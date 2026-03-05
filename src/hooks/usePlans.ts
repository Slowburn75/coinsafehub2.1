"use client";

import { useState } from "react";
import { transactions, investments } from "@/lib/api";
import { toast } from "sonner";

export interface Plan {
    id: string;
    name: string;
    price: string;
    duration: string;
    profit: string;
    minDeposit: string;
    maxDeposit: string;
    minReturn: string;
    maxReturn: string;
}

export const PREDEFINED_PLANS: Record<string, Plan> = {
    starter: {
        id: "starter",
        name: "Starter",
        price: "$10,000",
        duration: "1 Month",
        profit: "1% Weekly",
        minDeposit: "$10,000",
        maxDeposit: "$100,000",
        minReturn: "100%",
        maxReturn: "100%"
    },
    gold: {
        id: "gold",
        name: "Gold Plan",
        price: "$20,000",
        duration: "1 Month",
        profit: "30% Weekly",
        minDeposit: "$20,000",
        maxDeposit: "$500,000",
        minReturn: "100%",
        maxReturn: "100%"
    }
};

export function usePlans() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const invest = async (data: {
        plan: string;
        amount: number;
        paymentMethod: string;
    }) => {
        setIsSubmitting(true);
        try {
            await investments.create(data);
            toast.success("Investment successful!");
            return true;
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Investment failed");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isSubmitting,
        invest,
    };
}
