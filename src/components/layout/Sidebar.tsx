"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Home,
    ArrowUpCircle,
    ArrowDownCircle,
    Send,
    Wallet,
    Briefcase,
    LineChart,
    History,
    Settings,
    Headphones,
    X,
    Menu,
    ChevronRight
} from "lucide-react";

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    section?: string;
}

const NAV_ITEMS: NavItem[] = [
    { label: "Overview", href: "/dashboard", icon: Home },
    { label: "Deposit", href: "/dashboard/deposit", icon: ArrowUpCircle, section: "FINANCES" },
    { label: "Withdraw", href: "/dashboard/withdraw", icon: ArrowDownCircle, section: "FINANCES" },
    { label: "Transfer", href: "/dashboard/transfer", icon: Send, section: "FINANCES" },
    { label: "Recovery Plans", href: "/dashboard/plans", icon: Briefcase, section: "FORENSICS" },
    { label: "Network Intel", href: "/dashboard/crypto", icon: LineChart, section: "FORENSICS" },
    { label: "Secure Bridge", href: "/dashboard/wallet", icon: Wallet, section: "FORENSICS" },
    { label: "Transactions", href: "/dashboard/transactions", icon: History, section: "ACCOUNT" },
    { label: "Settings", href: "/dashboard/settings", icon: Settings, section: "ACCOUNT" },
    { label: "Support", href: "/dashboard/support", icon: Headphones, section: "ACCOUNT" },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const sections = ["FINANCES", "FORENSICS", "ACCOUNT"];

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
                    <Link href="/dashboard" className="flex items-center gap-2 no-underline">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                            <Wallet className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">
                            AssetSafe<span className="text-primary">Hub</span>
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
                <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
                    {/* Home Item */}
                    <div className="mb-6">
                        <SidebarLink
                            item={NAV_ITEMS[0]}
                            isActive={pathname === NAV_ITEMS[0].href}
                        />
                    </div>

                    {sections.map(section => (
                        <div key={section} className="mb-8">
                            <h3 className="px-4 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                                {section}
                            </h3>
                            <ul className="space-y-1">
                                {NAV_ITEMS.filter(item => item.section === section).map((item) => (
                                    <SidebarLink
                                        key={item.href}
                                        item={item}
                                        isActive={pathname === item.href}
                                    />
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Bottom Card */}
                <div className="p-4 mt-auto">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-white/5 text-center">
                        <p className="text-xs font-semibold text-foreground mb-1 uppercase tracking-wider">Recovery Case</p>
                        <p className="text-[10px] text-muted-foreground mb-3">Expedite your retrieval with advanced forensic tools.</p>
                        <Link
                            href="/dashboard/plans"
                            className="inline-flex items-center justify-center w-full py-2 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-transform active:scale-95 no-underline"
                        >
                            Upgrade Now
                        </Link>
                    </div>
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

function SidebarLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
    const Icon = item.icon;
    return (
        <li>
            <Link
                href={item.href}
                className={cn(
                    "group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold no-underline transition-all duration-200",
                    isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
            >
                <div className="flex items-center gap-3">
                    <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-primary")} />
                    <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
            </Link>
        </li>
    );
}
