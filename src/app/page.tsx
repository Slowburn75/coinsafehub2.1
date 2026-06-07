"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    ShieldCheck,
    Menu,
    X,
    Wallet,
    ArrowUpRight,
    History,
    Users,
    CheckCircle2,
    Mail,
    MapPin,
    Phone,
    Lock,
    FileSearch,
    Scale,
    ClipboardCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { LiveChat } from "@/components/layout/LiveChat";

export default function LandingPage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const services = [
        {
            title: "Blockchain Tracing",
            desc: "Certified forensic specialists trace stolen or lost assets across multiple blockchains using advanced transaction mapping tools. Every movement is documented for actionable intelligence.",
            icon: FileSearch,
        },
        {
            title: "Asset Interception",
            desc: "Our team works directly with exchanges and liquidity providers to identify and secure frozen or intercepted assets that belong to our clients.",
            icon: ShieldCheck,
        },
        {
            title: "Multi-Sig Escrow Vault",
            desc: "All recovered assets are held in a secure, multi-signature escrow vault requiring multiple authorized approvals before any disbursal can occur. Your assets remain protected at every stage.",
            icon: Lock,
        },
        {
            title: "Legal Liaison & Reporting",
            desc: "Comprehensive forensic reports suitable for law enforcement and legal proceedings. Our specialists liaise with authorities to support formal recovery actions.",
            icon: Scale,
        },
        {
            title: "Case Consultation",
            desc: "Expert-led consultation for victims of scams, rug pulls, exchange hacks, or forgotten private key scenarios. We evaluate feasibility before any engagement.",
            icon: ClipboardCheck,
            highlight: true
        },
        {
            title: "Wallet Security Audit",
            desc: "Once assets are secured, we provide a full audit of your compromised digital environment and recommend remedial actions to prevent future losses.",
            icon: Wallet,
        }
    ];

    const phases = [
        { phase: "1", label: "Blockchain Tracing", desc: "Our specialists map the transaction trail across chains to locate your assets." },
        { phase: "2", label: "Assets Intercepted", desc: "Recovered assets are identified and secured in coordination with exchange partners." },
        { phase: "3", label: "Held in Secure Escrow", desc: "Assets are deposited into a multi-signature escrow vault for safekeeping." },
        { phase: "4", label: "Awaiting Clearance", desc: "Final verification and compliance checks before disbursal to your wallet." },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary/20 overflow-x-hidden">
            {/* Navigation */}
            <nav className={cn(
                "fixed top-0 w-full z-50 transition-all duration-300 px-6 lg:px-12 py-4",
                isScrolled ? "bg-white/80 backdrop-blur-xl shadow-sm py-3" : "bg-transparent"
            )}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                            <ShieldCheck className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">CoinSafeHub</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <Link href="#services" className="hover:text-primary transition-colors">How It Works</Link>
                        <Link href="#escrow" className="hover:text-primary transition-colors">Escrow Security</Link>
                        <Link href="#about" className="hover:text-primary transition-colors">About</Link>
                        <Link href="/login" className="hover:text-primary transition-colors">Client Portal</Link>
                        <Button asChild className="rounded-full px-6 shadow-md shadow-primary/10">
                            <Link href="/register">Submit Recovery Case</Link>
                        </Button>
                    </div>

                    <button className="md:hidden text-slate-900" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between p-6 border-b">
                            <span className="text-lg font-bold text-slate-900">Menu</span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex flex-col p-6 gap-4 text-sm font-semibold text-slate-600">
                            <Link href="#services" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors py-2">How It Works</Link>
                            <Link href="#escrow" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors py-2">Escrow Security</Link>
                            <Link href="#about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors py-2">About</Link>
                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors py-2">Client Portal</Link>
                            <Button asChild className="rounded-full mt-4">
                                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>Submit Recovery Case</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10" />
                <div className="container px-6 mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Escrow-Backed Asset Recovery
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000">
                            Secure, Escrow-Backed Digital Asset <span className="text-primary italic">Recovery</span> & Forensics
                        </h1>
                        <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            CoinSafeHub provides certified blockchain forensics and secure multi-signature escrow custody for recovered assets. Our specialists work directly with exchanges, liquidity providers, and law enforcement to locate, intercept, and return your stolen or lost digital assets.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                            <Button size="lg" className="h-14 px-10 rounded-full text-md shadow-xl shadow-primary/20 hover:scale-105 transition-transform" asChild>
                                <Link href="/register">Submit Recovery Case</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-10 rounded-full text-md hover:bg-slate-100" asChild>
                                <Link href="#services">See How It Works</Link>
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 relative animate-in fade-in zoom-in duration-1000">
                        <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                            <Image
                                src="/images/landing/hero.png"
                                alt="Asset Recovery Vault"
                                width={700}
                                height={700}
                                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
                    </div>
                </div>
            </section>

            {/* Services / How It Works */}
            <section id="services" className="py-24 bg-white relative">
                <div className="container px-6 mx-auto">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
                        <h2 className="text-4xl lg:text-5xl font-bold text-slate-900">Our <span className="text-primary">Recovery</span> Process</h2>
                        <p className="text-slate-500 text-lg">
                            Every case is handled by certified forensic specialists using proven investigative methodologies. No automated tools — only expert-led analysis and secure escrow custody.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((item, i) => (
                            <Card key={i} className={cn(
                                "group border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2",
                                item.highlight ? "bg-slate-900 text-white" : "bg-slate-50"
                            )}>
                                <CardHeader>
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                                        item.highlight ? "bg-primary text-white" : "bg-white text-primary shadow-sm"
                                    )}>
                                        <item.icon className="w-8 h-8" />
                                    </div>
                                    <CardTitle className="text-2xl font-bold">{item.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className={cn(
                                        "leading-relaxed",
                                        item.highlight ? "text-slate-300" : "text-slate-600"
                                    )}>
                                        {item.desc}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Escrow Security Section */}
            <section id="escrow" className="py-24 bg-slate-50 relative">
                <div className="container px-6 mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1 space-y-8">
                            <Badge className="bg-primary/10 text-primary border-primary/20 py-1.5 px-4 text-xs font-bold">
                                MULTI-SIGNATURE SECURITY
                            </Badge>
                            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                                Your Recovered Assets Are Held in a <span className="text-primary">Multi-Sig Escrow</span> Vault
                            </h2>
                            <p className="text-slate-600 text-lg leading-relaxed">
                                Unlike standard custodial wallets, our escrow vault requires multiple independent private key signatures to authorize any withdrawal. This means no single party — including CoinSafeHub — can access your funds without the required approvals.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Multi-signature architecture requiring 2-of-3 or 3-of-5 key approvals",
                                    "Geographically distributed key holders for maximum security",
                                    "Real-time vault status visible in your client dashboard",
                                    "Assets remain under your ownership — we hold no unilateral control"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-700">
                                        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex-1">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
                                <div className="p-10 bg-gradient-to-br from-primary/5 to-blue-500/5">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                                            <Lock className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">Escrow Vault</h3>
                                            <p className="text-sm text-slate-500">Multi-Signature Secure Storage</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {["Key Holder 1: Independent Custodian", "Key Holder 2: Case Officer", "Key Holder 3: Client Designee"].map((k, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/70 border border-slate-200">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                                </div>
                                                <span className="font-medium text-slate-700">{k}</span>
                                                <span className="ml-auto text-xs font-bold text-blue-600 uppercase">Verified</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recovery Phases */}
            <section className="py-24 bg-white relative">
                <div className="container px-6 mx-auto">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
                        <h2 className="text-4xl lg:text-5xl font-bold text-slate-900">Case <span className="text-primary">Lifecycle</span></h2>
                        <p className="text-slate-500 text-lg">
                            Every case progresses through verified phases, with full transparency available in your client dashboard.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {phases.map((p, i) => (
                            <div key={i} className="relative">
                                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                                    <div className="mx-auto h-14 w-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-black">
                                        {p.phase}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">{p.label}</h3>
                                    <p className="text-sm text-slate-500">{p.desc}</p>
                                </div>
                                {i < phases.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-primary/30" />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 text-center">
                        <Button size="lg" className="h-14 px-10 rounded-full font-bold shadow-xl shadow-primary/20" asChild>
                            <Link href="/register">Request a Free Case Evaluation</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 bg-slate-900 text-white">
                <div className="container px-6 mx-auto">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        <div>
                            <div className="text-5xl font-black text-primary mb-3">$48M+</div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Assets Traced</div>
                        </div>
                        <div>
                            <div className="text-5xl font-black text-primary mb-3">$22M+</div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Funds Secured in Escrow</div>
                        </div>
                        <div>
                            <div className="text-5xl font-black text-primary mb-3">340+</div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Successful Case Resolutions</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 relative overflow-hidden">
                <div className="container px-6 mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1 order-2 lg:order-1">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl skew-y-3 lg:-skew-y-3">
                                <Image
                                    src="/images/landing/about.png"
                                    alt="Forensic Investigation"
                                    width={600}
                                    height={800}
                                    className="w-full h-[600px] object-cover"
                                />
                                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
                            </div>
                        </div>
                        <div className="flex-1 space-y-6 order-1 lg:order-2">
                            <Badge className="bg-primary/10 text-primary border-primary/20 py-1.5 px-4 text-xs font-bold">
                                ABOUT US
                            </Badge>
                            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                                Our Mission is <span className="text-primary">Restorative Security</span>
                            </h2>
                            <p className="text-slate-600 text-lg leading-relaxed">
                                CoinSafeHub provides certified blockchain forensic investigation and secure multi-signature escrow custody for recovered digital assets. Our specialists support individuals and enterprises who have suffered from cryptocurrency theft, exchange insolvency, or lost private keys.
                            </p>
                            <p className="text-slate-600 text-lg leading-relaxed">
                                We operate with full transparency — every case is assigned a unique reference number, and clients can track progress through their dedicated dashboard. All recovered assets are held in multi-signature escrow until clearance is complete.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button size="lg" className="h-14 px-8 rounded-full font-bold shadow-xl shadow-primary/20" asChild>
                                    <Link href="/register">Initiate Escrow Setup</Link>
                                </Button>
                                <Button size="lg" variant="outline" className="h-14 px-8 rounded-full" asChild>
                                    <Link href="/login">Client Portal Login</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Free Case Evaluation */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
                <div className="container px-6 mx-auto relative z-10 text-center space-y-8">
                    <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                        Lost Digital Assets? <br /><span className="text-primary">We Can Help.</span>
                    </h2>
                    <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                        Our forensic specialists will evaluate your case free of charge. Submit your details and we will respond within 24 hours with a feasibility assessment.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" className="h-14 px-10 rounded-full font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 text-lg" asChild>
                            <Link href="/register">Request a Free Case Evaluation</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 pt-24 pb-12 border-t">
                <div className="container px-6 mx-auto">
                    <div className="grid lg:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 lg:col-span-1 space-y-6">
                            <Link href="/" className="flex items-center gap-2 group">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                    <ShieldCheck className="text-white w-6 h-6" />
                                </div>
                                <span className="text-xl font-bold tracking-tight text-slate-900">CoinSafeHub</span>
                            </Link>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Certified blockchain forensics and multi-signature escrow custody for recovered digital assets. Our specialists work with law enforcement and exchange partners worldwide.
                            </p>
                            <div className="flex gap-4">
                                <a href="https://t.me/COINSAFEHUB" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all text-slate-600">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.87 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.938z" /></svg>
                                </a>
                                <a href="https://t.me/COINSAFEHUB" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all text-slate-600">
                                    <ArrowUpRight className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        <div className="col-span-1 lg:col-start-2 space-y-6">
                            <h4 className="text-lg font-bold text-slate-900 uppercase tracking-widest text-xs">Services</h4>
                            <ul className="space-y-4 text-sm text-slate-500 font-medium">
                                <li><Link href="#services" className="hover:text-primary transition-colors">Blockchain Forensics</Link></li>
                                <li><Link href="#escrow" className="hover:text-primary transition-colors">Escrow Security</Link></li>
                                <li><Link href="/login" className="hover:text-primary transition-colors">Client Portal</Link></li>
                                <li><Link href="/register" className="hover:text-primary transition-colors">Submit a Case</Link></li>
                            </ul>
                        </div>

                        <div className="col-span-1 space-y-6">
                            <h4 className="text-lg font-bold text-slate-900 uppercase tracking-widest text-xs">Resources</h4>
                            <ul className="space-y-4 text-sm text-slate-500 font-medium">
                                <li><Link href="/security" className="hover:text-primary transition-colors">Multi-Sig Security</Link></li>
                                <li><Link href="/legal" className="hover:text-primary transition-colors">Legal Framework</Link></li>
                                <li><Link href="/disclaimer" className="hover:text-primary transition-colors">Risk Disclaimer</Link></li>
                                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Principles</Link></li>
                            </ul>
                        </div>

                        <div className="col-span-1 space-y-6">
                            <h4 className="text-lg font-bold text-slate-900 uppercase tracking-widest text-xs">Connect</h4>
                            <ul className="space-y-4 text-sm text-slate-500">
                                <li className="flex gap-3">
                                    <MapPin className="w-5 h-5 text-primary shrink-0" />
                                    <span>135-39 118 Street, 11420, USA</span>
                                </li>
                                <li className="flex gap-3">
                                    <Mail className="w-5 h-5 text-primary shrink-0" />
                                    <span>support@coinsafehub.org</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-slate-400 text-xs">
                            &copy; 2026 CoinSafeHub Research. All Rights Reserved. Not a regulated financial service.
                        </p>
                        <div className="flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <Link href="#" className="hover:text-primary">Status: Operational</Link>
                            <Link href="#" className="hover:text-primary">GDPR Compliant</Link>
                            <Link href="#" className="hover:text-primary">SSL Encrypted</Link>
                        </div>
                    </div>
                </div>
            </footer>
            <LiveChat />
        </div>
    );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>
            {children}
        </div>
    );
}
