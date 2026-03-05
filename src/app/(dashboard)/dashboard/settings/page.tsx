"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { User, Shield, Wallet, Lock, Bell, Loader2 } from "lucide-react";

interface UserProfile {
    fullname?: string;
    email?: string;
    phone?: string;
    dob?: string;
    country?: string;
    address?: string;
    preferred_withdrawal_method?: string;
    crypto_wallet_address?: string;
}

export default function SettingsPage() {
    const { isSubmitting, updateProfile, changePassword, updatePin, getMe } = useSettings();
    const [isLoading, setIsLoading] = useState(true);

    // Profile state
    const [profile, setProfile] = useState<UserProfile>({
        fullname: "",
        email: "",
        phone: "",
        dob: "",
        country: "",
        address: ""
    });

    // Withdrawal state
    const [withdrawal, setWithdrawal] = useState({
        preferred_withdrawal_method: "bank",
        crypto_wallet_address: ""
    });

    // Password state
    const [passwords, setPasswords] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // PIN state
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");

    useEffect(() => {
        const loadUser = async () => {
            setIsLoading(true);
            const data = await getMe() as UserProfile | null;
            if (data) {
                setProfile({
                    fullname: data.fullname || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    dob: data.dob || "",
                    country: data.country || "",
                    address: data.address || ""
                });
                setWithdrawal({
                    preferred_withdrawal_method: data.preferred_withdrawal_method || "bank",
                    crypto_wallet_address: data.crypto_wallet_address || ""
                });
            }
            setIsLoading(false);
        };
        loadUser();
    }, []);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateProfile(profile);
    };

    const handleWithdrawalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateProfile({
            ...profile,
            ...withdrawal
        });
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        await changePassword({
            old_password: passwords.oldPassword,
            new_password: passwords.newPassword,
            confirm_password: passwords.confirmPassword
        });
        setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    };

    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length !== 4) {
            toast.error("PIN must be 4 digits");
            return;
        }
        if (pin !== confirmPin) {
            toast.error("PINs do not match");
            return;
        }
        await updatePin(pin);
        setPin("");
        setConfirmPin("");
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground">
                    Manage your personal information, security, and preferences.
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="h-4 w-4" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="withdrawal" className="gap-2">
                        <Wallet className="h-4 w-4" /> Withdrawal
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                        <Shield className="h-4 w-4" /> Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" /> Alerts
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Details</CardTitle>
                            <CardDescription>Update your personal information used for verification.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileSubmit} className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="fullname">Full Name</Label>
                                    <Input
                                        id="fullname"
                                        placeholder="John Doe"
                                        value={profile.fullname}
                                        onChange={e => setProfile({ ...profile, fullname: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        disabled
                                        value={profile.email}
                                    />
                                    <p className="text-[10px] text-muted-foreground">Email cannot be changed.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        placeholder="+1..."
                                        value={profile.phone}
                                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dob">Date of Birth</Label>
                                    <Input
                                        id="dob"
                                        type="date"
                                        value={profile.dob}
                                        onChange={e => setProfile({ ...profile, dob: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        placeholder="United States"
                                        value={profile.country}
                                        onChange={e => setProfile({ ...profile, country: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Full Address</Label>
                                    <Input
                                        id="address"
                                        placeholder="123 Main St..."
                                        value={profile.address}
                                        onChange={e => setProfile({ ...profile, address: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Update Profile
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="withdrawal">
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Preferences</CardTitle>
                                <CardDescription>Configure your default withdrawal destination.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Preferred Method</Label>
                                        <Select
                                            value={withdrawal.preferred_withdrawal_method}
                                            onValueChange={(v) => setWithdrawal({ ...withdrawal, preferred_withdrawal_method: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bank">Bank Transfer</SelectItem>
                                                <SelectItem value="crypto">Crypto Wallet</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="crypto_address">Default Crypto Address</Label>
                                        <Input
                                            id="crypto_address"
                                            placeholder="0x... or BTC address"
                                            value={withdrawal.crypto_wallet_address}
                                            onChange={e => setWithdrawal({ ...withdrawal, crypto_wallet_address: e.target.value })}
                                        />
                                    </div>
                                    <Button type="submit" disabled={isSubmitting}>
                                        Save Preferences
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Withdrawal PIN</CardTitle>
                                <CardDescription>This PIN is required for every withdrawal request.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePinSubmit} className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>New 4-Digit PIN</Label>
                                            <InputOTP maxLength={4} value={pin} onChange={setPin}>
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                    <InputOTPSlot index={3} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Confirm PIN</Label>
                                            <InputOTP maxLength={4} value={confirmPin} onChange={setConfirmPin}>
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                    <InputOTPSlot index={3} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={isSubmitting || pin.length !== 4}>
                                        Update PIN
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Protect your account with a unique, strong password.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="old_pass">Current Password</Label>
                                    <Input
                                        id="old_pass"
                                        type="password"
                                        value={passwords.oldPassword}
                                        onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new_pass">New Password</Label>
                                    <Input
                                        id="new_pass"
                                        type="password"
                                        value={passwords.newPassword}
                                        onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm_pass">Confirm New Password</Label>
                                    <Input
                                        id="confirm_pass"
                                        type="password"
                                        value={passwords.confirmPassword}
                                        onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={isSubmitting}>
                                    Update Password
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Notifications</CardTitle>
                            <CardDescription>Control which alerts you receive via email.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <p className="font-medium text-sm">Security Alerts</p>
                                    <p className="text-xs text-muted-foreground">Get notified when someone logs in from a new device.</p>
                                </div>
                                {/* Toggle placeholder */}
                                <div className="h-6 w-10 bg-primary/20 rounded-full flex items-center px-1">
                                    <div className="h-4 w-4 bg-primary rounded-full ml-auto" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <p className="font-medium text-sm">Transaction Alerts</p>
                                    <p className="text-xs text-muted-foreground">Get notified when a deposit or withdrawal is completed.</p>
                                </div>
                                <div className="h-6 w-10 bg-primary/20 rounded-full flex items-center px-1">
                                    <div className="h-4 w-4 bg-primary rounded-full ml-auto" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
