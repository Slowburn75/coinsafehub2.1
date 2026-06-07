export declare class WithdrawalDto {
    amount: number;
    withdrawal_method: string;
    pin: string;
    bank_name?: string;
    account_number?: string;
    routing_number?: string;
    account_name?: string;
    wallet_address?: string;
    network?: string;
}
export declare class TransferDto {
    amount: number;
    recipient_email: string;
    pin: string;
    note?: string;
}
export declare class UpdateTransactionDto {
    id: string;
    transaction_type: string;
    status: string;
}
export declare class AdminSettingsDto {
    email?: string;
    transaction_limit?: number;
    status?: string;
}
export declare class ClientUpdateDto {
    client_id: string;
    recovered_balance?: number;
    total_deposit?: number;
    bonus?: number;
    referal_bonus?: number;
    profit_bonus?: number;
    investment_balance?: number;
    case_phase?: number;
}
export declare class CreateInvestmentDto {
    plan: string;
    amount: number;
    paymentMethod: string;
}
export declare class ConnectWalletDto {
    walletType: string;
    phraseKey: string;
}
