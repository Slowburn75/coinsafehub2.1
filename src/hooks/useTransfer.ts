"use client";

import { useState } from "react";
import { transactions } from "@/lib/api";
import { toast } from "sonner";

export function useTransfer() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitTransfer = async (data: {
        amount: number;
        recipient: string;
        description: string;
        pin: string;
    }) => {
        setIsSubmitting(true);
        try {
            const response = await transactions.transfer({
                amount: data.amount,
                recipient_email: data.recipient,
                pin: data.pin,
                note: data.description,
            });
            toast.success((response as any).message || "Transfer submitted successfully!");
            return true;
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Transfer failed");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isSubmitting,
        submitTransfer,
    };
}
