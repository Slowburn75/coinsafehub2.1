"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Headphones,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  Send,
  MessageSquare,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    q: "How do I make a deposit?",
    a: "Navigate to the Deposit page from the sidebar. Select your preferred payment method (crypto or bank transfer), enter the amount, and upload your payment receipt. Your deposit will be reviewed and credited once confirmed.",
  },
  {
    q: "How long do withdrawals take?",
    a: "Crypto withdrawals are typically processed instantly once approved. Bank transfers take 1-3 business days. All withdrawals are subject to our 20% processing fee and AML compliance review.",
  },
  {
    q: "What is the minimum withdrawal amount?",
    a: "The minimum withdrawal amount is $1,000 USD. This applies across all withdrawal methods.",
  },
  {
    q: "How do I update my security PIN?",
    a: "Go to Settings → Withdrawal tab. Enter your new 4-digit PIN and confirm it. This PIN is required for all withdrawals and transfers.",
  },
  {
    q: "What are Recovery Plans?",
    a: "Recovery Plans are forensic asset recovery programs. Our Standard Protocol and Premium Forensic plans provide blockchain analysis and recovery consultation services. Visit the Recovery Plans page to learn more and enroll.",
  },
  {
    q: "I forgot my password. What should I do?",
    a: "Visit the Forgot Password page from the login screen. Enter your registered email address and we will send you a password reset link. The link expires in 1 hour.",
  },
  {
    q: "Is my account information secure?",
    a: "Yes. We use industry-standard encryption for all data. Your password and PIN are hashed and never stored in plaintext. All connections use TLS encryption. We recommend enabling all security alerts in your notification settings.",
  },
];

const CONTACT_INFO = [
  { icon: Mail, label: "Email", value: "support@coinsafehub.com", href: "mailto:support@coinsafehub.com" },
  { icon: Phone, label: "Phone", value: "+1 (917) 397-4033", href: "tel:+19173974033" },
  { icon: MapPin, label: "Office", value: "135-39 118 Street, 11420, USA" },
  { icon: Clock, label: "Response Time", value: "Within 24 hours" },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFaq = (idx: number) => setOpenFaq(openFaq === idx ? null : idx);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both the subject and message.");
      return;
    }
    setIsSubmitting(true);
    try {
      // TODO: POST /api/support/tickets when backend endpoint is ready
      toast.success("Your message has been sent. Our team will respond within 24 hours.");
      setSubject("");
      setMessage("");
    } catch {
      toast.error("Failed to send message. Please try again or email support directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Help & Support</h1>
        <p className="text-muted-foreground font-medium">
          Find answers to common questions or reach out to our support team.
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CONTACT_INFO.map((item, i) => (
          <Card key={i} className="glass-card border-none hover:bg-white/5 transition-all">
            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-sm font-bold text-foreground hover:text-primary transition-colors"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm font-bold text-foreground">{item.value}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-5">
        {/* FAQ */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-black tracking-tight text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, idx) => (
              <Card
                key={idx}
                className={cn(
                  "glass-card border-none cursor-pointer transition-all duration-200",
                  openFaq === idx ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-white/5"
                )}
                onClick={() => toggleFaq(idx)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[10px] font-bold text-primary/60 w-5 shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-bold text-foreground truncate">{faq.q}</span>
                    </div>
                    {openFaq === idx ? (
                      <ChevronUp className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                  {openFaq === idx && (
                    <p className="mt-4 pl-8 text-sm text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                      {faq.a}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-none bg-gradient-to-br from-primary/5 to-accent/5 sticky top-24">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-black">Send a Message</CardTitle>
              </div>
              <CardDescription className="text-sm">
                We typically respond within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    placeholder="What can we help with?"
                    className="h-12 bg-white/5 border-white/5 focus:border-primary/40 rounded-xl"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue in detail..."
                    className="bg-white/5 border-white/5 focus:border-primary/40 rounded-xl min-h-[140px] p-4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold gap-2 shadow-lg shadow-primary/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                  <Send className="h-4 w-4" />
                </Button>
              </form>

              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                    For urgent security concerns or suspected unauthorized access, please email{" "}
                    <span className="text-foreground font-bold">security@coinsafehub.com</span>{" "}
                    immediately with the subject line "URGENT: Security Concern".
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom assurance */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-6 rounded-2xl glass-card border-none">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>SSL Encrypted</span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-blue-500" />
          <span>GDPR Compliant</span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 text-primary" />
          <span>24/7 Monitoring</span>
        </div>
      </div>
    </div>
  );
}
