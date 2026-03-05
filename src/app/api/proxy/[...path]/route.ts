import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function POST(request: Request) {
    return proxyRequest(request, "POST");
}

export async function GET(request: Request) {
    return proxyRequest(request, "GET");
}

export async function PUT(request: Request) {
    return proxyRequest(request, "PUT");
}

export async function PATCH(request: Request) {
    return proxyRequest(request, "PATCH");
}

export async function DELETE(request: Request) {
    return proxyRequest(request, "DELETE");
}

async function proxyRequest(request: Request, method: string) {
    const url = new URL(request.url);
    // Remove /api/proxy from the start
    const path = url.pathname.replace(/^\/api\/proxy/, "");
    const targetUrl = `${API_URL}${path}${url.search}`;

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    const headers = new Headers(request.headers);
    // Important: set the Host header for the backend
    try {
        headers.set("host", new URL(API_URL).host);
    } catch {
        // URL might be empty or invalid during build
    }

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const body = method !== "GET" && method !== "HEAD" ? await request.arrayBuffer() : undefined;

    try {
        const response = await fetch(targetUrl, {
            method,
            headers,
            body,
            redirect: "manual",
        });

        if (response.status === 401) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const responseHeaders = new Headers(response.headers);
        responseHeaders.delete("content-encoding");
        responseHeaders.delete("content-length");
        responseHeaders.delete("transfer-encoding");
        // Remove CORS headers from backend so we can set our own or rely on same-origin
        responseHeaders.delete("access-control-allow-origin");
        responseHeaders.delete("access-control-allow-credentials");

        return new Response(response.body, {
            status: response.status,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
    }
}
