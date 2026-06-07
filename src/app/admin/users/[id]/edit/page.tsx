"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { admin as adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Save, ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function EditUserPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;
    const { users, isLoading: usersLoading, freezeUser } = useAdminUsers();

    const [user, setUser] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Form states
    const [balances, setBalances] = useState({
        recovered_balance: 0,
        total_deposit: 0,
        bonus: 0,
        referal_bonus: 0,
        profit_bonus: 0,
        investment_balance: 0,
    });

    useEffect(() => {
        if (users.length > 0 && userId) {
            const foundUser = users.find((u) => String(u.id) === userId);
            if (foundUser) {
                setUser(foundUser);
                setBalances({
                    recovered_balance: foundUser.recovered_balance || 0,
                    total_deposit: foundUser.total_deposit || 0,
                    bonus: foundUser.bonus || 0,
                    referal_bonus: foundUser.referal_bonus || 0,
                    profit_bonus: foundUser.profit_bonus || 0,
                    investment_balance: foundUser.investment_balance || 0,
                });
            }
        }
    }, [users, userId]);

    const handleBalanceChange = (field: string, value: string) => {
        setBalances((prev) => ({
            ...prev,
            [field]: parseFloat(value) || 0,
        }));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await adminApi.updateClient({
                client_id: userId,
                ...balances,
            });
            toast.success("User details updated successfully");
            router.push("/admin/users");
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Failed to update user");
        } finally {
            setIsUpdating(false);
        }
    };

    if (usersLoading && !user) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user && !usersLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                <p className="text-muted-foreground">User not found.</p>
                <Button asChild variant="outline">
                    <Link href="/admin/users">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/admin/users">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
                </div>
                <Button
                    variant={user?.is_active ? "destructive" : "default"}
                    onClick={async () => {
                        const success = await freezeUser(userId, user?.is_active);
                        if (success) {
                            setUser({ ...user, is_active: !user.is_active });
                        }
                    }}
                    className="gap-2"
                >
                    {user?.is_active ? (
                        <>
                            <ShieldAlert className="h-4 w-4" /> Deactivate Account
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="h-4 w-4" /> Activate Account
                        </>
                    )}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* User Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-1">
                            <span className="text-xs font-semibold uppercase text-muted-foreground">Full Name</span>
                            <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-xs font-semibold uppercase text-muted-foreground">Email</span>
                            <p className="font-medium">{user?.email}</p>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-xs font-semibold uppercase text-muted-foreground">Phone</span>
                            <p className="font-medium">{user?.phone_number || "—"}</p>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-xs font-semibold uppercase text-muted-foreground">Role</span>
                            <p className="font-medium">{user?.is_staff ? "Admin" : "Client"}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Balance Management Card */}
                <Card className="md:row-span-2">
                    <CardHeader>
                        <CardTitle>Financial Balances</CardTitle>
                    </CardHeader>
                    <form onSubmit={handleUpdate}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="recovered_balance">Recovered Vault Balance ($)</Label>
                                <Input
                                    id="recovered_balance"
                                    type="number"
                                    step="0.01"
                                    value={balances.recovered_balance}
                                    onChange={(e) => handleBalanceChange("recovered_balance", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="total_deposit">Total Deposit ($)</Label>
                                <Input
                                    id="total_deposit"
                                    type="number"
                                    step="0.01"
                                    value={balances.total_deposit}
                                    onChange={(e) => handleBalanceChange("total_deposit", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="investment_balance">Escrow Ledger ($)</Label>
                                <Input
                                    id="investment_balance"
                                    type="number"
                                    step="0.01"
                                    value={balances.investment_balance}
                                    onChange={(e) => handleBalanceChange("investment_balance", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bonus">Bonus ($)</Label>
                                <Input
                                    id="bonus"
                                    type="number"
                                    step="0.01"
                                    value={balances.bonus}
                                    onChange={(e) => handleBalanceChange("bonus", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="referal_bonus">Referral Bonus ($)</Label>
                                <Input
                                    id="referal_bonus"
                                    type="number"
                                    step="0.01"
                                    value={balances.referal_bonus}
                                    onChange={(e) => handleBalanceChange("referal_bonus", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="profit_bonus">Profit Bonus ($)</Label>
                                <Input
                                    id="profit_bonus"
                                    type="number"
                                    step="0.01"
                                    value={balances.profit_bonus}
                                    onChange={(e) => handleBalanceChange("profit_bonus", e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full gap-2" disabled={isUpdating}>
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" /> Save All Changes
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Quick Actions / Status Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium">Currently {user?.is_active ? "Active" : "Frozen"}</p>
                                <p className="text-xs text-muted-foreground">
                                    {user?.is_active
                                        ? "This user has full access to their dashboard."
                                        : "This user cannot place withdrawals or trades."}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
