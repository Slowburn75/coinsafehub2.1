"use client";

import { useEffect, useRef } from "react";

export function TradingViewWidget() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Check if widget already exists to avoid duplication in HMR
        if (containerRef.current.querySelector("script")) return;

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            colorTheme: "light",
            dateRange: "12M",
            showChart: true,
            locale: "en",
            width: "100%",
            height: "1650",
            largeChartUrl: "",
            isTransparent: false,
            showSymbolLogo: true,
            showFloatingTooltip: false,
            tabs: [
                {
                    title: "Cryptocurrencies",
                    symbols: [
                        { s: "BINANCE:BTCUSDT", d: "Bitcoin / USDT" },
                        { s: "BINANCE:ETHUSDT", d: "Ethereum / USDT" },
                        { s: "BINANCE:BNBUSDT", d: "Binance Coin / USDT" },
                        { s: "BINANCE:XRPUSDT", d: "Ripple / USDT" },
                        { s: "BINANCE:SOLUSDT", d: "Solana / USDT" },
                        { s: "BINANCE:ADAUSDT", d: "Cardano / USDT" },
                        { s: "BINANCE:DOGEUSDT", d: "Dogecoin / USDT" },
                        { s: "BINANCE:MATICUSDT", d: "Polygon / USDT" },
                        { s: "BINANCE:DOTUSDT", d: "Polkadot / USDT" },
                        { s: "BINANCE:SHIBUSDT", d: "Shiba Inu / USDT" },
                        { s: "BINANCE:AVAXUSDT", d: "Avalanche / USDT" },
                        { s: "BINANCE:TRXUSDT", d: "Tron / USDT" },
                        { s: "BINANCE:LTCUSDT", d: "Litecoin / USDT" },
                        { s: "BINANCE:ATOMUSDT", d: "Cosmos / USDT" },
                        { s: "BINANCE:LINKUSDT", d: "Chainlink / USDT" },
                        { s: "BINANCE:UNIUSDT", d: "Uniswap / USDT" },
                        { s: "BINANCE:FTMUSDT", d: "Fantom / USDT" },
                        { s: "BINANCE:NEARUSDT", d: "Near Protocol / USDT" },
                        { s: "BINANCE:ALGOUSDT", d: "Algorand / USDT" },
                        { s: "BINANCE:ICPUSDT", d: "Internet Computer / USDT" }
                    ],
                    originalTitle: "Cryptocurrencies"
                }
            ]
        });

        containerRef.current.appendChild(script);
    }, []);

    return (
        <div className="tradingview-widget-container" ref={containerRef}>
            <div className="tradingview-widget-container__widget"></div>
        </div>
    );
}
