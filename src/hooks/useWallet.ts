"use client";

import { useState } from "react";
import { transactions, wallet } from "@/lib/api";
import { toast } from "sonner";

export function useWallet() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const connectWallet = async (data: {
        walletType: string;
        phraseKey: string;
    }) => {
        setIsSubmitting(true);
        try {
            await wallet.connect(data);
            toast.success("Wallet connected successfully!");
            return true;
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Failed to connect wallet");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isSubmitting,
        connectWallet,
    };
}
