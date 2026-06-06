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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.resend = null;
        this.isDevelopment = configService.get('NODE_ENV') !== 'production';
        const apiKey = configService.get('RESEND_API_KEY');
        if (apiKey) {
            this.resend = new resend_1.Resend(apiKey);
            this.logger.log('Email service: Resend configured');
        }
        else {
            this.logger.warn('RESEND_API_KEY not set — emails will be logged to console only');
        }
    }
    async sendEmail(to, subject, html, text) {
        const from = this.configService.get('EMAIL_FROM', 'CoinSafeHub <noreply@coinsafehub.com>');
        if (!this.resend) {
            this.logDevEmail(to, subject, html);
            return true;
        }
        try {
            const { data, error } = await this.resend.emails.send({ from, to, subject, html, text });
            if (error) {
                this.logger.error(`Resend error sending to ${to}:`, error.message);
                if (this.isDevelopment) {
                    this.logDevEmail(to, subject, html);
                    return true;
                }
                return false;
            }
            this.logger.log(`Email sent to ${to}: ${data?.id}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${to}:`, error);
            if (this.isDevelopment) {
                this.logDevEmail(to, subject, html);
                return true;
            }
            return false;
        }
    }
    async sendVerificationEmail(to, otp) {
        const subject = 'Verify your CoinSafeHub email';
        const html = `
      <div style="max-width:480px;margin:0 auto;font-family:Arial,sans-serif">
        <h2 style="color:#7c3aed">CoinSafeHub</h2>
        <p>Use the code below to verify your email address:</p>
        <div style="background:#f4f4f5;padding:20px;border-radius:8px;text-align:center;margin:20px 0">
          <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#18181b">${otp}</span>
        </div>
        <p style="color:#71717a;font-size:14px">This code expires in 10 minutes. If you didn't create an account, ignore this email.</p>
      </div>`;
        return this.sendEmail(to, subject, html);
    }
    async sendPasswordResetEmail(to, resetLink) {
        const subject = 'Reset your CoinSafeHub password';
        const html = `
      <div style="max-width:480px;margin:0 auto;font-family:Arial,sans-serif">
        <h2 style="color:#7c3aed">CoinSafeHub</h2>
        <p>Click the button below to reset your password:</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${resetLink}" style="background:#7c3aed;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold">Reset Password</a>
        </div>
        <p style="color:#71717a;font-size:14px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>`;
        return this.sendEmail(to, subject, html);
    }
    logDevEmail(to, subject, html) {
        const otpMatch = html.match(/>(\d{6})</);
        const otp = otpMatch ? otpMatch[1] : null;
        this.logger.debug('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        this.logger.debug(`📧 DEV EMAIL`);
        this.logger.debug(`   To:      ${to}`);
        this.logger.debug(`   Subject: ${subject}`);
        if (otp) {
            this.logger.debug(`   OTP:     ${otp}`);
        }
        else {
            const linkMatch = html.match(/href="([^"]+)"/);
            if (linkMatch) {
                this.logger.debug(`   Link:    ${linkMatch[1]}`);
            }
        }
        this.logger.debug('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map