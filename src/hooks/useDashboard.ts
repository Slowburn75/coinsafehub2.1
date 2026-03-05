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

            console.log("Dashboard API response:", summaryData);

            const rawSummary = summaryData as any;
            const total_balance = (rawSummary.balance ?? 0)
                + (rawSummary.investment_balance ?? 0)
                + (rawSummary.referral_balance ?? 0)
                + (rawSummary.bonus_balance ?? 0)
                + (rawSummary.profit_balance ?? 0)
                + (rawSummary.recovered_balance ?? 0);

            setSummary({
                ...rawSummary,
                total_balance
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
