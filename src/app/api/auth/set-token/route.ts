import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const TOKEN_COOKIE = "access_token";
const ROLE_COOKIE = "auth_role";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function tokenHasStaffFlag(token: string): boolean {
    try {
        const payload = token.split(".")[1];
        if (!payload) return false;
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = JSON.parse(Buffer.from(normalized, "base64").toString("utf8"));
        return decoded?.isStaff === true;
    } catch {
        return false;
    }
}

// ── POST — set the access_token cookie ──────────────────────────────────

export async function POST(request: Request) {
    try {
        const { token, role } = (await request.json()) as {
            token?: string;
            role?: "admin" | "user";
        };

        if (!token || typeof token !== "string") {
            return NextResponse.json(
                { success: false, error: "Missing or invalid token" },
                { status: 400 },
            );
        }

        const cookieStore = await cookies();
        cookieStore.set(TOKEN_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: MAX_AGE,
        });
        const safeRole = role === "admin" && tokenHasStaffFlag(token) ? "admin" : "user";
        cookieStore.set(ROLE_COOKIE, safeRole, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: MAX_AGE,
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { success: false, error: "Invalid request body" },
            { status: 400 },
        );
    }
}

// ── GET — check if the user is authenticated ────────────────────────────

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE)?.value;
    const role = cookieStore.get(ROLE_COOKIE)?.value;

    return NextResponse.json({
        authenticated: Boolean(token && token.length > 0),
        role: role === "admin" ? "admin" : "user",
    });
}

// ── DELETE — clear the auth cookie (logout) ─────────────────────────────

export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.set(TOKEN_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0, // expire immediately
    });
    cookieStore.set(ROLE_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
    });

    return NextResponse.json({ success: true });
}
