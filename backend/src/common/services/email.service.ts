import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private readonly isProduction: boolean;

  constructor(private configService: ConfigService) {
    this.isProduction = configService.get('NODE_ENV') === 'production';
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get('SMTP_HOST');
    const port = parseInt(this.configService.get('SMTP_PORT', '587'), 10);
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASS');

    if (!host) {
      this.logger.warn('SMTP_HOST not configured. Emails will be logged to console only.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });

    this.logger.log(`Email service configured: ${host}:${port}`);
  }

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    const from = this.configService.get('EMAIL_FROM', 'noreply@coinsafehub.com');

    if (!this.transporter) {
      this.logDevEmail(to, subject, html);
      return true;
    }

    try {
      const info = await this.transporter.sendMail({ from, to, subject, html, text });
      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      // In development, log the email so testing can continue
      if (!this.isProduction) {
        this.logDevEmail(to, subject, html);
        return true;
      }
      return false;
    }
  }

  async sendVerificationEmail(to: string, otp: string): Promise<boolean> {
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

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<boolean> {
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

  private logDevEmail(to: string, subject: string, html: string) {
    const otpMatch = html.match(/>(\d{6})</);
    const otp = otpMatch ? otpMatch[1] : null;

    this.logger.debug('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.debug(`📧 DEV EMAIL`);
    this.logger.debug(`   To:      ${to}`);
    this.logger.debug(`   Subject: ${subject}`);
    if (otp) {
      this.logger.debug(`   OTP:     ${otp}`);
    } else {
      const linkMatch = html.match(/href="([^"]+)"/);
      if (linkMatch) {
        this.logger.debug(`   Link:    ${linkMatch[1]}`);
      }
    }
    this.logger.debug('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
}
