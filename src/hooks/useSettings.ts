"use client";

import { useState } from "react";
import { auth } from "@/lib/api";
import { toast } from "sonner";

export function useSettings() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateProfile = async (data: any) => {
        setIsSubmitting(true);
        try {
            await auth.updateProfile(data);
            toast.success("Profile updated successfully!");
            return true;
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Failed to update profile");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const changePassword = async (data: any) => {
        setIsSubmitting(true);
        try {
            await auth.changePassword(data);
            toast.success("Password changed successfully!");
            return true;
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Failed to change password");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const updatePin = async (pin: string) => {
        setIsSubmitting(true);
        try {
            await auth.updatePin({ pin });
            toast.success("PIN updated successfully!");
            return true;
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Failed to update PIN");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const getMe = async () => {
        try {
            const data = await auth.me();
            return data;
        } catch (err) {
            console.error("Failed to fetch user profile:", err);
            return null;
        }
    };

    return {
        isSubmitting,
        updateProfile,
        changePassword,
        updatePin,
        getMe,
    };
}
