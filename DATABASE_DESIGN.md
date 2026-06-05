# CoinSafeHub — Production PostgreSQL Database Design

> **Target**: PostgreSQL 16+
> **ORM Recommendation**: Drizzle ORM (TypeScript) or SQLAlchemy (Python/Django)
> **Migrations**: Managed via ORM migration tooling (Drizzle Kit, Alembic, or Django migrations)

---

## 1. Entity Relationship Diagram (ERD)

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                      CORE ENTITIES                                        │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│        users         │       │   user_balances      │       │    refresh_tokens    │
├──────────────────────┤       ├──────────────────────┤       ├──────────────────────┤
│ id             PK ◄──┼───1:1─┤ user_id       PK,FK  │       │ id             PK    │
│ email          UQ    │       │ balance              │       │ user_id        FK ◄──┼──┐
│ password_hash        │       │ total_deposit        │       │ token_hash           │  │
│ first_name           │       │ total_withdrawal     │       │ device_info          │  │
│ last_name            │       │ recovered_balance    │       │ ip_address           │  │
│ phone                │       │ investment_balance   │       │ location             │  │
│ dob                  │       │ bonus                │       │ last_used_at         │  │
│ country              │       │ referral_bonus       │       │ expires_at           │  │
│ address              │       │ profit_bonus         │       │ revoked_at           │  │
│ is_active            │       │ pending_balance      │       │ created_at           │  │
│ is_staff             │       │ updated_at           │       └──────────────────────┘  │
│ is_superuser         │       └──────────────────────┘                                  │
│ email_verified       │                                                                  │
│ email_verify_otp     │       ┌──────────────────────┐                                  │
│ email_verify_otp_exp │       │   login_attempts     │                                  │
│ pin_hash             │       ├──────────────────────┤                                  │
│ pref_withdrawal_meth │       │ id             PK    │                                  │
│ crypto_wallet_addr   │       │ email                │                                  │
│ reset_uidb64         │       │ ip_address           │                                  │
│ reset_token          │       │ attempted_at         │                                  │
│ reset_token_expiry   │       │ success              │                                  │
│ created_at           │       │ failure_reason       │                                  │
│ updated_at           │       │ user_agent           │                                  │
└──────┬───────────────┘       └──────────────────────┘                                  │
       │                                                                                   │
       │  ┌───────────────────────────────────────────────────────────────────────────────┘
       │  │
       │  │  ┌──────────────────────┐       ┌──────────────────────┐
       │  ├──┤    transactions      │       │   idempotency_keys   │
       │  │  ├──────────────────────┤       ├──────────────────────┤
       │  │  │ id             PK    │       │ id             PK    │
       │  │  │ user_id        FK ◄──┤       │ key            UQ    │
       │  │  │ transaction_type     │       │ response_body        │
       │  │  │ amount               │       │ response_status      │
       │  │  │ status               │       │ created_at           │
       ├──┤  │ payment_method       │       └──────────────────────┘
       │  │  │ withdrawal_method    │
       │  │  │ bank_name            │       ┌──────────────────────┐
       │  │  │ account_number       │       │   token_blacklists   │
       │  │  │ routing_number       │       ├──────────────────────┤
       │  │  │ wallet_address       │       │ id             PK    │
       │  │  │ network              │       │ jti            UQ    │
       │  │  │ recipient_email      │       │ expires_at           │
       │  │  │ recipient_user_id FK─┼──┐    │ created_at           │
       │  │  │ note                  │  │    └──────────────────────┘
       │  │  │ receipt_url           │  │
       │  │  │ fee                   │  │
       │  │  │ net_amount            │  │
       │  │  │ processed_by_id  FK ◄─┼──┤ (admin FK → users)
       │  │  │ idempotency_key       │  │
       │  │  │ created_at            │  │
       │  │  │ updated_at            │  │
       │  │  └───────────────────────┘  │
       │  │                             │
       │  │  ┌──────────────────────┐   │
       │  ├──┤    investments       │   │
       │  │  ├──────────────────────┤   │
       │  │  │ id             PK    │   │
       │  │  │ user_id        FK ◄──┤   │
       │  │  │ plan_id        FK    │   │
       │  │  │ amount               │   │
       │  │  │ payment_method       │   │
       │  │  │ status               │   │
       │  │  │ created_at           │   │
       │  │  │ updated_at           │   │
       │  │  └──────────────────────┘   │
       │  │                             │
       │  │  ┌──────────────────────┐   │
       │  ├──┤  wallet_connections  │   │
       │  │  ├──────────────────────┤   │
       │  │  │ id             PK    │   │
       │  │  │ user_id        FK ◄──┤   │
       │  │  │ wallet_type          │   │
       │  │  │ encrypted_phrase_key │   │
       │  │  │ is_active            │   │
       │  │  │ created_at           │   │
       │  │  └──────────────────────┘   │
       │  │                             │
       │  │  ┌──────────────────────┐   │
       │  ├──┤   audit_logs         │   │
       │  │  ├──────────────────────┤   │
       │  │  │ id             PK    │   │
       │  │  │ actor_id       FK ◄──┤   │
       │  │  │ target_user_id FK ◄──┼───┘
       │  │  │ action               │
       │  │  │ entity_type          │
       │  │  │ entity_id            │
       │  │  │ old_values   (JSONB) │
       │  │  │ new_values   (JSONB) │
       │  │  │ ip_address           │
       │  │  │ user_agent           │
       │  │  │ created_at           │
       │  │  └──────────────────────┘
       │  │
       │  │  ┌──────────────────────┐       ┌──────────────────────┐
       │  ├──┤  kyc_verifications   │       │   kyc_documents      │
       │  │  ├──────────────────────┤       ├──────────────────────┤
       │  │  │ id             PK    │       │ id             PK    │
       │  │  │ user_id   UQ,FK ◄───┼──1:N──┤ verification_id FK   │
       │  │  │ status               │       │ document_type        │
       │  │  │ verified_by_id  FK ◄─┼──┐    │ document_url         │
       │  │  │ verification_notes   │  │    │ uploaded_at          │
       │  │  │ submitted_at         │  │    └──────────────────────┘
       │  │  │ verified_at          │  │
       │  │  │ reviewed_at          │  │
       │  │  └──────────────────────┘  │
       │  │                             │
       │  │  ┌──────────────────────┐   │
       │  ├──┤   referral_codes     │   │
       │  │  ├──────────────────────┤   │
       │  │  │ id             PK    │   │
       │  │  │ user_id   UQ,FK ◄───┤   │
       │  │  │ code           UQ    │   │
       │  │  │ click_count          │   │
       │  │  │ signup_count         │   │
       │  │  │ created_at           │   │
       │  │  └──────────────────────┘   │
       │  │                             │
       │  │  ┌──────────────────────┐   │
       │  ├──┤     referrals        │   │
       │  │  ├──────────────────────┤   │
       │  │  │ id             PK    │   │
       │  │  │ referrer_id    FK ◄──┤   │
       │  │  │ referred_user_id FK◄─┤   │
       │  │  │ status               │   │
       │  │  │ bonus_amount         │   │
       │  │  │ bonus_paid_at        │   │
       │  │  │ created_at           │   │
       │  │  └──────────────────────┘   │
       │  │                             │
       │  │  ┌──────────────────────┐   │
       │  ├──┤  support_tickets     │   │
       │  │  ├──────────────────────┤   │
       │  │  │ id             PK    │   │
       │  │  │ user_id        FK ◄──┤   │
       │  │  │ subject              │   │
       │  │  │ status               │   │
       │  │  │ priority             │   │
       │  │  │ assigned_to_id  FK ◄─┼───┘ (admin FK → users)
       │  │  │ created_at           │
       │  │  │ updated_at           │
       │  │  └──────────┬───────────┘
       │  │             │
       │  │             │  ┌──────────────────────┐
       │  │             └──┤ support_ticket_msgs  │
       │  │                ├──────────────────────┤
       │  │                │ id             PK    │
       │  │                │ ticket_id      FK    │
       │  │                │ sender_id      FK ◄──┤ (user or admin)
       │  │                │ message              │
       │  │                │ attachment_url       │
       │  │                │ created_at           │
       │  │                └──────────────────────┘
       │  │
       │  │  ┌──────────────────────┐       ┌──────────────────────┐
       │  ├──┤   notifications      │       │notification_prefs    │
       │  │  ├──────────────────────┤       ├──────────────────────┤
       │  │  │ id             PK    │       │ id             PK    │
       │  │  │ user_id        FK ◄──┤       │ user_id   UQ,FK ◄───┤
       │  │  │ type                 │       │ security_alerts      │
       │  │  │ title                │       │ transaction_alerts   │
       │  │  │ body                 │       │ marketing_emails     │
       │  │  │ is_read              │       │ created_at           │
       │  │  │ link                 │       │ updated_at           │
       │  │  │ created_at           │       └──────────────────────┘
       │  │  └──────────────────────┘
       │  │
       │  │  ┌──────────────────────┐       ┌──────────────────────┐
       │  └──┤    user_roles        │       │   role_permissions   │
       │     ├──────────────────────┤       ├──────────────────────┤
       │     │ id             PK    │       │ id             PK    │
       │     │ user_id        FK ◄──┤       │ role_id        FK    │
       │     │ role_id        FK    │       │ permission_id  FK    │
       │     │ created_at           │       └──────────┬───────────┘
       │     └──────────┬───────────┘                  │
       │                │                              │
       │                │     ┌──────────────────────┐ │   ┌──────────────────────┐
       │                └─────┤       roles          │ │   │     permissions      │
       │                      ├──────────────────────┤ │   ├──────────────────────┤
       │                      │ id             PK ◄──┼─┘   │ id             PK ◄──┤
       │                      │ name           UQ    │     │ codename       UQ    │
       │                      │ description           │     │ name                 │
       │                      │ is_system             │     │ description          │
       │                      │ created_at            │     └──────────────────────┘
       │                      └──────────────────────┘
       │
       │   ┌──────────────────────────────────────────────────────┐
       └───┤             REFERENCE / CONFIG TABLES                │
           ├──────────────────────────────────────────────────────┤
           │                                                      │
           │  ┌──────────────────┐  ┌──────────────────┐         │
           │  │ investment_plans │  │ deposit_addresses│         │
           │  ├──────────────────┤  ├──────────────────┤         │
           │  │ id         PK    │  │ id         PK    │         │
           │  │ name             │  │ currency          │         │
           │  │ slug       UQ    │  │ address           │         │
           │  │ min_amount       │  │ label             │         │
           │  │ max_amount       │  │ is_active         │         │
           │  │ profit_rate      │  │ created_at        │         │
           │  │ duration_days    │  └──────────────────┘         │
           │  │ is_active        │                               │
           │  │ created_at       │  ┌──────────────────┐         │
           │  └──────────────────┘  │withdrawal_methods│         │
           │                        ├──────────────────┤         │
           │  ┌──────────────────┐  │ id         PK    │         │
           │  │  system_configs  │  │ name             │         │
           │  ├──────────────────┤  │ min_amount       │         │
           │  │ id         PK    │  │ max_amount       │         │
           │  │ key        UQ    │  │ fee_percentage   │         │
           │  │ value            │  │ duration         │         │
           │  │ updated_at       │  │ is_active        │         │
           │  └──────────────────┘  │ created_at       │         │
           │                        └──────────────────┘         │
           │  ┌──────────────────┐                               │
           │  │  email_templates │                               │
           │  ├──────────────────┤                               │
           │  │ id         PK    │                               │
           │  │ name       UQ    │                               │
           │  │ subject          │                               │
           │  │ body_html        │                               │
           │  │ body_text        │                               │
           │  │ variables(JSONB) │                               │
           │  │ updated_at       │                               │
           │  └──────────────────┘                               │
           └──────────────────────────────────────────────────────┘
```

---

## 2. Table Definitions

### 2.1 users

Core user identity and authentication. Balance data is stored in a separate `user_balances` table for financial integrity and row-locking granularity.

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(30),
    dob             DATE,
    country         VARCHAR(100),
    address         TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_staff        BOOLEAN NOT NULL DEFAULT FALSE,
    is_superuser    BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    email_verify_otp         VARCHAR(6),
    email_verify_otp_expiry  TIMESTAMPTZ,
    pin_hash        VARCHAR(255),
    preferred_withdrawal_method VARCHAR(20) CHECK (preferred_withdrawal_method IN ('bank', 'crypto')),
    crypto_wallet_address     VARCHAR(255),
    reset_uidb64             VARCHAR(255),
    reset_token              VARCHAR(255),
    reset_token_expiry       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_email UNIQUE (email)
);

-- Lookup indexes
CREATE INDEX idx_users_is_active   ON users (is_active)   WHERE is_active = TRUE;
CREATE INDEX idx_users_is_staff    ON users (is_staff)    WHERE is_staff = TRUE;
CREATE INDEX idx_users_email_verified ON users (email_verified);
CREATE INDEX idx_users_country     ON users (country);
CREATE INDEX idx_users_created_at  ON users (created_at);
```

**Relationships**:
- **1:1** with `user_balances` — each user has exactly one balance record
- **1:N** with `transactions` — one user can have many transactions
- **1:N** with `investments` — one user can enroll in multiple recovery plans
- **1:N** with `wallet_connections` — one user can connect multiple wallets
- **1:N** with `refresh_tokens` — one user can have multiple active sessions
- **1:N** with `audit_logs` (as actor) — user performs actions that are logged
- **1:N** with `audit_logs` (as target) — user is the subject of admin actions
- **1:N** with `login_attempts` — tracks login attempts per user
- **1:N** with `kyc_verifications` — one user has one KYC submission
- **1:N** with `referral_codes` (1:1 in practice) — each user has a referral code
- **1:N** with `referrals` (as referrer) — user can refer many others
- **1:N** with `referrals` (as referred) — user is referred by exactly one person
- **1:N** with `support_tickets` — user can create multiple tickets
- **1:N** with `support_ticket_messages` — user can send multiple messages
- **1:N** with `notifications` — user can receive many notifications
- **1:N** with `notification_preferences` (1:1 in practice)
- **1:N** with `user_roles` — user can have multiple roles

---

### 2.2 user_balances

Separated from `users` for financial integrity. Allows row-level locking on balance updates without blocking user profile reads.

```sql
CREATE TABLE user_balances (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    balance             DECIMAL(18,2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    total_deposit       DECIMAL(18,2) NOT NULL DEFAULT 0.00 CHECK (total_deposit >= 0),
    total_withdrawal    DECIMAL(18,2) NOT NULL DEFAULT 0.00 CHECK (total_withdrawal >= 0),
    recovered_balance   DECIMAL(18,2) NOT NULL DEFAULT 0.00 CHECK (recovered_balance >= 0),
    investment_balance  DECIMAL(18,2) NOT NULL DEFAULT 0.00 CHECK (investment_balance >= 0),
    bonus               DECIMAL(18,2) NOT NULL DEFAULT 0.00 CHECK (bonus >= 0),
    referral_bonus      DECIMAL(18,2) NOT NULL DEFAULT 0.00 CHECK (referral_bonus >= 0),
    profit_bonus        DECIMAL(18,2) NOT NULL DEFAULT 0.00 CHECK (profit_bonus >= 0),
    pending_balance     DECIMAL(18,2) NOT NULL DEFAULT 0.00 CHECK (pending_balance >= 0),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_balances_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_balances_user UNIQUE (user_id)
);

CREATE INDEX idx_balances_user ON user_balances (user_id);
```

**Why separate table**:
- `SELECT ... FOR UPDATE` on the balance row locks only this row, not the entire user record
- Clean separation of identity (users) from financial state (user_balances)
- Easier to add audit triggers on balance changes
- Prevents accidental modification of balance fields during user profile updates
- Allows future sharding of balance data independently from user identity

**Relationship**: **1:1** with `users` via `user_id` (UNIQUE constraint). Every user has exactly one balance record. Created automatically via trigger on user insert.

```sql
CREATE OR REPLACE FUNCTION create_user_balance()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_balances (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_user_balance
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_user_balance();
```

---

### 2.3 transactions

Central financial transaction ledger. Records deposits, withdrawals, and peer-to-peer transfers.

```sql
CREATE TABLE transactions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL,
    transaction_type  VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer')),
    amount            DECIMAL(18,2) NOT NULL CHECK (amount > 0),
    status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'approved', 'completed', 'declined', 'cancelled')),
    payment_method    VARCHAR(50),
    withdrawal_method VARCHAR(50),
    bank_name         VARCHAR(100),
    account_number    VARCHAR(50),
    routing_number    VARCHAR(50),
    wallet_address    VARCHAR(255),
    network           VARCHAR(50),
    recipient_email   VARCHAR(255),
    recipient_user_id UUID,
    note              TEXT,
    receipt_url       VARCHAR(500),
    fee               DECIMAL(18,2) NOT NULL DEFAULT 0.00 CHECK (fee >= 0),
    net_amount        DECIMAL(18,2) GENERATED ALWAYS AS (amount - fee) STORED,
    processed_by_id   UUID,
    idempotency_key   VARCHAR(64),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_txn_user           FOREIGN KEY (user_id)           REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_txn_recipient_user FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_txn_processed_by   FOREIGN KEY (processed_by_id)   REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_txn_idempotency    UNIQUE (idempotency_key)
);

-- Critical performance indexes
CREATE INDEX idx_txn_user_id        ON transactions (user_id);
CREATE INDEX idx_txn_status         ON transactions (status)         WHERE status = 'pending';
CREATE INDEX idx_txn_type           ON transactions (transaction_type);
CREATE INDEX idx_txn_created_at     ON transactions (created_at DESC);
CREATE INDEX idx_txn_user_status    ON transactions (user_id, status);
CREATE INDEX idx_txn_recipient      ON transactions (recipient_user_id);
CREATE INDEX idx_txn_processed_by   ON transactions (processed_by_id);
CREATE INDEX idx_txn_recipient_email ON transactions (recipient_email);

-- Partial index for pending transactions (frequently queried by admins)
CREATE INDEX idx_txn_pending_admin   ON transactions (created_at DESC) WHERE status = 'pending';
```

**Why `ON DELETE RESTRICT` on user_id**: Prevents accidental deletion of users with transaction history. Users must be anonymized or soft-deleted, never hard-deleted if they have transactions.

**Why GENERATED ALWAYS AS STORED for net_amount**: Ensures consistency — net amount is always derived from amount minus fee. Cannot be set independently.

**Relationships**:
- **N:1** with `users` (`user_id`) — the user who initiated the transaction
- **N:1** with `users` (`recipient_user_id`) — for transfers, the receiving user (nullable)
- **N:1** with `users` (`processed_by_id`) — the admin who approved/declined (nullable)
- **1:1** with `idempotency_keys` — via `idempotency_key` UNIQUE, prevents duplicate transactions

---

### 2.4 investments

User enrollments in recovery/investment plans.

```sql
CREATE TABLE investments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    plan_id         UUID NOT NULL,
    amount          DECIMAL(18,2) NOT NULL CHECK (amount > 0),
    payment_method  VARCHAR(30) NOT NULL CHECK (payment_method IN ('account_balance', 'credit_card', 'crypto_wallet')),
    status          VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_investment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_investment_plan FOREIGN KEY (plan_id) REFERENCES investment_plans(id) ON DELETE RESTRICT
);

CREATE INDEX idx_investment_user   ON investments (user_id);
CREATE INDEX idx_investment_plan   ON investments (plan_id);
CREATE INDEX idx_investment_status ON investments (status) WHERE status = 'active';
CREATE INDEX idx_investment_user_active ON investments (user_id, status) WHERE status = 'active';
```

**Relationships**:
- **N:1** with `users` (`user_id`) — the investor
- **N:1** with `investment_plans` (`plan_id`) — the plan they enrolled in

---

### 2.5 wallet_connections

External wallet connections. **Security note**: `encrypted_phrase_key` should be removed in favor of Web3 wallet connection patterns (see Gap Analysis §8.1). Included here for current spec completeness.

```sql
CREATE TABLE wallet_connections (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID NOT NULL,
    wallet_type            VARCHAR(30) NOT NULL CHECK (wallet_type IN ('bitcoin', 'ethereum', 'tether', 'binance')),
    encrypted_phrase_key   TEXT,
    is_active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_wallet_user ON wallet_connections (user_id);
```

**Relationships**:
- **N:1** with `users` (`user_id`) — a user can connect multiple wallets (one per type typically)

---

### 2.6 refresh_tokens

Active user sessions. Supports session management and remote logout.

```sql
CREATE TABLE refresh_tokens (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL,
    token_hash    VARCHAR(255) NOT NULL,
    device_info   VARCHAR(500),
    ip_address    INET,
    location      VARCHAR(255),
    last_used_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at    TIMESTAMPTZ NOT NULL,
    revoked_at    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_token_hash   UNIQUE (token_hash)
);

CREATE INDEX idx_session_user        ON refresh_tokens (user_id);
CREATE INDEX idx_session_expires     ON refresh_tokens (expires_at)    WHERE revoked_at IS NULL;
CREATE INDEX idx_session_user_active ON refresh_tokens (user_id)       WHERE revoked_at IS NULL;
```

**Relationships**:
- **N:1** with `users` — a user can have multiple active sessions (phone, desktop, tablet)

---

### 2.7 audit_logs

Immutable audit trail for all state-changing operations. Critical for compliance, debugging, and security.

```sql
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id        UUID,
    target_user_id  UUID,
    action          VARCHAR(50) NOT NULL,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       VARCHAR(255),
    old_values      JSONB,
    new_values      JSONB,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_audit_actor  FOREIGN KEY (actor_id)       REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_audit_target FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Audit queries are typically filtered by actor, target, action, or time range
CREATE INDEX idx_audit_actor     ON audit_logs (actor_id, created_at DESC);
CREATE INDEX idx_audit_target    ON audit_logs (target_user_id, created_at DESC);
CREATE INDEX idx_audit_action    ON audit_logs (action, created_at DESC);
CREATE INDEX idx_audit_entity    ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_created   ON audit_logs (created_at DESC);

-- Prevent modifications to audit logs
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_logs table is append-only. Updates and deletes are forbidden.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_no_update
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
```

**Audit Actions** (action values):
| Action | When |
|--------|------|
| `user.login` | Successful login |
| `user.login_failed` | Failed login attempt |
| `user.password_changed` | Password changed |
| `user.pin_changed` | PIN changed |
| `user.profile_updated` | Profile fields changed |
| `user.frozen` / `user.activated` | Account freeze/unfreeze |
| `user.deleted` | Account deleted |
| `admin.balance_updated` | Admin changed user balances |
| `admin.settings_updated` | System settings changed |
| `transaction.created` | New transaction |
| `transaction.approved` | Transaction approved |
| `transaction.declined` | Transaction declined |
| `transaction.cancelled` | Transaction cancelled |
| `kyc.submitted` | KYC documents uploaded |
| `kyc.approved` / `kyc.rejected` | KYC verification result |

**Relationships**:
- **N:1** with `users` (`actor_id`) — who performed the action (nullable for system actions)
- **N:1** with `users` (`target_user_id`) — which user was affected (nullable for non-user actions)

---

### 2.8 login_attempts

Track all login attempts for rate limiting and security monitoring.

```sql
CREATE TABLE login_attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL,
    ip_address      INET NOT NULL,
    attempted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    success         BOOLEAN NOT NULL,
    failure_reason  VARCHAR(100),
    user_agent      TEXT
);

-- Rate limiting queries
CREATE INDEX idx_login_email    ON login_attempts (email, attempted_at DESC);
CREATE INDEX idx_login_ip       ON login_attempts (ip_address, attempted_at DESC);
CREATE INDEX idx_login_attempted ON login_attempts (attempted_at DESC);

-- Partition by month for efficient cleanup of old attempts
-- (Enable if table exceeds ~10M rows)
-- CREATE TABLE login_attempts (...) PARTITION BY RANGE (attempted_at);
```

**Why no FK to users**: This table records attempts for non-existent emails too (brute force detection). Using a plain email string allows tracking attack patterns across both valid and invalid accounts.

---

### 2.9 kyc_verifications

Know Your Customer verification status and results.

```sql
CREATE TABLE kyc_verifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    verified_by_id      UUID,
    verification_notes  TEXT,
    submitted_at        TIMESTAMPTZ,
    verified_at         TIMESTAMPTZ,
    reviewed_at         TIMESTAMPTZ,

    CONSTRAINT fk_kyc_user       FOREIGN KEY (user_id)        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_kyc_verified_by FOREIGN KEY (verified_by_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_kyc_user       UNIQUE (user_id)
);

CREATE INDEX idx_kyc_status ON kyc_verifications (status) WHERE status IN ('pending', 'under_review');
```

**Relationships**:
- **1:1** with `users` via UNIQUE `user_id` — each user has at most one KYC submission
- **N:1** with `users` (`verified_by_id`) — the admin/compliance officer who reviewed it
- **1:N** with `kyc_documents` — one KYC submission can contain multiple documents

---

### 2.10 kyc_documents

Individual documents uploaded for KYC verification.

```sql
CREATE TABLE kyc_documents (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_id   UUID NOT NULL,
    document_type     VARCHAR(30) NOT NULL CHECK (document_type IN ('government_id', 'proof_of_address', 'selfie', 'other')),
    document_url      VARCHAR(500) NOT NULL,
    uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_kyc_doc_verification FOREIGN KEY (verification_id) REFERENCES kyc_verifications(id) ON DELETE CASCADE
);

CREATE INDEX idx_kyc_doc_verification ON kyc_documents (verification_id);
```

**Relationships**:
- **N:1** with `kyc_verifications` — one verification has multiple documents

---

### 2.11 referral_codes

Unique referral codes generated per user.

```sql
CREATE TABLE referral_codes (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL,
    code          VARCHAR(20) NOT NULL,
    click_count   INTEGER NOT NULL DEFAULT 0 CHECK (click_count >= 0),
    signup_count  INTEGER NOT NULL DEFAULT 0 CHECK (signup_count >= 0),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_refcode_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_refcode_user UNIQUE (user_id),
    CONSTRAINT uq_refcode_code UNIQUE (code)
);

CREATE INDEX idx_refcode_code ON referral_codes (code);
```

**Relationships**:
- **1:1** with `users` via UNIQUE `user_id` — each user has exactly one referral code

---

### 2.12 referrals

Tracks who referred whom and the bonus earned.

```sql
CREATE TABLE referrals (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id       UUID NOT NULL,
    referred_user_id  UUID NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    bonus_amount      DECIMAL(18,2) NOT NULL DEFAULT 0.00 CHECK (bonus_amount >= 0),
    bonus_paid_at     TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ref_referrer   FOREIGN KEY (referrer_id)      REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_ref_referred   FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT uq_ref_referred   UNIQUE (referred_user_id),
    CONSTRAINT chk_not_self_ref  CHECK (referrer_id <> referred_user_id)
);

CREATE INDEX idx_ref_referrer ON referrals (referrer_id);
```

**Relationships**:
- **N:1** with `users` (`referrer_id`) — the referring user
- **1:1** with `users` (`referred_user_id`) via UNIQUE — each user can be referred only once
- **CHECK constraint** prevents self-referral

---

### 2.13 support_tickets

User support requests.

```sql
CREATE TABLE support_tickets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    subject         VARCHAR(255) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority        VARCHAR(10) NOT NULL DEFAULT 'medium'
                    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to_id  UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ticket_user      FOREIGN KEY (user_id)        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ticket_assigned   FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_ticket_user      ON support_tickets (user_id, created_at DESC);
CREATE INDEX idx_ticket_status    ON support_tickets (status)      WHERE status IN ('open', 'in_progress');
CREATE INDEX idx_ticket_assigned  ON support_tickets (assigned_to_id);
CREATE INDEX idx_ticket_priority  ON support_tickets (priority);
```

**Relationships**:
- **N:1** with `users` (`user_id`) — the ticket creator
- **N:1** with `users` (`assigned_to_id`) — the admin/staff assigned (nullable)
- **1:N** with `support_ticket_messages` — one ticket has many messages

---

### 2.14 support_ticket_messages

Individual messages within a support ticket thread.

```sql
CREATE TABLE support_ticket_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id       UUID NOT NULL,
    sender_id       UUID NOT NULL,
    message         TEXT NOT NULL,
    attachment_url  VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_msg_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_msg_ticket ON support_ticket_messages (ticket_id, created_at);
```

**Relationships**:
- **N:1** with `support_tickets` — a ticket has many messages
- **N:1** with `users` (`sender_id`) — the message sender (can be user or admin)

---

### 2.15 notifications

In-app notification history.

```sql
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,
    type        VARCHAR(30) NOT NULL,
    title       VARCHAR(255) NOT NULL,
    body        TEXT,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    link        VARCHAR(500),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notif_user_unread ON notifications (user_id, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_notif_user_all    ON notifications (user_id, created_at DESC);
CREATE INDEX idx_notif_created     ON notifications (created_at DESC);
```

**Notification types**: `deposit_approved`, `deposit_declined`, `withdrawal_approved`, `withdrawal_declined`, `transfer_received`, `kyc_approved`, `kyc_rejected`, `security_alert`, `system_announcement`

**Relationships**:
- **N:1** with `users` — a user receives many notifications

---

### 2.16 notification_preferences

Per-user notification delivery preferences. 1:1 with users.

```sql
CREATE TABLE notification_preferences (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    security_alerts     BOOLEAN NOT NULL DEFAULT TRUE,
    transaction_alerts  BOOLEAN NOT NULL DEFAULT TRUE,
    marketing_emails    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_notif_pref_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_notif_pref_user UNIQUE (user_id)
);

-- Auto-create preferences on user insert
CREATE OR REPLACE FUNCTION create_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_preferences (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_notification_prefs
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_notification_preferences();
```

---

### 2.17 roles

System roles for RBAC.

```sql
CREATE TABLE roles (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(50) NOT NULL,
    description   TEXT,
    is_system     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_role_name UNIQUE (name)
);
```

**Predefined roles**:
| Name | Description | is_system |
|------|-------------|-----------|
| `super_admin` | Full system access, role management | TRUE |
| `admin` | Manage users, transactions, settings | TRUE |
| `support_agent` | View users, manage tickets | TRUE |
| `compliance_officer` | Review KYC, monitor transactions | TRUE |
| `auditor` | Read-only access to all data | TRUE |
| `finance_manager` | Approve large transactions, manage deposits | TRUE |

---

### 2.18 permissions

Granular permission codenames for RBAC.

```sql
CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codename    VARCHAR(100) NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description TEXT,

    CONSTRAINT uq_perm_codename UNIQUE (codename)
);
```

**Predefined permissions**:
| Codename | Name |
|----------|------|
| `users.read` | View users |
| `users.write` | Create/edit users |
| `users.delete` | Delete users |
| `users.freeze` | Freeze/activate users |
| `balances.read` | View user balances |
| `balances.write` | Modify user balances |
| `transactions.read` | View transactions |
| `transactions.approve` | Approve/decline transactions |
| `settings.read` | View system settings |
| `settings.write` | Modify system settings |
| `kyc.read` | View KYC submissions |
| `kyc.verify` | Approve/reject KYC |
| `tickets.read` | View support tickets |
| `tickets.manage` | Manage support tickets |
| `audit.read` | View audit logs |
| `roles.manage` | Manage roles and permissions |

---

### 2.19 user_roles

Junction table: users ↔ roles (many-to-many).

```sql
CREATE TABLE user_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,
    role_id     UUID NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
);

CREATE INDEX idx_ur_user ON user_roles (user_id);
CREATE INDEX idx_ur_role ON user_roles (role_id);
```

---

### 2.20 role_permissions

Junction table: roles ↔ permissions (many-to-many).

```sql
CREATE TABLE role_permissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id         UUID NOT NULL,
    permission_id   UUID NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_rp_role FOREIGN KEY (role_id)       REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    CONSTRAINT uq_role_perm UNIQUE (role_id, permission_id)
);

CREATE INDEX idx_rp_role ON role_permissions (role_id);
CREATE INDEX idx_rp_perm ON role_permissions (permission_id);
```

**Relationships** (for the RBAC subsystem):
- `users` **N:M** `roles` via `user_roles`
- `roles` **N:M** `permissions` via `role_permissions`

---

### 2.21 idempotency_keys

Prevents duplicate financial transactions. Key → response mapping with TTL-based cleanup.

```sql
CREATE TABLE idempotency_keys (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key               VARCHAR(64) NOT NULL,
    response_body     JSONB,
    response_status   SMALLINT NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_idem_key UNIQUE (key)
);

-- Cleanup: keys expire after 24 hours
CREATE INDEX idx_idem_created ON idempotency_keys (created_at);
```

**Usage**: Client sends `Idempotency-Key: <uuid>` header. Server checks this table. If key exists, return cached response (same status and body). If not, process request, store response, return.

---

### 2.22 token_blacklists

Invalidated JWT tokens. Checked on every authenticated request.

```sql
CREATE TABLE token_blacklists (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jti         VARCHAR(255) NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_blacklist_jti UNIQUE (jti)
);

-- Cleanup: remove expired tokens (cron job or pg_cron)
CREATE INDEX idx_blacklist_expires ON token_blacklists (expires_at) WHERE expires_at < NOW();
```

**Usage**: On logout, password change, or admin-forced session revoke, add the JWT's JTI to this table. Auth middleware checks this table on every request — if JTI exists, return 401.

---

## 3. Reference / Configuration Tables

### 3.1 investment_plans

Available recovery/investment plans. Currently hardcoded in frontend (`PREDEFINED_PLANS`).

```sql
CREATE TABLE investment_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(50) NOT NULL,
    min_amount      DECIMAL(18,2) NOT NULL CHECK (min_amount > 0),
    max_amount      DECIMAL(18,2) NOT NULL CHECK (max_amount >= min_amount),
    profit_rate     DECIMAL(5,2) NOT NULL,
    duration_days   INTEGER NOT NULL CHECK (duration_days > 0),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_plan_slug UNIQUE (slug)
);

-- Seed data
INSERT INTO investment_plans (name, slug, min_amount, max_amount, profit_rate, duration_days) VALUES
    ('Standard Protocol',  'starter', 10000.00, 100000.00, 1.00, 30),
    ('Premium Forensic',   'gold',    20000.00, 500000.00, 30.00, 30);
```

### 3.2 deposit_addresses

Platform deposit wallet addresses by currency.

```sql
CREATE TABLE deposit_addresses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency    VARCHAR(10) NOT NULL CHECK (currency IN ('btc', 'eth', 'usdt')),
    address     VARCHAR(255) NOT NULL,
    label       VARCHAR(100),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_depaddr_currency UNIQUE (currency)
);
```

### 3.3 withdrawal_methods

Available withdrawal methods.

```sql
CREATE TABLE withdrawal_methods (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    min_amount      DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    max_amount      DECIMAL(18,2) NOT NULL DEFAULT 999999999.99,
    fee_percentage  DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    duration        VARCHAR(50),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed data matching frontend expectations
INSERT INTO withdrawal_methods (name, min_amount, max_amount, fee_percentage, duration) VALUES
    ('Bitcoin',        1000.00, 100000.00, 20.00, 'Instant'),
    ('Ethereum',       1000.00, 500000.00, 20.00, 'Instant'),
    ('USDT (TRC20)',   1000.00, 500000.00, 20.00, 'Instant'),
    ('Bank Transfer',  1000.00, 500000.00, 20.00, '1-3 Business Days');
```

### 3.4 system_configs

Key-value configuration store. Singleton per key.

```sql
CREATE TABLE system_configs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key         VARCHAR(100) NOT NULL,
    value       TEXT NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_config_key UNIQUE (key)
);

-- Seed default configs
INSERT INTO system_configs (key, value) VALUES
    ('admin_email',        'admin@coinsafehub.com'),
    ('transaction_limit',  '10000'),
    ('system_status',      'Active');
```

### 3.5 email_templates

Configurable transactional email templates.

```sql
CREATE TABLE email_templates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    subject     VARCHAR(255) NOT NULL,
    body_html   TEXT NOT NULL,
    body_text   TEXT NOT NULL,
    variables   JSONB,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_template_name UNIQUE (name)
);

-- Seed templates
INSERT INTO email_templates (name, subject, body_html, body_text, variables) VALUES
    ('email_verification', 'Verify your CoinSafeHub email', '<p>Your code: {{otp}}</p>', 'Your code: {{otp}}', '["otp", "user_name"]'),
    ('password_reset',     'Reset your CoinSafeHub password', '<p>Reset link: {{reset_link}}</p>', 'Reset link: {{reset_link}}', '["reset_link", "user_name"]'),
    ('deposit_approved',   'Deposit Approved — CoinSafeHub', '<p>Your deposit of {{amount}} has been approved.</p>', 'Your deposit of {{amount}} has been approved.', '["amount", "user_name", "transaction_id"]');
```

---

## 4. Key Relationships Summary

```
users
├── 1:1 ── user_balances          (every user has exactly one balance record)
├── 1:1 ── notification_preferences (every user has notification settings)
├── 1:1 ── referral_codes          (every user has a unique referral code)
├── 1:1 ── kyc_verifications       (every user has at most one KYC submission)
│
├── 1:N ── transactions            (user initiates many transactions)
├── 1:N ── transactions (recipient) (user receives many transfers)
├── 1:N ── transactions (processor) (admin processes many transactions)
├── 1:N ── investments             (user enrolls in many plans)
├── 1:N ── wallet_connections      (user connects many wallets)
├── 1:N ── refresh_tokens          (user has many active sessions)
├── 1:N ── audit_logs (actor)      (user performs many auditable actions)
├── 1:N ── audit_logs (target)     (user is subject of many admin actions)
├── 1:N ── notifications           (user receives many notifications)
├── 1:N ── support_tickets         (user creates many tickets)
├── 1:N ── support_ticket_messages (user sends many messages)
├── 1:N ── referrals (referrer)    (user refers many people)
├── 1:1 ── referrals (referred)    (user is referred by at most one person)
│
├── N:M ── roles (via user_roles)  (user has many roles)

kyc_verifications
├── 1:N ── kyc_documents           (one verification has many documents)

support_tickets
├── 1:N ── support_ticket_messages (one ticket has many messages)

investment_plans
├── 1:N ── investments             (one plan has many enrollments)

roles
├── N:M ── permissions (via role_permissions) (each role has many permissions)
```

---

## 5. Index Strategy Summary

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| users | `uq_users_email` | UNIQUE | Login lookup, duplicate prevention |
| users | `idx_users_is_active` | Partial | Filter active users quickly |
| users | `idx_users_is_staff` | Partial | Filter admin users |
| user_balances | `uq_balances_user` | UNIQUE | Enforce 1:1, fast join |
| transactions | `idx_txn_user_id` | B-tree | User's transaction list |
| transactions | `idx_txn_status` | Partial | Pending transaction queue (admin) |
| transactions | `idx_txn_created_at` | B-tree DESC | Chronological listing |
| transactions | `idx_txn_user_status` | Composite | "My pending transactions" |
| transactions | `uq_txn_idempotency` | UNIQUE | Idempotency check |
| transactions | `idx_txn_pending_admin` | Partial | Admin pending approval queue |
| refresh_tokens | `uq_token_hash` | UNIQUE | Fast token lookup on auth |
| refresh_tokens | `idx_session_user_active` | Partial | "My active sessions" |
| audit_logs | `idx_audit_actor` | Composite | "Actions by this admin" |
| audit_logs | `idx_audit_target` | Composite | "Actions on this user" |
| audit_logs | `idx_audit_created` | B-tree DESC | Recent activity feed |
| login_attempts | `idx_login_email` | Composite | Rate limit by email |
| login_attempts | `idx_login_ip` | Composite | Rate limit by IP |
| kyc_verifications | `uq_kyc_user` | UNIQUE | One submission per user |
| referral_codes | `uq_refcode_code` | UNIQUE | Code lookup on registration |
| referrals | `uq_ref_referred` | UNIQUE | One referral per user |
| idempotency_keys | `uq_idem_key` | UNIQUE | Idempotency lookup |
| token_blacklists | `uq_blacklist_jti` | UNIQUE | Fast deny-list check |
| token_blacklists | `idx_blacklist_expires` | Partial | Cron cleanup of expired |
| notifications | `idx_notif_user_unread` | Partial | Unread notification count |
| user_roles | `uq_user_role` | UNIQUE | Prevent duplicate role assignments |

---

## 6. Important Design Decisions

### 6.1 UUIDs as Primary Keys
All tables use UUIDs (`gen_random_uuid()`) rather than auto-increment integers. Reasons:
- No sequential ID enumeration (security)
- Safe for distributed systems / horizontal scaling
- Can be generated client-side for idempotency keys
- Frontend already expects string IDs

Trade-off: UUIDs are 16 bytes vs 4/8 bytes for integers. Indexes are larger. Acceptable for this scale.

### 6.2 DECIMAL(18,2) for Financial Amounts
All monetary values use `DECIMAL(18,2)` — exact precision, no floating-point errors. 18 total digits, 2 decimal places allows values up to 9.9 quadrillion with cent precision. Non-negative CHECK constraints on all balance fields.

### 6.3 Separate user_balances Table
Split from users for:
- Row-level locking isolation (`SELECT ... FOR UPDATE` on balance row doesn't block profile reads)
- Cleaner audit trail
- Future sharding flexibility

### 6.4 Stored Generated Column for net_amount
`net_amount` is `GENERATED ALWAYS AS (amount - fee) STORED`. This guarantees consistency — net amount can never drift from amount minus fee.

### 6.5 RESTRICT vs CASCADE Delete
- `ON DELETE CASCADE`: wallet_connections, refresh_tokens, notifications, notification_preferences, user_roles, kyc_documents (ephemeral data that should disappear with the parent)
- `ON DELETE RESTRICT`: transactions, investments, referrals (financial records that must be preserved)
- `ON DELETE SET NULL`: transactions.processed_by_id, transactions.recipient_user_id, audit_logs.actor_id, kyc_verifications.verified_by_id (preserve the record, nullify the reference)

### 6.6 Immutable Audit Logs
The `audit_logs` table has a trigger that prevents UPDATE and DELETE. Audit logs are append-only. This ensures the integrity of the audit trail for compliance.

### 6.7 Partial Indexes
Multiple indexes use WHERE clauses (`WHERE status = 'pending'`, `WHERE is_read = FALSE`). This reduces index size significantly — only relevant rows are indexed.

### 6.8 No Foreign Key on login_attempts
`login_attempts.email` is a plain string, not an FK to users. This allows tracking brute force attempts against non-existent emails without needing user records.
