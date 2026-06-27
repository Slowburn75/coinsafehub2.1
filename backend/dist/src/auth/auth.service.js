"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../common/services/email.service");
const SALT_ROUNDS = 12;
async function asyncFind(items, predicate) {
    for (const item of items) {
        if (await predicate(item))
            return item;
    }
    return undefined;
}
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.emailService = emailService;
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase().trim() },
            include: { roles: { select: { role: { select: { name: true } } } } },
        });
        if (!user) {
            await this.logLoginAttempt(dto.email, false, 'unknown_email');
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is suspended. Contact support.');
        }
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid) {
            await this.logLoginAttempt(dto.email, false, 'wrong_password');
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        await this.logLoginAttempt(dto.email, true);
        const roles = user.roles.map((r) => r.role.name);
        const isAdmin = roles.some((role) => ['super_admin', 'admin', 'support_agent', 'compliance_officer', 'auditor', 'finance_manager'].includes(role));
        const payload = {
            sub: user.id,
            email: user.email,
            isStaff: user.isStaff,
        };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRY', '15m'),
        });
        const refreshToken = await this.createRefreshToken(user.id);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isStaff: user.isStaff,
                isAdmin,
                roles,
                emailVerified: user.emailVerified,
            },
        };
    }
    async register(dto) {
        if (dto.password !== dto.password2) {
            throw new common_1.BadRequestException('Passwords do not match');
        }
        const email = dto.email.toLowerCase().trim();
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
        const [firstName, ...lastParts] = dto.fullName.trim().split(' ');
        const lastName = lastParts.join(' ') || '';
        const otp = this.generateOtp();
        await this.createUserWithRelatedRecords({
            email,
            passwordHash,
            firstName,
            lastName,
            country: dto.country,
            otp,
        });
        await this.emailService.sendVerificationEmail(email, otp);
        return { message: 'Registration successful. Please check your email for the verification code.' };
    }
    async verifyEmail(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                emailVerifyOtp: dto.otp,
                emailVerifyOtpExpiry: { gte: new Date() },
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid or expired verification code');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerifyOtp: null,
                emailVerifyOtpExpiry: null,
            },
        });
        const payload = { sub: user.id, email: user.email, isStaff: user.isStaff };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRY', '15m'),
        });
        return { access_token: accessToken, message: 'Email verified successfully' };
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase().trim() },
        });
        if (!user || !user.emailVerified) {
            return { message: 'If an account exists with this email, a password reset link has been sent.' };
        }
        const token = this.generateOtp() + this.generateOtp();
        const uidb64 = Buffer.from(user.id).toString('base64');
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetUidb64: uidb64,
                resetToken: token,
                resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
            },
        });
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
        const resetLink = `${frontendUrl}/reset-password?uidb64=${uidb64}&token=${token}`;
        await this.emailService.sendPasswordResetEmail(user.email, resetLink);
        return { message: 'If an account exists with this email, a password reset link has been sent.' };
    }
    async resetPassword(dto) {
        if (dto.password !== dto.confirmPassword) {
            throw new common_1.BadRequestException('Passwords do not match');
        }
        let userId;
        try {
            userId = Buffer.from(dto.uidb64, 'base64').toString('utf-8');
        }
        catch {
            throw new common_1.BadRequestException('Invalid reset link');
        }
        const user = await this.prisma.user.findFirst({
            where: {
                id: userId,
                resetToken: dto.token,
                resetTokenExpiry: { gte: new Date() },
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid or expired reset link');
        }
        const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetUidb64: null,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        return { message: 'Password has been reset successfully. Please log in.' };
    }
    async changePassword(userId, dto) {
        if (dto.newPassword !== dto.confirmPassword) {
            throw new common_1.BadRequestException('Passwords do not match');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const valid = await bcrypt.compare(dto.oldPassword, user.passwordHash);
        if (!valid)
            throw new common_1.BadRequestException('Current password is incorrect');
        const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        return { message: 'Password changed successfully' };
    }
    async updatePin(userId, dto) {
        const pinHash = await bcrypt.hash(dto.pin, SALT_ROUNDS);
        await this.prisma.user.update({
            where: { id: userId },
            data: { pinHash },
        });
        return { message: 'PIN updated successfully' };
    }
    async validatePin(userId, pin) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { pinHash: true },
        });
        if (!user?.pinHash)
            return false;
        return bcrypt.compare(pin, user.pinHash);
    }
    async refreshAccessToken(refreshToken) {
        const sessions = await this.prisma.refreshToken.findMany({
            where: {
                revokedAt: null,
                expiresAt: { gte: new Date() },
            },
        });
        const session = await asyncFind(sessions, (candidate) => bcrypt.compare(refreshToken, candidate.tokenHash));
        if (!session) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: session.userId },
            select: { id: true, email: true, isStaff: true, isActive: true },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        await this.prisma.refreshToken.update({
            where: { id: session.id },
            data: { lastUsedAt: new Date() },
        });
        const payload = { sub: user.id, email: user.email, isStaff: user.isStaff };
        return this.jwtService.sign(payload, {
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRY', '15m'),
        });
    }
    async logout(userId, tokenIat) {
        const jti = `${userId}-${tokenIat}`;
        const expiresAt = new Date(tokenIat * 1000 + 7 * 24 * 60 * 60 * 1000);
        await this.prisma.tokenBlacklist.upsert({
            where: { jti },
            update: {},
            create: { jti, expiresAt },
        });
        return { message: 'Logged out successfully' };
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    async generateUniqueReferralCode() {
        for (let attempt = 0; attempt < 10; attempt++) {
            const code = this.generateReferralCode();
            const existing = await this.prisma.referralCode.findUnique({ where: { code } });
            if (!existing)
                return code;
        }
        throw new common_1.BadRequestException('Could not generate referral code. Please try again.');
    }
    async createUserWithRelatedRecords(data) {
        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                const caseRef = await this.generateCaseRef();
                const referralCode = await this.generateUniqueReferralCode();
                return await this.prisma.$transaction(async (tx) => {
                    const user = await tx.user.create({
                        data: {
                            email: data.email,
                            passwordHash: data.passwordHash,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            country: data.country,
                            emailVerifyOtp: data.otp,
                            emailVerifyOtpExpiry: new Date(Date.now() + 10 * 60 * 1000),
                            caseRef,
                        },
                    });
                    await tx.userBalance.create({ data: { userId: user.id } });
                    await tx.notificationPreference.create({ data: { userId: user.id } });
                    await tx.referralCode.create({
                        data: { userId: user.id, code: referralCode },
                    });
                    return user;
                });
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                    error.code === 'P2002') {
                    continue;
                }
                throw error;
            }
        }
        throw new common_1.BadRequestException('Could not create account. Please try again.');
    }
    async createRefreshToken(userId) {
        const token = (0, crypto_1.randomBytes)(48).toString('hex');
        const tokenHash = await bcrypt.hash(token, 6);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.prisma.refreshToken.create({
            data: { userId, tokenHash, expiresAt },
        });
        return token;
    }
    async logLoginAttempt(email, success, reason) {
        await this.prisma.loginAttempt.create({
            data: {
                email: email.toLowerCase().trim(),
                ipAddress: '',
                success,
                failureReason: reason || null,
            },
        });
    }
    async generateCaseRef() {
        const users = await this.prisma.user.findMany({
            where: { caseRef: { not: null } },
            select: { caseRef: true },
        });
        const highest = users.reduce((max, user) => {
            const match = user.caseRef?.match(/^#CSH-(\d+)$/);
            if (!match)
                return max;
            return Math.max(max, Number(match[1]));
        }, 10023);
        return `#CSH-${highest + 1}`;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map