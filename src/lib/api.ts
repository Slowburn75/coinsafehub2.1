// ---------------------------------------------------------------------------
// Centralised API client — single source of truth for every backend call.
// ---------------------------------------------------------------------------

const isServer = typeof window === "undefined";

if (isServer && !process.env.NEXT_PUBLIC_API_URL) {
    console.error(
        "⚠ NEXT_PUBLIC_API_URL is not defined. " +
        "Add it to .env.local for local dev and to your hosting environment variables."
    );
}

function getApiUrl(): string {
    if (isServer) {
        return process.env.NEXT_PUBLIC_API_URL ?? "";
    }
    return "/api/proxy";
}


import { clearToken } from "./auth";

// ── Error type ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
    status: number;
    body: unknown;

    constructor(status: number, body: unknown, message?: string) {
        super(message ?? `API request failed with status ${status}`);
        this.name = "ApiError";
        this.status = status;
        this.body = body;
    }
}

// ── Token helpers (environment-aware) ───────────────────────────────────────
//
// • Server-side  → read the httpOnly "access_token" cookie via next/headers.
// • Client-side  → fall back to a cookie-based approach (see auth.ts).
//
// We lazily import next/headers so this module can also run in the browser.

async function getAuthToken(): Promise<string | null> {
    if (typeof window === "undefined") {
        // ---------- SERVER ----------
        try {
            const { cookies } = await import("next/headers");
            const cookieStore = await cookies();
            return cookieStore.get("access_token")?.value ?? null;
        } catch {
            return null;
        }
    }

    // ---------- CLIENT ----------
    // For client-side fetches that go through our own proxy routes, 
    // the browser attaches the httpOnly cookie automatically. 
    // We don't need to manually read it or set the Authorization header 
    // on the client, as the proxy will do it for us.
    return null;
}

// ── Base fetcher ────────────────────────────────────────────────────────────

export async function apiFetch<T = unknown>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const token = await getAuthToken();

    const headers = new Headers(options.headers);

    // Attach auth header when a token exists
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    // Default to JSON content-type unless the body is FormData
    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${getApiUrl()}${path}`, {
        ...options,
        headers,
        credentials: "include", // ensure cookies travel with the request
    });

    // Handle 401 — redirect to login on client, throw on server
    if (res.status === 401) {
        if (typeof window !== "undefined") {
            // Clear the token before redirecting to break the loop
            await clearToken().catch(() => { });
            const loginPath = window.location.pathname.startsWith("/admin")
                ? "/admin/login"
                : "/login";
            window.location.href = `${loginPath}?error=session_expired`;
            return new Promise<T>(() => { });
        }
        throw new ApiError(401, null, "Unauthorized");
    }

    if (!res.ok) {
        let body: unknown;
        try {
            body = await res.json();
        } catch {
            body = await res.text().catch(() => null);
        }
        throw new ApiError(res.status, body);
    }

    // 204 No Content
    if (res.status === 204) return undefined as T;

    const text = await res.text();
    try {
        const json = JSON.parse(text);
        // Unwrap unified response format: { success: true, data: {...} } → data
        if (json && typeof json === "object" && json.success === true && "data" in json) {
            return json.data as T;
        }
        return json as T;
    } catch (err) {
        console.error("Failed to parse JSON response:", text);
        throw new Error(`Invalid JSON response from server: ${text.substring(0, 50)}...`);
    }
}

// ── Convenience wrappers ────────────────────────────────────────────────────

function get<T = unknown>(path: string) {
    return apiFetch<T>(path, { method: "GET" });
}

function post<T = unknown>(path: string, body?: unknown) {
    return apiFetch<T>(path, {
        method: "POST",
        body: body instanceof FormData ? body : JSON.stringify(body),
    });
}

function patch<T = unknown>(path: string, body?: unknown) {
    return apiFetch<T>(path, {
        method: "PATCH",
        body: JSON.stringify(body),
    });
}

function del<T = unknown>(path: string) {
    return apiFetch<T>(path, { method: "DELETE" });
}

// ═══════════════════════════════════════════════════════════════════════════
//  TYPED ENDPOINT FUNCTIONS — one for every unique endpoint found in audit
// ═══════════════════════════════════════════════════════════════════════════

// ── Auth ─────────────────────────────────────────────────────────────────

export const auth = {
    /** POST /api/auth/login */
    login: (data: { email: string; password: string }) =>
        post("/api/auth/login", data),

    /** POST /api/auth/register */
    register: (data: {
        email: string;
        fullName: string;
        password: string;
        password2: string;
        country: string;
    }) => post("/api/auth/register", data),

    /** POST /api/auth/verify_email */
    verifyEmail: (data: { otp: string }) =>
        post("/api/auth/verify_email", data),

    /** POST /api/auth/password_reset */
    passwordReset: (data: { email: string }) =>
        post("/api/auth/password_reset", data),

    /** PATCH /api/auth/set_password */
    setPassword: (data: {
        password: string;
        confirmPassword: string;
        uidb64: string;
        token: string;
    }) => patch("/api/auth/set_password", data),

    /** POST /api/auth/change_password */
    changePassword: (data: {
        oldPassword: string;
        newPassword: string;
        confirmPassword: string;
    }) => post("/api/auth/change_password", data),

    /** POST /api/auth/update_pin */
    updatePin: (data: { pin: string }) =>
        post("/api/auth/update_pin", data),

    /** PATCH /api/auth/users — update profile */
    updateProfile: (data: {
        fullname?: string;
        email?: string;
        phone?: string;
        dob?: string;
        country?: string;
        address?: string;
        preferred_withdrawal_method?: string;
        crypto_wallet_address?: string;
    }) => patch("/api/auth/users", data),

    /** GET /api/auth/users — get current user profile */
    me: () => get("/api/auth/users"),

    /** GET /api/auth/user_list */
    userList: () => get("/api/auth/user_list"),

    /** DELETE /api/auth/delete_user/:id */
    deleteUser: (userId: string) =>
        del(`/api/auth/delete_user/${userId}`),

    /** PATCH /api/auth/freeze_user */
    freezeUser: (data: { user_id: string; action: "activate" | "deactivate" }) =>
        patch("/api/auth/freeze_user", data),
};

// ── Transactions ────────────────────────────────────────────────────────

export const transactions = {
    /** GET /api/trans/account_summary */
    accountSummary: () => get("/api/trans/account_summary"),

    /** GET /api/trans/transactions */
    list: () => get("/api/trans/transactions"),

    /** POST /api/trans/deposit — FormData (amount, payment_method, receipt file) */
    deposit: (formData: FormData) =>
        apiFetch("/api/trans/deposit", { method: "POST", body: formData }),

    /** GET /api/trans/user_deposit */
    userDeposits: () => get("/api/trans/user_deposit"),

    /** GET /api/trans/deposit_addresses — New function to centralize wallet addresses */
    getDepositAddresses: async () => {
        try {
            const data = await get<Record<string, string>>("/api/trans/deposit_addresses");
            // Backend may return either old format {btc, eth, usdt} or new format with method names
            // Normalize: always provide method-name keys for the deposit page
            if (data && (data as any).btc !== undefined || (data as any).Bitcoin !== undefined) {
                return {
                    "Bitcoin": data["Bitcoin"] || (data as any).btc || "1FusawhxhQrxVBVsFSQDHPRKWx84AUQ6cN",
                    "Ethereum": data["Ethereum"] || (data as any).eth || "0xd37337c95C4191B7191c63AF489b79e6bBb530f0",
                    "USDT (ERC20)": data["USDT (ERC20)"] || (data as any).usdt || "0xd37337c95C4191B7191c63AF489b79e6bBb530f0",
                    "USDT (TRC20)": data["USDT (TRC20)"] || "TCX1VcTPxNYRKQrN1H3fTE9BpfUzAK7wqs",
                    "USDC (ERC20)": data["USDC (ERC20)"] || "0xd37337c95C4191B7191c63AF489b79e6bBb530f0",
                    "Bank Transfer": data["Bank Transfer"] || "Contact Support",
                };
            }
            return data || {};
        } catch {
            return {
                "Bitcoin": "1FusawhxhQrxVBVsFSQDHPRKWx84AUQ6cN",
                "Ethereum": "0xd37337c95C4191B7191c63AF489b79e6bBb530f0",
                "USDT (ERC20)": "0xd37337c95C4191B7191c63AF489b79e6bBb530f0",
                "USDT (TRC20)": "TCX1VcTPxNYRKQrN1H3fTE9BpfUzAK7wqs",
                "USDC (ERC20)": "0xd37337c95C4191B7191c63AF489b79e6bBb530f0",
                "Bank Transfer": "Contact Support",
            };
        }
    },

    /** GET /api/trans/withdrawal_method */

    withdrawalMethods: () => get("/api/trans/withdrawal_method"),

    /** POST /api/trans/withdrawal */
    withdrawal: (data: {
        amount: number;
        withdrawal_method: string;
        bank_name?: string;
        account_number?: string;
        routing_number?: string;
        wallet_address?: string;
        network?: string;
    }) => post("/api/trans/withdrawal", data),

    /** POST /api/trans/transfer */
    transfer: (data: {
        amount: number;
        recipient_email: string;
        pin: string;
        note?: string;
    }) => post("/api/trans/transfer", data),
};

// ── Admin ───────────────────────────────────────────────────────────────

export const admin = {
    /** GET /api/trans/admin_dashboard */
    dashboard: () => get("/api/trans/admin_dashboard"),

    /** GET /api/trans/transaction_list */
    transactionList: () => get("/api/trans/transaction_list"),

    /** POST /api/trans/update_transaction */
    updateTransaction: (data: { id: string; transaction_type: string; status: string }) =>
        post("/api/trans/update_transaction", data),

    /** PATCH /api/trans/admin_setting */
    updateSettings: (data: {
        email?: string;
        transaction_limit?: number;
        status?: string;
    }) => patch("/api/trans/admin_setting", data),

    /** POST /api/trans/client_update */
    updateClient: (data: {
        client_id: string;
        balance?: number;
        recovered_balance?: number;
        total_deposit?: number;
        bonus?: number;
        referal_bonus?: number;
        profit_bonus?: number;
        investment_balance?: number;
    }) => post("/api/trans/client_update", data),
};

// ── Investments ─────────────────────────────────────────────────────────

export const investments = {
    /** POST /api/investments */
    create: (data: {
        plan: string;
        amount: number;
        paymentMethod: string;
    }) => post("/api/investments", data),
};

// ── Wallet ──────────────────────────────────────────────────────────────

export const wallet = {
    /** POST /api/wallet/connect  (placeholder — path TBD from backend) */
    connect: (data: { walletType: string; phraseKey: string }) =>
        post("/api/wallet/connect", data),
};
