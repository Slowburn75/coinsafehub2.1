"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  History,
  Users,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Send
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
      title: "Forensic Analysis",
      desc: "Deep-trace blockchain forensics to identify the movement and destination of your lost or stolen digital assets.",
      icon: ShieldCheck,
    },
    {
      title: "Asset Tracking",
      desc: "Real-time monitoring of identified wallets to detect any movement, enabling swift action with liquidity providers.",
      icon: History,
    },
    {
      title: "Legal Liaison",
      desc: "We provide comprehensive forensic reports suitable for law enforcement and legal proceedings to aid in recovery.",
      icon: ShieldCheck,
    },
    {
      title: "Wallet Security",
      desc: "Expert audit and securing of your compromised digital environment once assets have been retrieved.",
      icon: Wallet,
    },
    {
      title: "Recovery Consultation",
      desc: "Specialized expert-led consultation for victims of scams, rug pulls, or forgotten private key scenarios.",
      icon: ShieldCheck,
      highlight: true
    },
    {
      title: "Network Intelligence",
      desc: "Access our proprietary database of blacklisted wallets and suspicious exchange endpoints globally.",
      icon: Users,
    }
  ];

  const plans = [
    {
      name: "Case Evaluation",
      min: "100",
      features: ["Initial blockchain audit", "Case feasibility report", "Standard support"],
      color: "bg-blue-500/10 border-blue-500/20"
    },
    {
      name: "Standard Recovery",
      min: "1,000",
      features: ["Full forensic tracking", "Priority exchange outreach", "Asset monitoring", "Liaison with authorities"],
      color: "bg-primary/10 border-primary/20",
      featured: true
    },
    {
      name: "Enterprise Forensics",
      min: "5,000",
      features: ["Deep-chain analysis", "Dedicated investigator", "Custom forensic reporting", "Legal firm integration"],
      color: "bg-purple-500/10 border-purple-500/20"
    }
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
            <Link href="#about" className="hover:text-primary transition-colors">Forensics</Link>
            <Link href="#services" className="hover:text-primary transition-colors">Expertise</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Solutions</Link>
            <Link href="/login" className="hover:text-primary transition-colors">Login</Link>
            <Button asChild className="rounded-full px-6 shadow-md shadow-primary/10">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>

          <button className="md:hidden text-slate-900" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

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
              Industry-Leading Asset Recovery & Forensics
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000">
              Recover Your Lost Assets With <span className="text-primary italic">Forensic</span> Precision
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              CoinSafeHub provides specialized blockchain forensics and expert fund recovery consultation to retrieve lost, stolen, or inaccessible digital assets.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <Button size="lg" className="h-14 px-10 rounded-full text-md shadow-xl shadow-primary/20 hover:scale-105 transition-transform" asChild>
                <Link href="/register">Open Free Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 rounded-full text-md hover:bg-slate-100" asChild>
                <Link href="#services">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="flex-1 relative animate-in fade-in zoom-in duration-1000">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="/images/landing/hero.png"
                alt="Crypto Vault"
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

      {/* Services Grid */}
      <section id="services" className="py-24 bg-white relative">
        <div className="container px-6 mx-auto">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900">Restorative <span className="text-primary">Justice</span></h2>
            <p className="text-slate-500 text-lg">
              Explore our specialized forensic capabilities dedicated to identifying and retrieving digital assets across the decentralized landscape.
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

      {/* About Section */}
      <section id="about" className="py-24 relative overflow-hidden">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl skew-y-3 lg:-skew-y-3">
                <Image
                  src="/images/landing/about.png"
                  alt="Modern Office"
                  width={600}
                  height={800}
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
              </div>
            </div>
            <div className="flex-1 space-y-6 order-1 lg:order-2">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                Our Mission is <span className="text-primary">Defensive Excellence</span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                CoinSafeHub provides the infrastructure for sophisticated digital asset tracking. We support individuals and enterprises with advanced forensic tools while offering unique consultation for complex recovery cases involving decentralized assets.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                By leveraging advanced blockchain forensics and restorative security protocols, we bridge the gap between financial loss and peace of mind. Our team is dedicated to transparency, security, and investigative integrity.
              </p>
              <div className="pt-4 grid grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl font-bold text-primary mb-1">$2B+</div>
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Assets Analyzed</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-1">99%</div>
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Support Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recovery Focus Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <Badge className="bg-primary/20 text-primary border-primary/30 py-1.5 px-4 text-xs font-bold font-mono">
                SPECIALIZED SERVICE
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">Lost Your Funds? <br /><span className="text-primary italic">We investigate.</span></h2>
              <p className="text-slate-400 text-lg">
                Crypto recovery is a complex field requiring precision. Our team uses specialized forensic tools to track transaction trails across multiple chains, identifying end-point exchanges and assisting in the recovery process where technically possible.
              </p>
              <Accordion type="single" collapsible className="w-full border-t border-white/10">
                <AccordionItem value="item-1" className="border-white/10">
                  <AccordionTrigger className="hover:text-primary transition-colors py-4 text-lg">Forensic Blockchain Tracking</AccordionTrigger>
                  <AccordionContent className="text-slate-400">
                    Deep-chain analysis to identify the movement of stolen or lost assets, providing full transaction heatmaps.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="border-white/10">
                  <AccordionTrigger className="hover:text-primary transition-colors py-4 text-lg">Direct Exchange Communication</AccordionTrigger>
                  <AccordionContent className="text-slate-400">
                    We facilitate information sharing with major liquidity providers to freeze suspicious accounts.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Button size="lg" className="h-14 px-10 rounded-full font-bold shadow-xl shadow-primary/40 bg-primary hover:bg-primary/90">
                Start Recovery Case
              </Button>
            </div>
            <div className="flex-1">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative rounded-2xl overflow-hidden bg-slate-800 border-2 border-white/5 shadow-2xl">
                  <Image
                    src="/images/landing/recovery.png"
                    alt="Recovery Forensics"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white relative">
        <div className="container px-6 mx-auto">
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900">Recovery <span className="text-primary">Paths</span></h2>
            <p className="text-slate-500 text-lg">
              Choose the level of forensic depth and liaison services that match your specific case requirements.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={cn(
                  "p-8 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center text-center",
                  plan.color,
                  plan.featured ? "scale-105 shadow-2xl relative z-10 border-primary" : "shadow-lg border-transparent"
                )}
              >
                {plan.featured && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <div className="text-4xl font-extrabold text-slate-900 mb-2">${plan.min}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">Retainer Fee</div>

                <div className="w-full h-px bg-slate-200 mb-8" />

                <ul className="space-y-4 mb-10 flex-1 w-full text-left">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3 text-slate-600 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Button variant={plan.featured ? "default" : "outline"} className="w-full h-14 rounded-2xl text-md font-bold transition-transform hover:scale-105" asChild>
                  <Link href="/register">Choose {plan.name.split(' ')[0]}</Link>
                </Button>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-400 text-xs mt-12 max-w-lg mx-auto leading-relaxed">
            * All service tiers involve complex forensic analysis. Results depend on technical feasibility and wallet availability. Ensure you have read our Terms of Service.
          </p>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
        <div className="container px-6 mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">Stay Ahead of the <span className="text-slate-900 underline underline-offset-8">Blockchain</span> Curve</h2>
            <p className="text-white/80 text-xl max-w-2xl mx-auto">
              Receive high-impact security intelligence and forensic alerts directly to your inbox. No spam, only security.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto shadow-2xl rounded-3xl p-2 bg-white/10 backdrop-blur-md border border-white/20">
              <input
                type="email"
                placeholder="Enter workspace email"
                required
                className="flex-1 bg-transparent border-none text-white placeholder:text-white/60 px-6 h-14 outline-none text-lg"
              />
              <Button size="lg" className="h-14 rounded-2xl bg-white text-primary hover:bg-slate-100 font-bold px-8 gap-2">
                Join Network <Send className="w-4 h-4" />
              </Button>
            </form>
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
                Next-gen forensics portal specializing in blockchain asset tracking and advanced digital assets recovery consultation.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all text-slate-600">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all text-slate-600">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="col-span-1 lg:col-start-2 space-y-6">
              <h4 className="text-lg font-bold text-slate-900 uppercase tracking-widest text-xs">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li><Link href="#services" className="hover:text-primary transition-colors">Digital Forensics</Link></li>
                <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing Models</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Portal Access</Link></li>
                <li><Link href="/register" className="hover:text-primary transition-colors">New Registration</Link></li>
              </ul>
            </div>

            <div className="col-span-1 space-y-6">
              <h4 className="text-lg font-bold text-slate-900 uppercase tracking-widest text-xs">Resources</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li><Link href="#" className="hover:text-primary transition-colors">Security Whitepaper</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Legal Framework</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Risk Disclaimer</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Principles</Link></li>
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
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <span>+1 (917) 397-4033</span>
                </li>
                <li className="flex gap-3">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <span>support@coinsafehub.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-slate-400 text-xs">
              © 2024 CoinSafeHub Research. All Rights Reserved. Not a regulated financial service.
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
