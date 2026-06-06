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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const public_decorator_1 = require("../common/decorators/public.decorator");
let DevController = class DevController {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    guardDevOnly() {
        if (this.configService.get('NODE_ENV') === 'production') {
            throw new common_1.ForbiddenException('Dev tools are disabled in production');
        }
    }
    async getOtp(email) {
        this.guardDevOnly();
        if (!email)
            throw new common_1.NotFoundException('Email query parameter is required');
        const user = await this.prisma.user.findFirst({
            where: {
                email: email.toLowerCase().trim(),
                emailVerifyOtp: { not: null },
                emailVerifyOtpExpiry: { gte: new Date() },
            },
            select: { email: true, emailVerifyOtp: true, emailVerifyOtpExpiry: true },
        });
        if (!user) {
            return {
                found: false,
                message: `No valid OTP found for ${email}. It may have expired or the email is not registered.`,
            };
        }
        return {
            found: true,
            email: user.email,
            otp: user.emailVerifyOtp,
            expiresAt: user.emailVerifyOtpExpiry,
        };
    }
    async getResetLink(email) {
        this.guardDevOnly();
        if (!email)
            throw new common_1.NotFoundException('Email query parameter is required');
        const user = await this.prisma.user.findFirst({
            where: {
                email: email.toLowerCase().trim(),
                resetToken: { not: null },
                resetTokenExpiry: { gte: new Date() },
            },
            select: {
                email: true,
                resetUidb64: true,
                resetToken: true,
                resetTokenExpiry: true,
            },
        });
        if (!user) {
            return {
                found: false,
                message: `No valid reset token found for ${email}.`,
            };
        }
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
        return {
            found: true,
            email: user.email,
            resetLink: `${frontendUrl}/reset-password?uidb64=${user.resetUidb64}&token=${user.resetToken}`,
            expiresAt: user.resetTokenExpiry,
        };
    }
};
exports.DevController = DevController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('otp'),
    (0, swagger_1.ApiOperation)({
        summary: '[DEV ONLY] Get the latest verification OTP for an email',
    }),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DevController.prototype, "getOtp", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('reset-link'),
    (0, swagger_1.ApiOperation)({
        summary: '[DEV ONLY] Get password reset link for an email',
    }),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DevController.prototype, "getResetLink", null);
exports.DevController = DevController = __decorate([
    (0, swagger_1.ApiTags)('Dev Tools'),
    (0, common_1.Controller)('auth/dev'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], DevController);
//# sourceMappingURL=dev.controller.js.map