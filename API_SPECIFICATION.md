# CoinSafeHub — Complete API Specification

> **Source**: Full frontend codebase trace of every API call
> **Base URL**: `https://server.coinsafehub.com`
> **Auth**: JWT Bearer token (via `Authorization` header), delivered through httpOnly `access_token` cookie
> **Proxy**: Client-side calls go through `/api/proxy` (strips prefix, injects token). Server-side calls go direct.

---

## Table of Contents

1. [Global Conventions](#1-global-conventions)
2. [Authentication Endpoints (Auth)](#2-authentication-endpoints)
3. [Transaction Endpoints (Trans)](#3-transaction-endpoints)
4. [Admin Endpoints (Admin)](#4-admin-endpoints)
5. [Investment Endpoints](#5-investment-endpoints)
6. [Wallet Endpoints](#6-wallet-endpoints)
7. [Next.js Route Handlers (Internal)](#7-nextjs-route-handlers)
8. [Missing Endpoints](#8-missing-endpoints)
9. [Page-to-Endpoint Mapping](#9-page-to-endpoint-mapping)

---

## 1. Global Conventions

### 1.1 Request Headers

| Header | Value | When |
|--------|-------|------|
| `Authorization` | `Bearer <jwt>` | All authenticated requests |
| `Content-Type` | `application/json` | All JSON body requests (default) |
| `Content-Type` | `multipart/form-data` | Deposit only (FormData, browser sets boundary) |

### 1.2 Response Conventions

**Success (2xx)**
```json
// Mutation success (200/201)
{}
// or
{ "message": "Operation successful" }

// List success (200)
[ ... ]
// or
{ "results": [ ... ], "total": N, "next_cursor": "..." }

// Single resource (200)
{ "id": "...", ... }

// No content (204)
<empty body>
```

**Error (4xx/5xx)**
```json
{ "detail": "Human-readable error message" }
```
Frontend checks `err.body?.detail` first, then `err.body?.message`, then `err?.message`.

**HTTP Status Codes Used**
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (DELETE success) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) → frontend redirects to `/login?error=session_expired` |
| 404 | Not Found |
| 429 | Too Many Requests (rate limiting) |
| 500 | Internal Server Error |

### 1.3 Authentication Flow

1. Client calls `POST /api/auth/login` or `POST /api/auth/verify_email`
2. Receives `{ "access_token": "<jwt>" }`
3. Client-side: calls internal `POST /api/auth/set-token` with `{ "token": "<jwt>" }` to persist in httpOnly cookie
4. All subsequent API calls: backend proxy reads `access_token` cookie, injects `Authorization: Bearer <jwt>` header
5. Backend validates JWT, extracts `user_id` and `is_staff` claims
6. On logout: internal `DELETE /api/auth/set-token` clears cookie. No backend invalidation endpoint (see §8.1).

### 1.4 JWT Claims

```
{
  "user_id": "uuid",
  "email": "user@example.com",
  "is_staff": false,
  "exp": 1735689600,
  "iat": 1735084800
}
```

---

## 2. Authentication Endpoints

### 2.1 POST /api/auth/login

**Page**: `/login`, `/admin/login`
**Auth**: None

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "Str0ng!Pass"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Must be valid email format |
| `password` | string | Yes | Non-empty (frontend: min 1 char) |

**Success Response** (200)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses**
| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{ "detail": "Email and password are required" }` | Missing fields |
| 401 | `{ "detail": "Invalid email or password" }` | Wrong credentials |
| 403 | `{ "detail": "Email not verified" }` | Account exists but email unverified |
| 403 | `{ "detail": "Account is frozen" }` | Account deactivated by admin |

**Authorization**: None required. Backend must **not** require `is_staff=true` — the same endpoint authenticates both users and admins. Admin access is determined by the `is_staff` claim in the returned JWT.

---

### 2.2 POST /api/auth/register

**Page**: `/register`
**Auth**: None

**Request Body**
```json
{
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "Str0ng!Pass",
  "password2": "Str0ng!Pass",
  "country": "United States"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email, must be unique |
| `full_name` | string | Yes | Min 2 characters |
| `password` | string | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char |
| `password2` | string | Yes | Must match `password` |
| `country` | string | Yes | Non-empty. Frontend options: "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "Nigeria", "South Africa", "Other" (sorted alphabetically) |

**Success Response** (201)
```json
{}
```
or
```json
{ "message": "Registration successful. Please check your email for verification code." }
```

**Backend must**:
- Generate a 6-digit OTP
- Store OTP with expiry (e.g., 10 minutes) against the user record
- Send OTP via email
- Create user with `email_verified = false`, `is_active = true`, `is_staff = false`

**Error Responses**
| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{ "detail": "Email already registered" }` | Duplicate email |
| 400 | `{ "detail": { "password": ["Password must contain..."] } }` | Password validation failure |
| 400 | `{ "detail": "Passwords do not match" }` | password ≠ password2 |

---

### 2.3 POST /api/auth/verify_email

**Page**: `/verify-email`
**Auth**: None (but may auto-login on success)

**Request Body**
```json
{
  "otp": "123456"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `otp` | string | Yes | Exactly 6 digits |

**Success Response** (200) — with auto-login
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response** (200) — without auto-login
```json
{}
```
Frontend behavior: if `access_token` present → auto-login → redirect to `/dashboard`. If absent → redirect to `/login?verified=true`.

**Error Responses**
| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{ "detail": "Invalid verification code" }` | Wrong OTP |
| 400 | `{ "detail": "Verification code expired" }` | OTP expired |
| 400 | `{ "detail": "Email already verified" }` | Already verified |

**Backend must**:
- Mark user as `email_verified = true`
- Clear stored OTP
- Optionally issue JWT for auto-login

---

### 2.4 POST /api/auth/password_reset

**Page**: `/forgot-password`
**Auth**: None

**Request Body**
```json
{
  "email": "user@example.com"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email format |

**Success Response** (200)
```json
{}
```
or
```json
{ "message": "If an account exists with this email, a password reset link has been sent." }
```

**Security note**: Always return 200 regardless of whether the email exists (prevent user enumeration).

**Backend must**:
- Generate a unique reset token
- Encode user ID as `uidb64` (Base64-encoded)
- Store token with expiry (e.g., 1 hour) against user
- Send email containing reset link: `https://yourdomain.com/reset-password?uidb64=<uid>&token=<tok>`

---

### 2.5 PATCH /api/auth/set_password

**Page**: `/reset-password?uidb64=<uid>&token=<tok>`
**Auth**: None

**Request Body**
```json
{
  "password": "NewStr0ng!Pass",
  "confirm_password": "NewStr0ng!Pass",
  "uidb64": "MTIz",
  "token": "abc123def456"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `password` | string | Yes | Min 8 characters |
| `confirm_password` | string | Yes | Must match `password` |
| `uidb64` | string | Yes | Valid Base64-encoded user ID |
| `token` | string | Yes | Valid reset token (not expired) |

**Success Response** (200)
```json
{}
```
or
```json
{ "message": "Password has been reset successfully. Please log in." }
```

**Error Responses**
| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{ "detail": "Invalid or expired reset link" }` | bad uidb64/token |
| 400 | `{ "detail": "Passwords do not match" }` | password ≠ confirm_password |
| 400 | `{ "detail": "Password must be at least 8 characters" }` | Too short |

**Backend must**:
- Invalidate the reset token after successful use
- Hash the new password

---

### 2.6 POST /api/auth/change_password

**Page**: `/dashboard/settings` (Security tab)
**Auth**: Required (Bearer token)

**Request Body**
```json
{
  "old_password": "OldPass!1",
  "new_password": "NewPass!2",
  "confirm_password": "NewPass!2"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `old_password` | string | Yes | Must match current password |
| `new_password` | string | Yes | Min 8 chars (frontend hardcodes this) |
| `confirm_password` | string | Yes | Must match `new_password` |

**Success Response** (200)
```json
{}
```
or
```json
{ "message": "Password changed successfully" }
```

**Error Responses**
| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{ "detail": "Current password is incorrect" }` | old_password wrong |
| 400 | `{ "detail": "New password must be different from current password" }` | Same password |
| 400 | `{ "detail": "Passwords do not match" }` | new ≠ confirm |

---

### 2.7 POST /api/auth/update_pin

**Page**: `/dashboard/settings` (Withdrawal tab — PIN section)
**Auth**: Required

**Request Body**
```json
{
  "pin": "1234"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `pin` | string | Yes | Exactly 4 numeric digits (frontend enforces before sending) |

**Success Response** (200)
```json
{}
```
or
```json
{ "message": "PIN updated successfully" }
```

**Security note**: PIN should be hashed server-side (bcrypt/argon2). Never store in plaintext.

---

### 2.8 PATCH /api/auth/users (Update Profile)

**Page**: `/dashboard/settings` (Profile tab, Withdrawal tab)
**Auth**: Required

**Request Body**
```json
{
  "fullname": "John Doe",
  "email": "user@example.com",
  "phone": "+1234567890",
  "dob": "1990-01-01",
  "country": "United States",
  "address": "123 Main St, New York, NY 10001",
  "preferred_withdrawal_method": "bank",
  "crypto_wallet_address": "0x..."
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `fullname` | string | No | Full display name |
| `email` | string | No | Frontend marks this as disabled/read-only (email change not implemented) |
| `phone` | string | No | Any phone format |
| `dob` | string | No | ISO date format (YYYY-MM-DD) |
| `country` | string | No | Any string |
| `address` | string | No | Any string |
| `preferred_withdrawal_method` | string | No | `"bank"` or `"crypto"` |
| `crypto_wallet_address` | string | No | Any valid wallet address format |

**All fields are optional** — the frontend sends only the fields that changed (spread operator from state). Backend must only update provided fields.

**Success Response** (200)
```json
{}
```
or
```json
{ "message": "Profile updated successfully" }
```

---

### 2.9 GET /api/auth/users (Get Current User — "me")

**Page**: `/dashboard/settings` (all tabs for initial load)
**Auth**: Required

**No Request Body**

**Success Response** (200)
```json
{
  "id": "uuid-123",
  "email": "user@example.com",
  "fullname": "John Doe",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "phone_number": "+1234567890",
  "dob": "1990-01-01",
  "country": "United States",
  "address": "123 Main St",
  "is_active": true,
  "is_frozen": false,
  "is_staff": false,
  "email_verified": true,
  "preferred_withdrawal_method": "bank",
  "crypto_wallet_address": "0x...",
  "balance": 15000.00,
  "recovered_balance": 5000.00,
  "total_deposit": 20000.00,
  "total_withdrawal": 5000.00,
  "bonus": 500.00,
  "referal_bonus": 200.00,
  "profit_bonus": 300.00,
  "investment_balance": 2000.00,
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Field notes**:
- `first_name`/`last_name`: Used by admin user tables for display name and avatar initials
- `phone_number`: Used by admin user tables (frontend checks both `phone` and `phone_number`)
- `is_frozen`/`is_active`: Frontend uses both interchangeably. Backend should standardize on one.
- `is_staff`: Boolean flag for admin access
- Balance fields: All decimal/float

---

### 2.10 GET /api/auth/user_list (Admin: List All Users)

**Page**: `/admin/dashboard`, `/admin/users`, `/admin/users/[id]/edit`
**Auth**: Required (Admin only)

**No Request Body**

**Success Response** (200)
```json
[
  {
    "id": "uuid-123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "fullname": "John Doe",
    "phone_number": "+1234567890",
    "is_active": true,
    "is_frozen": false,
    "is_staff": false,
    "balance": 15000.00,
    "recovered_balance": 5000.00,
    "total_deposit": 20000.00,
    "bonus": 500.00,
    "referal_bonus": 200.00,
    "profit_bonus": 300.00,
    "investment_balance": 2000.00,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

**Authorization**: Backend must verify `is_staff = true` in JWT. Return 403 if not admin.

**Note**: No pagination implemented. At scale, this endpoint must support `?page=&page_size=` (see §8).

---

### 2.11 DELETE /api/auth/delete_user/:id

**Page**: `/admin/dashboard`, `/admin/users`
**Auth**: Required (Admin only)

**Path Parameter**
| Param | Type | Description |
|-------|------|-------------|
| `id` | string | User ID to delete |

**Success Response** (200 or 204)
```json
{}
```
204 No Content is also accepted by the frontend.

**Authorization**: Backend must verify `is_staff = true`. Must not allow self-deletion.

**Backend must**: Audit log who deleted which user.

---

### 2.12 PATCH /api/auth/freeze_user

**Page**: `/admin/dashboard`, `/admin/users`, `/admin/users/[id]/edit`
**Auth**: Required (Admin only)

**Request Body**
```json
{
  "user_id": "uuid-123",
  "action": "deactivate"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `user_id` | string | Yes | Must be a valid user ID |
| `action` | string | Yes | `"activate"` or `"deactivate"` |

**Success Response** (200)
```json
{}
```
or
```json
{ "message": "User successfully deactivated" }
```

**Authorization**: `is_staff = true`. Cannot freeze self. Cannot freeze other admin accounts (super admin protection).

**Backend must**:
- `"deactivate"`: Set `is_active = false` (or `is_frozen = true`)
- `"activate"`: Set `is_active = true` (or `is_frozen = false`)
- Audit log the action

---

## 3. Transaction Endpoints

### 3.1 GET /api/trans/account_summary

**Page**: `/dashboard` (dashboard page, used by useDashboard hook), `/dashboard/withdraw` (for balance validation), `/dashboard/transfer` (for balance validation)
**Auth**: Required

**No Request Body**

**Success Response** (200)
```json
{
  "balance": 15000.00,
  "total_deposit": 20000.00,
  "total_withdrawal": 5000.00,
  "total_profit": 3000.00,
  "total_bonus": 500.00,
  "total_referral_bonus": 200.00,
  "recovered_balance": 5000.00,
  "investment_balance": 2000.00,
  "profit_balance": 3000.00,
  "bonus_balance": 500.00,
  "referral_balance": 200.00,
  "pending_balance": 0,
  "withdrawal_balance": 0,
  "total_balance": 30700.00
}
```

**Frontend computation** (used if `total_balance` is missing from API):
```
total_balance =
  balance
  + investment_balance
  + recovered_balance
  + max(profit_balance, total_profit)
  + max(bonus_balance, total_bonus)
  + max(referral_balance, total_referral_bonus)
```

**Withdrawal validation in frontend**: Uses `balance` (main balance only) for available withdrawal balance. Users cannot withdraw from `investment_balance` or `recovered_balance`.

---

### 3.2 GET /api/trans/transactions

**Page**: `/dashboard` (recent transactions table), `/dashboard/transactions` (full ledger)
**Auth**: Required

**No Request Body**

**Success Response** (200)
```json
[
  {
    "id": "txn_abc123",
    "amount": 1000.00,
    "transaction_type": "deposit",
    "status": "completed",
    "payment_method": "Bitcoin",
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": "txn_def456",
    "amount": 500.00,
    "transaction_type": "withdrawal",
    "status": "pending",
    "payment_method": "Bank Transfer",
    "created_at": "2024-01-14T08:15:00Z"
  }
]
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Transaction reference. Frontend truncates to first 8 chars for display. |
| `amount` | number | USD amount |
| `transaction_type` | string | `"deposit"`, `"withdrawal"`, or `"transfer"` |
| `status` | string | `"pending"`, `"approved"`, `"completed"`, `"declined"` (case-insensitive in frontend) |
| `payment_method` | string | Optional. e.g., "Bitcoin", "Bank Transfer" |
| `created_at` | string | ISO 8601 datetime |

**Frontend display**: Dashboard shows most recent 5 (`recentTransactions.slice(0, 5)`). Transactions page shows all with client-side search/filter.

---

### 3.3 POST /api/trans/deposit

**Page**: `/dashboard/deposit` (step 3)
**Auth**: Required
**Content-Type**: `multipart/form-data`

**FormData Fields**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `amount` | string | Yes | Parseable as positive number |
| `payment_method` | string | Yes | One of: `"USDT (ERC20)"`, `"USDT (TRC20)"`, `"Ethereum"`, `"Bitcoin"`, `"Bank Transfer"`, `"USDC (ERC20)"` |
| `wallet_address` | string | Yes | The deposit address the user should send to (or "Contact Support") |
| `receipt` | File | Yes | Image or PDF file. Frontend UI says max 5MB (not enforced client-side). Accept: `image/*` |

**Success Response** (200/201)
```json
{}
```
or
```json
{ "message": "Deposit confirmed. Thank you!" }
```

**Backend must**:
- Store uploaded receipt file (filesystem or S3)
- Create a transaction record with `status = "pending"`
- Store `receipt_url` path on the transaction
- Do NOT credit the user's balance until an admin approves

**Error Responses**
| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{ "detail": "Receipt file is required" }` | No file |
| 400 | `{ "detail": "Invalid payment method" }` | Unknown method |
| 400 | `{ "detail": "Amount must be greater than 0" }` | Invalid amount |
| 413 | `{ "detail": "File too large. Maximum 5MB" }` | File exceeds limit |

---

### 3.4 GET /api/trans/user_deposit

**Page**: `/dashboard/deposit` (history sidebar)
**Auth**: Required

**No Request Body**

**Success Response** (200)
```json
{
  "results": [
    {
      "id": "dep_abc123",
      "amount": 1000.00,
      "payment_method": "Bitcoin",
      "status": "Pending",
      "created_at": "2024-01-15T10:30:00Z",
      "date": "2024-01-15"
    }
  ]
}
```
Frontend reads `(response as any).results || response`, supporting both wrapped and unwrapped formats.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Deposit reference |
| `amount` | number | USD amount |
| `payment_method` | string | Method used |
| `status` | string | Frontend checks capitalized: `"Completed"`, `"Pending"`, `"approved"` |
| `created_at` | string | ISO 8601 datetime (fallback: `date` field) |
| `date` | string | Alternative date field (used if `created_at` absent) |

**Note**: The frontend does NOT currently display `receipt_url` to users. Users cannot view their own uploaded receipts. This is a gap — add `receipt_url` to this response and serve receipts to the owner.

---

### 3.5 GET /api/trans/deposit_addresses

**Page**: `/dashboard/deposit` (step 3 — shows wallet address to send to)
**Auth**: Required

**No Request Body**

**Success Response** (200)
```json
{
  "btc": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "eth": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2",
  "usdt": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2"
}
```

**Frontend fallback**: If this endpoint fails (not implemented), frontend falls back to environment variables:
- `NEXT_PUBLIC_DEPOSIT_ADDRESS_BTC`
- `NEXT_PUBLIC_DEPOSIT_ADDRESS_ETH`
- `NEXT_PUBLIC_DEPOSIT_ADDRESS_USDT`

If neither the API nor env vars are set, address displays as `"TODO_BTC_ADDRESS"`.

---

### 3.6 GET /api/trans/withdrawal_method

**Page**: `/dashboard/withdraw` (step 2 — payment method selection)
**Auth**: Required

**No Request Body**

**Success Response** (200)
```json
[
  {
    "id": "1",
    "name": "Bitcoin",
    "min": 1000,
    "max": 100000,
    "charge": "20%",
    "duration": "Instant"
  },
  {
    "id": "2",
    "name": "Ethereum",
    "min": 1000,
    "max": 500000,
    "charge": "20%",
    "duration": "Instant"
  },
  {
    "id": "3",
    "name": "USDT (TRC20)",
    "min": 1000,
    "max": 500000,
    "charge": "20%",
    "duration": "Instant"
  },
  {
    "id": "4",
    "name": "Bank Transfer",
    "min": 1000,
    "max": 500000,
    "charge": "20%",
    "duration": "1-3 Business Days"
  }
]
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Method identifier |
| `name` | string | Yes | Display name. Frontend checks `name === "Bank Transfer"` to decide bank vs crypto form fields. |
| `min` | number | No | Minimum withdrawal amount |
| `max` | number | No | Maximum withdrawal amount |
| `charge` | string | No | Fee display string |
| `duration` | string | No | Processing time |

---

### 3.7 POST /api/trans/withdrawal

**Page**: `/dashboard/withdraw` (step 3 — after PIN entry)
**Auth**: Required (PIN validated)

**Request Body (Bank Transfer)**
```json
{
  "amount": 5000,
  "withdrawal_method": "4",
  "pin": "1234",
  "bank_name": "Chase",
  "account_number": "123456789",
  "routing_number": "021000021",
  "account_name": "John Doe"
}
```

**Request Body (Crypto)**
```json
{
  "amount": 5000,
  "withdrawal_method": "1",
  "pin": "1234",
  "wallet_address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `amount` | number | Yes | ≥ $1,000 (frontend validation). ≥ backend min for method. ≤ available balance. |
| `withdrawal_method` | string | Yes | Method ID from withdrawal_method list |
| `pin` | string | Yes | 4-digit PIN. Must match user's stored hashed PIN. |
| `bank_name` | string | Conditional | Required if method is "Bank Transfer" |
| `account_number` | string | Conditional | Required if method is "Bank Transfer" |
| `routing_number` | string | Conditional | Required if method is "Bank Transfer" |
| `account_name` | string | Conditional | Sent for Bank Transfer (not validated in frontend) |
| `wallet_address` | string | Conditional | Required if method is crypto |
| `network` | string | No | Network identifier (not currently sent by frontend) |

**Success Response** (200)
```json
{}
```
or
```json
{ "message": "Withdrawal request submitted successfully!" }
```

**Backend must**:
- Validate PIN against stored hash
- Validate available balance
- Apply 20% fee (frontend shows: fee = amount × 0.2, net = amount × 0.8)
- Create transaction with `status = "pending"`
- Deduct from user balance immediately or hold in pending

**Error Responses**
| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{ "detail": "Invalid PIN" }` | Wrong PIN |
| 400 | `{ "detail": "Insufficient balance" }` | Balance too low |
| 400 | `{ "detail": "Minimum withdrawal is $1,000" }` | Below minimum |
| 400 | `{ "detail": "Bank details are required" }` | Missing bank fields |

---

### 3.8 POST /api/trans/transfer

**Page**: `/dashboard/transfer` (PIN dialog confirmation)
**Auth**: Required (PIN validated)

**Request Body**
```json
{
  "amount": 2000,
  "recipient_email": "recipient@coinsafe.com",
  "pin": "1234",
  "note": "Internal settlement for services"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `amount` | number | Yes | > 0, ≤ available balance |
| `recipient_email` | string | Yes | Must match an existing user's email |
| `pin` | string | Yes | 4-digit PIN |
| `note` | string | No | Optional memo (textarea) |

**Success Response** (200)
```json
{
  "message": "Transfer submitted successfully!"
}
```
Frontend reads `(response as any).message`.

**Backend must**:
- Validate PIN
- Validate sender has sufficient balance
- Validate recipient exists by email
- Apply 20% fee (frontend shows: impact = amount × 1.2, i.e., fee added on top)
- Debit sender, credit recipient
- Create transaction records for both parties
- All within a database transaction

**Error Responses**
| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{ "detail": "Invalid PIN" }` | Wrong PIN |
| 400 | `{ "detail": "Insufficient balance" }` | Balance too low |
| 404 | `{ "detail": "Recipient not found" }` | No user with that email |
| 400 | `{ "detail": "Cannot transfer to yourself" }` | Self-transfer |

---

## 4. Admin Endpoints

### 4.1 GET /api/trans/admin_dashboard

**Page**: `/admin/dashboard`
**Auth**: Required (Admin only)

**No Request Body**

**Success Response** (200)
```json
{
  "total_users": 1250,
  "total_transactions": 8432,
  "total_deposit_amount": 2450000.00
}
```

| Field | Type | Notes |
|-------|------|-------|
| `total_users` | number | Total registered users (all) |
| `total_transactions` | number | Total transaction count (all time) |
| `total_deposit_amount` | number | Sum of all deposit amounts (all time) |

**Authorization**: `is_staff = true`

**Note**: No date range filtering. Backend should eventually support `?from=&to=` query parameters.

---

### 4.2 GET /api/trans/transaction_list

**Page**: `/admin/transactions`
**Auth**: Required (Admin only)

**No Request Body**

**Success Response** (200)
```json
{
  "results": [
    {
      "id": "txn_abc123",
      "amount": 1000.00,
      "transaction_type": "deposit",
      "status": "pending",
      "date": "2024-01-15T10:30:00Z",
      "user": {
        "email": "user@example.com",
        "full_name": "John Doe",
        "name": "John Doe"
      },
      "receipt_url": "/media/receipts/receipt_abc.jpg",
      "payment_method": "Bitcoin"
    },
    {
      "id": "txn_def456",
      "amount": 5000.00,
      "transaction_type": "withdrawal",
      "status": "approved",
      "date": "2024-01-14T08:15:00Z",
      "user": "user2@example.com",
      "receipt_url": null,
      "payment_method": "Bank Transfer"
    }
  ]
}
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Transaction reference |
| `amount` | number | USD amount |
| `transaction_type` | string | `"deposit"` or `"withdrawal"` |
| `status` | string | Frontend lowercases for comparison: `"pending"`, `"approved"`, `"completed"`, `"declined"` |
| `date` | string | ISO 8601. Frontend displays as "MMM dd, yyyy" and "HH:mm:ss" |
| `user` | object or string | If object: has `email`, `full_name`, `name` fields. If string: used as display name directly. |
| `receipt_url` | string or null | Path to uploaded receipt. Frontend constructs full URL: `${NEXT_PUBLIC_API_URL}${tx.receipt_url}` |
| `payment_method` | string | Method used |

**Authorization**: `is_staff = true`

**Frontend processing**: Reads `(response as any).results || []`. Filters pending count for the "Active Requests" counter: `transactions.filter(t => t.status.toLowerCase() === 'pending').length`.

---

### 4.3 POST /api/trans/update_transaction

**Page**: `/admin/transactions` (approve/decline buttons)
**Auth**: Required (Admin only)

**Request Body**
```json
{
  "id": "txn_abc123",
  "transaction_type": "deposit",
  "status": "Approved"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `id` | string | Yes | Transaction ID |
| `transaction_type` | string | Yes | `"deposit"` or `"withdrawal"` |
| `status` | string | Yes | `"Approved"` or `"Declined"` (capitalized — sent by frontend) |

**Success Response** (200)
```json
{}
```
or
```json
{ "message": "Transaction approved successfully" }
```

**Backend must**:
- For approval: update status, credit/debit user balance, record audit log
- For decline: update status to declined, do NOT modify balance
- Only allow transition from `"pending"` status
- All within a database transaction

**Authorization**: `is_staff = true`. Maker-checker recommended: admin who approves must not be the same admin who created the transaction (if applicable).

---

### 4.4 PATCH /api/trans/admin_setting

**Page**: `/admin/settings`
**Auth**: Required (Admin only)

**Request Body**
```json
{
  "email": "admin@coinsafehub.com",
  "transaction_limit": 10000,
  "status": "Active"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | No | Valid email format. Master admin contact email. |
| `transaction_limit` | number | No | Minimum amount requiring secondary verification. |
| `status` | string | No | `"Active"`, `"Maintenance"`, `"Restricted"`, or `"Offline"` |

**All fields optional** — frontend only sends fields that have a value.

**Success Response** (200)
```json
{}
```
or
```json
{ "message": "Settings updated successfully!" }
```

**Authorization**: `is_staff = true`

**Missing endpoint**: There is no `GET /api/trans/admin_setting` to load current settings. The form starts blank. **Add this endpoint** to pre-populate the form.

---

### 4.5 POST /api/trans/client_update

**Page**: `/admin/users/edit`, `/admin/users/[id]/edit`
**Auth**: Required (Admin only)

**Request Body**
```json
{
  "client_id": "uuid-123",
  "recovered_balance": 5000.00,
  "total_deposit": 10000.00,
  "bonus": 500.00,
  "referal_bonus": 200.00,
  "profit_bonus": 300.00,
  "investment_balance": 2000.00
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `client_id` | string | Yes | Must be a valid existing user ID |
| `recovered_balance` | number | No | Positive or zero |
| `total_deposit` | number | No | Positive or zero |
| `bonus` | number | No | Positive or zero |
| `referal_bonus` | number | No | Positive or zero |
| `profit_bonus` | number | No | Positive or zero |
| `investment_balance` | number | No | Positive or zero |

**All fields except `client_id` are optional** — frontend only sends fields with non-empty values (checks `if (formData.field)` before adding).

**Success Response** (200)
```json
{}
```
or
```json
{ "message": "Client details updated successfully!" }
```

**Critical**: This endpoint directly sets balance values. **Must**:
- Audit log: who changed what, old value → new value, for each changed field
- Require `is_staff = true`
- Consider maker-checker for large adjustments (see Gap Analysis)

---

## 5. Investment Endpoints

### 5.1 POST /api/investments

**Page**: `/dashboard/plans`
**Auth**: Required

**Request Body**
```json
{
  "plan": "starter",
  "amount": 500,
  "paymentMethod": "account_balance"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `plan` | string | Yes | `"starter"` or `"gold"` |
| `amount` | number | Yes | > 0 (frontend validates `parseFloat(amount) > 0`) |
| `paymentMethod` | string | Yes | `"account_balance"`, `"credit_card"`, or `"crypto_wallet"` |

**Success Response** (200/201)
```json
{}
```
or
```json
{ "message": "Case initiated successfully!" }
```

**Backend must**:
- Create an investment/recovery plan record
- Deduct `amount` from user's balance (if `paymentMethod = "account_balance"`)
- Set status (e.g., "active")

**Predefined plans** (hardcoded in frontend, should be backed by database):
| ID | Name | Min | Max | Duration | Weekly Profit |
|----|------|-----|-----|----------|---------------|
| `starter` | Standard Protocol | $10,000 | $100,000 | 1 Month | 1% |
| `gold` | Premium Forensic | $20,000 | $500,000 | 1 Month | 30% |

**Missing endpoint**: `GET /api/investments` — users cannot view their active plans or investment history. See §8.5.

---

## 6. Wallet Endpoints

### 6.1 POST /api/wallet/connect

**Page**: `/dashboard/wallet`
**Auth**: Required

**Request Body**
```json
{
  "walletType": "bitcoin",
  "phraseKey": "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `walletType` | string | Yes | `"bitcoin"`, `"ethereum"`, `"tether"`, or `"binance"` |
| `phraseKey` | string | Yes | 12 or 24-word recovery phrase |

**⚠ CRITICAL SECURITY NOTE**: Sending a wallet recovery phrase to a server is a **catastrophic security anti-pattern**. This endpoint should be:
1. Removed entirely, and replaced with Web3 wallet connection (MetaMask, WalletConnect)
2. If absolutely required for some reason, the phrase key must be encrypted client-side before transmission and the server must never store it in plaintext (encrypt at rest with a key the server does not have access to — which is impossible in practice)

**Success Response** (200)
```json
{}
```
or
```json
{ "message": "Wallet connected successfully!" }
```

---

## 7. Next.js Route Handlers

These are internal frontend endpoints, not backend endpoints. Documented for completeness.

### 7.1 POST /api/auth/set-token

**Called by**: `setToken()` in `src/lib/auth.ts` after login/verify
**Purpose**: Persist JWT in httpOnly cookie

**Request Body**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** (200)
```json
{ "success": true }
```

**Cookie Set**: `access_token=<token>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`

### 7.2 GET /api/auth/set-token

**Called by**: `isAuthenticated()` (client-side)
**Purpose**: Check if user has a valid auth cookie

**Response** (200)
```json
{ "authenticated": true }
```

### 7.3 DELETE /api/auth/set-token

**Called by**: `clearToken()` on logout
**Purpose**: Clear the auth cookie

**Response** (200)
```json
{ "success": true }
```

### 7.4 ALL /api/proxy/[...path]

**Purpose**: Universal proxy for client-side API calls

**Behavior**:
1. Receives request from browser at `/api/proxy/api/auth/login`
2. Strips `/api/proxy` prefix → `/api/auth/login`
3. Forwards to `https://server.coinsafehub.com/api/auth/login`
4. Reads `access_token` cookie, injects as `Authorization: Bearer <token>` header
5. Forwards request method, headers (except `host`), and body
6. Strips `content-encoding`, `transfer-encoding`, `content-length` from response (prevents Vercel double-compression)
7. Returns response to client

**Server-side calls**: `apiFetch()` calls `API_URL` directly (not through proxy) when running on the server.

---

## 8. Missing Endpoints

These endpoints are required by the frontend (pages, features, or logical necessity) but do not exist in the current API client or are not implemented.

### 8.1 Security & Auth

| # | Method | Endpoint | Required By | Purpose |
|---|--------|----------|-------------|---------|
| 8.1.1 | POST | `/api/auth/logout` | Header logout button | Invalidate JWT server-side (add to deny-list). Currently only clears client cookie — token remains valid for 7 days. |
| 8.1.2 | POST | `/api/auth/refresh` | Token expiry | Refresh short-lived access token with refresh token. Implement rotation. |
| 8.1.3 | POST | `/api/auth/resend_verification` | `/verify-email` | Resend email verification OTP. Add cooldown (60s). |
| 8.1.4 | GET | `/api/auth/sessions` | Settings > Security | List active sessions: device, IP, location, last active. |
| 8.1.5 | DELETE | `/api/auth/sessions/:id` | Settings > Security | Revoke a specific session. |
| 8.1.6 | POST | `/api/auth/2fa/setup` | Settings > Security | Generate TOTP secret + QR code URI. |
| 8.1.7 | POST | `/api/auth/2fa/verify` | Settings > Security | Verify and enable TOTP by providing a valid code. |
| 8.1.8 | POST | `/api/auth/2fa/disable` | Settings > Security | Disable 2FA (requires password re-entry). |

### 8.2 User Management

| # | Method | Endpoint | Required By | Purpose |
|---|--------|----------|-------------|---------|
| 8.2.1 | POST | `/api/auth/admin_create_user` | Admin "Provision User" button | Admin creates a new user account. Body: `{ email, password, full_name, is_staff?, initial_balance? }` |
| 8.2.2 | POST | `/api/auth/delete_account` | Settings > Security | User self-deletes their account. Requires password confirmation. GDPR compliance. |
| 8.2.3 | GET | `/api/auth/export_data` | Settings > Data export | GDPR data portability. Returns JSON of all user data. |

### 8.3 KYC (Know Your Customer)

| # | Method | Endpoint | Required By | Purpose |
|---|--------|----------|-------------|---------|
| 8.3.1 | POST | `/api/auth/kyc/upload` | Withdrawal flow | Upload ID document + proof of address. Multipart form. |
| 8.3.2 | GET | `/api/auth/kyc/status` | Withdrawal flow, Dashboard | Get user's KYC verification status. |
| 8.3.3 | GET | `/api/auth/kyc/list` | Admin panel | List all KYC submissions. Admin only. |
| 8.3.4 | POST | `/api/auth/kyc/:id/verify` | Admin panel | Approve or reject a KYC submission. |

### 8.4 Notification Preferences

| # | Method | Endpoint | Required By | Purpose |
|---|--------|----------|-------------|---------|
| 8.4.1 | GET | `/api/auth/notification_preferences` | Settings > Notifications | Get user's notification settings. |
| 8.4.2 | PATCH | `/api/auth/notification_preferences` | Settings > Notifications | Update settings: `{ security_alerts, transaction_alerts, marketing_emails }` |
| 8.4.3 | GET | `/api/auth/notifications` | Header bell dropdown | List recent in-app notifications. |
| 8.4.4 | PATCH | `/api/auth/notifications/:id/read` | Header bell | Mark notification as read. |
| 8.4.5 | POST | `/api/auth/notifications/read_all` | Header bell | Mark all notifications as read. |

### 8.5 Investments & Plans

| # | Method | Endpoint | Required By | Purpose |
|---|--------|----------|-------------|---------|
| 8.5.1 | GET | `/api/investments` | `/dashboard/plans` | List user's investment/recovery plan history. |
| 8.5.2 | GET | `/api/investments/active` | `/dashboard` | Get currently active plan. Dashboard shows "Premium Growth" and "~0.45% AVG" as hardcoded values. |
| 8.5.3 | GET | `/api/investments/plans` | `/dashboard/plans` | List available plans (currently hardcoded frontend: `PREDEFINED_PLANS`). |

### 8.6 Referrals

| # | Method | Endpoint | Required By | Purpose |
|---|--------|----------|-------------|---------|
| 8.6.1 | GET | `/api/auth/referral_code` | Referral page (not built) | Get user's unique referral code/link. |
| 8.6.2 | GET | `/api/auth/referral_stats` | Referral page | Referral count, earnings, list of referred users. |

### 8.7 Support

| # | Method | Endpoint | Required By | Purpose |
|---|--------|----------|-------------|---------|
| 8.7.1 | POST | `/api/support/tickets` | `/dashboard/support` (not built) | Create support ticket. |
| 8.7.2 | GET | `/api/support/tickets` | `/dashboard/support` | List user's tickets. |
| 8.7.3 | GET | `/api/support/tickets/:id` | `/dashboard/support` | Get ticket detail with messages. |
| 8.7.4 | POST | `/api/support/tickets/:id/messages` | `/dashboard/support` | Add reply to ticket. |
| 8.7.5 | GET | `/api/support/admin/tickets` | Admin panel | List all tickets. Admin only. |
| 8.7.6 | PATCH | `/api/support/admin/tickets/:id` | Admin panel | Update ticket status/assignment. Admin only. |

### 8.8 Admin

| # | Method | Endpoint | Required By | Purpose |
|---|--------|----------|-------------|---------|
| 8.8.1 | GET | `/api/trans/admin_setting` | `/admin/settings` | Load current system settings. Currently the form starts blank. |
| 8.8.2 | GET | `/api/auth/audit_log` | Admin panel | List audit log entries with filters: user, action type, date range. |
| 8.8.3 | GET | `/api/auth/activity_log` | Settings > Security | User's own activity log (login history, balance changes). |

### 8.9 Transaction Enhancements

| # | Method | Endpoint | Required By | Purpose |
|---|--------|----------|-------------|---------|
| 8.9.1 | GET | `/api/trans/transactions/:id` | Transaction detail page (not built) | Get full transaction detail: receipt image, status history, fee breakdown, processing notes. |
| 8.9.2 | POST | `/api/trans/transactions/:id/cancel` | Transaction list | Cancel a pending deposit or withdrawal. |
| 8.9.3 | GET | `/api/trans/export` | Transactions export button | Export filtered transactions as CSV. Support same filters as list endpoint. |

### 8.10 System

| # | Method | Endpoint | Required By | Purpose |
|---|--------|----------|-------------|---------|
| 8.10.1 | GET | `/api/health` | Monitoring | Health check: `{ status, db, timestamp }`. |

---

## 9. Page-to-Endpoint Mapping

| Page | Endpoints Called |
|------|-----------------|
| `/` (Landing) | None (LiveChat script only) |
| `/login` | `POST /api/auth/login` → `POST /api/auth/set-token` |
| `/register` | `POST /api/auth/register` |
| `/forgot-password` | `POST /api/auth/password_reset` |
| `/reset-password` | `PATCH /api/auth/set_password` |
| `/verify-email` | `POST /api/auth/verify_email` → `POST /api/auth/set-token` |
| `/dashboard` | `GET /api/trans/account_summary` + `GET /api/trans/transactions` |
| `/dashboard/deposit` | `GET /api/trans/user_deposit` + `GET /api/trans/deposit_addresses` + `POST /api/trans/deposit` |
| `/dashboard/withdraw` | `GET /api/trans/withdrawal_method` + `GET /api/trans/account_summary` (via useDashboard) + `POST /api/trans/withdrawal` |
| `/dashboard/transfer` | `GET /api/trans/account_summary` (via useDashboard) + `POST /api/trans/transfer` |
| `/dashboard/plans` | `POST /api/investments` |
| `/dashboard/crypto` | None (TradingView widget — external script) |
| `/dashboard/wallet` | `POST /api/wallet/connect` |
| `/dashboard/transactions` | `GET /api/trans/account_summary` + `GET /api/trans/transactions` (via useDashboard) |
| `/dashboard/settings` | `GET /api/auth/users` + `PATCH /api/auth/users` + `POST /api/auth/change_password` + `POST /api/auth/update_pin` |
| `/admin/login` | `POST /api/auth/login` → `POST /api/auth/set-token` |
| `/admin/dashboard` | `GET /api/trans/admin_dashboard` + `GET /api/auth/user_list` + `DELETE /api/auth/delete_user/:id` |
| `/admin/transactions` | `GET /api/trans/transaction_list` + `POST /api/trans/update_transaction` |
| `/admin/users` | `GET /api/auth/user_list` + `DELETE /api/auth/delete_user/:id` + `PATCH /api/auth/freeze_user` |
| `/admin/users/edit` | `POST /api/trans/client_update` |
| `/admin/users/[id]/edit` | `GET /api/auth/user_list` (via useAdminUsers) + `POST /api/trans/client_update` + `PATCH /api/auth/freeze_user` |
| `/admin/settings` | `PATCH /api/trans/admin_setting` |

**Shared by all authenticated pages**: `apiFetch` applies `Authorization: Bearer <jwt>` header to every request via proxy or direct connection. On 401: clears cookie, redirects to `/login?error=session_expired`.
