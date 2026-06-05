"use client";

import { useState, useEffect } from "react";
import { transactions } from "@/lib/api";
import { parseApiError } from "@/lib/error-utils";
import { toast } from "sonner";

export interface WithdrawalMethod {
    id: string;
    name: string;
    // Based on the HTML, it seems it expects these details which might be hardcoded in UI or returned by API
    min?: number;
    max?: number;
    charge?: string;
    duration?: string;
}

export function useWithdrawal() {
    const [methods, setMethods] = useState<WithdrawalMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchMethods();
    }, []);

    const fetchMethods = async () => {
        setIsLoading(true);
        try {
            const data = await transactions.withdrawalMethods();
            setMethods(data as WithdrawalMethod[]);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to load withdrawal methods");
        } finally {
            setIsLoading(false);
        }
    };

    const submitWithdrawal = async (data: any) => {
        setIsSubmitting(true);
        try {
            await transactions.withdrawal(data);
            toast.success("Withdrawal request submitted successfully!");
            return true;
        } catch (err: any) {
            console.error(err);
            const errorMsg = parseApiError(err).message;
            toast.error(errorMsg);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        methods,
        isLoading,
        isSubmitting,
        submitWithdrawal,
    };
}
