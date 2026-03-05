import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full opacity-50 pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/20 blur-[150px] rounded-full opacity-40 pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-indigo-500/10 blur-[100px] rounded-full opacity-30 pulse" style={{ animationDelay: '4s' }} />
            </div>

            {/* Sidebar — fixed, full-height */}
            <Sidebar />

            {/* Main content area — offset by sidebar width on desktop */}
            <div className="flex min-h-screen flex-col xl:ml-[270px] relative z-10 transition-all duration-500">
                <Header />
                <main className="flex-1 p-4 md:p-6 lg:p-10 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out fill-mode-both">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
}
