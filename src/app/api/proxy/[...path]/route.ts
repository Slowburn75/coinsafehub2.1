import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL; // server-side only, no NEXT_PUBLIC prefix

async function handler(req: NextRequest) {
    const { pathname, search } = new URL(req.url);

    // Strip /api/proxy from the path, keep everything after
    const backendPath = pathname.replace(/^\/api\/proxy/, "");
    const targetUrl = `${API_URL}${backendPath}${search}`;

    // Forward all headers except host
    const headers = new Headers(req.headers);
    headers.delete("host");

    try {
        const backendRes = await fetch(targetUrl, {
            method: req.method,
            headers,
            body: req.method !== "GET" && req.method !== "HEAD"
                ? await req.arrayBuffer()
                : undefined,
            // Required for Vercel — disable automatic body decompression
            // @ts-expect-error
            duplex: "half",
        });

        const resHeaders = new Headers(backendRes.headers);
        // Remove encoding headers so Vercel doesn't double-decompress
        resHeaders.delete("content-encoding");
        resHeaders.delete("transfer-encoding");

        return new NextResponse(backendRes.body, {
            status: backendRes.status,
            statusText: backendRes.statusText,
            headers: resHeaders,
        });
    } catch (err) {
        console.error("[Proxy Error]", err);
        return NextResponse.json(
            { error: "Proxy failed to reach backend", detail: String(err) },
            { status: 502 }
        );
    }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
