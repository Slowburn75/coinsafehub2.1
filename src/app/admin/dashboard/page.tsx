"use client";

import { useAdminDashboard } from "@/hooks/useAdminDashboard";
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
    Users,
    ArrowUpRight,
    DollarSign,
    Trash2,
    Eye,
    Loader2,
    TrendingUp,
    ShieldCheck,
    Search,
    UserPlus,
    MoreVertical,
    Edit
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";

export default function AdminDashboardPage() {
    const { stats, users, isLoading, deleteUser } = useAdminDashboard();

    const adminStats = [
        {
            title: "Global User Base",
            value: stats?.total_users || 0,
            icon: <Users className="h-5 w-5 text-primary" />,
            description: "Active platform members",
            color: "primary"
        },
        {
            title: "System Volume",
            value: stats?.total_transactions || 0,
            icon: <ArrowUpRight className="h-5 w-5 text-indigo-400" />,
            description: "Lifetime processed events",
            color: "indigo"
        },
        {
            title: "Total Inflow (USD)",
            value: stats?.total_deposit_amount || 0,
            icon: <DollarSign className="h-5 w-5 text-blue-500" />,
            description: "Aggregate capital received",
            color: "blue"
        }
    ];

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
                    <h1 className="text-3xl font-black tracking-tight text-foreground">System Overview</h1>
                    <p className="text-muted-foreground font-medium italic">High-level telemetry and user administration.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="h-12 px-6 rounded-2xl glass-card border-none hover:bg-white/5 font-bold gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Run Analytics
                    </Button>
                    <Button asChild className="h-12 px-6 rounded-2xl bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20">
                        <Link href="/admin/users/create">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Provision User
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {adminStats.map((stat, idx) => (
                    <Card key={idx} className="glass-card border-none hover:bg-white/5 transition-all duration-300 overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                            <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                                {stat.title}
                            </CardTitle>
                            <div className={cn("p-2.5 rounded-xl bg-white/5 transition-transform group-hover:scale-110")}>
                                {stat.icon}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black tracking-tighter text-foreground mb-1">
                                {typeof stat.value === 'number' && stat.title.includes('USD') ? `$${stat.value.toLocaleString()}` : stat.value.toLocaleString()}
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest leading-relaxed">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Users Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-bold tracking-tight">User Directory</h3>
                    <div className="flex items-center gap-2">
                        <Search className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Filters Active</span>
                    </div>
                </div>

                <Card className="glass-card border-none overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/5 hover:bg-transparent h-16 bg-white/5">
                                    <TableHead className="pl-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Identity</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account Status</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Role</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contact</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Portfolio</TableHead>
                                    <TableHead className="pr-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors h-20">
                                            <TableCell className="pl-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-primary group-hover:bg-primary/20 transition-colors">
                                                        {user.first_name?.[0]}{user.last_name?.[0]}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-foreground">
                                                            {user.first_name} {user.last_name}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">{user.email}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "h-1.5 w-1.5 rounded-full animate-pulse",
                                                        !user.is_frozen ? "bg-blue-500" : "bg-rose-500"
                                                    )} />
                                                    <span className={cn(
                                                        "text-[10px] font-bold uppercase tracking-wider",
                                                        !user.is_frozen ? "text-blue-500" : "text-rose-500"
                                                    )}>
                                                        {!user.is_frozen ? "Active" : "Suspended"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn(
                                                    "px-3 py-0.5 rounded-lg border-none font-bold text-[10px] uppercase",
                                                    user.is_staff ? "bg-primary text-primary-foreground" : "bg-white/10 text-muted-foreground"
                                                )}>
                                                    {user.is_staff ? "Staff / Root" : "Standard Client"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs font-medium text-muted-foreground">
                                                {user.phone_number || "No contact info"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-blue-500">${(user.balance || 0).toLocaleString()}</span>
                                                    <span className="text-[8px] font-bold text-muted-foreground uppercase">Settled</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-8 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button asChild variant="ghost" size="icon" className="rounded-xl hover:bg-white/5">
                                                        <Link href={`/admin/users/${user.id}/edit`}>
                                                            <Edit className="h-4 w-4 text-blue-500" />
                                                        </Link>
                                                    </Button>

                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5">
                                                                <Eye className="h-4 w-4 text-primary" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="glass border-white/10 text-foreground">
                                                            <DialogHeader>
                                                                <DialogTitle className="text-xl font-bold">Protocol View: {user.email}</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="grid gap-2 py-4">
                                                                {Object.entries(user).map(([key, value]) => (
                                                                    <div key={key} className="flex justify-between border-b border-white/5 py-2">
                                                                        <span className="font-bold uppercase text-[10px] text-muted-foreground">{key.replace(/_/g, " ")}:</span>
                                                                        <span className="text-xs font-mono text-foreground truncate ml-4 max-w-[200px]">
                                                                            {typeof value === "object" ? "Data Package" : String(value)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-xl hover:bg-rose-500/10 text-rose-500 transition-colors"
                                                        onClick={() => {
                                                            if (confirm("Confirm system-level user deletion? This process is irreversible.")) {
                                                                deleteUser(user.id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="p-0 border-none">
                                            <EmptyState
                                                icon={Users}
                                                title="Empty Directory"
                                                description="No user records detected in the synchronization cluster."
                                                action={<Button className="font-bold">Manual Provision</Button>}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
