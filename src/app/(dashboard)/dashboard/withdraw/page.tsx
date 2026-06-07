"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/hooks/useDashboard";
import { useWithdrawal, WithdrawalMethod } from "@/hooks/useWithdrawal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import {
    Bitcoin,
    Coins,
    Landmark,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    CheckCircle2,
    Loader2,
    AlertCircle,
    ChevronRight,
    Wallet,
    Info,
    ArrowDownCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function WithdrawalPage() {
    const router = useRouter();
    const { summary } = useDashboard();
    const { methods, isLoading, isSubmitting, submitWithdrawal } = useWithdrawal();

    const [step, setStep] = useState(1);
    const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod | null>(null);

    // Form states
    const [amount, setAmount] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");
    const [routingNumber, setRoutingNumber] = useState("");
    const [pin, setPin] = useState("");

    const handleNext = () => {
        if (step === 1) {
            const numAmount = parseFloat(amount);
            const availableBalance = summary?.balance ?? 0;

            if (isNaN(numAmount) || numAmount < 1000) {
                toast.error("Minimum withdrawal amount is $1,000");
                return;
            }

            if (numAmount > availableBalance) {
                toast.error(`Insufficient balance. Available: $${availableBalance.toLocaleString()}`);
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!selectedMethod) {
                toast.error("Please select a withdrawal method");
                return;
            }
            const isBank = selectedMethod.name === "Bank Transfer";
            if (isBank) {
                if (!bankName || !accountNumber || !accountName || !routingNumber) {
                    toast.error("Please fill in all bank details including routing number");
                    return;
                }
            } else {
                if (!walletAddress) {
                    toast.error("Please enter your wallet address");
                    return;
                }
            }
            setStep(3);
        }
    };

    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        if (pin.length !== 4) {
            toast.error("Please enter your 4-digit security PIN");
            return;
        }

        if (!selectedMethod) return;

        const isBank = selectedMethod.name === "Bank Transfer";
        const payload: any = {
            amount: parseFloat(amount),
            withdrawal_method: selectedMethod.id,
            pin: pin
        };

        if (isBank) {
            payload.bank_name = bankName;
            payload.account_number = accountNumber;
            payload.routing_number = routingNumber; // Need to add routingNumber state
            payload.account_name = accountName;
        } else {
            payload.wallet_address = walletAddress;
        }

        const success = await submitWithdrawal(payload);
        if (success) {
            setStep(1);
            setAmount("");
            setPin("");
            router.push("/dashboard");
        }
    };

    const getIcon = (name: string) => {
        if (name.includes("Bitcoin")) return <Bitcoin className="h-6 w-6 text-orange-500" />;
        if (name.includes("Ethereum")) return <Coins className="h-6 w-6 text-slate-400" />;
        if (name.includes("Bank")) return <Landmark className="h-6 w-6 text-indigo-400" />;
        return <Coins className="h-6 w-6 text-blue-500" />;
    };

    if (isLoading) {
        return (
            <div className="flex h-[600px] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Withdraw Assets</h1>
                    <p className="text-muted-foreground font-medium">Transfer your earnings to your preferred destination.</p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl glass-card border-none">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                                step === s ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110" :
                                    step > s ? "bg-blue-500 text-white" : "bg-white/5 text-muted-foreground"
                            )}>
                                {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                            </div>
                            {s < 3 && <div className={cn("h-px w-6 bg-white/10", step > s && "bg-blue-500/50")} />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid gap-10 lg:grid-cols-5">
                <div className="lg:col-span-3 space-y-6">
                    {step === 1 && (
                        <Card className="glass-card border-none overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <CardHeader className="p-8">
                                <CardTitle className="text-2xl font-black">Step 1: Set Amount</CardTitle>
                                <CardDescription className="text-sm font-medium text-muted-foreground/80">Specify the total amount you wish to withdraw from your available balance.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-8">
                                <div className="space-y-4">
                                    <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Payout Amount (USD)</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                            <span className="text-2xl font-bold text-muted-foreground/50">$</span>
                                        </div>
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="1,000.00"
                                            className="h-20 pl-12 text-3xl font-black bg-white/5 border-white/5 focus:border-primary/50 transition-all rounded-[1.5rem]"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                        />
                                    </div>
                                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex gap-3 text-orange-200">
                                        <AlertCircle className="h-5 w-5 shrink-0" />
                                        <p className="text-[10px] font-bold uppercase tracking-wider">Minimum withdrawal: $1,000.00</p>
                                    </div>
                                </div>

                                <Button onClick={handleNext} className="w-full h-16 rounded-[1.5rem] bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                                    Select Payout Method
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {step === 2 && (
                        <Card className="glass-card border-none overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                            <CardHeader className="p-8">
                                <CardTitle className="text-2xl font-black">Step 2: Destination</CardTitle>
                                <CardDescription className="text-sm font-medium">Choose where you want your funds sent.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {methods.map((pm) => (
                                        <button
                                            key={pm.id}
                                            onClick={() => setSelectedMethod(pm)}
                                            className={cn(
                                                "flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 group text-left",
                                                selectedMethod?.id === pm.id
                                                    ? "bg-primary border-transparent shadow-lg shadow-primary/20 scale-[1.02]"
                                                    : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                                                selectedMethod?.id === pm.id ? "bg-white/20" : "bg-black/20"
                                            )}>
                                                {getIcon(pm.name)}
                                            </div>
                                            <div className="flex-1">
                                                <p className={cn("text-sm font-bold", selectedMethod?.id === pm.id ? "text-white" : "text-foreground")}>{pm.name}</p>
                                                <p className={cn("text-[10px] uppercase font-bold tracking-widest", selectedMethod?.id === pm.id ? "text-white/70" : "text-muted-foreground")}>INSTANT PAYOUT</p>
                                            </div>
                                            {selectedMethod?.id === pm.id && <CheckCircle2 className="h-5 w-5 text-white" />}
                                        </button>
                                    ))}
                                </div>

                                {selectedMethod && (
                                    <div className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in zoom-in-95">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Account Details</Label>
                                        {selectedMethod.name === "Bank Transfer" ? (
                                            <div className="grid gap-3">
                                                <Input placeholder="Bank Name" value={bankName} onChange={e => setBankName(e.target.value)} className="h-12 bg-white/5 border-white/5" />
                                                <Input placeholder="Account Number / IBAN" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="h-12 bg-white/5 border-white/5" />
                                                <Input placeholder="Account Holder Name" value={accountName} onChange={e => setAccountName(e.target.value)} className="h-12 bg-white/5 border-white/5" />
                                                <Input placeholder="Routing Number / SWIFT" value={routingNumber} onChange={e => setRoutingNumber(e.target.value)} className="h-12 bg-white/5 border-white/5" />
                                            </div>
                                        ) : (
                                            <div className="relative group">
                                                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-50" />
                                                <Input
                                                    placeholder="Enter your wallet address"
                                                    value={walletAddress}
                                                    onChange={e => setWalletAddress(e.target.value)}
                                                    className="h-14 pl-12 bg-white/5 border-white/5 font-mono text-sm"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <Button variant="ghost" onClick={handleBack} className="h-14 px-8 rounded-2xl font-bold hover:bg-white/5">
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                    <Button onClick={handleNext} disabled={!selectedMethod} className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                                        Continue to Security
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {step === 3 && (
                        <Card className="glass-card border-none overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                            <CardHeader className="p-8 text-center bg-black/20">
                                <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <ShieldCheck className="h-10 w-10 text-primary" />
                                </div>
                                <CardTitle className="text-2xl font-black">Security Verification</CardTitle>
                                <CardDescription className="text-sm font-medium">Please enter your 4-digit security PIN to authorize this withdrawal.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8 flex flex-col items-center">
                                <div className="space-y-4 text-center">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">4-Digit Security PIN</Label>
                                    <InputOTP maxLength={4} value={pin} onChange={setPin} className="gap-4">
                                        <InputOTPGroup className="gap-2">
                                            <InputOTPSlot index={0} className="h-16 w-14 text-2xl font-black rounded-xl border-white/10 bg-white/5" />
                                            <InputOTPSlot index={1} className="h-16 w-14 text-2xl font-black rounded-xl border-white/10 bg-white/5" />
                                            <InputOTPSlot index={2} className="h-16 w-14 text-2xl font-black rounded-xl border-white/10 bg-white/5" />
                                            <InputOTPSlot index={3} className="h-16 w-14 text-2xl font-black rounded-xl border-white/10 bg-white/5" />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>

                                <div className="w-full space-y-4">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                                        <Info className="h-4 w-4 text-primary mt-0.5" />
                                        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">By confirming, you authorize the immediate transfer of funds. Processing times may vary based on the destination network.</p>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button variant="ghost" onClick={handleBack} className="h-16 px-8 rounded-[1.5rem] font-bold hover:bg-white/5">
                                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting || pin.length !== 4}
                                            className="flex-1 h-16 rounded-[1.5rem] bg-blue-500 text-white font-black text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-transform"
                                        >
                                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize Payout"}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="glass-card border-none bg-gradient-to-br from-primary/10 to-accent/5 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ArrowDownCircle className="h-20 w-20 -rotate-12" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-xl font-black tracking-tight">Withdrawal Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 relative z-10">
                            <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                <span className="text-muted-foreground font-medium uppercase tracking-tighter text-[10px]">Requested</span>
                                <span className="text-foreground font-bold">${amount ? parseFloat(amount).toLocaleString() : "0.00"}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                <span className="text-muted-foreground font-medium uppercase tracking-tighter text-[10px]">Method</span>
                                <span className="text-foreground font-bold">{selectedMethod?.name || "---"}</span>
                            </div>
                            <div className="pt-6 flex flex-col items-center">
                                <span className="text-xs font-bold uppercase text-muted-foreground mb-1">Estimated Credit</span>
                                <span className="text-4xl font-black text-primary tracking-tighter italic">
                                    ${amount ? parseFloat(amount).toLocaleString() : "0.00"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-6 rounded-[1.5rem] border border-white/5 bg-white/5 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-xs font-bold text-foreground">Anti-Money Laundering (AML) Compliance</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">All withdrawals are subject to verification by our compliance department. Funds are usually processed within 24 hours of authorization.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActionButton({ href, label, icon: Icon, color }: { href: string; label: string; icon: any; color: string }) {
    return (
        <Link href={href} className="group no-underline h-full">
            <div className="h-full glass-card border-none hover:bg-white/5 transition-all duration-300 p-4 flex flex-col items-center justify-center gap-3 text-center rounded-[2rem]">
                <div className={cn("p-4 rounded-2xl shadow-xl transition-transform group-hover:scale-110", color)}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-foreground">{label}</span>
            </div>
        </Link>
    );
}
