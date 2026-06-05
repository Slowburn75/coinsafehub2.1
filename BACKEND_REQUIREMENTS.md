# CoinSafeHub — Backend Requirements Document

> **Generated from complete frontend codebase analysis**
> Frontend: Next.js 16 (canary) + React 19 + Tailwind CSS v4
> Backend target: `https://server.coinsafehub.com`
> Auth mode: httpOnly cookie-based JWT, proxied via `/api/proxy/[...path]`

---

## 1. All Pages

### Public / Landing
| # | Route | Description |
|---|-------|-------------|
| 1 | `/` | Landing page — hero, services, about, pricing, newsletter, footer |

### Auth (Route Group `(auth)`)
| # | Route | Description |
|---|-------|-------------|
| 2 | `/login` | User login (email + password) |
| 3 | `/register` | User registration (full name, email, country, password, confirm) |
| 4 | `/forgot-password` | Password reset request (email only) |
| 5 | `/reset-password` | Set new password (requires `uidb64` & `token` query params from email link) |
| 6 | `/verify-email` | Email OTP verification (6-digit code) |

### User Dashboard (Route Group `(dashboard)` — protected, wrapper layout with Sidebar + Header + Footer)
| # | Route | Description |
|---|-------|-------------|
| 7 | `/dashboard` | Main dashboard — portfolio summary, 8 financial stat cards, recent activity table, quick action buttons |
| 8 | `/dashboard/deposit` | 3-step deposit: Amount → Payment Method → Upload Receipt Proof |
| 9 | `/dashboard/withdraw` | 3-step withdrawal: Amount → Destination Details → PIN Verification |
| 10 | `/dashboard/transfer` | Internal peer-to-peer transfer with PIN authorization dialog |
| 11 | `/dashboard/plans` | Recovery/forensic plan selection and investment initiation |
| 12 | `/dashboard/crypto` | TradingView market overview widget |
| 13 | `/dashboard/wallet` | External wallet connection (requires wallet phrase key) |
| 14 | `/dashboard/transactions` | Filterable/searchable transaction ledger with CSV export placeholder |
| 15 | `/dashboard/settings` | 4-tab: Profile, Withdrawal Preferences, Security (password), Notifications/Alerts |

### Admin Panel (Route Group `admin` — protected except /admin/login, AdminSidebar layout)
| # | Route | Description |
|---|-------|-------------|
| 16 | `/admin/login` | Standalone admin login page (not protected by middleware) |
| 17 | `/admin/dashboard` | Admin system overview: stats cards + user directory table |
| 18 | `/admin/transactions` | Global transaction ledger with approve/decline per item |
| 19 | `/admin/users` | User management table — profile view, freeze/activate, delete, edit |
| 20 | `/admin/users/edit` | Client balance adjustment by entering a `client_id` |
| 21 | `/admin/users/[id]/edit` | Single-user edit page: profile info + 6 financial balance fields |
| 22 | `/admin/settings` | System configuration: master admin email, transaction threshold, system mode |

---

## 2. All Features

### 2.1 Authentication & Account
- **Registration** with email, full name, password confirmation, country selection
- **Email verification** via 6-digit OTP (auto-login on success)
- **Login** (email + password) → returns JWT stored as httpOnly cookie
- **Password reset** flow: email → uidb64+token link → set new password → redirect to login
- **Password change** (authenticated): old_password + new_password + confirm
- **Session management**: JWT in `access_token` cookie, 7-day expiry, httpOnly, secure (prod), sameSite: strict
- **Auto-logout** on 401 → redirect to `/login?error=session_expired`
- **Secondary PIN auth** (4-digit) required for withdrawals and P2P transfers
- **PIN update** via settings

### 2.2 Dashboard Overview
- **Portfolio total net worth** (computed: balance + investment + recovered + profit + bonus + referral)
- **8 financial stat cards**: Account Balance, Recovered Balance, Investment Balance, Total Deposit, Total Withdrawal, Total Profit, Total Bonus, Referral Bonus
- **Recent transactions** table (last 5 entries) with type badge, amount, status, date
- **Quick action buttons**: Deposit, Withdraw, Invest, Transfer
- **Active market card** with decorative BTC price display

### 2.3 Deposit Flow
- **Step 1**: Enter deposit amount in USD (quick presets: $100, $500, $1,000, $5,000)
- **Step 2**: Select payment method from 6 options:
  - USDT (ERC20), USDT (TRC20), Ethereum (ETH), Bitcoin (BTC), Bank Transfer, USDC (ERC20)
- **Step 3**: Display wallet deposit address (fetched from API), upload receipt/proof image (JPG/PNG/PDF, max 5MB), confirm submission
- **Deposit history** sidebar (recent 5 entries)
- **Copy-to-clipboard** for wallet addresses
- **Summary card** with recipient (Private Escrow), asset amount, gateway, fees ($0.00)

### 2.4 Withdrawal Flow
- **Step 1**: Enter withdrawal amount (minimum $1,000), validates against available balance, shows 20% fee warning
- **Step 2**: Select withdrawal method (fetched from API), fill destination details:
  - Bank: bank name, account number/IBAN, account holder name, routing number/SWIFT
  - Crypto: wallet address
- **Step 3**: Enter 4-digit security PIN to authorize
- **Summary sidebar**: requested amount, 20% charge, method, estimated credit (amount × 0.8)
- **AML compliance notice**

### 2.5 P2P Transfer
- **Recipient** by email or username
- **Amount** in USD (validated against available balance)
- **Memo/reference** textarea
- **20% processing fee** shown in review card
- **PIN dialog** (modal) for authorization
- **Non-reversible** warning

### 2.6 Recovery / Investment Plans
- **Two predefined plans**:
  - Standard Protocol: $10,000 min, 1 month, 1% weekly profit
  - Premium Forensic: $20,000 min, 1 month, 30% weekly profit
- **Custom retainer amount** with quick presets ($100–$2,000)
- **Payment method**: Account Balance, Credit Card, Crypto Wallet
- **Plan details sidebar**: duration, expected return, min/max case value, retainer summary

### 2.7 Wallet Connection
- **Wallet type selection**: Bitcoin, Ethereum, Tether USDT, Binance Coin
- **Phrase key input** (12 or 24-word recovery phrase)
- **Security warning** about never sharing phrase key
- Claimed server-side encryption of phrase key

### 2.8 Transaction Ledger
- **Full transaction history table**
- **Filter buttons**: All, Deposits, Withdrawals
- **Search** by amount or transaction type
- **Columns**: Reference ID, Type (badge), Amount, Status (with pulse indicator), Date & Time
- **Empty state** with call-to-action when no transactions

### 2.9 User Settings
- **Profile tab**: Full name (editable), email (read-only), phone, date of birth, country, address
- **Withdrawal tab**: preferred withdrawal method (bank/crypto), default crypto wallet address, PIN management (set + confirm)
- **Security tab**: change password (old + new + confirm)
- **Notifications tab**: placeholder toggles for security alerts and transaction alerts (UI only, no backend integration)

### 2.10 Admin Dashboard
- **3 stat cards**: Global User Base (total_users), System Volume (total_transactions), Total Inflow (total_deposit_amount)
- **User directory table**: avatar initials, full name + email, account status (active/suspended with pulse), role badge (Staff/Client), phone, portfolio balance
- **Per-user actions**: edit (link to single-user edit), view full profile (dialog showing all fields), delete (with confirmation)
- **Provision User** button (links to `/admin/users/create` — not yet implemented)

### 2.11 Admin Transaction Management
- **Global ledger table**: beneficiary (user info), intent (badge: deposit/withdrawal), net value, verification status (with glow indicator), synchronization timestamp
- **Active requests counter** and **processed 24h counter**
- **Search** by username, amount, or transaction ID
- **Evidence verification package** dialog: displays receipt image URL, all transaction metadata
- **Approve/Decline buttons** for pending transactions

### 2.12 Admin User Management
- **User table**: full name, email, phone, status badge, actions
- **Freeze/Activate** toggle per user
- **Delete user** with confirmation
- **Full profile dialog** showing all user fields
- **Edit user** → navigates to single-user edit page

### 2.13 Admin Financial Adjustments
- **By client_id** (admin/users/edit): adjust 6 balance fields: recovered_balance, bonus, referral_bonus, profit_bonus, investment_balance, total_deposit
- **Single-user edit** (admin/users/[id]/edit): profile info read-only + same 6 balance fields editable

### 2.14 Admin System Settings
- **Master admin email**: primary contact for automated alerts
- **Transaction threshold**: minimum amount requiring secondary manual verification
- **Global system mode**: Active (Normal), Maintenance, Restricted, Offline

### 2.15 Other
- **LiveChat** integration script (Tidio/Intercom-style)
- **TradingView** embed widget for market overview
- **Landing page** marketing sections: hero, services grid, about, pricing tiers, newsletter signup, footer
- **Dark/light** mode support (via `next-themes`)
- **Loading skeletons** and empty states throughout
- **Glassmorphism UI** design language throughout

---

## 3. All User Roles

### 3.1 Anonymous / Public
- Access: `/` (landing page only)
- Middleware redirects authenticated users away from auth pages to `/dashboard`

### 3.2 Registered User (Client)
- **Identifier**: `is_staff = false`
- Access: All `/dashboard/*` routes
- Capabilities:
  - View portfolio summary and financial stats
  - Initiate deposits (with receipt upload)
  - Request withdrawals (with PIN authorization)
  - Make internal P2P transfers (with PIN)
  - Enroll in recovery/investment plans
  - Connect external wallets
  - View transaction history
  - Manage profile, security, withdrawal preferences, notifications
- Restrictions: Cannot access `/admin/*` routes

### 3.3 Administrator / Staff
- **Identifier**: `is_staff = true`
- Access: All `/admin/*` routes (login via `/admin/login`, which calls the same `/api/auth/login` endpoint)
- Capabilities:
  - View system-wide stats (total users, transactions, deposit volume)
  - View and search all user records
  - Freeze/activate user accounts
  - Delete users
  - Edit user financial balances (6 fields)
  - View all transactions globally
  - Approve or decline pending transactions
  - View receipt evidence
  - Configure system settings (email, transaction threshold, system mode)
- Also has access to `/dashboard/*` (same as regular user) via shared JWT

---

## 4. All API Endpoints Being Called

### 4.1 Authentication (`/api/auth/*`)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | POST | `/api/auth/login` | No | Authenticate user/admin, returns JWT |
| 2 | POST | `/api/auth/register` | No | Register new user account |
| 3 | POST | `/api/auth/verify_email` | No | Verify email with 6-digit OTP, optionally auto-login |
| 4 | POST | `/api/auth/password_reset` | No | Request password reset email |
| 5 | PATCH | `/api/auth/set_password` | No | Set new password using uidb64 + token from email |
| 6 | POST | `/api/auth/change_password` | Yes | Change password (requires current password) |
| 7 | POST | `/api/auth/update_pin` | Yes | Set/update 4-digit security PIN |
| 8 | PATCH | `/api/auth/users` | Yes | Update current user's profile fields |
| 9 | GET | `/api/auth/users` | Yes | Get current user's full profile ("me") |
| 10 | GET | `/api/auth/user_list` | Yes (Admin) | List all registered users |
| 11 | DELETE | `/api/auth/delete_user/:id` | Yes (Admin) | Permanently delete a user |
| 12 | PATCH | `/api/auth/freeze_user` | Yes (Admin) | Activate or deactivate a user account |

### 4.2 Transactions (`/api/trans/*`)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 13 | GET | `/api/trans/account_summary` | Yes | Get user's financial account summary |
| 14 | GET | `/api/trans/transactions` | Yes | Get user's transaction history |
| 15 | POST | `/api/trans/deposit` | Yes | Submit deposit with receipt (FormData/multipart) |
| 16 | GET | `/api/trans/user_deposit` | Yes | Get user's deposit history |
| 17 | GET | `/api/trans/deposit_addresses` | Yes | Get platform wallet addresses for deposit (BTC/ETH/USDT) |
| 18 | GET | `/api/trans/withdrawal_method` | Yes | Get available withdrawal methods |
| 19 | POST | `/api/trans/withdrawal` | Yes | Submit a withdrawal request |
| 20 | POST | `/api/trans/transfer` | Yes | Submit internal P2P transfer |

### 4.3 Admin (`/api/trans/*` — admin operations)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 21 | GET | `/api/trans/admin_dashboard` | Yes (Admin) | Admin system overview stats |
| 22 | GET | `/api/trans/transaction_list` | Yes (Admin) | List all transactions across all users |
| 23 | POST | `/api/trans/update_transaction` | Yes (Admin) | Approve or decline a transaction |
| 24 | PATCH | `/api/trans/admin_setting` | Yes (Admin) | Update system configuration |
| 25 | POST | `/api/trans/client_update` | Yes (Admin) | Update specific user's financial balances |

### 4.4 Investments (`/api/investments/*`)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 26 | POST | `/api/investments` | Yes | Create a new investment/recovery plan enrollment |

### 4.5 Wallet (`/api/wallet/*`)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 27 | POST | `/api/wallet/connect` | Yes | Connect an external crypto wallet |

---

## 5. Request Payloads

### 5.1 Auth

**POST /api/auth/login**
```json
{
  "email": "user@example.com",
  "password": "••••••••"
}
```

**POST /api/auth/register**
```json
{
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "Str0ng!Pass",
  "password2": "Str0ng!Pass",
  "country": "United States"
}
```
Frontend validation: password min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char. passwords must match. Frontend country list: 10 countries (sorted).

**POST /api/auth/verify_email**
```json
{
  "otp": "123456"
}
```

**POST /api/auth/password_reset**
```json
{
  "email": "user@example.com"
}
```

**PATCH /api/auth/set_password**
```json
{
  "password": "NewStr0ng!Pass",
  "confirm_password": "NewStr0ng!Pass",
  "uidb64": "<base64-encoded-user-id>",
  "token": "<reset-token>"
}
```

**POST /api/auth/change_password**
```json
{
  "old_password": "OldPass!1",
  "new_password": "NewPass!2",
  "confirm_password": "NewPass!2"
}
```

**POST /api/auth/update_pin**
```json
{
  "pin": "1234"
}
```

**PATCH /api/auth/users** (Update Profile)
```json
{
  "fullname": "John Doe",
  "email": "user@example.com",
  "phone": "+1234567890",
  "dob": "1990-01-01",
  "country": "United States",
  "address": "123 Main St",
  "preferred_withdrawal_method": "bank",
  "crypto_wallet_address": "0x..."
}
```
All fields optional — backend should only update provided fields.

**PATCH /api/auth/freeze_user**
```json
{
  "user_id": "123",
  "action": "activate"
}
```
`action` is either `"activate"` or `"deactivate"`.

### 5.2 Transactions

**POST /api/trans/deposit** (multipart/form-data)
```
amount: "1000"
payment_method: "Bitcoin"
wallet_address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
receipt: <file binary>
```

**POST /api/trans/withdrawal**
```json
{
  "amount": 5000,
  "withdrawal_method": "Bank Transfer",
  "bank_name": "Chase",
  "account_number": "123456789",
  "routing_number": "021000021",
  "wallet_address": "0x...",
  "network": "ERC20"
}
```
Bank fields are sent when withdrawal method is bank. `wallet_address` and `network` sent for crypto methods.

**POST /api/trans/transfer**
```json
{
  "amount": 2000,
  "recipient_email": "recipient@coinsafe.com",
  "pin": "1234",
  "note": "Internal settlement"
}
```

### 5.3 Admin

**POST /api/trans/update_transaction**
```json
{
  "id": "txn_abc123",
  "transaction_type": "deposit",
  "status": "Approved"
}
```
`status` values sent: `"Approved"` or `"Declined"` (capitalized first letter).

**PATCH /api/trans/admin_setting**
```json
{
  "email": "admin@coinsafehub.com",
  "transaction_limit": 10000,
  "status": "Active"
}
```
All fields optional. `status` options: `"Active"`, `"Maintenance"`, `"Restricted"`, `"Offline"`.

**POST /api/trans/client_update**
```json
{
  "client_id": "123",
  "recovered_balance": 5000.00,
  "total_deposit": 10000.00,
  "bonus": 500.00,
  "referal_bonus": 200.00,
  "profit_bonus": 300.00,
  "investment_balance": 2000.00
}
```
All fields except `client_id` are optional — only sent if they have a value.

### 5.4 Investments

**POST /api/investments**
```json
{
  "plan": "starter",
  "amount": 500,
  "paymentMethod": "account_balance"
}
```
`plan` values: `"starter"` or `"gold"`. `paymentMethod` values: `"account_balance"`, `"credit_card"`, `"crypto_wallet"`.

### 5.5 Wallet

**POST /api/wallet/connect**
```json
{
  "walletType": "bitcoin",
  "phraseKey": "word1 word2 word3 ... word12"
}
```
`walletType` values: `"bitcoin"`, `"ethereum"`, `"tether"`, `"binance"`.

---

## 6. Response Payloads

### 6.1 Auth Responses

**Success — Login / Verify Email**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```
Note: `POST /api/auth/verify_email` may *optionally* include `access_token` for auto-login. If absent, frontend redirects to `/login?verified=true`.

**Success — Generic mutation (register, password_reset, set_password, change_password, update_pin, update_profile, freeze_user)**
```json
{}
```
or
```json
{
  "message": "Success message"
}
```

**GET /api/auth/users ("me")**
```json
{
  "id": "123",
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
  "preferred_withdrawal_method": "bank",
  "crypto_wallet_address": "0x...",
  "balance": 15000.00,
  "recovered_balance": 5000.00,
  "total_deposit": 20000.00,
  "bonus": 500.00,
  "referal_bonus": 200.00,
  "profit_bonus": 300.00,
  "investment_balance": 2000.00
}
```

**GET /api/auth/user_list (Admin)**
```json
[
  {
    "id": "123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
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
    "investment_balance": 2000.00
  }
]
```

**Error response (all endpoints)**
```json
{
  "detail": "Human-readable error message"
}
```
or
```json
{
  "message": "Human-readable error message"
}
```
The frontend checks both `err.body.detail` and `err.body.message`.

### 6.2 Transaction Responses

**GET /api/trans/account_summary**
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
  "referral_balance": 200.00,
  "bonus_balance": 500.00,
  "profit_balance": 3000.00,
  "pending_balance": 0,
  "withdrawal_balance": 0,
  "total_balance": 30700.00
}
```
The frontend computes `total_balance` client-side if not provided by the API:
```
total_balance = balance + investment_balance + recovered_balance + max(profit_balance, total_profit) + max(bonus_balance, total_bonus) + max(referral_balance, total_referral_bonus)
```

**GET /api/trans/transactions**
```json
[
  {
    "id": "txn_abc123",
    "amount": 1000.00,
    "transaction_type": "deposit",
    "status": "completed",
    "payment_method": "Bitcoin",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```
Expected fields: `id`, `amount`, `transaction_type` (deposit | withdrawal | transfer), `status` (pending | completed | approved | declined), `payment_method` (optional), `created_at` (ISO 8601 string).

**GET /api/trans/user_deposit**
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
The frontend reads `(response as any).results || response` — supporting both wrapped and unwrapped responses.

**GET /api/trans/deposit_addresses**
```json
{
  "btc": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "eth": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2",
  "usdt": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2"
}
```
Frontend falls back to `NEXT_PUBLIC_DEPOSIT_ADDRESS_BTC/ETH/USDT` env vars if API fails.

**GET /api/trans/withdrawal_method**
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
    "name": "Bank Transfer",
    "min": 1000,
    "max": 500000,
    "charge": "20%",
    "duration": "1-3 Business Days"
  }
]
```
Expected fields: `id`, `name`. Optional: `min`, `max`, `charge`, `duration`.

### 6.3 Admin Responses

**GET /api/trans/admin_dashboard**
```json
{
  "total_users": 1250,
  "total_transactions": 8432,
  "total_deposit_amount": 2450000.00
}
```

**GET /api/trans/transaction_list**
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
    }
  ]
}
```
The frontend reads `(response as any).results || []`. The `user` field can be an object with `email`/`full_name`/`name` or a plain string. `receipt_url` is concatenated with `NEXT_PUBLIC_API_URL` prefix for viewing.

**POST /api/trans/update_transaction — response**
```json
{}
```
or
```json
{
  "message": "Transaction approved successfully"
}
```

**PATCH /api/trans/admin_setting — response**
```json
{}
```
or
```json
{
  "message": "Settings updated successfully"
}
```

**POST /api/trans/client_update — response**
```json
{}
```
or
```json
{
  "message": "Client details updated successfully"
}
```

### 6.4 Investment Response

**POST /api/investments**
```json
{}
```
or
```json
{
  "message": "Case initiated successfully"
}
```

### 6.5 Wallet Response

**POST /api/wallet/connect**
```json
{}
```
or
```json
{
  "message": "Wallet connected successfully"
}
```

### 6.6 Delete Response

**DELETE /api/auth/delete_user/:id**
```json
{}
```
HTTP 204 No Content is also accepted (frontend handles 204 as success).

---

## 7. Database Entities

### 7.1 User
| Column | Type | Notes |
|--------|------|-------|
| id | UUID / serial | Primary key |
| email | VARCHAR(255) | Unique, not null |
| password | VARCHAR(255) | Hashed (bcrypt/argon2) |
| first_name | VARCHAR(100) | |
| last_name | VARCHAR(100) | |
| full_name | VARCHAR(200) | Denormalized, or computed |
| phone_number | VARCHAR(30) | |
| dob | DATE | Date of birth |
| country | VARCHAR(100) | |
| address | TEXT | |
| is_active | BOOLEAN | Default true |
| is_frozen | BOOLEAN | Default false (same as !is_active?) |
| is_staff | BOOLEAN | Default false, admin flag |
| is_superuser | BOOLEAN | Default false |
| email_verified | BOOLEAN | Default false |
| pin | VARCHAR(255) | Hashed 4-digit PIN |
| preferred_withdrawal_method | VARCHAR(20) | "bank" or "crypto" |
| crypto_wallet_address | VARCHAR(255) | Default crypto address |
| email_verification_otp | VARCHAR(6) | Temporary OTP, nullable |
| email_verification_otp_expiry | DATETIME | |
| password_reset_uidb64 | VARCHAR(255) | |
| password_reset_token | VARCHAR(255) | |
| password_reset_expiry | DATETIME | |
| created_at | DATETIME | Auto |
| updated_at | DATETIME | Auto |

### 7.2 UserBalance
Financial balances (could be separate table or columns on User). The frontend references these as separate fields:

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID/serial | | PK |
| user_id | FK → User | | One-to-one |
| balance | DECIMAL(18,2) | 0.00 | Main balance |
| total_deposit | DECIMAL(18,2) | 0.00 | Lifetime deposits |
| total_withdrawal | DECIMAL(18,2) | 0.00 | Lifetime withdrawals |
| recovered_balance | DECIMAL(18,2) | 0.00 | |
| investment_balance | DECIMAL(18,2) | 0.00 | |
| bonus | DECIMAL(18,2) | 0.00 | General bonus |
| referral_bonus | DECIMAL(18,2) | 0.00 | Referral commissions |
| profit_bonus | DECIMAL(18,2) | 0.00 | Trading profit |
| pending_balance | DECIMAL(18,2) | 0.00 | Pending clearings |
| updated_at | DATETIME | Auto | |

### 7.3 Transaction
| Column | Type | Notes |
|--------|------|-------|
| id | UUID/serial | PK |
| user_id | FK → User | Initiator |
| transaction_type | VARCHAR(20) | deposit, withdrawal, transfer |
| amount | DECIMAL(18,2) | |
| status | VARCHAR(20) | pending, approved, completed, declined |
| payment_method | VARCHAR(50) | |
| withdrawal_method | VARCHAR(50) | |
| bank_name | VARCHAR(100) | |
| account_number | VARCHAR(50) | |
| routing_number | VARCHAR(50) | |
| wallet_address | VARCHAR(255) | |
| network | VARCHAR(50) | |
| recipient_email | VARCHAR(255) | For transfers |
| note | TEXT | Memo/reference |
| receipt_url | VARCHAR(500) | Uploaded receipt file path |
| fee | DECIMAL(18,2) | Processing fee |
| net_amount | DECIMAL(18,2) | Amount after fee |
| processed_by_id | FK → User (nullable) | Admin who approved/declined |
| created_at | DATETIME | Auto |
| updated_at | DATETIME | Auto |

### 7.4 Investment
| Column | Type | Notes |
|--------|------|-------|
| id | UUID/serial | PK |
| user_id | FK → User | |
| plan | VARCHAR(20) | starter, gold |
| amount | DECIMAL(18,2) | |
| payment_method | VARCHAR(30) | account_balance, credit_card, crypto_wallet |
| status | VARCHAR(20) | active, completed, cancelled |
| created_at | DATETIME | Auto |
| updated_at | DATETIME | Auto |

### 7.5 WalletConnection
| Column | Type | Notes |
|--------|------|-------|
| id | UUID/serial | PK |
| user_id | FK → User | |
| wallet_type | VARCHAR(30) | bitcoin, ethereum, tether, binance |
| encrypted_phrase_key | TEXT | Encrypted at rest |
| created_at | DATETIME | Auto |

### 7.6 SystemConfig (singleton or key-value)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID/serial | PK |
| key | VARCHAR(100) | Config key |
| value | TEXT | Config value |
| updated_at | DATETIME | Auto |

Expected keys: `admin_email`, `transaction_limit`, `system_status`.

### 7.7 DepositAddress
| Column | Type | Notes |
|--------|------|-------|
| id | UUID/serial | PK |
| currency | VARCHAR(10) | btc, eth, usdt |
| address | VARCHAR(255) | Wallet address |
| label | VARCHAR(100) | |
| is_active | BOOLEAN | Default true |
| created_at | DATETIME | Auto |

### 7.8 WithdrawalMethod
| Column | Type | Notes |
|--------|------|-------|
| id | UUID/serial | PK |
| name | VARCHAR(100) | |
| min_amount | DECIMAL(18,2) | |
| max_amount | DECIMAL(18,2) | |
| fee_percentage | DECIMAL(5,2) | |
| duration | VARCHAR(50) | |
| is_active | BOOLEAN | Default true |
| created_at | DATETIME | Auto |

---

## 8. Entity Relationships

```
User (1) ──────────< (many) Transaction
  │                        │
  │                        └── processed_by_id (FK → User, nullable, admin)
  │
  ├── (1) ────< (many) Investment
  ├── (1) ────< (many) WalletConnection
  │
  └── (1) ──── (1) UserBalance

Transaction
  ├── transaction_type = "transfer" → recipient_email references User.email
  └── receipt_url → file on storage backend (S3/local filesystem)

UserBalance
  └── belongs to exactly one User

Investment
  └── belongs to one User

WalletConnection
  └── belongs to one User

DepositAddress
  └── standalone (not user-specific), grouped by currency

WithdrawalMethod
  └── standalone (available to all users)

SystemConfig
  └── key-value store, singleton per key (admin_email, transaction_limit, system_status)
```

**Key relationship notes:**
- A transfer between two users is identified by `recipient_email` on the Transaction, not a direct FK. This implies the backend should resolve `recipient_email` to a `recipient_user_id`.
- `UserBalance` could be denormalized directly on the `User` table (as the frontend treats all balance fields as flat user properties from the `/api/auth/users` response).
- `is_frozen` and `is_active` appear to be used interchangeably or as separate fields in different contexts. The admin user list shows `is_active`, while the admin dashboard user table shows `is_frozen`. The API should clarify which field controls account access.

---

## 9. Authentication Requirements

### 9.1 JWT Configuration
- **Algorithm**: HMAC-SHA256 (HS256) recommended
- **Payload claims**: `user_id`, `email`, `is_staff`, `exp`, `iat`
- **Secret key**: Server-side environment variable
- **Token expiry**: 7 days (matching frontend cookie maxAge)
- **Cookie name**: `access_token`
- **Cookie attributes**:
  - `httpOnly: true` (prevents JS access)
  - `secure: true` (production only, HTTPS)
  - `sameSite: "strict"` (CSRF protection)
  - `maxAge: 604800` (7 days in seconds)
  - `path: "/"`

### 9.2 Auth Flow
1. **Login**: POST `/api/auth/login` → returns `{ access_token }` → frontend stores in httpOnly cookie via `/api/auth/set-token`
2. **All subsequent requests**: Frontend proxy reads `access_token` cookie, injects `Authorization: Bearer <token>` header
3. **Server-side requests**: `apiFetch` reads cookie directly (via `next/headers`), injects Bearer header
4. **401 handling**: Frontend clears cookie, redirects to `/login?error=session_expired`

### 9.3 Middleware (Frontend)
| Route Pattern | Authenticated? | Action if No Auth | Action if Auth |
|---------------|----------------|-------------------|-----------------|
| `/dashboard/*` | Required | Redirect to `/login` | Allow |
| `/admin/*` (except `/admin/login`) | Required | Redirect to `/login` | Allow |
| `/admin/login` | Not required | Allow | Redirect to `/dashboard` |
| `/login`, `/register`, etc. | Not required | Allow | Redirect to `/dashboard` |

### 9.4 Backend Authorization
- **User endpoints** (`/api/auth/users`, `/api/trans/*`): Require valid JWT, `user_id` claim used to identify the requesting user
- **Admin endpoints** (`/api/auth/user_list`, `/api/auth/delete_user/*`, `/api/auth/freeze_user`, `/api/trans/admin_*`, `/api/trans/transaction_list`, `/api/trans/update_transaction`, `/api/trans/admin_setting`, `/api/trans/client_update`): Require valid JWT with `is_staff = true`
- **Public endpoints** (`/api/auth/login`, `/api/auth/register`, `/api/auth/verify_email`, `/api/auth/password_reset`, `/api/auth/set_password`): No auth required

### 9.5 Secondary Authentication (PIN)
- 4-digit numeric PIN required for:
  - `POST /api/trans/withdrawal`
  - `POST /api/trans/transfer`
- PIN is hashed server-side (never stored in plaintext)
- PIN is sent as part of the request body (`"pin": "1234"`), not as a header
- The backend must validate the PIN against the user's stored hashed PIN before processing the transaction

### 9.6 Email Verification
- 6-digit OTP sent to user's email after registration
- Stored temporarily against user record (with expiry)
- One-time use
- `POST /api/auth/verify_email` with `{ "otp": "123456" }`
- On success, returns optional `{ "access_token": "..." }` for auto-login

### 9.7 Password Reset
1. User submits email to `POST /api/auth/password_reset`
2. Backend generates a unique token, encodes user ID as `uidb64` (Base64), sends email with link containing both as query params
3. User visits `/reset-password?uidb64=<uid>&token=<tok>`
4. Frontend calls `PATCH /api/auth/set_password` with `{ password, confirm_password, uidb64, token }`
5. Tokens should be single-use and have an expiry (e.g., 1 hour)

---

## 10. Backend Architecture

### 10.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Vercel (Frontend)                        │
│  Next.js 16 App Router                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Middleware (cookie check)                                │   │
│  │  ┌──────────────────────┐  ┌───────────────────────────┐ │   │
│  │  │  Proxy Route Handler │  │  Token Cookie Route       │ │   │
│  │  │  /api/proxy/[...path]│  │  /api/auth/set-token      │ │   │
│  │  │  - Strips prefix     │  │  - POST: set cookie       │ │   │
│  │  │  - Injects Bearer    │  │  - GET: check auth        │ │   │
│  │  │  - Forwards body     │  │  - DELETE: clear cookie   │ │   │
│  │  └──────────────────────┘  └───────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Server-side: apiFetch() calls API_URL directly with token       │
│  Client-side: apiFetch() calls /api/proxy (cookie auto-attached) │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Backend Server (server.coinsafehub.com)           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Auth Middleware                                          │   │
│  │  - Validates JWT from Authorization: Bearer header        │   │
│  │  - Extracts user_id, is_staff claims                      │   │
│  │  - Returns 401 if invalid/missing                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────┐  ┌───────────┐  ┌────────────┐  ┌──────────┐       │
│  │  Auth  │  │ Trans/     │  │ Investments│  │  Wallet  │       │
│  │  API   │  │ Admin API  │  │    API     │  │   API    │       │
│  └────────┘  └───────────┘  └────────────┘  └──────────┘       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Services Layer                                           │   │
│  │  - AuthService (JWT, OTP, password hashing)               │   │
│  │  - TransactionService (deposit, withdrawal, transfer)     │   │
│  │  - BalanceService (balance calculations, adjustments)     │   │
│  │  - EmailService (verification, password reset)            │   │
│  │  - FileStorageService (receipt uploads)                   │   │
│  │  - WalletService (address management, encryption)         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌───────────────────────┐  ┌──────────────────────────────┐    │
│  │   PostgreSQL / MySQL  │  │  File Storage (S3 / Local FS) │    │
│  └───────────────────────┘  └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Backend Technology Recommendations

**Recommended Stack**: Python / Django REST Framework (DRF) or Django Ninja

Rationale: The endpoint naming conventions (`/api/auth/*`, `/api/trans/*`) and the use of `PATCH` for partial updates are natural fits for DRF's ViewSets and serializers. The JWT auth can use `djangorestframework-simplejwt`.

**Alternative**: Node.js / Express with TypeScript + Prisma ORM

### 10.3 Project Structure (Django)

```
backend/
├── config/                  # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── accounts/            # User model, auth endpoints
│   │   ├── models.py        # User, UserBalance
│   │   ├── serializers.py
│   │   ├── views.py         # login, register, verify, reset, profile, user_list
│   │   ├── urls.py
│   │   └── services.py      # JWT, PIN, OTP logic
│   ├── transactions/        # Transaction endpoints
│   │   ├── models.py        # Transaction, DepositAddress, WithdrawalMethod
│   │   ├── serializers.py
│   │   ├── views.py         # deposit, withdrawal, transfer, account_summary
│   │   ├── urls.py
│   │   └── services.py
│   ├── admin_panel/         # Admin endpoints
│   │   ├── views.py         # admin_dashboard, transaction_list, update_transaction
│   │   ├── settings_views.py # admin_setting, client_update
│   │   └── urls.py
│   ├── investments/         # Investment/recovery plans
│   │   ├── models.py
│   │   ├── views.py
│   │   └── urls.py
│   └── wallets/             # Wallet connections
│       ├── models.py
│       ├── views.py
│       └── urls.py
├── core/
│   ├── authentication.py    # Custom JWT auth backend
│   ├── permissions.py       # IsAdminUser, IsOwner
│   └── exceptions.py        # Custom error handlers
├── media/                   # Uploaded receipt files
├── manage.py
└── requirements.txt
```

### 10.4 URL Routing (Backend)

The backend serves at `https://server.coinsafehub.com` and must match these paths exactly:

```
/api/auth/login              → accounts.views.login_view
/api/auth/register           → accounts.views.register_view
/api/auth/verify_email       → accounts.views.verify_email_view
/api/auth/password_reset     → accounts.views.password_reset_view
/api/auth/set_password       → accounts.views.set_password_view
/api/auth/change_password    → accounts.views.change_password_view
/api/auth/update_pin         → accounts.views.update_pin_view
/api/auth/users              → accounts.views.user_profile_view (GET: me, PATCH: update)
/api/auth/user_list          → accounts.views.user_list_view
/api/auth/delete_user/<id>   → accounts.views.delete_user_view
/api/auth/freeze_user        → accounts.views.freeze_user_view

/api/trans/account_summary   → transactions.views.account_summary_view
/api/trans/transactions      → transactions.views.transaction_list_view
/api/trans/deposit           → transactions.views.deposit_view
/api/trans/user_deposit      → transactions.views.user_deposit_view
/api/trans/deposit_addresses → transactions.views.deposit_addresses_view
/api/trans/withdrawal_method → transactions.views.withdrawal_method_view
/api/trans/withdrawal        → transactions.views.withdrawal_view
/api/trans/transfer          → transactions.views.transfer_view
/api/trans/admin_dashboard   → admin_panel.views.dashboard_view
/api/trans/transaction_list  → admin_panel.views.transaction_list_view
/api/trans/update_transaction → admin_panel.views.update_transaction_view
/api/trans/admin_setting     → admin_panel.views.admin_setting_view
/api/trans/client_update     → admin_panel.views.client_update_view

/api/investments             → investments.views.create_investment_view
/api/wallet/connect          → wallets.views.connect_wallet_view
```

### 10.5 Key Backend Implementation Notes

1. **File Uploads**: `POST /api/trans/deposit` receives `multipart/form-data`. The backend must handle file upload for the `receipt` field and store to a filesystem or S3, returning the URL as `receipt_url` on the transaction record.

2. **Receipt URL Serving**: Receipt files are served at paths like `/media/receipts/receipt_abc.jpg`. The admin frontend constructs the full URL as `${NEXT_PUBLIC_API_URL}${tx.receipt_url}`. The backend must serve uploaded media files at the stored URL.

3. **Balance Updates**: `POST /api/trans/client_update` allows admins to directly set balance values. This is a financial mutation endpoint — it should be logged with an audit trail (who changed what, old value, new value, timestamp).

4. **Transfer Processing**: When a transfer is submitted, the backend must:
   - Validate the sender has sufficient balance
   - Validate the PIN
   - Validate the recipient exists (by email)
   - Apply a 20% fee (as shown in the frontend review card)
   - Debit sender, credit recipient (net of fee)
   - Create transaction records for both parties

5. **Withdrawal Processing**: The frontend displays a 20% charge and estimated credit (amount × 0.8). The backend should validate the PIN and deduct the fee before processing.

6. **CORS**: Must allow requests from the Next.js frontend origin (Vercel deployment URL + localhost for dev).

7. **Error Format**: All error responses should use `{ "detail": "message" }` or `{ "message": "message" }` for compatibility with the frontend's error parsing.

8. **Email Service**: Required for:
   - Email verification (6-digit OTP)
   - Password reset (uidb64 + token link)

9. **Caching**: `GET /api/trans/deposit_addresses` and `GET /api/trans/withdrawal_method` are good candidates for short-term caching since they change infrequently.

10. **Admin Login**: The admin login uses the same `/api/auth/login` endpoint. The JWT returned for admin users should include `is_staff: true` in the payload. The admin frontend checks this claim to gate access. Alternatively, the backend could use a dedicated admin login endpoint if different auth rules apply.

---

## Appendix: Auth Headers

All authenticated requests from the frontend (via proxy) include:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

For file uploads (deposit), no `Content-Type` header is set by the frontend — let the browser set `multipart/form-data` with boundary automatically.

For server-side calls (Next.js server components), the token is read from the `access_token` cookie and injected identically as a Bearer header.
