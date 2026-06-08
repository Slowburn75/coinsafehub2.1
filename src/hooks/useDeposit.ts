"use client";

import { useState, useEffect } from "react";
import { transactions } from "@/lib/api";
import { toast } from "sonner";

const WALLET_ADDRESSES: Record<string, string> = {
    "Bitcoin": "17mHPvhLr8zUjcHW6Ct8oRMBazEaRoqnZZ",
    "Ethereum": "0x01Cf020193D0bb473534739B18BFcad94aa9B9C5",
    "USDT (ERC20)": "0x01Cf020193D0bb473534739B18BFcad94aa9B9C5",
    "USDT (TRC20)": "TBCC31o8LurWrcAsGbjR9saF2PjTefusSn",
    "USDC (ERC20)": "0x01Cf020193D0bb473534739B18BFcad94aa9B9C5",
    "Bank Transfer": "Contact Support",
};

export interface DepositHistory {
    id: string;
    amount: number;
    payment_method: string;
    status: string;
    created_at: string;
    date?: string;
}

export function useDeposit() {
    const [history, setHistory] = useState<DepositHistory[]>([]);
    const [addresses, setAddresses] = useState<Record<string, string>>(WALLET_ADDRESSES);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const historyData = await transactions.userDeposits();
            setHistory((historyData as any).results || historyData);
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
