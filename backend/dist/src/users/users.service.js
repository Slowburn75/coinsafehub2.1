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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { balance: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const b = (user.balance ?? {});
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
            case_phase: user.casePhase,
            case_ref: user.caseRef,
            created_at: user.createdAt,
        };
    }
    async updateProfile(userId, dto) {
        const data = {};
        if (dto.phone !== undefined)
            data.phone = dto.phone;
        if (dto.dob !== undefined)
            data.dob = new Date(dto.dob);
        if (dto.country !== undefined)
            data.country = dto.country;
        if (dto.address !== undefined)
            data.address = dto.address;
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
    async findAll() {
        const users = await this.prisma.user.findMany({
            include: { balance: true },
            orderBy: { createdAt: 'desc' },
        });
        return users.map((user) => {
            const b = (user.balance ?? {});
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
                case_phase: user.casePhase,
                case_ref: user.caseRef,
                created_at: user.createdAt,
            };
        });
    }
    async deleteUser(adminUserId, targetUserId) {
        if (adminUserId === targetUserId) {
            throw new common_1.BadRequestException('Cannot delete your own account');
        }
        const target = await this.prisma.user.findUnique({
            where: { id: targetUserId },
        });
        if (!target)
            throw new common_1.NotFoundException('User not found');
        if (target.isSuperuser) {
            throw new common_1.ForbiddenException('Cannot delete superuser accounts');
        }
        await this.prisma.user.delete({ where: { id: targetUserId } });
        return { message: 'User deleted successfully' };
    }
    async freezeUser(adminUserId, dto) {
        if (adminUserId === dto.user_id) {
            throw new common_1.BadRequestException('Cannot freeze your own account');
        }
        const target = await this.prisma.user.findUnique({
            where: { id: dto.user_id },
        });
        if (!target)
            throw new common_1.NotFoundException('User not found');
        if (target.isSuperuser) {
            throw new common_1.ForbiddenException('Cannot freeze superuser accounts');
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map