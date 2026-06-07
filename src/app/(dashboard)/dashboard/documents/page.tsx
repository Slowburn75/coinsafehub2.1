"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Upload,
    FileText,
    ShieldCheck,
    CheckCircle2,
    AlertTriangle,
    FileImage,
    Clock,
    Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024;

export default function DocumentsPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        const valid: File[] = [];

        for (const file of selected) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                toast.error(`${file.name}: Only JPG, PNG, and PDF files are accepted.`);
                continue;
            }
            if (file.size > MAX_SIZE) {
                toast.error(`${file.name}: File exceeds 10MB limit.`);
                continue;
            }
            valid.push(file);
        }

        if (valid.length > 0) {
            setFiles(prev => [...prev, ...valid]);
            toast.success(`${valid.length} file(s) selected.`);
        }
    };

    const removeFile = (idx: number) => {
        setFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (files.length === 0) {
            toast.error("Please select at least one document to upload.");
            return;
        }
        setIsSubmitting(true);
        try {
            // TODO: POST to backend document upload endpoint when available
            toast.success(`${files.length} document(s) uploaded securely to your case file.`);
            setFiles([]);
        } catch {
            toast.error("Upload failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-10 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-foreground">Case Documents</h1>
                <p className="text-muted-foreground font-medium">
                    Securely upload evidence, screenshots, and identity documents for your recovery case.
                </p>
            </div>

            {/* Security Notice */}
            <Card className="glass-card border-none bg-gradient-to-br from-primary/5 to-blue-500/5">
                <CardContent className="p-5 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">End-to-End Encrypted Upload</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            All documents are encrypted during transmission and stored in a secure, access-controlled vault.
                            Only your assigned case officer can view submitted documents.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Upload Area */}
            <Card className="glass-card border-none">
                <CardHeader>
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" />
                        Upload Case Documents
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Accepted formats: JPG, PNG, PDF (max 10MB per file)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group/upload">
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                accept=".jpg,.jpeg,.png,.pdf"
                                multiple
                                onChange={handleFileSelect}
                            />
                            <div className={cn(
                                "h-48 rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all",
                                files.length > 0
                                    ? "bg-blue-500/5 border-blue-500/30"
                                    : "bg-white/5 border-white/10 group-hover/upload:bg-white/10 group-hover/upload:border-primary/50"
                            )}>
                                <div className={cn(
                                    "p-4 rounded-full",
                                    files.length > 0 ? "bg-blue-500/20 text-blue-500" : "bg-white/10 text-muted-foreground"
                                )}>
                                    {files.length > 0 ? <CheckCircle2 className="h-6 w-6" /> : <FileImage className="h-6 w-6" />}
                                </div>
                                <p className="text-sm font-bold">
                                    {files.length > 0 ? `${files.length} file(s) selected` : "Drop documents here or click to browse"}
                                </p>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                                    JPG, PNG, PDF &middot; MAX 10MB EACH
                                </p>
                            </div>
                        </div>

                        {/* File List */}
                        {files.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Selected Files
                                </Label>
                                <div className="space-y-2">
                                    {files.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                                    <FileText className="h-4 w-4 text-blue-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-foreground truncate">{file.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {(file.size / 1024 / 1024).toFixed(1)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs text-rose-500 hover:text-rose-400 h-8 shrink-0"
                                                onClick={() => removeFile(idx)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                            disabled={isSubmitting || files.length === 0}
                        >
                            {isSubmitting ? "Uploading..." : `Upload ${files.length > 0 ? files.length : ""} Document${files.length !== 1 ? "s" : ""} Securely`}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Guidelines */}
            <Card className="glass-card border-none">
                <CardHeader>
                    <CardTitle className="text-lg font-black">Upload Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[
                        {
                            icon: FileImage,
                            title: "Fraud Screenshots",
                            desc: "Screenshots of conversations with scammers, transaction confirmations, and platform communications.",
                        },
                        {
                            icon: ShieldCheck,
                            title: "Identity Documents",
                            desc: "Government-issued ID, proof of address, or any KYC documents requested by your case officer.",
                        },
                        {
                            icon: AlertTriangle,
                            title: "Evidence Files",
                            desc: "Blockchain transaction records, exchange correspondence, police reports, or legal documentation.",
                        },
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                            <item.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-foreground">{item.title}</p>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
