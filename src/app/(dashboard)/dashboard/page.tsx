"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    ArrowUpCircle,
    ArrowDownCircle,
    Plus,
    ArrowRight,
    ShieldCheck,
    Loader2,
    History,
    Send,
    Lock,
    Landmark,
    Wallet
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    const { summary, recentTransactions, isLoading } = useDashboard();

    if (isLoading) {
        return (
            <div className="flex h-[600px] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse font-medium">Synchronizing your escrow dashboard...</p>
                </div>
            </div>
        );
    }

    const formatCurrency = (val: number | null | undefined) => {
        const safe = typeof val === "number" && !isNaN(val) ? val : 0;
        return safe.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const recoveredVault = summary?.recovered_balance ?? 0;
    const totalDeposits = summary?.total_deposit ?? 0;
    const availableForWithdrawal = recoveredVault + totalDeposits;

    const statCards = [
        {
            title: "Recovered Vault Balance",
            value: formatCurrency(recoveredVault),
            icon: <Lock className="h-5 w-5 text-blue-500" />,
            description: "Assets held in multi-sig escrow",
            color: "blue"
        },
        {
            title: "Total Ledger Deposits",
            value: formatCurrency(totalDeposits),
            icon: <Landmark className="h-5 w-5 text-teal-400" />,
            description: "Operational deposits for case processing",
            color: "teal"
        },
        {
            title: "Available for Withdrawal",
            value: formatCurrency(availableForWithdrawal),
            icon: <Wallet className="h-5 w-5 text-cyan-500" />,
            description: "Vault balance + ledger deposits combined",
            color: "cyan"
        },
    ];

    return (
        <div className="space-y-10 pb-10">
            {/* 1. Header Portfolio Summary */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 p-8 rounded-[2rem] glass-card flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldCheck className="h-32 w-32 rotate-12" />
                    </div>

                    <div className="relative z-10">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-2">Case Reference</p>
                        <h2 className="text-3xl font-black tracking-tighter text-foreground mb-1 font-mono">
                            #CSH-10024
                        </h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Recovery Case</p>
                    </div>

                    <div className="mt-8 flex items-center gap-8 relative z-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Current Phase</p>
                            <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                Phase 3 — Escrow Holding
                            </p>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Next Phase</p>
                            <p className="text-sm font-bold text-foreground">Awaiting Clearance</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Card */}
                <div className="grid grid-cols-2 gap-4">
                    <ActionButton href="/dashboard/deposit" label="Deposit" icon={Plus} color="bg-blue-500" />
                    <ActionButton href="/dashboard/withdraw" label="Withdraw" icon={ArrowRight} color="bg-rose-500" />
                    <ActionButton href="/dashboard/transfer" label="Transfer" icon={Send} color="bg-indigo-500" />
                    <ActionButton href="/dashboard/documents" label="Documents" icon={ShieldCheck} color="bg-primary" />
                </div>
            </div>

            {/* 2. Stats Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-bold tracking-tight">Escrow Vault Overview</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Live Balance</p>
                </div>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    {statCards.map((card, idx) => (
                        <Card key={idx} className="glass-card border-none hover:bg-white/5 transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                                    {card.title}
                                </CardTitle>
                                <div className={cn("p-2 rounded-xl bg-white/5", `text-${card.color}-500 group-hover:scale-110 transition-transform`)}>
                                    {card.icon}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black tracking-tight text-foreground">
                                    {card.value}
                                </div>
                                <p className="text-[10px] font-medium text-muted-foreground/60 mt-2 leading-relaxed">
                                    {card.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* 3. Recent Transactions */}
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                            <History className="h-5 w-5 text-primary" />
                            Case Activity Ledger
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">Your latest case-related financial movements</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-wider hover:bg-white/5" asChild>
                        <Link href="/dashboard/transactions">View Full Ledger</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Transaction</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Amount</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Status</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentTransactions.length > 0 ? (
                                recentTransactions.slice(0, 5).map((tx) => (
                                    <TableRow key={tx.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-lg",
                                                    tx.transaction_type === 'deposit' ? "bg-blue-500/10 text-blue-500" :
                                                        tx.transaction_type === 'withdrawal' ? "bg-rose-500/10 text-rose-500" :
                                                            "bg-primary/10 text-primary"
                                                )}>
                                                    {tx.transaction_type === 'deposit' ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                                                </div>
                                                <span className="font-bold text-sm capitalize">{tx.transaction_type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-black text-sm">
                                            {formatCurrency(tx.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={cn(
                                                    "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                                                    (tx.status === "completed" || tx.status === "approved") ? "bg-blue-500/10 text-blue-500" :
                                                        tx.status === "pending" ? "bg-orange-500/10 text-orange-500" :
                                                            "bg-rose-500/10 text-rose-500"
                                                )}
                                            >
                                                {tx.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-xs font-medium text-muted-foreground">
                                            {format(new Date(tx.created_at), "MMM dd, yyyy")}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-medium">
                                        No case activity detected.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
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
