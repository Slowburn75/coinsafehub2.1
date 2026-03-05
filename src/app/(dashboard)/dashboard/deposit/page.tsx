"use client";

import { useState } from "react";
import { useDeposit } from "@/hooks/useDeposit";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Copy,
    CheckCircle2,
    Bitcoin,
    Coins,
    Landmark,
    ArrowRight,
    ArrowLeft,
    Upload,
    ShieldCheck,
    History,
    ChevronRight,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const PAYMENT_METHODS = [
    { id: "USDT (ERC20)", label: "Tether USDT (ERC20)", icon: <Coins className="h-6 w-6 text-emerald-500" />, network: "ERC20" },
    { id: "USDT (TRC20)", label: "Tether USDT (TRC20)", icon: <Coins className="h-6 w-6 text-emerald-600" />, network: "TRC20" },
    { id: "Ethereum", label: "Ethereum (ETH)", icon: <Coins className="h-6 w-6 text-slate-400" />, network: "Mainnet" },
    { id: "Bitcoin", label: "Bitcoin (BTC)", icon: <Bitcoin className="h-6 w-6 text-orange-500" />, network: "BTC" },
    { id: "Bank Transfer", label: "Bank Transfer", icon: <Landmark className="h-6 w-6 text-indigo-400" />, network: "SWIFT/SEPA" },
    { id: "USDC (ERC20)", label: "USDC (ERC20)", icon: <Coins className="h-6 w-6 text-blue-500" />, network: "ERC20" },
];

export default function DepositPage() {
    const { history, addresses, isLoading, isSubmitting, submitDeposit } = useDeposit();

    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("");
    const [receipt, setReceipt] = useState<File | null>(null);

    const handleNext = () => {
        if (step === 1 && !amount) {
            toast.error("Please enter a valid amount.");
            return;
        }
        if (step === 2 && !method) {
            toast.error("Please select a payment method.");
            return;
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => setStep(prev => prev - 1);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Wallet address copied!");
    };

    const handleFinalConfirm = async () => {
        if (!receipt) {
            toast.error("Please upload payment proof to continue.");
            return;
        }

        const success = await submitDeposit({
            amount,
            payment_method: method,
            wallet_address: addresses[method] || "Contact Support",
            receipt,
        });

        if (success) {
            setStep(1);
            setAmount("");
            setMethod("");
            setReceipt(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Fund Your Account</h1>
                    <p className="text-muted-foreground font-medium">Add capital to your investment portfolio securely.</p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl glass-card border-none">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                                step === s ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110" :
                                    step > s ? "bg-emerald-500 text-white" : "bg-white/5 text-muted-foreground"
                            )}>
                                {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                            </div>
                            {s < 3 && <div className={cn("h-px w-6 bg-white/10", step > s && "bg-emerald-500/50")} />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid gap-10 lg:grid-cols-5">
                {/* Main Flow Area */}
                <div className="lg:col-span-3 space-y-6">
                    {step === 1 && (
                        <Card className="glass-card border-none overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <CardHeader className="p-8">
                                <CardTitle className="text-2xl font-black">Step 1: Investment Amount</CardTitle>
                                <CardDescription className="text-sm font-medium">Enter the total amount you wish to credit.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-8">
                                <div className="space-y-4">
                                    <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Amount in USD</Label>
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
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        {[100, 500, 1000, 5000].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => setAmount(val.toString())}
                                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-colors"
                                            >
                                                +${val}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4">
                                    <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-foreground">Secure Vault Encryption</p>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed">Your funds are protected by multi-signature cold storage protocols immediately upon receipt.</p>
                                    </div>
                                </div>

                                <Button onClick={handleNext} className="w-full h-16 rounded-[1.5rem] bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                                    Continue to Gateway
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {step === 2 && (
                        <Card className="glass-card border-none overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                            <CardHeader className="p-8">
                                <CardTitle className="text-2xl font-black">Step 2: Selection Gateway</CardTitle>
                                <CardDescription className="text-sm font-medium">Choose your preferred transfer method.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {PAYMENT_METHODS.map((pm) => (
                                        <button
                                            key={pm.id}
                                            onClick={() => setMethod(pm.id)}
                                            className={cn(
                                                "flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 group text-left",
                                                method === pm.id
                                                    ? "bg-primary border-transparent shadow-lg shadow-primary/20 scale-[1.02]"
                                                    : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                                                method === pm.id ? "bg-white/20" : "bg-black/20"
                                            )}>
                                                {pm.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className={cn("text-sm font-bold", method === pm.id ? "text-white" : "text-foreground")}>{pm.label}</p>
                                                <p className={cn("text-[10px] uppercase font-bold tracking-widest", method === pm.id ? "text-white/70" : "text-muted-foreground")}>{pm.network}</p>
                                            </div>
                                            {method === pm.id && <CheckCircle2 className="h-5 w-5 text-white" />}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                    <Button variant="ghost" onClick={handleBack} className="h-14 px-8 rounded-2xl font-bold hover:bg-white/5">
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                    <Button onClick={handleNext} disabled={!method} className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                                        Continue to Payment
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {step === 3 && (
                        <Card className="glass-card border-none overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                            <CardHeader className="p-8 bg-black/20">
                                <CardTitle className="text-2xl font-black">Step 3: Finalize Transfer</CardTitle>
                                <CardDescription className="text-sm font-medium">Verify details and submit your proof of payment.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                                    <div className="flex justify-between items-center group/copy cursor-pointer" onClick={() => handleCopy(addresses[method] || "Contact Support")}>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Deposit Address</p>
                                        <Copy className="h-3 w-3 text-primary group-hover/copy:scale-125 transition-transform" />
                                    </div>
                                    <div className="font-mono text-sm bg-black/30 p-4 rounded-xl break-all border border-white/5 text-primary-foreground/90">
                                        {addresses[method] || "Address verification needed. Please contact concierge support."}
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-white/5">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">Expected Crediting Time</span>
                                        <span className="text-xs font-bold text-foreground">5 - 30 Minutes</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Upload Proof of Payment</Label>
                                    <div className="relative group/upload">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            accept="image/*"
                                            onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                                        />
                                        <div className={cn(
                                            "h-40 rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all",
                                            receipt ? "bg-emerald-500/5 border-emerald-500/30" : "bg-white/5 border-white/10 group-hover/upload:bg-white/10 group-hover/upload:border-primary/50"
                                        )}>
                                            <div className={cn("p-4 rounded-full", receipt ? "bg-emerald-500/20 text-emerald-500" : "bg-white/10 text-muted-foreground")}>
                                                {receipt ? <CheckCircle2 className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
                                            </div>
                                            <p className="text-sm font-bold">{receipt ? receipt.name : "Select or Drop Receipt Image"}</p>
                                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">JPG, PNG or PDF (MAX 5MB)</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button variant="ghost" onClick={handleBack} className="h-16 px-8 rounded-[1.5rem] font-bold hover:bg-white/5">
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                    <Button
                                        onClick={handleFinalConfirm}
                                        disabled={isSubmitting || !receipt}
                                        className="flex-1 h-16 rounded-[1.5rem] bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                                    >
                                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "I've Sent the Funds"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="glass-card border-none bg-gradient-to-br from-primary/10 to-accent/5">
                        <CardHeader>
                            <CardTitle className="text-lg font-black tracking-tight">Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                <span className="text-muted-foreground font-medium">Recipient</span>
                                <span className="text-foreground font-bold italic">Private Escrow</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                <span className="text-muted-foreground font-medium">Asset</span>
                                <span className="text-foreground font-bold">{amount ? `$${amount}` : "---"}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                <span className="text-muted-foreground font-medium">Gateway</span>
                                <span className="text-foreground font-bold">{method || "---"}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                <span className="text-muted-foreground font-medium">Fees (0.01%)</span>
                                <span className="text-emerald-500 font-bold">$0.00</span>
                            </div>
                            <div className="pt-4 flex justify-between items-center">
                                <span className="text-md font-black uppercase text-foreground">Total Credit</span>
                                <span className="text-2xl font-black text-primary italic">${amount || "0"}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-none">
                        <CardHeader>
                            <CardTitle className="text-lg font-black flex items-center gap-2">
                                <History className="h-5 w-5 text-primary" />
                                Recent History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[300px] overflow-y-auto scrollbar-hide px-6 pb-6 space-y-4">
                                {isLoading ? (
                                    <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                                ) : history.length > 0 ? (
                                    history.slice(0, 5).map((tx, idx) => (
                                        <div key={tx.id || idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-foreground capitalize">{tx.payment_method}</span>
                                                <span className="text-[10px] text-muted-foreground">{tx.created_at ? format(new Date(tx.created_at), "MMM d, HH:mm") : tx.date}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-black text-foreground">${tx.amount.toLocaleString()}</span>
                                                <Badge className={cn(
                                                    "text-[8px] px-1 py-0 h-4 border-none font-black uppercase",
                                                    (tx.status === "Completed" || tx.status === "approved") ? "bg-emerald-500/20 text-emerald-500" :
                                                        tx.status === "Pending" ? "bg-orange-500/20 text-orange-500" : "bg-rose-500/20 text-rose-500"
                                                )}>
                                                    {tx.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-10 text-xs text-muted-foreground font-medium italic">No previous records found.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
