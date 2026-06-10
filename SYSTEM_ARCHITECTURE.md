# FitNaija: System Architecture Specification

This document provides the complete, production-ready system architecture specification for **FitNaija**—a dual-platform (Web + Mobile App) fitness challenge prototype. It details the technical blueprints, interface contracts, AI routing abstractions, and deployment plans frozen under Version 4.0.

---

## 1. Product Goals, User Flows, & Integrations

### 1.1 Product Goals
*   **Accountability Enforced:** Drive fitness consistency among Abuja remote and office professionals using naira-denominated cash challenges.
*   **Zero Sensor Incompatibilities:** Avoid HealthKit / Google Fit API restrictions and store rejection policies. Use safe manual ingestion backed by LLM visual verification.
*   **Onboarding Optimization:** Bypasses card requests upfront. Registers users for a **1-month free trial** and drives them to enter warmup challenges to experience success metrics before paywall prompts.
*   **Pricing:** **₦15,000/month** recurring subscription after trial expiration.
*   **Settlement Safety:** **Manual payouts only** via exported admin CSV ledgers to prevent programmatic transaction loss or banking failures.

### 1.2 User Journey & Activation Flows

```
[Phone Number Input] ──► [Verify SMS OTP] ──► [Select Location Enum]
                                                    │ (Status: trial_active)
                                                    ▼
[Log First Workout]  ◄── [Join Warmup Challenge] ◄── [Browse Challenges]
  │ (Manual Form + Image Proof)
  ▼
[Gemini Vision Verification] ──► [Leaderboard Updates] ──► [AI Coach Congrats]
```

### 1.3 Integrations
1.  **Termii API:** Dispatches OTP codes over SMS and WhatsApp fallback channels.
2.  **Paystack API:** Currency transactions (₦15,000/month subscription + ₦1,000–₦5,000 challenge entry fees).
3.  **RevenueCat REST API:** Syncs transactions to manage user entitlement states.
4.  **Google Gemini API:** Vision OCR screenshot processing, agent reasoning, and RAG.
5.  **Groq API:** Low-latency inference and real-time streaming conversational chats.
6.  **Firebase Cloud Messaging (FCM):** Challenge notifications and winner settlement push alerts.

---

## 2. Technology Stack Selection

| Layer | Recommended Technology | Rationale |
| :--- | :--- | :--- |
| **Mobile Client** | React Native (Expo) | Cross-platform, fast prototyping, React Query state management. |
| **Web Client** | React 18 + Vite | Lightweight fallback PWA, shares state/hooks with Expo client. |
| **Backend API** | FastAPI (Python 3.12) | High performance async REST framework, native Pydantic validation. |
| **Primary Database**| PostgreSQL 16 | ACID compliant relational storage for transactions and activity logs. |
| **Vector DB** | pgvector (PostgreSQL extension)| Integrated vector storage (1536 dim), avoids multi-database overhead. |
| **Cache & Leaderboard**| Redis 7 | Sorted Sets (`ZADD`, `ZREVRANGE`) for O(log N) leaderboard queries. |
| **Task Queue** | Celery + Redis Broker | Handles daily trial/subscription reconciliations and ledger compilation. |
| **Host Environment**| Docker Compose | Standardized, low-complexity container orchestration. |

---

## 3. Folder & Project Structure

```
fitnaija/
├── docker/
│   ├── postgres/
│   │   └── Dockerfile         # PostgreSQL base with pgvector build
│   ├── docker-compose.yml     # Local multi-container configuration
│   └── backend.Dockerfile
├── backend/
│   ├── alembic/               # Alembic database migrations
│   ├── app/
│   │   ├── core/              # Security, exceptions, configurations, AI client router
│   │   │   ├── config.py
│   │   │   ├── security.py    # JWT and Passwordless OTP helpers
│   │   │   └── ai_router.py   # Gemini + Groq failover router
│   │   ├── database/          # Session management, declarative models
│   │   ├── domains/           # Domain-driven backend modules
│   │   │   ├── auth/          # OTP creation, verification, token generation
│   │   │   ├── users/         # Profiles, target location checks
│   │   │   ├── challenges/    # Challenge CRUD, Redis leaderboard interactions
│   │   │   ├── telemetry/     # Manual workout log submissions, image upload handlers
│   │   │   ├── payments/      # Paystack webhook signatures, RevenueCat bindings
│   │   │   ├── fraud/         # Rules engine limits (pace, speed checks)
│   │   │   └── ai_agent/      # LangGraph state configurations, pgvector searches
│   │   ├── main.py            # FastAPI Application initialization
│   │   └── celery_worker.py   # Background cron registrations
│   └── tests/                 # Test packages
└── frontend-mobile/           # Expo Native codebase
    ├── src/
    │   ├── components/        # Location selectors, leaderboards widgets
    │   ├── hooks/             # Query states, custom form logs hooks
    │   └── store/             # Zustand local caching and token states
    └── package.json
```

---

## 4. Database Schema (PostgreSQL DDL)

```sql
-- Enable UUID and Vector Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Predefined Location Taxonomy Enum
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
CREATE INDEX idx_users_location ON users(location);

-- Challenges Table
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    activity_type VARCHAR(20) CHECK (activity_type IN ('steps', 'running', 'cycling')),
    entry_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    prize_pool DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location_scope target_location, -- NULL corresponds to national/global challenges
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'verification', 'settled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_challenges_status ON challenges(status);

-- Challenge Participants Junction Table
CREATE TABLE challenge_participants (
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_steps INTEGER DEFAULT 0,
    fraud_status VARCHAR(20) DEFAULT 'clean' CHECK (fraud_status IN ('clean', 'soft_flag', 'hard_flag', 'disqualified', 'cleared')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (challenge_id, user_id)
);

-- Activity Logs (Partitioned monthly in production if scaling dictates)
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
CREATE INDEX idx_activity_logs_user_challenge ON activity_logs(user_id, challenge_id);

-- Transactions Table (Idempotent Webhook Log)
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

-- Chat messages memory
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id, created_at);
```

---

## 5. Authentication & Onboarding Architecture

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  Mobile Client  ├──────►│ FastAPI Backend ├──────►│   Termii API    │
│  (Phone Input)  │       │ (Redis OTP Gen) │       │ (SMS/WhatsApp)  │
└─────────────────┘       └─────────────────┘       └─────────────────┘
         ▲                         │                         │
         │                         ▼                         │
         │                 ┌─────────────────┐               │
         └─────────────────┤  Redis Cache    │◄──────────────┘
            Submit OTP     │ (OTP expiration)│
                           └─────────────────┘
```

1.  **OTP Generation:** User provides phone number. FastAPI backend generates a 6-digit OTP, stores the hash in Redis with a 10-minute TTL, and dispatches SMS/WhatsApp notifications via Termii.
2.  **Verification:** User submits the code. The backend validates it against Redis. On success:
    *   If the user record is missing, it is created with `status = trial_active` and `trial_end = NOW() + 30 days`.
    *   Returns a JWT access token (1 hour) and a rotating refresh token (30 days).
3.  **Refresh Token Rotation (RTR):** When refreshing, the backend checks the refresh token list in Redis. If verified, a new token pair is issued, and the old refresh token is blacklisted in Redis to prevent reuse attacks.

---

## 6. AI System Architecture (Gemini + Groq Router)

```
                            [User Request]
                                   │
                                   ▼
                         [AI Routing Layer]
                                   │
                     ┌─────────────┴─────────────┐
                     ▼                           ▼
            [Google Gemini API]              [Groq API]
           * Core Reasoning Agent        * Low-Latency Chats
           * Multimodal Screenshot OCR   * Primary Fallback
           * LangGraph State Planner
```

### 6.1 Routing Abstraction Layer
A core module `ai_router.py` manages LLM requests without hardcoding API endpoints:
*   **Reasoning and Vision:** Routed directly to the Google Gemini API (using `gemini-1.5-flash` or `gemini-1.5-pro`). This engine runs multimodal tasks (extracting workout proofs) and plans LangGraph state graphs.
*   **Fast Chat Streams:** Routed to Groq (using `llama-3-70b` or `mixtral-8x7b`) for real-time conversational streaming outputs (AI Coach interactions).
*   **Failover Logic:** If Groq calls trigger exceptions (rate limits, timeouts), the routing layer falls back to the Gemini API to prevent user-facing downtime.

### 6.2 Screenshot proof verification Flow
1.  User enters log metrics and uploads a workout proof image.
2.  FastAPI dispatches the image along with a structured Pydantic schema to the Gemini Vision API.
3.  Gemini OCR processes the image text (extracting steps, duration, and distance indicators) and returns a JSON payload.
4.  The backend compares the Gemini output against the user's manual form input. If values match within a 5% tolerance, the entry is validated; otherwise, the log is flagged as `hard_flag` and quarantined.

---

## 7. RAG & Vector Database Architecture

*   **Database Extension:** Enforced via `pgvector` inside PostgreSQL.
*   **Embeddings Dimension:** 1536 dimensions using OpenAI or Gemini embedding models.
*   **Retrieval Pipeline:**
    1.  User asks the AI Coach about a neighborhood running trail (e.g. "Suggest a route in Maitama").
    2.  The backend converts the query text to an embedding vector.
    3.  Performs a cosine similarity search on the `fitness_knowledge_embeddings` table.
    4.  Extracts top-K trail records and challenge rules.
    5.  Appends the context to the system prompt and streams the response via Groq.

```sql
-- Cosine Similarity Query Example
SELECT content, metadata, (embedding <=> :query_embedding) AS distance
FROM fitness_knowledge_embeddings
ORDER BY distance ASC
LIMIT 3;
```

---

## 8. Real-Time Sorted Set Leaderboards

Redis is used to maintain leaderboard scores.
*   **Leaderboard Keys:** Organized by challenge ID: `leaderboard:{challenge_id}`.
*   **Operations:**
    *   *Add/Update Score:* `ZADD leaderboard:{challenge_id} {steps_value} {user_id}`
    *   *Fetch Rankings:* `ZREVRANGE leaderboard:{challenge_id} 0 49 WITHSCORES` (returns top 50).
    *   *User Specific Rank:* `ZREVRANK leaderboard:{challenge_id} {user_id}`.
*   **Freshness:** Telemetry logs that pass the Gemini Vision check update the Redis score in real-time. The frontend mobile client polls the `/leaderboard` endpoint every 60 seconds.

---

## 9. Background Jobs & Worker Architecture

Asynchronous tasks are managed via Celery, using Redis as the message broker.

### 9.1 Celery Workers
*   **Trial Expiration Daemon:** Runs daily at 00:00. Identifies users where `trial_end < NOW()` and `status = 'trial_active'`. Updates their database state to `status = 'trial_expired'` and revokes RevenueCat entitlements.
*   **Subscription Expiration Daemon:** Queries RevenueCat daily for cancelled monthly subscriptions, updating the database status to `status = 'subscription_expired'`.
*   **Appeal Window Settlement:** When a challenge concludes, a task schedules a ledger compilation to run 48 hours later.

### 9.2 Payout CSV Ledger Compiler
After the 48-hour verification window closes:
1.  The worker queries final rankings from the Redis Sorted Set.
2.  Cross-checks participant profiles in PostgreSQL, filtering out cheaters (status `hard_flag` or `disqualified`).
3.  Generates a CSV ledger containing: `Rank, Username, Display Name, Bank Name, Account Number, Payout Amount (Naira)`.
4.  Stores the CSV file securely in S3 and notifies the admin dashboard.

---

## 10. Core API Endpoints

### 10.1 Authentication & Profile
*   `POST /api/v1/auth/otp/send`
    *   *Request:* `{"phone": "+2348031234567"}`
    *   *Response:* `{"message": "OTP sent successfully"}`
*   `POST /api/v1/auth/otp/verify`
    *   *Request:* `{"phone": "+2348031234567", "otp": "123456"}`
    *   *Response:* `{"access_token": "JWT", "refresh_token": "JWT", "status": "trial_active"}`
*   `POST /api/v1/users/profile`
    *   *Request:* `{"display_name": "Ada Wuse", "location": "wuse", "bank_name": "GTBank", "bank_account_number": "0123456789"}`
    *   *Response:* `{"status": "updated"}`

### 10.2 Telemetry Ingest & Leaderboard
*   `POST /api/v1/activity/sync` (Requires JWT)
    *   *Request:* Form data containing `steps`, `distance_m`, `duration_sec`, and optional `proof_image` file.
    *   *Response:* `{"status": "verified", "steps_credited": 8500}`
*   `GET /api/v1/challenges/{id}/leaderboard` (Requires JWT)
    *   *Response:* `{"top_users": [{"rank": 1, "name": "Ada", "steps": 12000}], "user_rank": {"rank": 5, "steps": 8500}}`

### 10.3 Payments & Support Chat
*   `POST /api/v1/payments/webhook/paystack` (Signature verified)
    *   *Response:* `{"status": "ok"}`
*   `POST /api/v1/coach/chat` (Requires JWT)
    *   *Request:* `{"message": "Is there a good running trail in Maitama?"}`
    *   *Response:* Server-Sent Events (SSE) text stream.

---

## 11. Security Architecture

1.  **Webhook HMAC Signatures:** Paystack webhooks validate payloads using the `x-paystack-signature` header (HMAC SHA512 using the local API secret key).
2.  **API Rate Limiting:** Redis rate limits the `/activity/sync` endpoint, restricting users to a maximum of 5 submission requests per 10 minutes to prevent database write locks and protect API quotas.
3.  **Data Isolation & NDPR Compliance:** User telemetry files and screenshots are stored with randomly generated UUID paths in secure S3 buckets. Health data is deleted 90 days after challenge settlement, or immediately upon user deletion requests.
4.  **Admin Ledger Locks:** The endpoint to download CSV ledgers is protected by administrative role guards and IP whitelist checks.

---

## 12. Deployment & Infrastructure Architecture

*   **Hosting Provider:** **Render** (for the FastAPI backend server, Celery background worker, PostgreSQL pgvector database, and Redis cache broker) and **Netlify** (for the static PWA frontend web client build).
*   **Orchestration Environment:** Native platform builds coordinated via `render.yaml` and `netlify.toml` in the repository root.
*   **Network Gateway:** Cloudflare WAF maps DNS records, terminates SSL (TLS 1.3), and applies DDoS protection filters.


```
                  Internet / Mobile App Client
                              │
                              ▼ (HTTPS Port 443)
                    ┌──────────────────┐
                    │  Cloudflare WAF  │
                    └────────┬─────────┘
                             │
                             ▼ (FastAPI Monolith)
                    ┌──────────────────┐
                    │  Nginx Gateway   │
                    └────────┬─────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼ (Port 8000)                     ▼ (Port 6379)
  ┌──────────────────┐              ┌──────────────────┐
  │ FastAPI Backend  │              │   Redis Cache    │
  └────────┬─────────┘              └──────────────────┘
           │
           ├────────────────────────┬────────────────────────┐
           ▼                        ▼                        ▼
  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
  │  PostgreSQL +    │     │  Celery Worker   │     │  S3 Static Proof │
  │  pgvector DB     │     │ (Reconciliation) │     │      Store       │
  └──────────────────┘     └──────────────────┘     └──────────────────┘
```

---

## 13. Scalability Considerations

1.  **PostgreSQL Index Partitioning:** As the user base grows, the `activity_logs` table accumulates millions of rows. We partition `activity_logs` by month on the `timestamp` column to prevent indexing slow-downs during writes.
2.  **Stateless API Scaling:** The FastAPI backend is completely stateless, storing session data in Redis. This allows us to scale backend containers horizontally behind the Nginx load balancer as traffic grows.
3.  **Redis Leaderboard Memory Footprint:** Sorted sets are memory-efficient. A leaderboard with 10,000 active participants consumes less than 5MB of Redis memory.

---

## 14. Frontend Web App (React Vite PWA) Architecture

The FitNaija Frontend Web App provides a desktop-friendly and mobile-web responsive Progressive Web Application (PWA). It acts as a fallback for users without immediate app store access and shares core business logic, Zustand hooks, and API schemas with the mobile Expo codebase.

### 14.1 Framework, Bundler, & PWA Config
*   **Core Stack:** React 18, Vite (for rapid HMR and optimized builds), TypeScript (for API type-safety), and TailwindCSS (for native-like styling).
*   **PWA Integrations:** Configured via `vite-plugin-pwa` to auto-inject the service worker manifest.
*   **PWA Configuration (`vite.config.ts`):**
    *   *Mode:* `generateSW` to automatically package build assets.
    *   *Service Worker Cache Strategies:*
        *   **Static Assets (CSS, JS, Fonts):** Cached via Cache-First strategy to allow instant offline rendering.
        *   **API Data (Leaderboards, Challenge Details):** Cached via Stale-While-Revalidate to ensure users see local rankings immediately while fetching fresh records in the background.

```typescript
// vite.config.ts (PWA Segment example)
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.fitnaija\.ng\/api\/v1\/(challenges|users)/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 86400, // 24 Hours
              }
            }
          }
        ]
      }
    })
  ]
});
```

### 14.2 Routing Structure & Route Guards
Navigation is handled by `react-router-dom` with explicit security wrappers:

```
                  [Root Routing Hub]
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   [Guest Routes]    [Auth Routes]     [Admin Routes]
   (Public Access)   (JWT Required)    (Admin Role Guard)
         │                 │                 │
         ├─ /login         ├─ /onboarding    └─ /admin/ledger
         └─ /register      ├─ /challenges
                           ├─ /challenges/:id
                           ├─ /log-workout
                           └─ /support-chat
```

*   **Route Guards:**
    *   `GuestGuard`: Redirects authenticated users away from `/login`.
    *   `AuthGuard`: Redirects unauthenticated users to `/login`.
    *   `TrialStatusGuard`: Evaluates user status. If status is `trial_expired` or `subscription_expired`, restricts access and redirects to `/subscribe` checkout view.

### 14.3 State Management & API Syncing (React Query + Zustand)
1.  **Zustand Auth Store (`useAuthStore`):** Manages user session state (`accessToken`, `refreshToken`, `currentUserProfile`, `onboardingCompleted`). Persists session variables to `localStorage`.
2.  **Zustand Telemetry Store (`useTelemetryStore`):** Holds offline submission queues. If a user logs a workout while offline, the payload is serialized into `IndexedDB` via Zustand middleware.
3.  **React Query Cache Layer:** Caches API requests with custom hook configurations:
    *   `useQuery` fetches challenge leaderboards every 60 seconds (when online).
    *   `useMutation` coordinates log synchronization. If mutation triggers connection errors, the record is placed in the offline queue, prompting the user with a "Sync pending - offline" alert.

### 14.4 Responsive Mobile-First Design System
*   **Adaptability:** TailwindCSS grids handle responsiveness. The screen switches dynamically:
    *   *Mobile Screens (< 768px):* Bottom tab bar navigation, full-width single-column challenge lists, fullscreen chatbot screens.
    *   *Desktop Screens (>= 768px):* Left sidebar navigation, dual-panel challenge viewer (explorer on the left, challenge details + leaderboard pinned on the right), slide-out chat sidebar.
*   **Theme Tokens:** Locally inspired color palette emphasizing Abuja Green (#008753), sunset orange highlights (#FF6B35), dark mode neutrals (#121212), and glassmorphic card containers.

### 14.5 Telemetry Input & Screen-Compression Logic
*   **Workout Log Form:** Built with `react-hook-form` and validated via `zod`. Fields collect: activity type, duration, distance, steps, and optional screenshot files.
*   **Screenshot Compression Utility:** To prevent high cellular data billing and speed up uploads over Abuja MTN/Airtel 3G networks:
    1.  User selects a workout screenshot (smartwatch dial, treadmill screen).
    2.  An HTML5 canvas utility parses the image file locally in-browser.
    3.  The canvas resizes the image to a maximum width of 800px and converts it to a compressed JPEG format (quality setting: 0.75).
    4.  The reduced base64 / blob payload is uploaded to S3, reducing upload weight by up to 90% (typically from 5MB down to ~300KB).

