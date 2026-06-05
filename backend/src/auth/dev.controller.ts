import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';

/**
 * Development-only controller for retrieving OTPs and reset tokens
 * without needing to check email or server logs.
 *
 * Disabled in production by the guard below.
 */
@ApiTags('Dev Tools')
@Controller('auth/dev')
export class DevController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get('otp')
  @ApiOperation({
    summary: '[DEV ONLY] Get the latest verification OTP for an email',
    description: 'Returns the current valid OTP. Only works in development mode.',
  })
  async getOtp(@Query('email') email: string) {
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
        message: `No valid OTP found for ${email}. The OTP may have expired or the email is not registered.`,
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
    summary: '[DEV ONLY] Get the latest password reset link for an email',
    description: 'Returns the reset link. Only works in development mode.',
  })
  async getResetLink(@Query('email') email: string) {
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

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return {
      found: true,
      email: user.email,
      resetLink: `${frontendUrl}/reset-password?uidb64=${user.resetUidb64}&token=${user.resetToken}`,
      expiresAt: user.resetTokenExpiry,
    };
  }
}
