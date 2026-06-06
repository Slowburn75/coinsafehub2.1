import { TransactionsService } from './transactions.service';
import { WithdrawalDto, TransferDto, UpdateTransactionDto, AdminSettingsDto, ClientUpdateDto, CreateInvestmentDto, ConnectWalletDto } from './dto/transactions.dto';
export declare class TransactionsController {
    private readonly service;
    constructor(service: TransactionsService);
    accountSummary(user: any): Promise<{
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
    list(user: any): Promise<{
        id: string;
        amount: number;
        transaction_type: string;
        status: string;
        payment_method: string | null;
        created_at: Date;
    }[]>;
    userDeposits(user: any): Promise<{
        results: {
            id: string;
            amount: number;
            payment_method: string | null;
            status: string;
            created_at: Date;
            date: string;
        }[];
    }>;
    depositAddresses(): Promise<{
        btc: string;
        eth: string;
        usdt: string;
    }>;
    withdrawalMethods(): Promise<{
        id: string;
        name: string;
        min: number;
        max: number;
        charge: string;
        duration: string | null;
    }[]>;
    deposit(user: any, body: any, receipt?: any): Promise<{
        message: string;
    }>;
    withdraw(user: any, dto: WithdrawalDto): Promise<{
        message: string;
    }>;
    transfer(user: any, dto: TransferDto): Promise<{
        message: string;
    }>;
    adminDashboard(): Promise<{
        total_users: number;
        total_transactions: number;
        total_deposit_amount: number;
    }>;
    transactionList(): Promise<{
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
    updateSettings(dto: AdminSettingsDto): Promise<{
        message: string;
    }>;
    getSettings(): Promise<Record<string, string>>;
    updateClient(dto: ClientUpdateDto): Promise<{
        message: string;
    }>;
}
export declare class InvestmentsController {
    private readonly service;
    constructor(service: TransactionsService);
    create(user: any, dto: CreateInvestmentDto): Promise<{
        message: string;
    }>;
}
export declare class WalletController {
    private readonly service;
    constructor(service: TransactionsService);
    connect(user: any, dto: ConnectWalletDto): Promise<{
        message: string;
    }>;
}
