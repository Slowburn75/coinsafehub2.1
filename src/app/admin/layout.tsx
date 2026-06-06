import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Bell, User as UserIcon, Shield } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full opacity-50 pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/20 blur-[150px] rounded-full opacity-40 pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Admin sidebar — fixed, full-height */}
            <AdminSidebar />

            {/* Main content area — offset by sidebar width on desktop */}
            <div className="flex min-h-screen flex-col xl:ml-[270px] relative z-10 transition-all duration-500">
                {/* Admin header */}
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between px-6 md:px-10 glass border-b border-white/5 shadow-sm">
                    {/* Left spacer for mobile toggle */}
                    <div className="w-10 xl:w-0" />

                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <Shield className="h-4 w-4 text-blue-500" />
                        </div>
                        <h2 className="text-lg font-black tracking-tight text-foreground uppercase">
                            Admin <span className="text-primary italic">Control</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-muted-foreground hover:text-primary">
                            <Bell className="h-5 w-5" />
                        </button>

                        <div className="h-8 w-px bg-white/10 mx-2" />

                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <p className="text-xs font-bold leading-none text-foreground uppercase">Master Admin</p>
                                <p className="text-[10px] text-blue-500 mt-1 font-bold">Authenticated</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center border border-white/10 shadow-lg">
                                <UserIcon className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 md:p-6 lg:p-10 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out fill-mode-both">
                    {children}
                </main>

                {/* Footer */}
                <footer className="p-8 text-center text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] border-t border-white/5">
                    Secure Management System &copy; AssetSafeHub {new Date().getFullYear()}
                </footer>
            </div>
        </div>
    );
}
