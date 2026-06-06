import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private readonly logger;
    private resend;
    private readonly isDevelopment;
    constructor(configService: ConfigService);
    sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean>;
    sendVerificationEmail(to: string, otp: string): Promise<boolean>;
    sendPasswordResetEmail(to: string, resetLink: string): Promise<boolean>;
    private logDevEmail;
}
