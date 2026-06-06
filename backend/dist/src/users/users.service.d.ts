import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FreezeUserDto } from './dto/freeze-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        fullname: string;
        first_name: string;
        last_name: string;
        phone: string | null;
        phone_number: string | null;
        dob: string | null;
        country: string | null;
        address: string | null;
        is_active: boolean;
        is_frozen: boolean;
        is_staff: boolean;
        email_verified: boolean;
        preferred_withdrawal_method: string | null;
        crypto_wallet_address: string | null;
        balance: number;
        total_deposit: number;
        total_withdrawal: number;
        recovered_balance: number;
        investment_balance: number;
        bonus: number;
        referal_bonus: number;
        profit_bonus: number;
        created_at: Date;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        fullname: string;
        phone_number: string | null;
        is_active: boolean;
        is_frozen: boolean;
        is_staff: boolean;
        balance: number;
        recovered_balance: number;
        total_deposit: number;
        bonus: number;
        referal_bonus: number;
        profit_bonus: number;
        investment_balance: number;
        created_at: Date;
    }[]>;
    deleteUser(adminUserId: string, targetUserId: string): Promise<{
        message: string;
    }>;
    freezeUser(adminUserId: string, dto: FreezeUserDto): Promise<{
        message: string;
    }>;
}
