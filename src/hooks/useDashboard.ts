"use client";

import { useState, useEffect } from "react";
import { transactions, auth } from "@/lib/api";
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
    profit_bonus?: number;
    profit_balance?: number;
    referral_balance?: number;
    bonus_balance?: number;
    profit_balance?: number;
    pending_balance?: number;
    withdrawal_balance?: number;
    total_balance?: number;
    case_phase?: number;
    case_ref?: string;
}

export interface Transaction {
    id: string;
    amount: number;
    transaction_type: string;
    status: string;
    payment_method?: string;
    created_at: string;
}

const PHASE_LABELS: Record<number, { current: string; next: string }> = {
    1: { current: "Phase 1 — Blockchain Tracing", next: "Asset Interception" },
    2: { current: "Phase 2 — Assets Intercepted", next: "Escrow Holding" },
    3: { current: "Phase 3 — Escrow Holding", next: "Awaiting Clearance" },
    4: { current: "Phase 4 — Awaiting Clearance", next: "Disbursal Complete" },
    5: { current: "Case Resolved", next: "N/A" },
};

export function useDashboard() {
    const [summary, setSummary] = useState<AccountSummary | null>(null);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [casePhase, setCasePhase] = useState<number>(1);
    const [caseRef, setCaseRef] = useState<string>("#CSH-10024");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [summaryData, transactionData, userData] = await Promise.all([
                transactions.accountSummary(),
                transactions.list(),
                auth.me(),
            ]);

            const data = summaryData as any;
            const user = userData as any;

            setSummary({
                balance: data.balance ?? 0,
                total_deposit: data.total_deposit ?? 0,
                total_withdrawal: data.total_withdrawal ?? 0,
                recovered_balance: data.recovered_balance ?? 0,
                investment_balance: data.investment_balance ?? 0,
                total_profit: data.total_profit ?? data.profit_balance ?? 0,
                total_bonus: data.total_bonus ?? data.bonus_balance ?? 0,
                profit_bonus: data.profit_bonus ?? 0,
                profit_balance: data.profit_balance ?? 0,
                total_referral_bonus: data.total_referral_bonus ?? data.referral_balance ?? 0,
                case_phase: user?.case_phase ?? 1,
                case_ref: user?.case_ref ?? "#CSH-10024",
            } as AccountSummary);

            if (user?.case_phase) setCasePhase(user.case_phase);
            if (user?.case_ref) setCaseRef(user.case_ref);

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

    const phaseInfo = PHASE_LABELS[casePhase] || PHASE_LABELS[1];

    return {
        summary,
        recentTransactions,
        casePhase,
        caseRef,
        phaseInfo,
        isLoading,
        error,
        refresh: fetchDashboardData,
    };
}
