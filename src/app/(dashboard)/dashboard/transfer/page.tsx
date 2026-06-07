"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/hooks/useDashboard";
import { useTransfer } from "@/hooks/useTransfer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { SendHorizontal, AlertTriangle, ArrowRight, ShieldCheck, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TransferPage() {
    const router = useRouter();
    const { summary } = useDashboard();
    const { isSubmitting, submitTransfer } = useTransfer();

    const [amount, setAmount] = useState("");
    const [recipient, setRecipient] = useState("");
    const [description, setDescription] = useState("");
    const [isPinOpen, setIsPinOpen] = useState(false);
    const [pin, setPin] = useState("");

    const handleOpenPin = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        const availableBalance = summary?.balance ?? 0;

        if (!amount || !recipient || !description) {
            toast.error("Please fill in all fields before proceeding!");
            return;
        }
        if (numAmount <= 0) {
            toast.error("Enter a valid settlement value!");
            return;
        }
        if (numAmount > availableBalance) {
            toast.error(`Insufficient balance. Available: $${availableBalance.toLocaleString()}`);
            return;
        }
        setIsPinOpen(true);
    };

    const handleConfirm = async () => {
        if (pin.length !== 4) {
            toast.error("Please enter a valid 4-digit numeric PIN!");
            return;
        }

        const success = await submitTransfer({
            amount: parseFloat(amount),
            recipient,
            description,
            pin,
        });

        if (success) {
            setIsPinOpen(false);
            router.push("/dashboard");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Secure Address Whitelisting</h1>
                    <p className="text-muted-foreground font-medium">Register and verify your secure external destination wallet for final asset dispensation.</p>
                </div>
                <div className="px-4 py-2 rounded-2xl glass-card border-none text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3" />
                    Whitelist Verified
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <Card className="glass-card border-none overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CardHeader className="p-8">
                    <CardTitle className="text-2xl font-black">Whitelist Destination</CardTitle>
                    <CardDescription className="text-sm font-medium text-muted-foreground/80">Specify the external wallet address and settlement value for whitelisting.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <form onSubmit={handleOpenPin} className="space-y-8">
                                <div className="space-y-4">
                                    <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Estimated Settlement Value ($)</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                            <span className="text-2xl font-bold text-muted-foreground/50">$</span>
                                        </div>
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="0.00"
                                            className="h-20 pl-12 text-3xl font-black bg-white/5 border-white/5 focus:border-primary/50 transition-all rounded-[1.5rem]"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label htmlFor="recipient" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Destination Blockchain Address</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                            <span className="text-muted-foreground/50">0x</span>
                                        </div>
                                        <Input
                                            id="recipient"
                                            placeholder="0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
                                            className="h-16 pl-12 bg-white/5 border-white/5 focus:border-primary/50 transition-all rounded-2xl font-mono text-sm"
                                            value={recipient}
                                            onChange={(e) => setRecipient(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Wallet Label / Network</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="e.g., Personal Hardware Wallet - Bitcoin Network"
                                        className="bg-white/5 border-white/5 focus:border-primary/40 rounded-2xl min-h-[100px] p-5 font-medium"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <Button type="submit" className="w-full h-16 rounded-[1.5rem] bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                                    Authorize & Whitelist Address
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card className="glass-card border-none bg-gradient-to-br from-primary/10 to-accent/5 overflow-hidden relative">
                        <CardHeader>
                            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                                <Info className="h-5 w-5 text-primary" />
                                Review & Confirm
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                    <span className="text-muted-foreground font-medium uppercase tracking-tighter text-[10px]">Settle Speed</span>
                                    <span className="text-blue-400 font-bold uppercase tracking-widest text-[10px]">Instant</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-[10px] font-bold uppercase leading-relaxed tracking-wider">
                                <AlertTriangle className="h-4 w-4 mb-2" />
                                NOTICE: Whitelisted addresses undergo cryptographic handshake validation. Ensure your external destination keys are correct before authorizing.
                            </div>

                            <div className="pt-4 flex flex-col items-center">
                                <span className="text-xs font-bold uppercase text-muted-foreground mb-1">Total Locked for Settlement</span>
                                <span className="text-4xl font-black text-foreground tracking-tighter italic">
                                    ${amount ? parseFloat(amount).toLocaleString() : "0.00"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isPinOpen} onOpenChange={setIsPinOpen}>
                <DialogContent className="glass border-white/10 text-foreground sm:max-w-md p-8">
                    <DialogHeader className="text-center space-y-4">
                        <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                            <ShieldCheck className="h-10 w-10 text-primary" />
                        </div>
                        <DialogTitle className="text-2xl font-black">Verify Whitelist Authorization</DialogTitle>
                        <DialogDescription className="text-sm font-medium">
                            Enter your platform-assigned 4-digit PIN to confirm this address whitelisting.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center gap-8 py-8">
                        <InputOTP maxLength={4} value={pin} onChange={setPin} autoFocus>
                            <InputOTPGroup className="gap-2">
                                <InputOTPSlot index={0} className="w-14 h-16 text-2xl font-black rounded-xl border-white/10 bg-white/5" />
                                <InputOTPSlot index={1} className="w-14 h-16 text-2xl font-black rounded-xl border-white/10 bg-white/5" />
                                <InputOTPSlot index={2} className="w-14 h-16 text-2xl font-black rounded-xl border-white/10 bg-white/5" />
                                <InputOTPSlot index={3} className="w-14 h-16 text-2xl font-black rounded-xl border-white/10 bg-white/5" />
                            </InputOTPGroup>
                        </InputOTP>

                        <div className="w-full flex gap-4">
                            <Button variant="ghost" className="flex-1 h-16 rounded-2xl font-bold hover:bg-white/5" onClick={() => setIsPinOpen(false)}>
                                Abort
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                disabled={isSubmitting || pin.length !== 4}
                                className="flex-[2] h-16 rounded-2xl bg-blue-500 text-white font-black text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-transform"
                            >
                                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Confirm & Whitelist"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
