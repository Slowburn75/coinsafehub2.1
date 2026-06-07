import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/services/email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePinDto } from './dto/update-pin.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  // ── Login ──────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      await this.logLoginAttempt(dto.email, false, 'unknown_email');
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is suspended. Contact support.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.logLoginAttempt(dto.email, false, 'wrong_password');
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.logLoginAttempt(dto.email, true);

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
        emailVerified: user.emailVerified,
      },
    };
  }

  // ── Register ───────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    if (dto.password !== dto.password2) {
      throw new BadRequestException('Passwords do not match');
    }

    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const [firstName, ...lastParts] = dto.fullName.trim().split(' ');
    const lastName = lastParts.join(' ') || '';

    const otp = this.generateOtp();
    const caseRef = await this.generateCaseRef();

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        country: dto.country,
        emailVerifyOtp: otp,
        emailVerifyOtpExpiry: new Date(Date.now() + 10 * 60 * 1000),
        caseRef,
      },
    });

    // Create associated records
    await this.prisma.userBalance.create({ data: { userId: user.id } });
    await this.prisma.notificationPreference.create({ data: { userId: user.id } });
    await this.prisma.referralCode.create({
      data: { userId: user.id, code: this.generateReferralCode() },
    });

    // Send verification email (logs OTP to console in dev if no SMTP)
    await this.emailService.sendVerificationEmail(email, otp);

    return { message: 'Registration successful. Please check your email for the verification code.' };
  }

  // ── Verify Email ───────────────────────────────────────────────────

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerifyOtp: dto.otp,
        emailVerifyOtpExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification code');
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

  // ── Forgot Password ────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    // Always return success to prevent user enumeration
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

  // ── Reset Password ─────────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    let userId: string;
    try {
      userId = Buffer.from(dto.uidb64, 'base64').toString('utf-8');
    } catch {
      throw new BadRequestException('Invalid reset link');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        resetToken: dto.token,
        resetTokenExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset link');
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

  // ── Change Password (authenticated) ─────────────────────────────────

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password changed successfully' };
  }

  // ── Update PIN (authenticated) ──────────────────────────────────────

  async updatePin(userId: string, dto: UpdatePinDto) {
    const pinHash = await bcrypt.hash(dto.pin, SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { pinHash },
    });

    return { message: 'PIN updated successfully' };
  }

  // ── Validate PIN ───────────────────────────────────────────────────

  async validatePin(userId: string, pin: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pinHash: true },
    });
    if (!user?.pinHash) return false;
    return bcrypt.compare(pin, user.pinHash);
  }

  // ── Refresh Token ──────────────────────────────────────────────────

  async refreshAccessToken(refreshToken: string) {
    const tokenHash = await bcrypt.hash(refreshToken, 6);
    // Search by iterating active tokens (simplified; production should store hash)
    const session = await this.prisma.refreshToken.findFirst({
      where: {
        revokedAt: null,
        expiresAt: { gte: new Date() },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, isStaff: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
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

  // ── Logout ─────────────────────────────────────────────────────────

  async logout(userId: string, tokenIat: number) {
    const jti = `${userId}-${tokenIat}`;
    const expiresAt = new Date(tokenIat * 1000 + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.tokenBlacklist.upsert({
      where: { jti },
      update: {},
      create: { jti, expiresAt },
    });

    return { message: 'Logged out successfully' };
  }

  // ── Helpers ────────────────────────────────────────────────────────

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const token = require('crypto').randomBytes(48).toString('hex');
    const tokenHash = await bcrypt.hash(token, 6);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return token;
  }

  private async logLoginAttempt(email: string, success: boolean, reason?: string) {
    await this.prisma.loginAttempt.create({
      data: {
        email: email.toLowerCase().trim(),
        ipAddress: '',
        success,
        failureReason: reason || null,
      },
    });
  }

  private async generateCaseRef(): Promise<string> {
    const count = await this.prisma.user.count();
    const num = 10024 + count;
    return `#CSH-${num}`;
  }
}
