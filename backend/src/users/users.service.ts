import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FreezeUserDto } from './dto/freeze-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ── Get Current User Profile ("me") ────────────────────────────────

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { balance: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const b = (user.balance ?? {}) as any;

    return {
      id: user.id,
      email: user.email,
      fullname: `${user.firstName} ${user.lastName}`.trim(),
      first_name: user.firstName,
      last_name: user.lastName,
      phone: user.phone,
      phone_number: user.phone,
      dob: user.dob?.toISOString().split('T')[0] ?? null,
      country: user.country,
      address: user.address,
      is_active: user.isActive,
      is_frozen: !user.isActive,
      is_staff: user.isStaff,
      email_verified: user.emailVerified,
      preferred_withdrawal_method: user.preferredWithdrawalMethod,
      crypto_wallet_address: user.cryptoWalletAddress,
      balance: Number(b.balance ?? 0),
      total_deposit: Number(b.totalDeposit ?? 0),
      total_withdrawal: Number(b.totalWithdrawal ?? 0),
      recovered_balance: Number(b.recoveredBalance ?? 0),
      investment_balance: Number(b.investmentBalance ?? 0),
      bonus: Number(b.bonus ?? 0),
      referal_bonus: Number(b.referralBonus ?? 0),
      profit_bonus: Number(b.profitBonus ?? 0),
      created_at: user.createdAt,
    };
  }

  // ── Update Profile ─────────────────────────────────────────────────

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: any = {};

    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.dob !== undefined) data.dob = new Date(dto.dob);
    if (dto.country !== undefined) data.country = dto.country;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.preferred_withdrawal_method !== undefined)
      data.preferredWithdrawalMethod = dto.preferred_withdrawal_method;
    if (dto.crypto_wallet_address !== undefined)
      data.cryptoWalletAddress = dto.crypto_wallet_address;

    if (dto.fullname) {
      const [firstName, ...lastParts] = dto.fullname.trim().split(' ');
      data.firstName = firstName;
      data.lastName = lastParts.join(' ') || '';
    }

    await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return { message: 'Profile updated successfully' };
  }

  // ── List All Users (Admin) ─────────────────────────────────────────

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { balance: true },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => {
      const b = (user.balance ?? {}) as any;
      return {
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        fullname: `${user.firstName} ${user.lastName}`.trim(),
        phone_number: user.phone,
        is_active: user.isActive,
        is_frozen: !user.isActive,
        is_staff: user.isStaff,
        balance: Number(b.balance ?? 0),
        recovered_balance: Number(b.recoveredBalance ?? 0),
        total_deposit: Number(b.totalDeposit ?? 0),
        bonus: Number(b.bonus ?? 0),
        referal_bonus: Number(b.referralBonus ?? 0),
        profit_bonus: Number(b.profitBonus ?? 0),
        investment_balance: Number(b.investmentBalance ?? 0),
        created_at: user.createdAt,
      };
    });
  }

  // ── Delete User (Admin) ────────────────────────────────────────────

  async deleteUser(adminUserId: string, targetUserId: string) {
    if (adminUserId === targetUserId) {
      throw new BadRequestException('Cannot delete your own account');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!target) throw new NotFoundException('User not found');
    if (target.isSuperuser) {
      throw new ForbiddenException('Cannot delete superuser accounts');
    }

    await this.prisma.user.delete({ where: { id: targetUserId } });

    return { message: 'User deleted successfully' };
  }

  // ── Freeze / Activate User (Admin) ─────────────────────────────────

  async freezeUser(adminUserId: string, dto: FreezeUserDto) {
    if (adminUserId === dto.user_id) {
      throw new BadRequestException('Cannot freeze your own account');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: dto.user_id },
    });

    if (!target) throw new NotFoundException('User not found');
    if (target.isSuperuser) {
      throw new ForbiddenException('Cannot freeze superuser accounts');
    }

    const isActive = dto.action === 'activate';

    await this.prisma.user.update({
      where: { id: dto.user_id },
      data: { isActive },
    });

    return {
      message: `User successfully ${isActive ? 'activated' : 'deactivated'}`,
    };
  }
}
