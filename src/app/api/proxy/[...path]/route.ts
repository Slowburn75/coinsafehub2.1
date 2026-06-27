import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL; // server-side only, no NEXT_PUBLIC prefix

async function handler(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const { search } = new URL(req.url);

    // Strip /api/proxy from the path, keep everything after
    const backendPath = pathname.replace("/api/proxy", "");
    if (!API_URL) {
        return NextResponse.json(
            { error: "Backend API URL is not configured" },
            { status: 500 },
        );
    }
    const targetUrl = `${API_URL}${backendPath}${search}`;

    // Forward all headers except host
    const headers = new Headers(req.headers);
    headers.delete("host");

    // Inject Authorization header from cookies if present
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    try {
        const backendRes = await fetch(targetUrl, {
            method: req.method,
            headers,
            body: req.method !== "GET" && req.method !== "HEAD"
                ? await req.arrayBuffer()
                : undefined,
            // Prevent double body decompression on serverless platforms.
            // @ts-expect-error Node fetch requires duplex for streamed request bodies.
            duplex: "half",
        });

        const resHeaders = new Headers(backendRes.headers);
        // Remove encoding headers to prevent double-compression on serverless platforms
        resHeaders.delete("content-encoding");
        resHeaders.delete("transfer-encoding");
        resHeaders.delete("content-length");

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
