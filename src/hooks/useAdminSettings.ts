"use client";

import { useState } from "react";
import { admin } from "@/lib/api";
import { toast } from "sonner";

export function useAdminSettings() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateSettings = async (data: {
        email?: string;
        transaction_limit?: number;
        status?: string;
    }) => {
        setIsSubmitting(true);
        try {
            await admin.updateSettings(data);
            toast.success("Settings updated successfully!");
            return true;
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Failed to update settings");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isSubmitting,
        updateSettings,
    };
}
