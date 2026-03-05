"use client";

import { useState } from "react";
import { usePlans, PREDEFINED_PLANS } from "@/hooks/usePlans";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, ShieldCheck, Clock, ArrowRightCircle } from "lucide-react";

export default function PlansPage() {
    const { isSubmitting, invest } = usePlans();

    const [selectedPlanId, setSelectedPlanId] = useState("starter");
    const [amount, setAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("account_balance");

    const plan = PREDEFINED_PLANS[selectedPlanId];

    const handleInvest = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        await invest({
            plan: selectedPlanId,
            amount: parseFloat(amount),
            paymentMethod,
        });
    };

    const quickAmounts = [100, 250, 500, 1000, 1500, 2000];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Investment Plans</h1>
                <p className="text-muted-foreground text-sm">
                    Get started with your investment by choosing a plan that fits your goals.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Investment Configurator */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Configure Investment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="plan">Select Plan</Label>
                            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                                <SelectTrigger id="plan">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="starter">Starter Plan</SelectItem>
                                    <SelectItem value="gold">Gold Plan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label>Quick Investment Options</Label>
                            <div className="flex flex-wrap gap-2">
                                {quickAmounts.map((amt) => (
                                    <Button
                                        key={amt}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setAmount(amt.toString())}
                                        className={amount === amt.toString() ? "border-primary bg-primary/5 text-primary" : ""}
                                    >
                                        ${amt.toLocaleString()}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="custom-amount">Or Enter Custom Amount ($)</Label>
                            <Input
                                id="custom-amount"
                                type="number"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payment-method">Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger id="payment-method">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="account_balance">Account Balance</SelectItem>
                                    <SelectItem value="credit_card">Credit Card</SelectItem>
                                    <SelectItem value="crypto_wallet">Crypto Wallet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            className="w-full h-12 text-md"
                            onClick={handleInvest}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Processing..." : "Confirm & Invest"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Plan Details Sidebar */}
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Plan Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Plan Name</span>
                            <span className="font-bold text-lg">{plan.name}</span>
                        </div>

                        <Separator className="bg-primary/10" />

                        <div className="grid grid-cols-2 gap-y-4">
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Duration</span>
                                <span className="font-medium flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {plan.duration}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Profit</span>
                                <span className="font-medium text-primary">{plan.profit}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Min Deposit</span>
                                <span className="font-medium">{plan.minDeposit}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Max Deposit</span>
                                <span className="font-medium">{plan.maxDeposit}</span>
                            </div>
                        </div>

                        <Separator className="bg-primary/10" />

                        <div className="rounded-lg bg-card p-4 border border-primary/10 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Investment:</span>
                                <span className="font-bold">${amount || "0"}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Payment Via:</span>
                                <span className="font-medium capitalize">{paymentMethod.replace("_", " ")}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <ShieldCheck className="h-3 w-3" />
                            <span>Investment backed by CoinSafeHub Protection Fund.</span>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
