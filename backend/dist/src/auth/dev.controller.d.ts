import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class DevController {
    private prisma;
    private configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    private guardDevOnly;
    getOtp(email: string): Promise<{
        found: boolean;
        message: string;
        email?: undefined;
        otp?: undefined;
        expiresAt?: undefined;
    } | {
        found: boolean;
        email: string;
        otp: string | null;
        expiresAt: Date | null;
        message?: undefined;
    }>;
    getResetLink(email: string): Promise<{
        found: boolean;
        message: string;
        email?: undefined;
        resetLink?: undefined;
        expiresAt?: undefined;
    } | {
        found: boolean;
        email: string;
        resetLink: string;
        expiresAt: Date | null;
        message?: undefined;
    }>;
}
