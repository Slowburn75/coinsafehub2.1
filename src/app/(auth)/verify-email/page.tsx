"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

import { auth } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const verifySchema = z.object({
    otp: z.string().length(6, "Verification code must be 6 digits"),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

export default function VerifyEmailPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<VerifyFormValues>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            otp: "",
        },
    });

    async function onSubmit(values: VerifyFormValues) {
        setIsLoading(true);
        setError(null);
        try {
            const response = await auth.verifyEmail(values) as { access_token?: string };
            toast.success("Email verified successfully!");

            if (response?.access_token) {
                await setToken(response.access_token);
                router.push("/dashboard");
            } else {
                router.push("/login?verified=true");
            }
        } catch (err: any) {
            console.error(err);
            setError(err?.body?.detail || err?.body?.message || "Verification failed. Please check your code.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Verify Email</CardTitle>
                    <CardDescription>
                        Enter the 6-digit code sent to your email address
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="otp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Verification Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123456" maxLength={6} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Verifying..." : "Verify Code"}
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center">
                        <Link href="/login" className="text-sm text-primary hover:underline">
                            Back to login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
