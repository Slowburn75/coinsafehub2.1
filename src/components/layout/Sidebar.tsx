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
    History,
    Settings,
    Headphones,
    X,
    Menu,
    ChevronRight,
    FileText,
    Hash,
    ShieldCheck,
} from "lucide-react";

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    section?: string;
}

const NAV_ITEMS: NavItem[] = [
    { label: "Overview", href: "/dashboard", icon: Home },
    { label: "Deposit", href: "/dashboard/deposit", icon: ArrowUpCircle, section: "ESCROW" },
    { label: "Withdraw", href: "/dashboard/withdraw", icon: ArrowDownCircle, section: "ESCROW" },
    { label: "Transfer", href: "/dashboard/transfer", icon: Send, section: "ESCROW" },
    { label: "Documents", href: "/dashboard/documents", icon: FileText, section: "ESCROW" },
    { label: "Transactions", href: "/dashboard/transactions", icon: History, section: "ACCOUNT" },
    { label: "Settings", href: "/dashboard/settings", icon: Settings, section: "ACCOUNT" },
    { label: "Support", href: "/dashboard/support", icon: Headphones, section: "ACCOUNT" },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const sections = ["ESCROW", "ACCOUNT"];

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
                            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">
                            Coinsafe<span className="text-primary">hub</span>
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
                    {/* Case Reference */}
                    <div className="mb-8 px-4">
                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                            <div className="flex items-center gap-2">
                                <Hash className="h-3.5 w-3.5 text-primary" />
                                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Case Reference</span>
                            </div>
                            <p className="text-xs font-mono font-bold text-primary mt-1">#CSH-10024</p>
                        </div>
                    </div>

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

                {/* Bottom */}
                <div className="p-4 mt-auto border-t border-white/5">
                    <p className="text-[9px] text-muted-foreground text-center font-medium uppercase tracking-[0.15em]">
                        Escrow-Backed Recovery
                    </p>
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
