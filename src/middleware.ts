import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard", "/admin"];

// Routes that should redirect authenticated users away (back to dashboard)
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/verify-email", "/reset-password"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("access_token")?.value;
    const isAuthenticated = Boolean(token && token.length > 0);

    // ── Protect /dashboard/* and /admin/* ─────────────────────────────────
    const isProtected = PROTECTED_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) && pathname !== "/admin/login";

    if (isProtected && !isAuthenticated) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ── Redirect authenticated users away from auth pages ─────────────────
    const isAuthRoute = AUTH_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
    );

    if (isAuthRoute && isAuthenticated) {
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = "/dashboard";
        dashboardUrl.search = "";
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all protected and auth routes, skip static files and API routes
        "/dashboard/:path*",
        "/admin/:path*",
        "/login",
        "/register",
        "/forgot-password",
        "/verify-email",
        "/reset-password",
    ],
};
