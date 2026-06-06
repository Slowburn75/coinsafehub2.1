"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminLogin } from "@/hooks/useAdminLogin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();
    const { isSubmitting, login } = useAdminLogin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login({ email, password });
        if (success) {
            router.push("/admin/dashboard");
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50 px-4">
            <Card className="w-full max-w-md border-none shadow-xl">
                <CardHeader className="space-y-1 bg-primary text-primary-foreground rounded-t-lg py-8 text-center">
                    <div className="flex justify-center mb-2">
                        <div className="rounded-full bg-white/20 p-2">
                            <ShieldCheck className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        AssetSafeHub Admin
                    </CardTitle>
                    <p className="text-sm text-primary-foreground/80">
                        Enter your credentials to access the admin portal
                    </p>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@coinsafehub.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <a href="#" className="text-xs text-primary hover:underline">
                                    Forgot password?
                                </a>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-12"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 text-md font-semibold"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Authenticating..." : "Login to Dashboard"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
