"use client";

import { useState, useEffect } from "react";
import { transactions } from "@/lib/api";
import { toast } from "sonner";

export interface DepositHistory {
    id: string;
    amount: number;
    payment_method: string;
    status: string;
    created_at: string;
    date?: string; // Original HTML used 'date'
}

export function useDeposit() {
    const [history, setHistory] = useState<DepositHistory[]>([]);
    const [addresses, setAddresses] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [historyData, addrData] = await Promise.all([
                transactions.userDeposits(),
                transactions.getDepositAddresses(),
            ]);
            setHistory((historyData as any).results || historyData);
            setAddresses(addrData as Record<string, string>);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to load deposit data");
        } finally {
            setIsLoading(false);
        }
    };

    const submitDeposit = async (data: {
        amount: string;
        payment_method: string;
        wallet_address: string;
        receipt: File;
    }) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("amount", data.amount);
            formData.append("payment_method", data.payment_method);
            formData.append("wallet_address", data.wallet_address);
            formData.append("receipt", data.receipt);

            await transactions.deposit(formData);
            toast.success("Deposit confirmed. Thank you!");
            fetchData(); // Refresh history
            return true;
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Failed to confirm deposit");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        history,
        addresses,
        isLoading,
        isSubmitting,
        submitDeposit,
        refresh: fetchData,
    };
}
