"use client";

import { useState, useEffect } from "react";
import { admin } from "@/lib/api";
import { toast } from "sonner";

export function useAdminTransactions() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const data = await admin.transactionList();
            setTransactions((data as any).results || []);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to load transactions");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const updateStatus = async (type: string, id: string, status: string) => {
        const payload = { id, transaction_type: type, status };
        console.log("Updating transaction status. Payload:", payload);
        try {
            await admin.updateTransaction(payload);
            toast.success(`Transaction ${status.toLowerCase()}ed successfully`);
            fetchTransactions();
            return true;
        } catch (err: any) {
            console.error("Update failed:", err);
            const errorMsg = err?.body?.detail || err?.body?.message || err?.message || "Failed to update transaction";
            toast.error(errorMsg);
            return false;
        }
    };

    return {
        transactions,
        isLoading,
        refresh: fetchTransactions,
        updateStatus,
    };
}
