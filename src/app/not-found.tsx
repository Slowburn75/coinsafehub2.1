import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, ArrowLeft, ShieldAlert } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-6">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Icon */}
        <div className="mx-auto h-28 w-28 rounded-[2rem] glass-card flex items-center justify-center relative group">
          <div className="absolute inset-0 bg-primary/10 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
          <ShieldAlert className="h-14 w-14 text-primary opacity-60" />
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-7xl font-black tracking-tighter text-foreground/20 select-none">
            404
          </h1>
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            The page you are looking for does not exist or has been moved.
            Check the URL or navigate back to a known page.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 gap-2">
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button asChild variant="ghost" className="h-12 px-8 rounded-xl font-bold gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <Card className="glass-card border-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Quick Links
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/dashboard/transactions", label: "Transactions" },
                { href: "/dashboard/deposit", label: "Deposit" },
                { href: "/dashboard/withdraw", label: "Withdraw" },
                { href: "/dashboard/settings", label: "Settings" },
                { href: "/dashboard/support", label: "Support" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium text-foreground text-center transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
