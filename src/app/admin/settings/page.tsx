"use client";

import { useState } from "react";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Settings, Mail, ShieldAlert, Activity, Save } from "lucide-react";

export default function AdminSettingsPage() {
    const { isSubmitting, updateSettings } = useAdminSettings();
    const [formData, setFormData] = useState({
        email: "",
        transaction_limit: "",
        status: "Active"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: any = {};
        if (formData.email) payload.email = formData.email;
        if (formData.transaction_limit) payload.transaction_limit = parseFloat(formData.transaction_limit);
        if (formData.status) payload.status = formData.status;

        await updateSettings(payload);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                <p className="text-muted-foreground text-sm">
                    Global configuration for administrative alerts and system status.
                </p>
            </div>

            <Card className="border-none shadow-xl overflow-hidden">
                <CardHeader className="bg-slate-900 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" /> Preferences
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Configure system-wide parameters and admin notifications.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-primary" /> Master Admin Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@coinsafehub.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="h-11"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Primary contact for automated system alerts and security reports.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="limit" className="flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-orange-500" /> Transaction Threshold ($)
                                </Label>
                                <Input
                                    id="limit"
                                    type="number"
                                    placeholder="10000"
                                    value={formData.transaction_limit}
                                    onChange={e => setFormData({ ...formData, transaction_limit: e.target.value })}
                                    className="h-11"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Minimum transaction amount requiring secondary manual verification.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status" className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-blue-500" /> Global System Mode
                                </Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={v => setFormData({ ...formData, status: v })}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active (Normal Operation)</SelectItem>
                                        <SelectItem value="Maintenance">Maintenance Mode</SelectItem>
                                        <SelectItem value="Restricted">Restricted Access</SelectItem>
                                        <SelectItem value="Offline">Offline / Emergency</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-muted-foreground">
                                    Changing this will immediately affect all user portals and API availability.
                                </p>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button type="submit" className="w-full h-12 gap-2 text-md font-bold shadow-lg shadow-primary/20" disabled={isSubmitting}>
                                <Save className="h-5 w-5" />
                                {isSubmitting ? "Saving Configuration..." : "Apply System Updates"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="p-4 rounded-lg bg-orange-50 border border-orange-200 flex gap-3">
                <ShieldAlert className="h-6 w-6 text-orange-600 shrink-0" />
                <div className="space-y-1">
                    <p className="text-sm font-bold text-orange-800">Security Notice</p>
                    <p className="text-xs text-orange-700 leading-relaxed">
                        Changes made here are global and will take effect immediately. Ensure you have double-checked the Admin Email and System Mode before saving, as incorrect settings may trigger security lockdowns.
                    </p>
                </div>
            </div>
        </div>
    );
}
