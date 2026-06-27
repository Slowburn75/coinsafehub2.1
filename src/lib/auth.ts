// ---------------------------------------------------------------------------
// Auth utilities — httpOnly cookie-based JWT management.
//
// • setToken()        → client-side: calls our Route Handler to set cookie
// • getToken()        → server-side: reads the cookie via next/headers
// • clearToken()      → client-side: calls Route Handler to clear cookie
// • isAuthenticated() → works on both server and client
// ---------------------------------------------------------------------------

const TOKEN_COOKIE = "access_token";

// ── Server-side helpers ─────────────────────────────────────────────────

/**
 * Read the JWT from the httpOnly cookie (server components / Route Handlers).
 * Returns `null` when running in the browser or when no cookie is set.
 */
export async function getToken(): Promise<string | null> {
    if (typeof window !== "undefined") return null;

    try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
    } catch {
        return null;
    }
}

// ── Client-side helpers ─────────────────────────────────────────────────

/**
 * Store the JWT in an httpOnly cookie via our Next.js Route Handler.
 * Call this after a successful login response.
 */
export async function setToken(token: string, role: "admin" | "user" = "user"): Promise<void> {
    const res = await fetch("/api/auth/set-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, role }),
    });

    if (!res.ok) {
        throw new Error("Failed to persist auth token");
    }
}

/**
 * Clear the auth cookie (logout).
 */
export async function clearToken(): Promise<void> {
    const res = await fetch("/api/auth/set-token", {
        method: "DELETE",
    });

    if (!res.ok) {
        throw new Error("Failed to clear auth token");
    }
}

// ── Universal helper ────────────────────────────────────────────────────

/**
 * Check whether the current user is authenticated.
 *
 * • Server-side → reads the httpOnly cookie directly.
 * • Client-side → pings a lightweight Route Handler.
 */
export async function isAuthenticated(): Promise<boolean> {
    if (typeof window === "undefined") {
        const token = await getToken();
        return token !== null && token.length > 0;
    }

    // Client-side: check via our Route Handler
    try {
        const res = await fetch("/api/auth/set-token", { method: "GET" });
        if (!res.ok) return false;
        const data = await res.json();
        return data.authenticated === true;
    } catch {
        return false;
    }
}
