"use client";

import { useState, useEffect } from "react";
import { transactions } from "@/lib/api";
import { toast } from "sonner";

export interface AccountSummary {
    balance: number;
    total_deposit: number;
    total_withdrawal: number;
    total_profit: number;
    total_bonus: number;
    total_referral_bonus: number;
    recovered_balance: number;
    investment_balance: number;
    referral_balance?: number;
    bonus_balance?: number;
    profit_balance?: number;
    pending_balance?: number;
    withdrawal_balance?: number;
    total_balance?: number; // Calculated field
}

export interface Transaction {
    id: string;
    amount: number;
    transaction_type: string;
    status: string;
    payment_method?: string;
    created_at: string;
}

export function useDashboard() {
    const [summary, setSummary] = useState<AccountSummary | null>(null);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [summaryData, transactionData] = await Promise.all([
                transactions.accountSummary(),
                transactions.list(),
            ]);

            console.log("RAW dashboard API response:", summaryData);

            const data = summaryData as any;
            const total_balance =
                (data.balance ?? 0) +
                (data.investment_balance ?? 0) +
                (data.recovered_balance ?? 0) +
                (data.profit_balance ?? data.total_profit ?? 0) +
                (data.bonus_balance ?? data.total_bonus ?? 0) +
                (data.referral_balance ?? data.total_referral_bonus ?? 0);

            setSummary({
                balance: data.balance ?? 0,
                total_deposit: data.total_deposit ?? 0,
                total_withdrawal: data.total_withdrawal ?? 0,
                recovered_balance: data.recovered_balance ?? 0,
                investment_balance: data.investment_balance ?? 0,
                total_profit: data.total_profit ?? data.profit_balance ?? 0,
                total_bonus: data.total_bonus ?? data.bonus_balance ?? 0,
                total_referral_bonus: data.total_referral_bonus ?? data.referral_balance ?? 0,
                total_balance: data.total_balance ?? total_balance, // Use API if exists, else calculated
            } as AccountSummary);
            setRecentTransactions(transactionData as Transaction[]);
        } catch (err: any) {
            console.error(err);
            setError(err?.message || "Failed to load dashboard data");
            toast.error("Error loading dashboard data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return {
        summary,
        recentTransactions,
        isLoading,
        error,
        refresh: fetchDashboardData,
    };
}
