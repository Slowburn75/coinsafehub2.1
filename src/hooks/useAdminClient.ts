"use client";

import { useState } from "react";
import { admin } from "@/lib/api";
import { toast } from "sonner";

export function useAdminClient() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateClient = async (data: {
        client_id: string;
        balance?: number;
        recovered_balance?: number;
        bonus?: number;
        referal_bonus?: number;
        profit_bonus?: number;
        investment_balance?: number;
        total_deposit?: number;
    }) => {
        setIsSubmitting(true);
        try {
            await admin.updateClient(data as any);
            toast.success("Client details updated successfully!");
            return true;
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Failed to update client details");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isSubmitting,
        updateClient,
    };
}
