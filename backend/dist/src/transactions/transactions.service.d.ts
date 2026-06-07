import { PrismaService } from '../prisma/prisma.service';
import { WithdrawalDto, TransferDto, UpdateTransactionDto, AdminSettingsDto, ClientUpdateDto, CreateInvestmentDto, ConnectWalletDto } from './dto/transactions.dto';
export declare class TransactionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAccountSummary(userId: string): Promise<{
        balance: number;
        total_deposit: number;
        total_withdrawal: number;
        total_profit: number;
        total_bonus: number;
        total_referral_bonus: number;
        recovered_balance: number;
        investment_balance: number;
        profit_balance: number;
        bonus_balance: number;
        referral_balance: number;
        pending_balance: number;
        withdrawal_balance: number;
        total_balance: number;
    }>;
    getTransactions(userId: string): Promise<{
        id: string;
        amount: number;
        transaction_type: string;
        status: string;
        payment_method: string | null;
        created_at: Date;
    }[]>;
    getUserDeposits(userId: string): Promise<{
        results: {
            id: string;
            amount: number;
            payment_method: string | null;
            status: string;
            created_at: Date;
            date: string;
        }[];
    }>;
    getDepositAddresses(): Promise<{
        Bitcoin: string;
        Ethereum: string;
        "USDT (ERC20)": string;
        "USDT (TRC20)": string;
        "USDC (ERC20)": string;
        "Bank Transfer": string;
        btc: string;
        eth: string;
        usdt: string;
    }>;
    getWithdrawalMethods(): Promise<{
        id: string;
        name: string;
        min: number;
        max: number;
        charge: string;
        duration: string | null;
    }[]>;
    deposit(userId: string, amount: string, paymentMethod: string, walletAddress: string, receipt?: any): Promise<{
        message: string;
    }>;
    withdraw(userId: string, dto: WithdrawalDto): Promise<{
        message: string;
    }>;
    transfer(userId: string, dto: TransferDto): Promise<{
        message: string;
    }>;
    getAdminDashboard(): Promise<{
        total_users: number;
        total_transactions: number;
        total_deposit_amount: number;
    }>;
    getTransactionList(): Promise<{
        results: {
            id: string;
            amount: number;
            transaction_type: string;
            status: string;
            date: Date;
            user: string | {
                email: string;
                full_name: string;
                name: string;
            };
            receipt_url: string | null;
            payment_method: string | null;
        }[];
    }>;
    updateTransaction(dto: UpdateTransactionDto): Promise<{
        message: string;
    }>;
    getAdminSettings(): Promise<Record<string, string>>;
    updateAdminSettings(dto: AdminSettingsDto): Promise<{
        message: string;
    }>;
    updateClient(dto: ClientUpdateDto): Promise<{
        message: string;
    }>;
    createInvestment(userId: string, dto: CreateInvestmentDto): Promise<{
        message: string;
    }>;
    connectWallet(userId: string, dto: ConnectWalletDto): Promise<{
        message: string;
    }>;
}
