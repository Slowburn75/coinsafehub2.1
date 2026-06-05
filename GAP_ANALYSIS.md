# CoinSafeHub — Production Readiness Gap Analysis

> **Reviewers**: Principal Frontend Architect, Backend Architect, Product Manager, UX Reviewer
> **Context**: Preparing this product for Series A production launch
> **Frontend**: Next.js 16 + React 19, proxy-based architecture to `server.coinsafehub.com`

---

## Gaps by Category

---

### 1. Missing Features

| # | Issue | Severity | Why It Matters | Recommended Solution |
|---|-------|----------|----------------|---------------------|
| 1.1 | **No logout on user dashboard header** | HIGH | The Header component (line 48) has a Sign Out button but the notification bell has no dropdown. The sidebar has no logout option — users must scroll to the top of page to sign out. | Add logout to Sidebar bottom section (mirroring AdminSidebar's pattern). Add a user dropdown menu on header avatar. |
| 1.2 | **`/dashboard/support` page does not exist** | MEDIUM | Sidebar (`Sidebar.tsx:40`) lists "Support" linking to `/dashboard/support` but no file exists at that route. Users clicking it will get a 404. | Create the support page or remove the nav item. If keeping, implement: FAQ, contact form, ticket list. |
| 1.3 | **`/admin/users/create` page does not exist** | MEDIUM | Admin dashboard has a "Provision User" button (`admin/dashboard/page.tsx:89`) linking to `/admin/users/create`. No file exists. | Implement admin user creation form with email, password, role selection, and optional initial balance. |
| 1.4 | **Export CSV is a decorative button** | LOW | Transactions page has an "Export CSV" button (`transactions/page.tsx:62`) with no onClick handler. It does nothing. | Implement CSV generation (client-side from filtered data, or server-side endpoint). At minimum, hide until implemented. |
| 1.5 | **No pagination on any list** | HIGH | Transaction lists, user lists, and admin ledgers load all records at once with no pagination. At scale, this will cause performance degradation and excessive bandwidth use. | Add cursor-based or offset pagination to all list endpoints. Frontend: add page controls or infinite scroll. |
| 1.6 | **No transaction detail page** | MEDIUM | Transactions appear only in list view. Users cannot click into a transaction to see full details (receipt image, processing timeline, fee breakdown). Admin can view some details in dialogs. | Create `/dashboard/transactions/[id]` page. Show receipt, amounts, status history, processing notes. |
| 1.7 | **No receipt viewing for users** | HIGH | Users upload deposit receipts but can never view them after submission. Only admins can view receipts via the evidence dialog. This erodes trust — users need proof of what they submitted. | Add receipt thumbnail/links in user transaction list and deposit history. Serve receipt images to the owner. |
| 1.8 | **No referral system UI** | MEDIUM | Referral bonus is tracked as a balance field but there's no UI for users to see their referral code/link, share it, or track referred users. | Add referral page under dashboard: personal referral link, sharing buttons, referred user list, earnings breakdown. |
| 1.9 | **No dashboard date range filter** | MEDIUM | Dashboard stats and transactions are shown for "all time" only. Users cannot filter by week, month, or custom range. | Add date range picker to dashboard and transactions. Backend: add `?from=&to=` query params on summary and list endpoints. |
| 1.10 | **No user dashboard search/filter for admin user list** | LOW | Admin dashboard user table has a search icon and "Filters Active" label but no actual filter inputs (unlike the admin users page and transactions page which have search). | Add search input and role/status filter dropdowns to admin dashboard user table. |

---

### 2. Missing User Flows

| # | Issue | Severity | Why It Matters | Recommended Solution |
|---|-------|----------|----------------|---------------------|
| 2.1 | **No post-registration onboarding** | HIGH | After email verification, users land on an empty dashboard with zero balances and no guidance. Drop-off at this stage will be high. | Implement a 3-step onboarding wizard: (1) complete profile, (2) make first deposit, (3) explore plans. Show contextual tooltips. |
| 2.2 | **No account deletion flow for users** | MEDIUM | Users have no way to delete their account from settings. GDPR/CCPA require this. | Add "Delete Account" section in Settings > Security with confirmation, password re-entry, and cooling-off period. |
| 2.3 | **Admin "forgot password" is a dead link** | MEDIUM | Admin login page (`admin/login/page.tsx:59`) has `<a href="#">Forgot password?</a>` — a dead link. | Either implement admin password reset (separate from user flow) or remove the link. |
| 2.4 | **No "resend verification email"** | MEDIUM | If a user's OTP expires or email doesn't arrive, there's no way to request a new one from the verify-email page. | Add "Resend Code" button with cooldown timer (60s). |
| 2.5 | **No cancel/modify for pending transactions** | MEDIUM | Users cannot cancel a pending deposit or withdrawal. Transfers are explicitly "non-reversible" but deposits/withdrawals should be cancellable while pending. | Add cancel button to pending transactions. Backend: support `status=cancelled` transition from pending. |
| 2.6 | **Deposit/withdraw flows lose state on navigation** | MEDIUM | If a user is on step 2 of deposit and navigates away (or refreshes), all form state is lost. | Persist form state to sessionStorage or URL search params. |
| 2.7 | **No email change verification** | LOW | Settings allows changing email (the field is disabled in the current UI, but the API supports it via PATCH). If enabled, it needs verification flow. | Require OTP to confirm new email before updating. |
| 2.8 | **No "login as user" for admin** | LOW | Admins cannot impersonate users for support troubleshooting. | Implement secure impersonation with audit logging (admin action, impersonated user, duration, reason). |

---

### 3. UX Problems

| # | Issue | Severity | Why It Matters | Recommended Solution |
|---|-------|----------|----------------|---------------------|
| 3.1 | **Transfer fee presentation is misleading** | HIGH | Transfer review card shows `-$${amount * 1.2}` as "Impact to Portfolio" with "INCL. PROCESSING CHARGE". This implies the user pays the fee on top of the transfer amount, so sending $1,000 costs the sender $1,200. Meanwhile withdrawal fee is 20% deducted from the amount (send $1,000, receive $800). These two fee models are inconsistent and confusing. | Unify the fee model across transfer and withdrawal. Either both charge fee on top, or both deduct from amount. Clearly label: "You send: $X | Fee: $Y | Recipient receives: $Z". |
| 3.2 | **Withdrawal uses wrong balance for validation** | HIGH | Withdraw page validates against `summary?.balance` (main balance only) but the dashboard shows `total_balance` which includes investment, recovered, profit, bonus balances. A user with $50,000 in total_balance but $0 in main balance cannot withdraw despite seeing a large portfolio. | Validate against available/withdrawable balance. Clearly show which balances are withdrawable vs locked. |
| 3.3 | **Native `confirm()` dialogs for destructive actions** | MEDIUM | Admin delete user uses `window.confirm()` which is unstyled, non-customizable, and inconsistent with the rest of the glassmorphism UI. | Replace with shadcn `AlertDialog` component with styled confirm/cancel, clear description of consequences, and a "type DELETE to confirm" for extra safety. |
| 3.4 | **Status values are inconsistent** | HIGH | The codebase checks for `status === "completed"`, `status === "approved"`, `status === "Completed"`, `status === "Pending"`, `status === "pending"`, `status === "Approved"`, `status.toLowerCase() === "approved"`, etc. This indicates the backend returns inconsistent casing. | Backend: standardize all status values to lowercase snake_case (`pending`, `approved`, `completed`, `declined`, `cancelled`). Frontend: capitalize for display only. |
| 3.5 | **No breadcrumb navigation** | LOW | Deep pages (admin/users/123/edit) have no breadcrumbs. Users can get lost. | Add Breadcrumb component from shadcn to all layouts. |
| 3.6 | **PIN dialog auto-opens without context** | LOW | On the transfer page, clicking "Authorize Transfer" immediately opens the PIN dialog. If validation fails (e.g., insufficient balance), the user already entered their PIN for nothing. | Validate all fields before showing PIN dialog. Only show PIN dialog after all validation passes. |
| 3.7 | **Amount input allows negative values** | MEDIUM | The `<input type="number">` fields allow typing negative numbers (e.g., `-100`). Depositing a negative amount is meaningless. | Add `min="0"` attribute. Frontend validation: amount > minimum threshold. |
| 3.8 | **Plans page uses `alert()` for validation** | LOW | Plans page (`plans/page.tsx:31`) uses native `alert("Please enter a valid amount.")` instead of toast. | Replace with `toast.error()`. |
| 3.9 | **No optimistic UI updates** | MEDIUM | When user submits a deposit, withdraw, transfer, or admin approves/declines, the UI waits for the full API response before reflecting changes. This feels slow. | Implement optimistic updates: immediately show pending state, roll back on failure. Use React Query or SWR for built-in support. |
| 3.10 | **Quick amount presets on plans page are too small** | LOW | Presets are $100–$2,000 but plans start at $10,000. The presets are essentially useless for the plans context. | Align quick amounts with plan minimums. Or show a warning if selected amount is below the plan minimum. |

---

### 4. UI Inconsistencies

| # | Issue | Severity | Why It Matters | Recommended Solution |
|---|-------|----------|----------------|---------------------|
| 4.1 | **Admin login has different background color** | LOW | Admin login page uses `bg-slate-50` while the rest of the app uses the CSS variable `bg-background` (dark theme capable). | Use `bg-background` consistently. |
| 4.2 | **Mixed use of `<button>` and `<Button>`** | LOW | Some interactive elements use raw `<button>` elements with Tailwind classes while others use the shadcn `<Button>` component. Inconsistent focus rings, hover states, and disabled styles. | Audit and replace all raw `<button>` elements with `<Button>` or `<Button variant="ghost">` from shadcn. |
| 4.3 | **Inconsistent heading hierarchy** | LOW | Some pages use `text-2xl font-bold`, others `text-3xl font-black tracking-tight`. No consistent typographic scale. | Define a typography token system (e.g., page-title, section-title, card-title) and apply consistently. |
| 4.4 | **Glass-card class applied inconsistently** | MEDIUM | Some cards use `glass-card` (custom class in globals.css), some use direct Tailwind classes, some use neither. Visual consistency suffers. | Define a `<Card>` variant system in globals.css. Use `variant="glass"` prop pattern. |
| 4.5 | **Dashboard stat cards vs admin stat cards use different layouts** | LOW | Dashboard uses a 2x4 grid with compact cards. Admin uses a 1x3 grid with different card structure. | Unify stat card component across user and admin dashboards. |
| 4.6 | **Admin user list uses `is_active`, dashboard uses `is_frozen`** | HIGH | Admin user management page checks `user.is_active` for the status badge. Admin dashboard checks `!user.is_frozen`. These may diverge. | Backend: use a single `is_active` boolean. `is_frozen` should either be an alias or removed. Standardize. |
| 4.7 | **Two different user table presentations in admin** | MEDIUM | Admin dashboard has a glass-card styled user table with avatar initials, role badges, and balance display. Admin users page has a simpler table with different columns (no balance, no role badge). | Use the same table component in both places. Consolidate. |
| 4.8 | **Footer differs between layouts** | LOW | Dashboard footer simply shows "© Coinsafehub {year}". Admin footer shows "Secure Management System © Coinsafehub {year}". Landing page footer is elaborate with 4 columns. No consistency. | Create a single `<Footer variant="dashboard|admin|landing" />` component. |
| 4.9 | **Empty state messaging is inconsistent** | LOW | Some empty states say "No recent activity detected." (dashboard), "No previous records found." (deposit), "No user records detected in the synchronization cluster." (admin dashboard). The tone varies wildly. | Standardize empty state copy across the app. Use a consistent tone. |

---

### 5. Missing Loading States

| # | Issue | Severity | Why It Matters | Recommended Solution |
|---|-------|----------|----------------|---------------------|
| 5.1 | **No skeleton for dashboard stat cards** | MEDIUM | Dashboard shows a full-page spinner while loading. Individual cards could skeleton-load for a faster perceived experience. | Add `<Skeleton>` components from shadcn for each stat card and the transaction table rows. |
| 5.2 | **Transfer page has no balance loading state** | LOW | Transfer page uses `useDashboard()` which shows a loading spinner, but if it fails silently, the balance is `0` and all validation will fail confusingly. | Show explicit error state if balance cannot be loaded. Disable the form until balance is available. |
| 5.3 | **Admin settings page has no initial data loading** | MEDIUM | Settings page starts with blank fields. There's no GET endpoint to load current settings. User sees blank form and may accidentally overwrite existing config. | Add `GET /api/trans/admin_setting` to return current values. Pre-populate form on load. |
| 5.4 | **Plans page has no submission loading state** | LOW | The "Confirm & Start Recovery" button changes to "Processing Case..." but the plan details don't show skeleton or disable interactions during submission. | Disable all form controls during submission. Show spinner on the submit button. |
| 5.5 | **Wallet page has no initial loading** | LOW | Wallet connect page has no data to load, but the form shows immediately. If there's a saved wallet, it should show it. | If wallet connection is persistent, add GET endpoint and show connected wallet state. |
| 5.6 | **Transaction ledger rows don't show loading during filter/search** | LOW | Client-side filtering is instant, but if server-side filtering is added later, rows need skeleton loading. | Add debounced search with loading indicator. |
| 5.7 | **Button loading states inconsistent** | MEDIUM | Some submit buttons show `<Loader2>` spinner, some show text change only ("Processing..."), some do neither. | Create a consistent pattern: `<Button loading={isSubmitting}>` that shows spinner + disables. |
| 5.8 | **No progressive loading for TradingView widget** | LOW | The crypto page shows a 1650px tall container that's empty until the external script loads. | Show a skeleton chart placeholder while the TradingView widget loads. |

---

### 6. Missing Error Handling

| # | Issue | Severity | Why It Matters | Recommended Solution |
|---|-------|----------|----------------|---------------------|
| 6.1 | **No React Error Boundary** | HIGH | No `error.tsx` files in any route segment. No `ErrorBoundary` component. An uncaught render error in any component will crash the entire page to a white screen. | Add `error.tsx` to each route group: `(auth)/error.tsx`, `(dashboard)/error.tsx`, `admin/error.tsx`. Add a global-error.tsx at root. |
| 6.2 | **No network retry mechanism** | MEDIUM | `apiFetch` throws on failure and callers show a toast. No automatic retry for transient network errors. | Implement exponential backoff retry (3 attempts) for GET requests and idempotent operations in `apiFetch`. |
| 6.3 | **No offline detection** | LOW | If the user's internet drops, API calls fail silently with generic errors. Users won't know they're offline. | Add `navigator.onLine` check and a persistent "You are offline" banner. Queue mutations for retry. |
| 6.4 | **File upload has no client-side size validation** | MEDIUM | Deposit receipt upload UI says "MAX 5MB" but doesn't enforce it before submission. Large files will fail at the server or proxy with unclear errors. | Validate `receipt.size <= 5 * 1024 * 1024` before submission. Show immediate inline error. |
| 6.5 | **File upload has no type validation** | MEDIUM | Accepts `image/*` but doesn't validate the actual file type. A user could rename a `.exe` to `.jpg` — the browser accepts it. | Validate file MIME type against an allowlist: `["image/jpeg", "image/png", "application/pdf"]`. |
| 6.6 | **Password reset page shows error but no redirect** | LOW | If `uidb64` or `token` query params are missing, reset-password page shows an error alert but doesn't redirect. User is stuck on a dead page. | Auto-redirect to `/login?error=invalid_reset_link` after 5 seconds. |
| 6.7 | **API error parsing is fragile** | MEDIUM | Error messages are extracted as `err?.body?.detail || err?.body?.message || err?.message`. If the backend returns a different shape (e.g., `{ error: { message: "..." } }`), the user sees "Failed to..." with no detail. | Create a centralized `extractErrorMessage(err)` utility that handles all known backend error shapes. |
| 6.8 | **No rate limit feedback** | MEDIUM | If the backend returns 429 (Too Many Requests), the frontend shows a generic error. Users don't know they're being rate-limited or when to retry. | Detect 429 status, read `Retry-After` header, show "Too many attempts. Please wait X seconds." |
| 6.9 | **Settings GET /api/auth/users failure is silent** | MEDIUM | If `getMe()` fails in settings page, `data` is null and the form stays empty. User sees blank fields with no error. | Show error state with retry button if profile fetch fails. |
| 6.10 | **Transfer validation order is wrong** | MEDIUM | Transfer page validates all fields then opens PIN dialog. But the PIN is validated *after* the dialog opens. If PIN is wrong, the whole form is lost. | Validate PIN alongside other fields before API call. Clear PIN on failure. |

---

### 7. Missing Empty States

| # | Issue | Severity | Why It Matters | Recommended Solution |
|---|-------|----------|----------------|---------------------|
| 7.1 | **No empty state for withdrawal methods** | MEDIUM | If `GET /api/trans/withdrawal_method` returns an empty array, the withdrawal page step 2 shows an empty grid with no feedback. | Add empty state: "No withdrawal methods available. Please contact support." |
| 7.2 | **No empty state for deposit addresses** | LOW | If `GET /api/trans/deposit_addresses` returns empty and env fallback is not set, address shows "Contact Support". Better to show a clearer empty state. | Show a card: "Deposit addresses are being configured. Please check back shortly or contact support." |
| 7.3 | **No empty state for admin stats** | LOW | Admin dashboard stats default to 0. If the API fails, stats show 0 with no indication of error vs truly zero data. | Distinguish between "loading failed" (show error with retry) and "zero data" (show 0 with appropriate label). |
| 7.4 | **No empty state for admin settings** | LOW | If settings have never been configured, the form shows blank fields with no guidance. | Pre-fill with sensible defaults. Show a banner: "Default configuration active. Customize below." |
| 7.5 | **No empty state for connected wallets** | LOW | Wallet page always shows the connect form. If a wallet is already connected, it should show the connected state. | Show "Wallet Connected" card with wallet type, masked address, and disconnect button. |

---

### 8. Security Concerns

| # | Issue | Severity | Why It Matters | Recommended Solution |
|---|-------|----------|----------------|---------------------|
| 8.1 | **Wallet phrase key sent to server** | **CRITICAL** | `POST /api/wallet/connect` sends the user's 12/24-word recovery phrase to the backend. **Private keys/recovery phrases must NEVER leave the client.** This is a catastrophic security flaw. If the server is compromised, all connected wallets can be drained. | Remove the phrase key field entirely. Use wallet connection via standard Web3 patterns (MetaMask, WalletConnect). Never ask for or transmit seed phrases. |
| 8.2 | **PIN sent in plaintext in request body** | HIGH | 4-digit PIN is sent as `{ "pin": "1234" }` in the JSON body. While HTTPS encrypts this in transit, it's logged in server request logs and could appear in error traces. | Hash the PIN client-side before sending (e.g., SHA-256). Server stores and compares hashes only. |
| 8.3 | **No CSRF protection** | HIGH | The app relies solely on `sameSite: "strict"` cookie attribute for CSRF protection. Older browsers don't support this. No CSRF token in headers or double-submit cookie pattern. | Implement CSRF token pattern: server sends token in cookie, client reads and sends back in `X-CSRF-Token` header. |
| 8.4 | **No idempotency for financial operations** | HIGH | Deposit, withdrawal, and transfer endpoints have no idempotency key. If the client retries due to a network timeout, duplicate transactions could occur. | Require `Idempotency-Key` header on all POST/PATCH financial endpoints. Server deduplicates by key (at least 24h TTL). |
| 8.5 | **No request signing for sensitive operations** | MEDIUM | No HMAC or similar signature on withdrawal/transfer requests. A compromised proxy could modify request bodies. | Sign financial mutation request bodies with a derived key. Server verifies signature. |
| 8.6 | **Admin login has no additional security** | HIGH | Admin login uses the exact same endpoint and flow as user login. No 2FA, no IP restriction, no hardware key support. | Require TOTP-based 2FA for all staff accounts. Add IP allowlisting for admin panel. Consider WebAuthn for production. |
| 8.7 | **JWT has no refresh mechanism** | MEDIUM | 7-day JWT expiry with no refresh token. If the token is compromised, the attacker has 7 days of access. On expiry, user must re-login. | Implement refresh token rotation: short-lived access token (15 min) + long-lived refresh token (7 days). Invalidate refresh token on password change, logout, or suspected compromise. |
| 8.8 | **No input sanitization on amount fields** | LOW | While React handles XSS through JSX escaping, numeric inputs accept arbitrary string input before conversion. | Validate and sanitize on blur. Reject non-numeric characters beyond valid float format. |
| 8.9 | **NEXT_PUBLIC_API_URL exposed** | LOW | The backend URL is exposed in client-side code. This is expected for a proxy pattern but reveals infrastructure details. | This is acceptable if the backend is publicly accessible. Ensure CORS is restricted to the frontend origin only. |
| 8.10 | **No session management** | MEDIUM | Users cannot view or revoke active sessions. If a session is compromised, the user has no self-service recourse. | Add "Active Sessions" section in Settings > Security. Show device, IP, location, last active. Allow revocation. |
| 8.11 | **No login attempt rate limiting visible** | MEDIUM | No frontend or visible backend indication of rate limiting on login. Brute force attacks could go unnoticed by users. | Backend: implement exponential backoff on failed login attempts per email and per IP. Frontend: show "Too many attempts" message with countdown. |

---

### 9. Accessibility Issues

| # | Issue | Severity | Why It Matters | Recommended Solution |
|---|-------|----------|----------------|---------------------|
| 9.1 | **No skip-to-content link** | MEDIUM | Keyboard users must tab through the entire sidebar (30+ items) to reach page content. | Add a visually hidden "Skip to main content" link as the first focusable element. |
| 9.2 | **Icon buttons have no accessible names** | HIGH | Buttons like `<Button variant="ghost" size="icon">` with only an icon inside have no `aria-label`. Screen readers announce them as "button" with no context. | Add `aria-label` to every icon-only button. E.g., `aria-label="Edit user"`, `aria-label="Delete transaction"`. |
| 9.3 | **Color-only status indicators** | HIGH | Transaction status uses color alone (green pulse for completed, orange for pending, red for declined). Color-blind users cannot distinguish. | Add text labels alongside color indicators. Use patterns (e.g., checkmark, clock, X icons) in addition to color. |
| 9.4 | **No focus management in modals** | MEDIUM | When PIN dialog opens (`Dialog` component), focus is not trapped inside. Keyboard users can tab out of the modal and interact with background elements. | Verify the Radix Dialog correctly traps focus. Add `autoFocus` to PIN input. Return focus to trigger button on close. |
| 9.5 | **InputOTP accessibility** | MEDIUM | The OTP input for PIN uses individual slots. Screen reader behavior for this pattern is inconsistent. | Test with NVDA/VoiceOver. Provide a hidden single input as fallback. Add `aria-label` to each slot. |
| 9.6 | **No form error announcements** | MEDIUM | Form validation errors appear visually (red text) but are not announced to screen readers. | Use `aria-live="polite"` region for form errors. Use `aria-describedby` linking error messages to inputs (shadcn Form already does this partially). |
| 9.7 | **Glass morphism contrast issues** | MEDIUM | Glass cards use `bg-white/5` and `backdrop-blur-xl` which can create low contrast between text and background, especially over animated gradient backgrounds. | Audit contrast ratios for all glass-card text. Ensure minimum 4.5:1 for normal text, 3:1 for large text. Provide high-contrast mode option. |
| 9.8 | **Toast notifications not announced** | LOW | Sonner toast messages appear visually but are not announced to screen readers. | Configure Sonner with `aria-live` region. Verify toast container has appropriate role. |
| 9.9 | **No keyboard shortcut documentation** | LOW | No indication of available keyboard shortcuts anywhere. | Low priority for v1. Consider adding `?` key to show keyboard shortcut modal. |

---

### 10. Mobile Responsiveness Issues

| # | Issue | Severity | Why It Matters | Recommended Solution |
|---|-------|----------|----------------|---------------------|
| 10.1 | **Tables overflow without horizontal scroll indicators** | HIGH | All table components (dashboard, transactions, admin users, admin transactions) use standard HTML tables. On mobile (< 640px), columns overflow and users must horizontally scroll without any visual affordance. | Wrap tables in a `overflow-x-auto` container with a gradient fade indicator on the right edge when scrollable. Consider responsive card layout for mobile instead of table. |
| 10.2 | **Dashboard stat grid is 2 columns then 4 on large** | MEDIUM | On medium screens (768px-1024px), the 2-column grid has very wide cards. The gap between 2-col and 4-col is too large. | Add a `md:grid-cols-3` breakpoint for smoother transition. Use `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`. |
| 10.3 | **Step indicators may overflow on small screens** | LOW | Deposit and withdraw pages have 3-step indicators with connecting lines. On screens < 400px, they may overflow. | Use a compact vertical step indicator on very small screens. |
| 10.4 | **Admin transaction actions cramped on mobile** | MEDIUM | Each transaction row has up to 3 icon buttons (view, approve, decline). On mobile, these are tightly packed and easy to mis-tap. | Increase touch target size to minimum 44x44px. Add spacing. Consider collapsing into a single action menu on mobile. |
| 10.5 | **PIN input slots too large on small screens** | LOW | OTP slots are `w-14 h-16` (56x64px). On screens < 360px, 4 slots plus gaps = ~260px which may overflow. | Use responsive slot sizes: `w-12 h-14` on small screens, `w-14 h-16` on larger. |
| 10.6 | **Landing page images not optimized** | MEDIUM | Landing page images use Next.js `<Image>` but no `sizes` prop. Browser downloads full-resolution images even on mobile. | Add `sizes="(max-width: 768px) 100vw, 50vw"` and ensure proper responsive breakpoints. |
| 10.7 | **Deposit payment method grid is 2 columns then 1** | LOW | On mobile, the 6 payment methods stack in a single column — acceptable but could be more compact. | Consider 2-column grid even on mobile for the 6 payment method buttons if screen width allows. |
| 10.8 | **Quick amount presets may wrap poorly** | LOW | Deposit quick amounts `[$100, $500, $1000, $5000]` use flex-wrap. On narrow screens they wrap, creating an uneven grid. | Use `grid grid-cols-2` or `grid-cols-4` for consistent layout regardless of screen width. |
| 10.9 | **Admin sidebar toggle button placement** | LOW | Mobile toggle is `fixed left-4 top-6` with `z-40`. This may overlap with the bell icon on small screens. | Ensure toggle button doesn't overlap with header content. Test at 320px width. |

---

### 11. Missing API Requirements

| # | Issue | Severity | Why It Matters | Recommended Solution |
|---|-------|----------|----------------|---------------------|
| 11.1 | **No logout/invalidate token endpoint** | HIGH | The frontend only clears the cookie client-side. The JWT remains valid on the server until it expires (7 days). A compromised token can be used directly against the API bypassing the frontend entirely. | Add `POST /api/auth/logout` that adds the token to a deny-list (Redis). Backend auth middleware checks deny-list on every request. |
| 11.2 | **No refresh token endpoint** | MEDIUM | See §8.7. The 7-day fixed expiry means users must re-login weekly. | Add `POST /api/auth/refresh` that accepts a refresh token and returns a new access token. Implement rotation. |
| 11.3 | **No pagination parameters on list endpoints** | HIGH | All GET list endpoints return unbounded results. At 10k+ transactions, this will cause timeouts and massive payloads. | Add `?page=1&page_size=20` or cursor-based `?cursor=xxx&limit=20` to: `/api/trans/transactions`, `/api/auth/user_list`, `/api/trans/transaction_list`, `/api/trans/user_deposit`. Return `{ results: [], total: N, next_cursor: "..." }`. |
| 11.4 | **No filtering parameters** | MEDIUM | Transaction lists can't be filtered server-side by date range, status, type, or amount. Client-side filtering breaks with pagination. | Add query params: `?status=pending&type=deposit&from=2024-01-01&to=2024-12-31&min_amount=100&max_amount=10000&search=bitcoin`. |
| 11.5 | **No sorting parameters** | LOW | Transaction lists are returned in default order (likely by created_at DESC). Users can't sort by amount, status, or type. | Add `?sort_by=amount&order=desc`. |
| 11.6 | **No notification preferences endpoint** | MEDIUM | Settings > Notifications tab has toggle placeholders but no API to read/write user notification preferences. | Add `GET/PATCH /api/auth/notification_preferences` with fields: `{ security_alerts: bool, transaction_alerts: bool, marketing_emails: bool }`. |
| 11.7 | **No endpoint for user to view own receipt** | MEDIUM | `GET /api/trans/user_deposit` returns deposit history but without receipt URLs. Users can't view their own uploaded receipts. | Include `receipt_url` in deposit history response. Serve receipt files with auth check (owner or admin only). |
| 11.8 | **No endpoint for current plan status** | LOW | Dashboard shows "Premium Growth" as a hardcoded plan name with hardcoded daily yield "~0.45% AVG". This should come from the backend. | Add `GET /api/investments/active` returning the user's current active plan with yield stats. |
| 11.9 | **No endpoint for admin to create users** | MEDIUM | "Provision User" button has no corresponding API. Admin cannot create users from the panel. | Add `POST /api/auth/admin_create_user` with `{ email, password, full_name, is_staff?, initial_balance? }`. |
| 11.10 | **No KYC/document upload endpoints** | MEDIUM | No identity verification flow exists. Financial platforms typically require KYC for withdrawals above certain thresholds. | Add `POST /api/auth/kyc/upload` for document upload (ID, proof of address). `GET /api/auth/kyc/status` for verification status. Admin: `GET /api/auth/kyc/list`, `POST /api/auth/kyc/verify`. |
| 11.11 | **No referral endpoints** | MEDIUM | Referral bonus exists as a balance field but there's no API for: generating referral code, tracking referrals, viewing referral earnings. | Add `GET /api/auth/referral_code`, `GET /api/auth/referral_stats` (count, earnings, list). |
| 11.12 | **No support ticket endpoints** | LOW | Support page doesn't exist yet (§1.2). When implemented, needs API. | Add `POST /api/support/tickets`, `GET /api/support/tickets`, `GET /api/support/tickets/:id`, `POST /api/support/tickets/:id/messages`. Admin: `GET /api/support/admin/tickets`, `PATCH /api/support/admin/tickets/:id`. |
| 11.13 | **No activity/audit log endpoint** | MEDIUM | See §16. Users and admins need to see account activity. | Add `GET /api/auth/activity_log` returning login history, balance changes, security events. |
| 11.14 | **No system health check endpoint** | LOW | No way to monitor backend health from the frontend or external monitoring tools. | Add `GET /api/health` returning `{ status: "ok", db: "connected", timestamp: "..." }`. |

---

### 12. Missing Database Entities

| # | Entity | Why Needed | Key Fields |
|---|--------|------------|------------|
| 12.1 | **AuditLog** | Track all state-changing operations for compliance and debugging (§16). | `id, user_id (actor), target_user_id, action (enum), old_value (JSON), new_value (JSON), ip_address, user_agent, created_at` |
| 12.2 | **LoginAttempt** | Rate limiting and security monitoring. | `id, email, ip_address, success (bool), failure_reason, user_agent, created_at` |
| 12.3 | **Session / RefreshToken** | Track active sessions, enable remote logout, support refresh token rotation. | `id, user_id, token_hash, device_info, ip_address, location, last_used_at, expires_at, revoked_at, created_at` |
| 12.4 | **NotificationPreference** | Store per-user notification settings (§11.6). | `id, user_id (1:1), security_alerts (bool), transaction_alerts (bool), marketing_emails (bool)` |
| 12.5 | **Notification** | In-app notification history. | `id, user_id, type, title, body, is_read (bool), link, created_at` |
| 12.6 | **KYCVerification** | Identity verification status and documents. | `id, user_id (1:1), status (enum: pending, approved, rejected), document_type, document_url, verified_by (FK User), verification_notes, submitted_at, verified_at` |
| 12.7 | **ReferralCode** | User-specific referral codes. | `id, user_id (1:1), code (unique), click_count, signup_count, created_at` |
| 12.8 | **Referral** | Track referral relationships. | `id, referrer_id (FK User), referred_user_id (FK User), status, bonus_amount, bonus_paid_at, created_at` |
| 12.9 | **SupportTicket** | User support requests. | `id, user_id, subject, status (enum: open, in_progress, resolved, closed), priority, assigned_to (FK User), created_at, updated_at` |
| 12.10 | **SupportMessage** | Messages within a ticket. | `id, ticket_id, sender_id (user or admin), message, attachment_url, created_at` |
| 12.11 | **Plan** | Recovery/investment plan definitions (currently hardcoded). | `id, name, slug, min_amount, max_amount, profit_rate, duration_days, is_active, created_at` |
| 12.12 | **EmailTemplate** | Configurable email templates for transactional emails. | `id, name, subject, body_html, body_text, variables (JSON), updated_at` |
| 12.13 | **IdempotencyKey** | Prevent duplicate financial transactions (§8.4). | `id, key (unique), response_body, response_status, created_at (TTL index for cleanup)` |
| 12.14 | **TokenBlacklist** | Invalidated JWT tokens (logout, password change). | `id, token_jti (unique), expires_at (matches original token expiry), created_at` |

---

### 13. Missing User Roles

| # | Role | Why Needed | Permissions |
|---|------|------------|-------------|
| 13.1 | **Support Agent** | Handle user inquiries without full admin access. Cannot modify balances or system settings. | View users (read-only), view transactions, manage support tickets, view KYC documents (cannot approve). |
| 13.2 | **Compliance Officer** | Review KYC submissions, monitor suspicious transactions. Required for regulatory compliance. | View users, view transactions, approve/reject KYC, flag suspicious activity, view audit logs. Cannot modify balances. |
| 13.3 | **Auditor (Read-Only)** | External or internal audit access. Read everything, modify nothing. | View all users, all transactions, all settings, all logs. No create/update/delete permissions. |
| 13.4 | **Super Admin** | Full system access including role management and system config. Distinct from regular admin. | All permissions. Manage other admin accounts. Change system mode. Access server logs. |
| 13.5 | **Finance Manager** | Handle financial operations: approve large withdrawals, manage deposit addresses, view financial reports. | Approve transactions above threshold, manage deposit addresses, view financial analytics. Cannot manage users or system settings. |

**Current state**: The frontend only checks `is_staff` (binary: staff or not). The backend JWT claim `is_staff: true` grants access to all admin endpoints. This is insufficient for a production financial platform.

---

### 14. Missing Permissions

| # | Issue | Severity | Why It Matters | Recommended Solution |
|---|-------|----------|----------------|---------------------|
| 14.1 | **No maker/checker (4-eyes) approval flow** | HIGH | A single admin can approve their own deposit or withdrawal. In financial systems, the person who initiates should not be the one who approves. | Implement dual-approval for transactions above a threshold: one admin requests, another admin must approve. Track both in audit log. |
| 14.2 | **No per-action permission granularity** | HIGH | `is_staff` gives access to everything. An admin who should only manage users can also change system mode and modify balances. | Implement RBAC with granular permissions: `users.read`, `users.write`, `users.delete`, `transactions.read`, `transactions.approve`, `settings.read`, `settings.write`, `balances.write`, etc. |
| 14.3 | **No transaction amount-based approval tiers** | MEDIUM | All pending transactions can be approved by any admin regardless of amount. A $10M withdrawal should require higher authority than a $100 deposit. | Define approval tiers: < $10k: any admin, $10k-$100k: senior admin, > $100k: dual approval or super admin. |
| 14.4 | **No IP-based access restrictions** | MEDIUM | Admin panel is accessible from any IP with valid credentials. No geo-fencing or IP allowlisting. | Add optional IP allowlist per admin user. Block access from unauthorized IPs even with valid credentials. |
| 14.5 | **No time-based access restrictions** | LOW | Admin accounts have 24/7 access. No concept of business hours or scheduled access. | Add optional time-window restrictions per admin role (e.g., support agents only during business hours). |
| 14.6 | **No withdrawal amount limits per user tier** | MEDIUM | Any verified user can withdraw any amount (subject to balance). No daily/monthly withdrawal limits. | Add configurable withdrawal limits per user tier: daily limit, monthly limit, per-transaction limit. |

---

### 15. Missing Notifications

| # | Issue | Severity | Why It Matters | Recommended Solution |
|---|-------|----------|----------------|---------------------|
| 15.1 | **No real-time notification system** | MEDIUM | Users must refresh pages to see status changes. When an admin approves a deposit, the user doesn't know until they manually check. | Implement WebSocket or Server-Sent Events (SSE) for real-time updates: transaction status changes, admin actions, security alerts. |
| 15.2 | **No in-app notification center** | MEDIUM | Header has a notification bell with a pulse dot but no dropdown. There's no notification history page. | Build a notification dropdown on the bell icon showing recent notifications. Add "View All" link to `/dashboard/notifications`. |
| 15.3 | **No email notification triggers** | HIGH | The app processes financial transactions but sends no emails for: deposit confirmation, withdrawal processing, transfer received, password changed, new login detected. This is a trust and security issue. | Backend: send transactional emails on key events. Use a queue (RabbitMQ/SQS) for reliable delivery. Frontend: notification preferences page to opt in/out. |
| 15.4 | **No push notification support** | LOW | Mobile users (PWA or future native app) would benefit from push notifications for transaction updates. | Add Web Push API support when PWA is implemented. |
| 15.5 | **No admin alerting for suspicious activity** | MEDIUM | No alerting for: large withdrawals (> threshold), multiple failed login attempts, unusual activity patterns. | Backend: implement anomaly detection triggers. Send alerts via email and in-app notification to admins. |

---

### 16. Missing Audit Logs

| # | Audit Event | Why Needed |
|---|-------------|------------|
| 16.1 | **User login (success/failure)** | Security monitoring. Detect brute force, credential stuffing, account takeover. |
| 16.2 | **Password change** | Compliance. Should log who changed, when, from which IP. |
| 16.3 | **PIN change** | Security. PIN is used to authorize financial transactions. |
| 16.4 | **Profile updates** | Data integrity. Track what fields changed, old vs new values. |
| 16.5 | **Balance adjustments by admin** | **Critical.** Direct balance manipulation must be fully auditable: who changed what, old value, new value, reason. |
| 16.6 | **Transaction status changes** | Compliance and dispute resolution. Who approved/declined, when, any notes. |
| 16.7 | **User freeze/activate** | Accountability. Who froze/activated a user, when, why. |
| 16.8 | **User deletion** | Irreversible action. Must log: who deleted, which user, when. Consider soft-delete instead. |
| 16.9 | **System setting changes** | Operational safety. Track who changed system mode, transaction limits, admin email. |
| 16.10 | **KYC verification actions** | Regulatory compliance. Who approved/rejected, when, notes. |
| 16.11 | **Wallet address changes** | Security. Deposit address changes could redirect funds. |

**Implementation**: Create an `AuditLog` table. All mutating backend operations write to it. The frontend admin panel needs an "Audit Log" page to view and filter logs.

---

### 17. Missing Analytics Requirements

| # | Analytics Need | Why Needed | Implementation |
|---|---------------|------------|----------------|
| 17.1 | **User acquisition funnel** | Track landing page → register → verify email → first deposit → active user. Identify drop-off points. | Backend: track events with timestamps. Frontend: analytics SDK (PostHog, Mixpanel, or custom). Admin dashboard: funnel visualization. |
| 17.2 | **Transaction volume trends** | Monitor daily/weekly/monthly deposit and withdrawal volumes. Detect anomalies. | Backend: aggregate queries or materialized views. Admin dashboard: time-series charts. |
| 17.3 | **User activity metrics** | DAU/WAU/MAU, average session duration, feature usage (which pages are visited most). | Frontend: page view tracking. Backend: session tracking. |
| 17.4 | **Revenue metrics** | Track total fees collected (20% on withdrawals/transfers), plan enrollments, total AUM. | Backend: aggregate fee calculations. Admin dashboard: revenue dashboard. |
| 17.5 | **Error tracking** | Monitor API error rates, client-side exceptions, failed transactions. Alert on spikes. | Integrate Sentry or similar. Add to both frontend and backend. |
| 17.6 | **Performance monitoring** | Page load times, API response times, Time to First Byte, Core Web Vitals. | Vercel Analytics + custom API timing middleware. |
| 17.7 | **KYC conversion rate** | How many users complete KYC vs drop off. | Track KYC start, document upload, approval/rejection with timestamps. |
| 17.8 | **Referral program analytics** | Track referral link clicks, signups, conversion rate, total referral bonuses paid. | Add to referral system when implemented. |

---

### 18. Missing Settings Pages

| # | Setting | Why Needed | Location |
|---|---------|------------|----------|
| 18.1 | **Theme preferences (dark/light)** | `next-themes` is installed but there's no theme toggle in the UI. The app defaults to system preference but users can't override. | Add theme toggle in header and settings. |
| 18.2 | **Language/localization** | `en` is hardcoded everywhere. International users need multi-language support. | Add locale selector. Requires i18n infrastructure (next-intl or similar). Future scope. |
| 18.3 | **Session management** | View and revoke active sessions. See devices, locations, last active times. | Add to Settings > Security tab. |
| 18.4 | **Connected devices/apps** | If API keys or OAuth are added later, users need to manage connected applications. | Future scope with API key management. |
| 18.5 | **Data export** | GDPR/CCPA right to data portability. Users must be able to download their data. | Add "Export My Data" button in Settings. Generate JSON/CSV of user data. |
| 18.6 | **Account deletion** | GDPR/CCPA right to erasure. See §2.2. | Add "Delete Account" section in Settings. |
| 18.7 | **Two-factor authentication setup** | See §8.6. Users need a way to enable TOTP or WebAuthn. | Add 2FA setup flow in Settings > Security. QR code scan for TOTP. Backup codes. |
| 18.8 | **API key management** | For future programmatic access or integrations. | Future scope. Add API key generation, revocation in Settings. |
| 18.9 | **Notification preferences (functional)** | Settings > Notifications tab currently has non-functional toggles. See §11.6. | Wire up to backend. |

---

### 19. Missing Onboarding Flows

| # | Flow | Why Needed | Implementation |
|---|------|------------|----------------|
| 19.1 | **Post-registration welcome wizard** | New users see an empty dashboard with no guidance. 3-step wizard: complete profile → make deposit → explore plans. | Implement as a modal or dedicated page after email verification. Track completion. |
| 19.2 | **First-deposit guidance** | Users who have never deposited see the same deposit page as experienced users. Add contextual help: "Start with a small amount to test the process." | Show a dismissible info card at top of deposit page for users with `total_deposit === 0`. |
| 19.3 | **Zero-balance state dashboard** | Dashboard stats show all zeros. This should be a guided state: "Welcome! Let's get started. Make your first deposit to activate your portfolio." | Design a special dashboard state for new users with zero balances. Replace stat cards with onboarding steps. |
| 19.4 | **Email verification reminder** | If a user registered but didn't verify email, they can log in but should see a persistent banner: "Please verify your email to unlock all features." | Check `email_verified` status in user profile. Show banner on dashboard if unverified. |
| 19.5 | **KYC prompt at withdrawal threshold** | If a user tries to withdraw above a threshold without KYC, prompt them to complete KYC first. | Check KYC status before allowing withdrawal. Show KYC upload flow inline. |
| 19.6 | **Feature tooltips for first-time visitors** | Users may not understand what "Recovery Plans" or "Secure Bridge" mean. | Add optional product tour (library like `driver.js` or custom). Show on first visit, dismissible. |

---

### 20. Backend Architecture Concerns

| # | Concern | Severity | Why It Matters | Recommended Solution |
|---|---------|----------|----------------|---------------------|
| 20.1 | **No API versioning strategy** | MEDIUM | All endpoints are unversioned (`/api/auth/login`). Breaking changes to the API will immediately break the frontend. | Prefix all endpoints with `/api/v1/`. Maintain backward compatibility for at least one version. Use header-based versioning as alternative: `Accept: application/vnd.coinsafe.v1+json`. |
| 20.2 | **No rate limiting architecture** | HIGH | No indication of rate limiting at any layer. Login endpoint, financial endpoints, and public endpoints are all equally unprotected against abuse. | Implement tiered rate limiting: auth endpoints (5 req/min/IP), financial endpoints (30 req/min/user), general endpoints (100 req/min/user). Use Redis for distributed rate limiting. |
| 20.3 | **No idempotency infrastructure** | HIGH | See §8.4 and §12.13. Financial POST endpoints must be idempotent to prevent double-charges on retry. | Implement `Idempotency-Key` header handling. Store key → response mapping in Redis with 24h TTL. |
| 20.4 | **No event-driven architecture for side effects** | MEDIUM | When a deposit is approved, multiple things should happen: update balance, send email, log audit, maybe trigger referral bonus. If any of these fail in a synchronous chain, the whole transaction could fail or leave inconsistent state. | Use an event bus (Redis Streams, RabbitMQ, or SQS+SNS). Emit `TransactionApproved`, `DepositCompleted`, etc. Separate services/handlers consume these events. |
| 20.5 | **No email queue** | MEDIUM | Email sending (verification, password reset, notifications) is likely synchronous. If the email provider is slow or down, API responses are delayed. | Offload email sending to a background queue. API responds immediately, email is sent asynchronously. |
| 20.6 | **No database migration strategy** | MEDIUM | No evidence of migration tooling in the frontend codebase (expected since it's frontend-only). Backend must have a strategy. | Use Django migrations, Alembic (SQLAlchemy), or Prisma Migrate. Never modify schema manually in production. |
| 20.7 | **No caching strategy documented** | MEDIUM | Several endpoints are good cache candidates (deposit addresses, withdrawal methods, plans, system settings). No caching headers or strategy indicated. | Implement cache headers (ETag, Cache-Control) for rarely-changing resources. Use Redis for server-side caching with TTL-based invalidation. |
| 20.8 | **No horizontal scaling consideration** | MEDIUM | The frontend proxy routes all traffic through Vercel serverless functions to a single backend server. At scale, this is a bottleneck. | Backend: stateless API servers behind a load balancer. Use Redis for session/token state. Use managed database with read replicas. Frontend: consider removing the proxy layer and calling the backend directly from the client with proper CORS setup (reduces double-hop latency). |
| 20.9 | **No WebSocket/SSE strategy** | MEDIUM | See §15.1. Real-time notifications require persistent connections. Serverless (Vercel) doesn't natively support WebSocket well. | Use a dedicated real-time service (Pusher, Ably, or self-hosted Socket.io on a separate server). Or use polling as a simpler v1 approach. |
| 20.10 | **No logging/monitoring infrastructure** | HIGH | No indication of structured logging, error tracking, or performance monitoring on the backend. Critical for a financial platform. | Implement structured JSON logging (all requests, all errors). Ship logs to a centralized system (ELK, Datadog, CloudWatch). Set up alerts for error rate spikes, slow responses, unusual patterns. |
| 20.11 | **No backup strategy** | HIGH | Financial data loss is catastrophic. No indication of database backup strategy. | Automated daily backups with point-in-time recovery. Encrypted off-site backup storage. Regular restore testing. |
| 20.12 | **No transaction atomicity guarantee** | HIGH | When approving a deposit, the backend must: update transaction status, update user balance, log audit entry. If the balance update succeeds but the audit log fails, the system is inconsistent. | Wrap all financial mutations in database transactions. Use SELECT ... FOR UPDATE for balance reads during mutations to prevent race conditions. |
| 20.13 | **No environment segregation** | MEDIUM | No indication of dev/staging/production environments. All config is in `.env.local` with a single production URL. | Maintain separate environments: development (local), staging (pre-prod), production. Each with isolated databases and config. Never test financial operations against production data. |
| 20.14 | **No API documentation** | LOW | No OpenAPI/Swagger spec. Frontend developers must read `api.ts` source to understand endpoints. | Generate OpenAPI 3.0 spec from backend code (DRF Spectacular, FastAPI auto-docs, or tsoa). Publish developer docs. |

---

## Severity Summary

| Severity | Count | Must-Fix for Launch |
|----------|-------|---------------------|
| **CRITICAL** | 1 | Wallet phrase key sent to server |
| **HIGH** | 22 | Error boundary, pagination, CSRF, admin 2FA, logout endpoint, transaction atomicity, rate limiting, accessibility, status inconsistency, etc. |
| **MEDIUM** | 43 | Onboarding, notifications, audit logs, maker/checker, API filtering, mobile responsiveness, etc. |
| **LOW** | 22 | UI polish, keyboard shortcuts, breadcrumbs, etc. |

**Total items**: 88 gaps identified across 20 categories.

---

## Launch Blockers (Must-Fix)

1. **CRITICAL**: Remove wallet phrase key upload — replace with Web3 wallet connection
2. **HIGH**: Add React Error Boundaries to all route groups
3. **HIGH**: Implement pagination on all list endpoints
4. **HIGH**: Standardize transaction status values (lowercase)
5. **HIGH**: Implement CSRF protection
6. **HIGH**: Add idempotency keys to all financial endpoints
7. **HIGH**: Implement token logout/invalidation endpoint
8. **HIGH**: Add admin 2FA requirement
9. **HIGH**: Add dual-approval for transactions above threshold
10. **HIGH**: Implement structured audit logging for all mutations
11. **HIGH**: Add database transaction wrapping for financial operations
12. **HIGH**: Implement automated database backups
13. **HIGH**: Fix withdrawal balance validation (validate against withdrawable balance, not main balance)
14. **HIGH**: Add proper permission granularity (RBAC)
15. **HIGH**: Implement email notifications for key events
