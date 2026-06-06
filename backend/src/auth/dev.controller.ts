import { Controller, Get, Query, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';

/**
 * Development-only controller. All endpoints return 403 in production.
 */
@ApiTags('Dev Tools')
@Controller('auth/dev')
export class DevController {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private guardDevOnly() {
    if (this.configService.get('NODE_ENV') === 'production') {
      throw new ForbiddenException('Dev tools are disabled in production');
    }
  }

  @Public()
  @Get('otp')
  @ApiOperation({
    summary: '[DEV ONLY] Get the latest verification OTP for an email',
  })
  async getOtp(@Query('email') email: string) {
    this.guardDevOnly();
    if (!email) throw new NotFoundException('Email query parameter is required');

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

  @Public()
  @Get('reset-link')
  @ApiOperation({
    summary: '[DEV ONLY] Get password reset link for an email',
  })
  async getResetLink(@Query('email') email: string) {
    this.guardDevOnly();
    if (!email) throw new NotFoundException('Email query parameter is required');

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
}
