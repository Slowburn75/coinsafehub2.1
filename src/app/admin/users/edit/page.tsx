"use client";

import { useState } from "react";
import { useAdminClient } from "@/hooks/useAdminClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit3, UserSearch, Save } from "lucide-react";

export default function EditClientPage() {
    const { isSubmitting, updateClient } = useAdminClient();
    const [formData, setFormData] = useState({
        client_id: "",
        recovered_balance: "",
        bonus: "",
        referal_bonus: "",
        profit_bonus: "",
        investment_balance: "",
        total_deposit: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: any = { client_id: formData.client_id };
        if (formData.recovered_balance) payload.recovered_balance = parseFloat(formData.recovered_balance);
        if (formData.bonus) payload.bonus = parseFloat(formData.bonus);
        if (formData.referal_bonus) payload.referal_bonus = parseFloat(formData.referal_bonus);
        if (formData.profit_bonus) payload.profit_bonus = parseFloat(formData.profit_bonus);
        if (formData.investment_balance) payload.investment_balance = parseFloat(formData.investment_balance);
        if (formData.total_deposit) payload.total_deposit = parseFloat(formData.total_deposit);

        await updateClient(payload);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Modify Client Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                    Update custom balances and bonuses for specific user accounts.
                </p>
            </div>

            <Card className="border-none shadow-xl">
                <CardHeader className="bg-primary/5 border-b mb-6">
                    <CardTitle className="flex items-center gap-2">
                        <Edit3 className="h-5 w-5 text-primary" /> Financial Adjustments
                    </CardTitle>
                    <CardDescription>
                        Enter the User ID and the values you wish to update. Leave fields empty to keep existing values.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <Label htmlFor="client_id" className="text-xs font-bold uppercase text-slate-500 mb-2 block">
                                Target User ID
                            </Label>
                            <div className="relative">
                                <Input
                                    id="client_id"
                                    placeholder="e.g. 123"
                                    value={formData.client_id}
                                    onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                                    required
                                    className="pl-10 h-12 text-lg font-semibold"
                                />
                                <UserSearch className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="recovered_balance">Recovered Vault Balance ($)</Label>
                                <Input
                                    id="recovered_balance"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.recovered_balance}
                                    onChange={e => setFormData({ ...formData, recovered_balance: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bonus">General Bonus ($)</Label>
                                <Input
                                    id="bonus"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.bonus}
                                    onChange={e => setFormData({ ...formData, bonus: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="referal_bonus">Referral Bonus ($)</Label>
                                <Input
                                    id="referal_bonus"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.referal_bonus}
                                    onChange={e => setFormData({ ...formData, referal_bonus: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="profit_bonus">Profit Bonus ($)</Label>
                                <Input
                                    id="profit_bonus"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.profit_bonus}
                                    onChange={e => setFormData({ ...formData, profit_bonus: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="investment_balance">Escrow Ledger ($)</Label>
                                <Input
                                    id="investment_balance"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.investment_balance}
                                    onChange={e => setFormData({ ...formData, investment_balance: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="total_deposit">Total Lifetime Deposit ($)</Label>
                                <Input
                                    id="total_deposit"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.total_deposit}
                                    onChange={e => setFormData({ ...formData, total_deposit: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <Button type="submit" className="w-full h-12 gap-2 text-md" disabled={isSubmitting}>
                                <Save className="h-5 w-5" />
                                {isSubmitting ? "Processing Update..." : "Apply Financial Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
