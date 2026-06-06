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
    History,
    ArrowUpCircle,
    ArrowDownCircle,
    Filter,
    ArrowRightLeft,
    Search,
    Download,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";

export default function TransactionsPage() {
    const { recentTransactions, isLoading } = useDashboard();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    const filteredTransactions = recentTransactions.filter(tx => {
        const matchesSearch = String(tx.transaction_type || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(tx.amount || 0).includes(searchQuery);
        const matchesFilter = activeFilter === "all" || tx.transaction_type === activeFilter;
        return matchesSearch && matchesFilter;
    });

    if (isLoading) {
        return (
            <div className="flex h-[600px] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Transaction Ledger</h1>
                    <p className="text-muted-foreground font-medium italic">A comprehensive history of your financial movements.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="h-12 px-6 rounded-2xl glass-card border-none hover:bg-white/5 font-bold gap-2">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button asChild className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20">
                        <Link href="/dashboard/deposit">New Transfer</Link>
                    </Button>
                </div>
            </div>

            {/* Filters Bar */}
            <Card className="glass-card border-none p-4">
                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <FilterButton
                            active={activeFilter === "all"}
                            onClick={() => setActiveFilter("all")}
                            label="All Activity"
                        />
                        <FilterButton
                            active={activeFilter === "deposit"}
                            onClick={() => setActiveFilter("deposit")}
                            label="Deposits"
                            icon={ArrowUpCircle}
                        />
                        <FilterButton
                            active={activeFilter === "withdrawal"}
                            onClick={() => setActiveFilter("withdrawal")}
                            label="Withdrawals"
                            icon={ArrowDownCircle}
                        />
                    </div>
                    <div className="relative group max-w-sm w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search by amount or type..."
                            className="h-12 pl-12 bg-white/5 border-white/5 focus:border-primary/40 rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            {/* Main Ledger */}
            <Card className="glass-card border-none overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent h-16 bg-white/5">
                                <TableHead className="pl-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reference</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Type</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Amount</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</TableHead>
                                <TableHead className="pr-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Date & Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((tx) => (
                                    <TableRow key={`${tx.transaction_type}-${tx.id}`} className="border-white/5 hover:bg-white/5 transition-colors h-20">
                                        <TableCell className="pl-8">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-foreground font-mono">#{tx.id ? String(tx.id).slice(0, 8) : "TXN-" + Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                                                <span className="text-[10px] text-muted-foreground">{tx.payment_method || "System Protocol"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center">
                                                <Badge className={cn(
                                                    "px-3 py-1 rounded-lg border-none font-bold text-[10px] uppercase gap-2",
                                                    tx.transaction_type === 'deposit' ? "bg-blue-500/10 text-blue-400" :
                                                        tx.transaction_type === 'withdrawal' ? "bg-rose-500/10 text-rose-400" :
                                                            "bg-primary/10 text-primary"
                                                )}>
                                                    {tx.transaction_type === 'deposit' ? <ArrowUpCircle className="h-3 w-3" /> : <ArrowDownCircle className="h-3 w-3" />}
                                                    {tx.transaction_type}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-black text-foreground">
                                                ${(tx.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "h-1.5 w-1.5 rounded-full animate-pulse",
                                                    (tx.status === "completed" || tx.status === "approved") ? "bg-blue-500" :
                                                        tx.status === "pending" ? "bg-orange-500" : "bg-rose-500"
                                                )} />
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider",
                                                    (tx.status === "completed" || tx.status === "approved") ? "text-blue-500" :
                                                        tx.status === "pending" ? "text-orange-500" : "text-rose-500"
                                                )}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="pr-8 text-right">
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {tx.created_at ? format(new Date(tx.created_at), "MMM dd, yyyy · HH:mm") : "—"}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="p-0 border-none">
                                        <EmptyState
                                            icon={searchQuery ? Search : History}
                                            title={searchQuery ? "No matches found" : "No Ledger Activity"}
                                            description={searchQuery ? "Adjust your search parameters and try again." : "We couldn't find any transactions associated with this account."}
                                            action={searchQuery ? (
                                                <Button variant="ghost" className="font-bold underline" onClick={() => setSearchQuery("")}>Clear Search</Button>
                                            ) : (
                                                <Button asChild className="rounded-xl font-bold px-8 h-12">
                                                    <Link href="/dashboard/deposit">Initiate First Deposit</Link>
                                                </Button>
                                            )}
                                        />
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

function FilterButton({ active, onClick, label, icon: Icon }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-white/5 text-muted-foreground hover:bg-white/10"
            )}
        >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {label}
        </button>
    );
}
