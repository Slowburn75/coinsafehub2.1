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
    Wallet,
    ArrowUpCircle,
    ArrowDownCircle,
    TrendingUp,
    Gift,
    Users,
    Activity,
    PieChart,
    Plus,
    ArrowRight,
    LineChart,
    ShieldCheck,
    Loader2,
    History,
    Send
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
    const { summary, recentTransactions, isLoading } = useDashboard();

    if (isLoading) {
        return (
            <div className="flex h-[600px] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse font-medium">Synchronizing your dashboard...</p>
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

    const statCards = [
        {
            title: "Account Balance",
            value: formatCurrency(summary?.total_balance),
            icon: <Wallet className="h-5 w-5 text-emerald-500" />,
            description: "Sum of all balance fields",
            color: "emerald"
        },
        {
            title: "Recovered Balance",
            value: formatCurrency(summary?.recovered_balance),
            icon: <Activity className="h-5 w-5 text-cyan-500" />,
            description: "Assets recovered via security protocols",
            color: "cyan"
        },
        {
            title: "Investment Balance",
            value: formatCurrency(summary?.investment_balance),
            icon: <PieChart className="h-5 w-5 text-indigo-500" />,
            description: "Capital active in trading plans",
            color: "indigo"
        },
        {
            title: "Total Deposit",
            value: formatCurrency(summary?.total_deposit),
            icon: <ArrowUpCircle className="h-5 w-5 text-teal-400" />,
            description: "Liefetime contribution to platform",
            color: "teal"
        },
        {
            title: "Total Withdrawal",
            value: formatCurrency(summary?.total_withdrawal),
            icon: <ArrowDownCircle className="h-5 w-5 text-rose-500" />,
            description: "Successfully processed payouts",
            color: "rose"
        },
        {
            title: "Total Profit",
            value: formatCurrency(summary?.total_profit ?? summary?.profit_balance),
            icon: <TrendingUp className="h-5 w-5 text-blue-400" />,
            description: "Net returns from active strategies",
            color: "blue"
        },
        {
            title: "Total Bonus",
            value: formatCurrency(summary?.total_bonus ?? summary?.bonus_balance),
            icon: <Gift className="h-5 w-5 text-purple-400" />,
            description: "Promotional and loyalty rewards",
            color: "purple"
        },
        {
            title: "Referral Bonus",
            value: formatCurrency(summary?.total_referral_bonus ?? summary?.referral_balance),
            icon: <Users className="h-5 w-5 text-orange-400" />,
            description: "Commissions from affiliate network",
            color: "orange"
        },
    ];

    const portfolioValue = summary?.total_balance ?? 0;

    return (
        <div className="space-y-10 pb-10">
            {/* 1. Header Portfolio Summary */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 p-8 rounded-[2rem] glass-card flex flex-col justify-between relative overflow-hidden group">
                    {/* Decorative pattern */}
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="h-32 w-32 rotate-12" />
                    </div>

                    <div className="relative z-10">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-2">Total Net Worth</p>
                        <h2 className="text-5xl font-black tracking-tighter text-foreground mb-4">
                            {formatCurrency(portfolioValue)}
                        </h2>
                        <div className="flex items-center gap-3">
                            <Badge className="bg-primary/20 text-primary border-primary/20 px-3 py-1 gap-1">
                                <TrendingUp className="h-3 w-3" />
                                +12.4%
                            </Badge>
                            <span className="text-xs text-muted-foreground font-medium">vs last 30 days</span>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-8 relative z-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Current Plan</p>
                            <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                Premium Growth
                            </p>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Daily Yield</p>
                            <p className="text-sm font-bold text-foreground">~0.45% AVG</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Card */}
                <div className="grid grid-cols-2 gap-4">
                    <ActionButton href="/dashboard/deposit" label="Deposit" icon={Plus} color="bg-emerald-500" />
                    <ActionButton href="/dashboard/withdraw" label="Withdraw" icon={ArrowRight} color="bg-rose-500" />
                    <ActionButton href="/dashboard/plans" label="Invest" icon={LineChart} color="bg-primary" />
                    <ActionButton href="/dashboard/transfer" label="Transfer" icon={Send} color="bg-indigo-500" />
                </div>
            </div>

            {/* 2. Stats Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-bold tracking-tight">Financial Overview</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Real-time Data</p>
                </div>
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
            <div className="grid gap-6 xl:grid-cols-3">
                <Card className="glass-card xl:col-span-2 border-none">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                                <History className="h-5 w-5 text-primary" />
                                Recent Activity
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">Your latest financial movements</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-wider hover:bg-white/5" asChild>
                            <Link href="/dashboard/transactions">View All History</Link>
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
                                                        tx.transaction_type === 'deposit' ? "bg-emerald-500/10 text-emerald-500" :
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
                                                        (tx.status === "completed" || tx.status === "approved") ? "bg-emerald-500/10 text-emerald-500" :
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
                                            No recent activity detected.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Secondary Content - Market or Plan */}
                <Card className="glass-card border-none bg-gradient-to-br from-indigo-500/20 to-primary/10">
                    <CardHeader>
                        <CardTitle className="text-xl font-black tracking-tight">Active Market</CardTitle>
                        <p className="text-xs text-muted-foreground">BTC/USD Real-time performance</p>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-10 space-y-6">
                        <div className="h-32 w-32 relative">
                            <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/30 animate-spin" style={{ animationDuration: '10s' }} />
                            <div className="absolute inset-4 rounded-full border-4 border-primary/60" />
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-2xl font-black text-foreground">$94k</span>
                                <span className="text-[10px] font-bold text-primary">+2.4%</span>
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-sm font-bold text-foreground">Market is Optimistic</p>
                            <p className="text-xs text-muted-foreground px-4">Our trading algorithms are currently capitalizing on low volatility.</p>
                        </div>
                        <Button className="w-full bg-foreground text-background hover:bg-foreground/90 font-bold rounded-2xl">
                            Analyze Markets
                        </Button>
                    </CardContent>
                </Card>
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
