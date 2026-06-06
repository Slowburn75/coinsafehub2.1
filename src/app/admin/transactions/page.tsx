"use client";

import { useAdminTransactions } from "@/hooks/useAdminTransactions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle,
    XCircle,
    Eye,
    FileText,
    Loader2,
    Calendar,
    ArrowUpCircle,
    ArrowDownCircle,
    History,
    ExternalLink,
    Filter,
    Search
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AdminTransactionsPage() {
    const { transactions, isLoading, updateStatus } = useAdminTransactions();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTransactions = transactions.filter(tx => {
        const userValue = typeof tx.user === 'object' ? (tx.user?.email || tx.user?.full_name || tx.user?.name || JSON.stringify(tx.user)) : String(tx.user || "");
        const userMatch = userValue.toLowerCase().includes(searchQuery.toLowerCase());
        const amountMatch = tx.amount?.toString().includes(searchQuery) ?? false;
        const idMatch = String(tx.id || "").toLowerCase().includes(searchQuery.toLowerCase());
        return userMatch || amountMatch || idMatch;
    });

    if (isLoading) {
        return (
            <div className="flex h-[600px] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-foreground text-glow-primary">Global Ledger</h1>
                    <p className="text-muted-foreground font-medium italic text-glow-secondary">Real-time monitoring of all platform financial velocities.</p>
                </div>
                <Card className="glass-card border-none px-6 py-3 flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Requests</span>
                        <span className="text-xl font-black text-primary">{transactions.filter(t => t.status.toLowerCase() === 'pending').length}</span>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Processed 24h</span>
                        <span className="text-xl font-black text-blue-500">{transactions.filter(t => t.status.toLowerCase() === 'approved').length}</span>
                    </div>
                </Card>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" className="h-10 px-4 rounded-xl glass-card border-none hover:bg-white/5 font-bold text-xs gap-2">
                        <Filter className="h-3.5 w-3.5" />
                        Custom Filters
                    </Button>
                </div>
                <div className="relative group max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by username or volume..."
                        className="h-12 pl-12 bg-white/5 border-white/5 focus:border-primary/40 rounded-2xl text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Ledger Table */}
            <Card className="glass-card border-none overflow-hidden translate-z-0">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent h-16 bg-white/5">
                                <TableHead className="pl-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Beneficiary</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Intent</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Net Value</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Verification</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Synchronization</TableHead>
                                <TableHead className="pr-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Operational Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((tx) => (
                                    <TableRow key={`${tx.transaction_type}-${tx.id}`} className="border-white/5 hover:bg-white/5 transition-colors h-20 group">
                                        <TableCell className="pl-8">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                                    {typeof tx.user === 'object' ? (tx.user?.email || tx.user?.full_name || tx.user?.name || "Unknown") : (tx.user || "Unknown")}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-mono">#{tx.id ? String(tx.id).slice(0, 8) : "REF-VOID"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(
                                                "px-3 py-1 rounded-lg border-none font-bold text-[10px] uppercase gap-2 shadow-sm",
                                                tx.transaction_type === 'deposit' ? "bg-blue-500/10 text-blue-400" :
                                                    tx.transaction_type === 'withdrawal' ? "bg-rose-500/10 text-rose-400" :
                                                        "bg-primary/20 text-primary"
                                            )}>
                                                {tx.transaction_type === 'deposit' ? <ArrowUpCircle className="h-3 w-3" /> : <ArrowDownCircle className="h-3 w-3" />}
                                                {tx.transaction_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-black text-foreground">
                                                ${(tx.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "h-1.5 w-1.5 rounded-full",
                                                    (tx.status.toLowerCase() === "approved" || tx.status.toLowerCase() === "completed") ? "bg-blue-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                                                        tx.status.toLowerCase() === "pending" ? "bg-orange-500 animate-pulse" : "bg-rose-500"
                                                )} />
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider",
                                                    (tx.status.toLowerCase() === "approved" || tx.status.toLowerCase() === "completed") ? "text-blue-500" :
                                                        tx.status.toLowerCase() === "pending" ? "text-orange-500" : "text-rose-500"
                                                )}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-foreground">{tx.date ? format(new Date(tx.date), "MMM dd, yyyy") : "—"}</span>
                                                <span className="text-[10px] text-muted-foreground">{tx.date ? format(new Date(tx.date), "HH:mm:ss") : "—"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="pr-8 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 p-0 rounded-xl hover:bg-white/5 group-hover:scale-110 transition-transform">
                                                            <Eye className="h-4 w-4 text-primary" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="glass border-white/10 text-foreground sm:max-w-xl">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-xl font-bold uppercase tracking-tight">Evidence Verification Package</DialogTitle>
                                                            <DialogDescription className="text-xs text-muted-foreground">Detailed transaction artifacts and system-level metadata.</DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-6 py-6">
                                                            {tx.receipt_url && (
                                                                <div className="space-y-3">
                                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Submitted Artifact</p>
                                                                    <a
                                                                        href={`${process.env.NEXT_PUBLIC_API_URL}${tx.receipt_url}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="block group/receipt relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-2 hover:border-primary/50 transition-all"
                                                                    >
                                                                        <div className="aspect-video flex items-center justify-center bg-black/40 rounded-xl mb-2">
                                                                            <FileText className="h-16 w-16 text-primary/40 group-hover/receipt:scale-110 transition-transform duration-500" />
                                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/receipt:opacity-100 transition-opacity bg-black/60">
                                                                                <span className="text-xs font-bold flex items-center gap-2">
                                                                                    VIEW FULL RESOLUTION <ExternalLink className="h-3 w-3" />
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="px-2 py-1 flex justify-between items-center">
                                                                            <span className="text-[10px] font-mono text-muted-foreground truncate">{tx.receipt_url}</span>
                                                                            <Badge className="bg-blue-500/10 text-blue-500 border-none text-[8px]">SECURE SCANNER ACTIVE</Badge>
                                                                        </div>
                                                                    </a>
                                                                </div>
                                                            )}
                                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                                                {Object.entries(tx)
                                                                    .filter(([key]) => key !== "receipt_url")
                                                                    .map(([key, value]) => (
                                                                        <div key={key} className="flex flex-col gap-1">
                                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                                                {key.replace(/_/g, " ")}
                                                                            </span>
                                                                            <span className="text-xs font-bold text-foreground truncate">
                                                                                {value === null || value === undefined
                                                                                    ? "—"
                                                                                    : typeof value === "object"
                                                                                        ? JSON.stringify(value)
                                                                                        : String(value)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>

                                                {tx.status.toLowerCase() === "pending" && (
                                                    <>
                                                        <Button
                                                            key={`approve-${tx.transaction_type}-${tx.id}`}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 p-0 rounded-xl hover:bg-blue-500/10 text-blue-500 hover:scale-110 transition-all"
                                                            onClick={() => updateStatus(tx.transaction_type, tx.id, "Approved")}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            key={`decline-${tx.transaction_type}-${tx.id}`}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 p-0 rounded-xl hover:bg-rose-500/10 text-rose-500 hover:scale-110 transition-all"
                                                            onClick={() => updateStatus(tx.transaction_type, tx.id, "Declined")}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="p-0 border-none">
                                        <EmptyState
                                            icon={searchQuery ? Search : History}
                                            title={searchQuery ? "Synchronicity Error" : "Void Records"}
                                            description={searchQuery ? "No protocol matching this query found in current system state." : "The global ledger is currently devoid of transactions matching this filter."}
                                            action={searchQuery && <Button variant="ghost" className="font-bold underline" onClick={() => setSearchQuery("")}>Reset Query Scanner</Button>}
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
