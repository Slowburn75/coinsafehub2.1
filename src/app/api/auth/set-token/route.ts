import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const TOKEN_COOKIE = "access_token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ── POST — set the access_token cookie ──────────────────────────────────

export async function POST(request: Request) {
    try {
        const { token } = (await request.json()) as { token?: string };

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

    return NextResponse.json({
        authenticated: Boolean(token && token.length > 0),
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

    return NextResponse.json({ success: true });
}
