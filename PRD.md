# AI-Powered Fitness Challenge App – Unified PRD & Architecture

**Product:** FitNaija  
**Market:** Abuja, Nigeria (initial) with Extended Regions  
**Phase:** Minimum Viable Product (MVP)  
**Version:** 4.0 – Simplified Prototype Locked  
**Date:** 2026-05-28

---

## 1. Executive Summary

FitNaija is a dual-platform (Web + Mobile App) fitness challenge prototype designed to solve the accountability crisis among Abuja professionals without using restricted health APIs or sensitive biometrics. Users participate in community challenges by entering manual workout logs and uploading optional screenshot proofs (e.g. photos of treadmill displays or outdoor paths).

The platform utilizes a **Gemini + Groq AI strategy** (Google Gemini handles reasoning, vision validation, and primary agent logic; Groq provides low-latency chats and fallback layers). New users register for a **1-month free trial** structured around a value-first onboarding flow. After the trial, users subscribe at a rate of **₦15,000/month** to maintain access. Challenge payouts are processed **manually** by administrators to eliminate complex payout integrations and maintain audit simplicity.

---

## 2. Onboarding & Conversion Optimization

To justify the ₦15,000/month pricing and maximize trial-to-paid conversion rates, the onboarding flow is optimized for value activation:
1.  **Value-First Entry (Milestone 1):** Users register with their phone number and are immediately dropped into the challenge directory. The payment screen is completely bypassed on registration.
2.  **Immediate Engagement (Milestone 2):** Users are prompted to join a free local warmup challenge. The app generates their rank and showcases the community leaderboard.
3.  **Early Success Indicator (Milestone 3):** Submitting their first manual log updates the leaderboard immediately. The AI Coach pushes a motivational message showing their progress, demonstrating the core value loop.
4.  **Billing Transition:** Subscription billing is prompted only when the 30-day trial expires or when the user joins high-stakes cash challenges.

---

## 3. Target Location Taxonomy

To enable local competition, user profiles and challenges are classified under a defined taxonomy:
*   **Abuja:** Maitama, Wuse, Garki, Asokoro, Apo, Lokogoma, Guzape, Lugbe, Kubwa.
*   **Extended Regions:** Lagos, Port Harcourt.

Stored as a normalized enum in the PostgreSQL database, this serves as a filter for user profiles, challenge scopes, and leaderboard listings.

---

## 4. Feature Set (MVP Scope)

1.  **Authentication & Onboarding**
    *   OTP verification via Termii (SMS and WhatsApp fallback).
    *   Onboarding milestones aimed at early success indicators and value activation.
2.  **App Store Compliant Telemetry**
    *   Zero HealthKit / Google Fit API dependencies.
    *   Manual logging forms (activity type, duration, distance, steps estimate).
    *   Optional workout proof upload verified via Gemini Multimodal Vision API.
3.  **Leaderboard Engine**
    *   Redis Sorted Sets (`ZADD`, `ZREVRANGE`) maintaining live user rankings based on verified entries.
4.  **Gemini + Groq AI Routing**
    *   **Google Gemini:** Primary reasoning engine, agent state planner, and Vision API processor.
    *   **Groq:** Fast chat stream responses and primary system fallback layer.
5.  **Billing & Entitlements**
    *   ₦15,000/month subscription processed through Paystack. Entitlement mapping is synced via RevenueCat.
6.  **WhatsApp Share Loops**
    *   Deep-link message generation for challenge invitations.
7.  **Manual Payout Processing**
    *   Exportable CSV ledgers compiled by the backend for manual bank transfers.

---

## 5. Out‑of‑Scope (MVP)

*   In-app social messaging grids or direct chats.
*   Medical health advice, caloric analysis, or workout generators.
*   Direct smartwatch integrations or native health APIs.
*   Automated payout transfers (disabled; manual bank transfers only).
*   Unused AI models and multi-provider dynamic cost routing beyond Gemini + Groq.

---

## 6. User Stories

*   As a user, I want to sign up with my phone number and immediately see active local challenges.
*   As a user, I want to log my running sessions manually and see my rank update on the neighborhood leaderboard.
*   As a user, I want a 1-month free trial so I can try the challenges before paying the ₦15,000/month subscription.
*   As an admin, I want all workout logs verified by Gemini Vision and a rules engine to check for duplicates and prevent cheating.
*   As an admin, I want to export payout ledgers as a CSV so I can manually disburse challenge funds.

---

## 7. Functional Requirements

### 7.1 Location Taxonomy
*   **FR-01: Onboarding Location Select:** New registrations require verification against the target location taxonomy (Abuja neighborhoods, Lagos, or Port Harcourt).
*   **FR-02: Challenge Scoping:** Challenges are scoped to specific locations in the database.

### 7.2 Telemetry Ingestion & Verification
*   **FR-03: Workout Logging:** Users submit forms containing: activity type, duration, distance, steps, and optional proof image.
*   **FR-04: Multimodal Audit:** Google Gemini Vision extracts the text from uploaded screenshots and checks for duplicate image hashes in the database.
*   **FR-05: Anomaly Rules Engine:** System compares inputs against physical limits (e.g. pace > 45 km/h, daily steps > 50,000).

### 7.3 Gemini + Groq Routing & LangGraph
*   **FR-06: API Routing Layer:** 
    *   Google Gemini handles complex agent reasoning, LangGraph plans, and Vision screenshot OCR processing.
    *   Groq handles fast conversational chat streams. If Groq triggers errors, requests fall back to Gemini.
*   **FR-07: RAG (`pgvector`):** The AI Coach retrieves neighborhood routes and challenge rules from the PostgreSQL database using semantic vector searches.
*   **FR-08: Memory Management:** Chat logs store context in `chat_messages`. Summaries are compiled periodically, updating a semantic memory node in the vector DB.

### 7.4 Billing & Manual Settlement
*   **FR-09: Onboarding Activation:** New users start with a 1-month free trial (`trial_active`). Expiry shifts state to `trial_expired`.
*   **FR-10: Subscription Billing:** ₦15,000/month processed through Paystack. Successful payment webhooks update state to `subscribed_active`.
*   **FR-11: Manual Settlement:** Challenge completes → 48-hour appeal window → admin exports final verified winner CSV ledger → admin processes transfers via bank portal/Paystack dashboard.

---

## 8. System Architecture

```
┌────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                      │
│      React Native Client   +   React PWA Fallback      │
└───────────┬────────────────────────────────┬───────────┘
            │                                │
            │ HTTPS Form Ingest              │ LLM SSE Streaming
            ▼                                ▼
┌────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND                     │
│                                                        │
│  ┌───────────────────┐           ┌───────────────────┐ │
│  │ Ingestion & Rules │           │ LangGraph Agent   │ │
│  │ (Gemini Vision)   │           │ Routing Layer     │ │
│  └────────┬──────────┘           └────────┬──────────┘ │
│           │                               │            │
└───────────┼───────────────────────────────┼────────────┘
            │                               │
    ┌───────┴───────┐               ┌───────┴────────┐
    ▼               ▼               ▼                ▼
┌───────┐       ┌───────┐       ┌───────┐       ┌────────┐
│ Postg-│       │ Redis │       │ pgve- │       │ Gemini │
│ reSQL │       │ (Set) │       │ ctor  │       │ & Groq │
└───────┘       └───────┘       └───────┘       └────────┘
```

---

## 9. Database Schema (Logical Models)

*   **users:** `id` (UUID), `phone` (unique), `display_name`, `location` (enum), `status` (trial_active, trial_expired, subscribed_active, subscription_expired), `trial_start`, `trial_end`, `bank_account`, `bank_code`.
*   **challenges:** `id` (UUID), `title`, `activity_type`, `entry_fee`, `prize_pool`, `start_date`, `end_date`, `location_scope` (enum), `status` (upcoming, active, verification, settled).
*   **activity_logs:** `id`, `user_id`, `challenge_id`, `steps`, `distance_m`, `duration_sec`, `proof_image_url`, `is_verified` (bool), `fraud_score`, `created_at`.
*   **transactions:** `id`, `user_id`, `challenge_id`, `amount`, `transaction_type` (subscription, entry_fee), `reference` (unique), `status` (pending, success, failed).
*   **fitness_knowledge_embeddings:** `id`, `content`, `metadata` (JSONB), `embedding` (vector(1536)).
*   **chat_messages:** `id`, `user_id`, `role`, `content`, `created_at`.
