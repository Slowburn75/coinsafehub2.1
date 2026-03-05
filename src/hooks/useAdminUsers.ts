"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/api";
import { toast } from "sonner";

export function useAdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await auth.userList();
            setUsers(data as any[]);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const deleteUser = async (userId: string) => {
        try {
            await auth.deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
            toast.success("User deleted successfully");
            return true;
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to delete user");
            return false;
        }
    };

    const freezeUser = async (userId: string, isCurrentlyActive: boolean) => {
        try {
            const action = isCurrentlyActive ? "deactivate" : "activate";
            await auth.freezeUser({ user_id: userId, action });
            toast.success(`User successfully ${isCurrentlyActive ? "deactivated" : "activated"}`);
            fetchUsers();
            return true;
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to update user status");
            return false;
        }
    };

    return {
        users,
        isLoading,
        refresh: fetchUsers,
        deleteUser,
        freezeUser,
    };
}
