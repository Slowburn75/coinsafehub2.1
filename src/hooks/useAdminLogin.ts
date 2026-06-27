"use client";

import { useState } from "react";
import { auth } from "@/lib/api";
import { toast } from "sonner";
import { setToken } from "@/lib/auth";

export function useAdminLogin() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const login = async (data: any) => {
        setIsSubmitting(true);
        try {
            const response = await auth.login(data);
            // Even if it's admin, the response structure should be same as user login
            if ((response as any).access_token) {
                const user = (response as any).user;
                if (!user?.isAdmin && !user?.isStaff) {
                    throw new Error("This account does not have admin access");
                }
                await setToken((response as any).access_token, "admin");
                toast.success("Admin login successful!");
                return true;
            }
            throw new Error("Invalid response from server");
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Invalid credentials");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isSubmitting,
        login,
    };
}
