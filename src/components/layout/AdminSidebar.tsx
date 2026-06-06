"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { clearToken } from "@/lib/auth";
import {
    LayoutDashboard,
    Users,
    History,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
    ChevronRight,
    Search
} from "lucide-react";

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "User Control", href: "/admin/users", icon: Users },
    { label: "Ledger History", href: "/admin/transactions", icon: History },
    { label: "System Config", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    async function handleLogout() {
        await clearToken();
        router.push("/login");
    }

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-50 flex h-screen w-[270px] flex-col border-r border-white/5 bg-card/80 backdrop-blur-xl transition-transform duration-300 xl:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                {/* Brand */}
                <div className="flex h-20 items-center justify-between px-8 border-b border-white/5">
                    <Link href="/admin/dashboard" className="flex items-center gap-2 no-underline">
                        <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground uppercase">
                            Admin<span className="text-blue-500 italic">Panel</span>
                        </span>
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="rounded-full p-2 text-muted-foreground hover:bg-white/5 xl:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-8">
                    <div>
                        <h3 className="px-4 mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">
                            Management
                        </h3>
                        <ul className="space-y-1">
                            {NAV_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold no-underline transition-all duration-200",
                                                isActive
                                                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                                                    : "text-muted-foreground hover:bg-blue-500/10 hover:text-blue-400",
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-blue-500")} />
                                                <span>{item.label}</span>
                                            </div>
                                            {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="px-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Search</p>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Jump to user..."
                                    className="w-full h-9 bg-black/20 border-white/5 rounded-lg pl-9 text-[10px] focus:outline-none focus:border-blue-500/50"
                                />
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-rose-500/10 hover:text-rose-400 active:scale-95"
                    >
                        <LogOut className="h-5 w-5 text-rose-500" />
                        <span>Sign Out System</span>
                    </button>
                </div>
            </aside>

            {/* Mobile toggle button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed left-4 top-6 z-40 rounded-xl p-2.5 glass xl:hidden text-foreground shadow-lg active:scale-95"
            >
                <Menu className="h-6 w-6" />
            </button>
        </>
    );
}
