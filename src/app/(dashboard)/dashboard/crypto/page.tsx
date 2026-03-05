"use client";

import { TradingViewWidget } from "@/components/TradingViewWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CryptoPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Live Crypto Chart</h1>
                <p className="text-muted-foreground text-sm">
                    Monitor real-time market performance across various cryptocurrency pairs.
                </p>
            </div>

            <Card className="overflow-hidden border-none shadow-md">
                <CardHeader className="bg-primary/5 py-4">
                    <CardTitle className="text-sm font-medium">Market Overview</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="w-full overflow-hidden min-h-[1650px] bg-white">
                        <TradingViewWidget />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
