# Software Requirements Specification (SRS)
## AI-Powered Fitness Challenge App ("FitNaija")

**Version:** 4.0  
**Date:** 2026-05-28  
**Author:** Senior AI Product Architect  
**Status:** Simplified Prototype Locked

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the complete functional, non-functional, interface, and data requirements for **FitNaija**—a dual-platform (Web + Mobile App) fitness challenge prototype.

### 1.2 Scope
The FitNaija platform provides:
*   OTP authentication via phone number.
*   A default 1-month free trial upon registration with value-first onboarding milestones.
*   A monthly subscription (₦15,000/month) processed through Paystack.
*   Naira-denominated cash-prize challenges with Redis-backed real-time leaderboards.
*   App Store and Play Store compliant workout tracking (manual inputs + screenshot uploads).
*   A simplified AI routing system using Google Gemini and Groq (OpenAI is removed).
*   An AI verification engine utilizing Gemini Vision API to verify workout screenshot proofs.
*   A LangGraph conversational agent integrating a pgvector database for RAG (coaching content) and semantic memory (user profiles).
*   An AI Support/Dispute Assistant to coordinate appeals conversationally.
*   Manual payout processing workflows for administrative validation.

Out-of-scope for MVP: In-app social feeds, medical health claims, direct wearable biometric integrations, automated payout execution, and multi-provider dynamic cost routing beyond Gemini + Groq.

---

## 2. General Description

### 2.1 Location Taxonomy System
Users must configure their profile under a predefined location taxonomy:
*   **Abuja:** Maitama, Wuse, Garki, Asokoro, Apo, Lokogoma, Guzape, Lugbe, Kubwa.
*   **Extended Regions:** Lagos, Port Harcourt.

### 2.2 Design & Implementation Constraints
*   Paystack serves as the gateway for Naira collections.
*   RevenueCat tracks subscription entitlements.
*   Zero native health APIs (no HealthKit / Google Fit API usage).
*   User registration uses phone number OTP with no passwords.
*   Automated payouts are disabled; all disbursements are processed manually via ledger exports.
*   Backend must run in compliance with the Nigeria Data Protection Regulation (NDPR).

---

## 3. Functional Requirements

### 3.1 Onboarding & On-Device Logs
*   **FR-01: Onboarding Location Capture:** New registrations require select validation against the target location taxonomy (Abuja neighborhoods, Lagos, or Port Harcourt).
*   **FR-02: Onboarding Milestones:** 
    *   *Step 1 (OTP Verification):* User enters phone number and instantly verifies OTP, initializing state to `trial_active` with a `trial_end` timestamp set to `NOW() + 30 days`.
    *   *Step 2 (Directory Entry):* User immediately enters active challenges list. Payment screen is bypassed.
    *   *Step 3 (Immediate Challenge Entry):* User joins a free local warmup challenge. The app shows the leaderboard rank (initialized to 0).
*   **FR-03: Trial Expiration:** When current time exceeds the user's `trial_end` timestamp, the system changes user state to `status = trial_expired`. The client restricts access and directs the user to the subscription flow.
*   **FR-04: Paystack Subscription Setup:** Users pay ₦15,000/month to reactivate access. Webhooks verify transactions and update RevenueCat entitlements.

### 3.2 Ingestion & Multimodal Verification
*   **FR-05: Manual Form Ingestion:** Users submit log entries: activity type, duration, distance, steps estimate, and optional screenshot proof image via `POST /api/v1/activity/sync`.
*   **FR-06: Gemini Multimodal Verification:** The backend dispatches uploaded images to the Google Gemini Vision API to verify that:
    *   Text on the screenshot matches the values entered in the form.
    *   The image hash does not match previous submissions (duplicate detection).
*   **FR-07: Rule-Based Filtering:** Validates inputs against physical limits (e.g. pace > 45 km/h, daily steps > 50,000). If anomalies are found, logs are flagged as `hard_flag`, freezing the user's leaderboard score.

### 3.3 Gemini + Groq AI Routing & LangGraph
*   **FR-08: Model Routing Layer:** A unified abstraction routes LLM operations dynamically:
    *   Google Gemini handles complex agent reasoning, LangGraph plans, and Vision screenshot OCR processing.
    *   Groq handles fast conversational chat streams. If Groq triggers errors, requests fall back to Gemini.
*   **FR-09: Semantic RAG (`pgvector`):** The AI Coach retrieves neighborhood routes and challenge rules from the PostgreSQL database using semantic vector searches.
*   **FR-10: Memory Management:** Chat logs store context in `chat_messages`. Summaries are compiled periodically, updating a semantic memory node in the vector DB.

### 3.4 Challenge Settlement & Finance
*   **FR-11: Leaderboard Sync:** Clean and verified steps are added to the challenge's Redis Sorted Set (`leaderboard:{challenge_id}`).
*   **FR-12: Payout Ledger Generation:** At the end of a challenge and its 48-hour appeal window, the backend generates a CSV ledger.
*   **FR-13: Manual Payout Execution:** The admin processes bank transfers via the bank portal or Paystack dashboard, then marks the challenge as `settled` in the database.

---

## 4. Non-Functional Requirements

### 4.1 Performance & Compliance
*   **NFR-01:** Image upload and Gemini Multimodal verification should process in < 5 seconds.
*   **NFR-02:** Chat streams must start returning tokens within 1.5 seconds via Groq.
*   **NFR-03:** Full compliance with Apple App Store and Google Play policies. Medical claims, biometric collection, and restricted health APIs are disabled.
*   **NFR-04:** NDPR data protection compliance.

---

## 5. System Interface Specifications

| Interface | Protocol | Purpose |
|---|---|---|
| **Google Gemini API** | HTTPS | Multimodal image processing / OCR verification and core agent reasoning |
| **Groq API** | HTTPS | High-speed conversational streaming and primary fallback routing |
| **Paystack API** | HTTPS | Process recurring subscriptions (₦15,000/month) and challenge entry fees |
| **RevenueCat REST API**| HTTPS | Sync purchases and verify active entitlements |
| **Termii API** | HTTPS | Dispatch SMS OTP and WhatsApp fallback codes |
