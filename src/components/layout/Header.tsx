"use client";

import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";
import { Bell, LogOut, User as UserIcon } from "lucide-react";

export function Header() {
    const router = useRouter();

    async function handleLogout() {
        await clearToken();
        router.push("/login");
    }

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between px-6 md:px-10 glass border-b border-white/5 shadow-sm">
            {/* Left spacer for mobile */}
            <div className="w-10 xl:hidden" />

            <div className="flex-1 hidden md:block">
                <p className="text-sm font-medium text-muted-foreground">
                    Welcome back to <span className="text-foreground font-bold">Coinsafehub</span>
                </p>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-6">
                {/* Notifications */}
                <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-muted-foreground hover:text-primary">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
                </button>

                {/* Profile */}
                <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <p className="text-sm font-semibold leading-none text-foreground">My Account</p>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">Case Verified</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center border border-white/10 shadow-lg">
                        <UserIcon className="h-5 w-5 text-white" />
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-foreground transition-all hover:bg-white/10 hover:text-primary border border-white/5 shadow-sm active:scale-95"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden lg:inline">Sign Out</span>
                </button>
            </div>
        </header>
    );
}
