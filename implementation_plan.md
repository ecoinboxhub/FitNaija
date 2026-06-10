# FitNaija: Comprehensive Implementation Plan & Architecture Validation

This document outlines the final execution roadmap, scaffolding schemas, API blueprints, testing strategy, and production readiness checklists for **FitNaija** based on the simplified MVP specifications.

---

## 1. Final Architecture Validation

### 1.1 Gemini + Groq Routing Strategy
*   **Unified Model Interface:** A middleware service abstracts API calls to Gemini and Groq.
*   **Orchestration Routing:** 
    *   **Google Gemini (Gemini Flash/Pro):** Powers LangGraph graph execution, complex reasoning, and multimodal Vision OCR screenshot audits.
    *   **Groq:** Handles high-speed conversational streaming chat outputs.
    *   *OpenAI is completely removed.*
*   **Failover Protocol:** If Groq API triggers errors or hits rate limits, the router fails over automatically to Gemini.

### 1.2 Onboarding & Billing
*   **Onboarding Conversion Strategy:** New registrations default to `status = trial_active` with a trial end timestamp set to `NOW() + 30 days`. The onboarding flow completely bypasses billing prompts, leading users through:
    *   *Milestone 1 (Zero-Friction Signup):* OTP registration + location select.
    *   *Milestone 2 (First-Use Experience):* Join a free local warmup challenge to view the live ranking leaderboard.
    *   *Milestone 3 (Early Success):* First manual log entry immediately updates the leaderboard and triggers a motivational coach push.
*   **Subscription:** Expired trials transition to `status = trial_expired`. Users subscribe at **₦15,000/month** processed through Paystack checkout. Entitlements are mapped via RevenueCat.

### 1.3 Telemetry Strategy (App Store & Play Store Compliant)
*   **Zero Biometrics:** Disables HealthKit and Google Fit REST API bindings to eliminate app review delays and biometrics restrictions.
*   **Safe Telemetry Ingestion:** Users submit log forms (activity type, duration, distance, steps estimate) and attach an optional screenshot proof.
*   **Gemini Vision Audit:** Gemini parses the image proof and audits the form inputs to confirm they match.

### 1.4 Custom Location Taxonomy
*   Normalized DB enum `target_location` enforces selection:
    *   **Abuja:** Maitama, Wuse, Garki, Asokoro, Apo, Lokogoma, Guzape, Lugbe, Kubwa.
    *   **Extended Regions:** Lagos, Port Harcourt.

### 1.5 Manual-Only Payouts
*   Challenges freeze for a 48-hour appeal window.
*   The backend compiles a CSV ledger containing verified winner accounts, display names, and bank details.
*   Admins execute bank transfers manually via bank portals or the Paystack dashboard.

---

## 2. Updated Scaffolding & Folder Structure Plan

```
fitnaija/
├── docker/
│   ├── postgres/
│   │   └── Dockerfile         # Custom Postgres with pgvector
│   ├── docker-compose.yml     # Local services configuration
│   └── backend.Dockerfile
├── backend/
│   ├── alembic/               # Database migrations folder
│   ├── app/
│   │   ├── core/              # Config, Exceptions, Gemini+Groq Router
│   │   ├── database/          # Database setups, SQLAlchemy schemas
│   │   ├── domains/           # Domain folders
│   │   │   ├── auth/          # Phone login, SMS OTP Termii client
│   │   │   ├── users/         # Profiles, Location enums
│   │   │   ├── challenges/    # Leaderboard integrations
│   │   │   ├── telemetry/     # Manual log uploads, screenshot payloads
│   │   │   ├── payments/      # Paystack, RevenueCat webhook validations
│   │   │   ├── fraud/         # Anomaly rules (pace / limit filters)
│   │   │   └── ai_agent/      # LangGraph states, pgvector RAG
│   │   ├── main.py            # FastAPI Init
│   │   └── celery_worker.py   # Celery tasks (entitlement checks)
│   └── tests/                 # Integration tests (PyTest)
├── frontend-mobile/           # React Native Expo Mobile App
│   ├── src/
│   │   ├── components/        # Location select dropdowns, Chat windows
│   │   ├── hooks/             # Query states, custom form logs hooks
│   │   └── store/             # Zustand state (JWTs, local steps cache)
│   └── package.json
└── frontend-web/              # React Vite PWA Web App
    ├── src/
    │   ├── components/        # UI widgets (leaderboards list, chat windows)
    │   ├── hooks/             # React Query states and axios bindings
    │   ├── store/             # Zustand states (Auth, Local offline queue)
    │   ├── serviceWorker.ts   # PWA service worker setups (generateSW mappings)
    │   └── utils/             # Canvas local image compression scripts
    └── package.json
```


---

## 3. Database Schema Suggestions (PostgreSQL)

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Target Location Taxonomy Enum
CREATE TYPE target_location AS ENUM (
    'maitama', 'wuse', 'garki', 'asokoro', 'apo', 
    'lokogoma', 'guzape', 'lugbe', 'kubwa', 
    'lagos', 'port_harcourt'
);

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    location target_location NOT NULL,
    status VARCHAR(20) DEFAULT 'trial_active' CHECK (status IN ('trial_active', 'trial_expired', 'subscribed_active', 'subscription_expired')),
    trial_start TIMESTAMPTZ DEFAULT NOW(),
    trial_end TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenges Table
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    activity_type VARCHAR(20) CHECK (activity_type IN ('steps', 'running', 'cycling')),
    entry_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    prize_pool DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location_scope target_location,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'verification', 'settled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge Participants
CREATE TABLE challenge_participants (
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_steps INTEGER DEFAULT 0,
    fraud_status VARCHAR(20) DEFAULT 'clean' CHECK (fraud_status IN ('clean', 'soft_flag', 'hard_flag', 'disqualified', 'cleared')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (challenge_id, user_id)
);

-- Safe Telemetry Log entries
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    steps INTEGER DEFAULT 0,
    distance_m DECIMAL(10,2),
    duration_sec INTEGER,
    proof_image_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    fraud_score FLOAT DEFAULT 0.0,
    fraud_flags JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('subscription', 'entry_fee')),
    reference VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- pgvector RAG Knowledge Store
CREATE TABLE fitness_knowledge_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    metadata JSONB,
    embedding vector(1536)
);

-- Chat messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Engineering Order & Milestone Execution Plan

### Phase 1: Database Setup & Scaffolding (Weeks 1-2)
1.  Configure Docker Compose containing PostgreSQL + pgvector and Redis 7.
2.  Initialize Alembic migrations and database enums.
3.  Implement User and Challenge schema structures.

### Phase 2: Authentication & Onboarding (Weeks 2-3)
1.  Integrate the Termii OTP SMS client services.
2.  Write user onboarding API endpoints requiring select values from the location taxonomy.
3.  Configure value-first onboarding triggers (free signup, warmup challenge joins).
4.  Configure JWT tokens and refresh token rotation middleware.

### Phase 3: Ingestion, Billings & Leaderboards (Weeks 3-5)
1.  Build manual telemetry log submission endpoints (`POST /api/v1/activity/sync`).
2.  Integrate Paystack checkout webhooks to process subscription payments (₦15,000/month).
3.  Connect RevenueCat REST APIs to sync entitlements.
4.  Write Redis Sorted Set systems to manage live leaderboard positions.
5.  Create daily Celery cron tasks to verify and revoke expired trials or subscriptions.

### Phase 4: AI Routing, Verification & LangGraph (Weeks 5-7)
1.  Implement the dynamic model router abstraction supporting Google Gemini and Groq.
2.  Build Gemini Multimodal verification handlers parsing uploaded workout screenshots.
3.  Populate `fitness_knowledge_embeddings` in pgvector.
4.  Build the LangGraph state machine orchestrating the AI Coach and Support Agent.

### Phase 5: Client Apps Integration (Web PWA & Mobile App) & Manual Payouts (Weeks 7-9)
1.  **Mobile Client (Expo):** Develop user screens (Workout Form logs, Leaderboards views, Chatbot Support panels, Profile fields).
2.  **Web PWA Client (React Vite):** 
    *   Implement user interfaces (Login, Location taxonomy enums, Leaderboards deck, Profile updates).
    *   Develop the **Workout Log Form** including local image preview and HTML5 Canvas compression utilities.
    *   Deploy `vite-plugin-pwa` service workers to cache static assets and compile offline local log persistence.
3.  **App/Web Sync Verification:** Test Zustand local storage mappings and React Query mutations to ensure logs submitted offline are queued and processed when connection is recovered.
4.  **Admin Payout Portal:** Build manual CSV ledger exports from the admin domain.
5.  **Integration Testing:** Run end-to-end testing cycles (JWT validations, Paystack mock webhook handlers, Gemini screenshot verification checks, PWA service worker responses).


### Phase 6: Deployments, Monitoring & Launch (Weeks 9-10)
1.  Configure Nginx reverse proxies and SSL routing via Cloudflare.
2.  Deploy application components to Galaxy Backbone using Docker.
3.  Set up Sentry error monitoring and Grafana metric dashboards.

---

## 5. Production Readiness Checklist

*   [ ] **Model Router Failover Verification:** Validate failover states from Groq to Gemini.
*   [ ] **Gemini Image Verification Guard:** Ensure image verification failures quarantine steps and do not update Redis.
*   [ ] **Paystack Webhook Verification:** Ensure the header signature check is enabled in production.
*   [ ] **Daily Subscription Cron Validation:** Ensure Celery task transitions expired trials to `trial_expired` and delinquent subscriptions to `subscription_expired` daily.
*   [ ] **Location Taxonomy Database Constraints:** Enforce select validations on the `location` field.
*   [ ] **NDPR Compliance:** Ensure all user telemetry is encrypted and deletions purge logs.
