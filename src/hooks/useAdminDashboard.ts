"use client";

import { useState, useEffect } from "react";
import { admin, auth } from "@/lib/api";
import { toast } from "sonner";

export interface AdminStats {
    total_users: number;
    total_transactions: number;
    total_deposit_amount: number;
}

export function useAdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [statsData, usersData] = await Promise.all([
                admin.dashboard(),
                auth.userList()
            ]);
            setStats(statsData as AdminStats);
            setUsers(usersData as any[]);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const deleteUser = async (userId: string) => {
        try {
            await auth.deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
            toast.success("User deleted successfully");
            return true;
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Failed to delete user");
            return false;
        }
    };

    return {
        stats,
        users,
        isLoading,
        refresh: fetchData,
        deleteUser,
    };
}
