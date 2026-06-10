# Product Requirements Document (PRD)

**Product:** FitNaija  
**Market:** Abuja, Nigeria (with extended regions)  
**Phase:** Minimum Viable Product (MVP)  
**Status:** Simplified Prototype Locked  

---

## 1. Executive Summary
FitNaija is a dual-platform (Web + Mobile App) fitness challenge prototype designed to solve the accountability crisis among Nigerian professionals without utilizing restricted health APIs or biometrics. Users participate in community challenges by entering manual workout logs and uploading optional screenshot proofs (e.g. photos of treadmill displays or outdoor paths). 

The platform utilizes a **simplified AI strategy** restricted to **Google Gemini** (primary reasoning, multimodal screenshot verification, and primary handler) and **Groq** (ultra-fast inference and fallback layer). New users register for a **1-month free trial** with an onboarding flow designed to demonstrate core value before any billing prompts. After the trial, users subscribe at a rate of **₦15,000/month** to maintain access. Challenge payouts are processed **manually** by administrators to maintain simplicity and audit compliance.

---

## 2. Onboarding & Conversion Optimization
To maximize trial-to-paid conversion rates, the user onboarding flow prioritizes value-first user activation before presenting the ₦15,000/month payment decision:
*   **Milestone 1 (Zero Friction Onboarding):** OTP authentication instantly logs the user in and routes them to a simple location selection. No upfront card requests.
*   **Milestone 2 (First-Use Value Demonstration):** Users immediately browse local challenges and join a free "Welcome Abuja Warmup Challenge" to experience the leaderboard.
*   **Milestone 3 (Early Success Indicators):** Log submission triggers a motivational push showing their rank update. The system demonstrates the accountability feedback loop within their first 5 minutes of app use.
*   **Subscription Prompt:** Billing screens are displayed only after the 1-month trial concludes or when joining high-stakes premium challenges.

---

## 3. Target Location Taxonomy
*   **Abuja:** Maitama, Wuse, Garki, Asokoro, Apo, Lokogoma, Guzape, Lugbe, Kubwa.
*   **Extended Regions:** Lagos, Port Harcourt.

---

## 4. Product Features (MVP Scope)

1.  **Authentication & Onboarding**
    *   OTP verification via Termii (SMS & WhatsApp).
    *   Milestone-based onboarding flow with immediate entry to free warmup challenges.
2.  **App Store Compliant Telemetry**
    *   Zero HealthKit / Google Fit API dependencies.
    *   Form-based logging (activity type, duration, distance, steps estimate).
    *   Optional image upload parsed and verified via Gemini Multimodal Vision API.
3.  **Real-Time Leaderboards**
    *   Live rankings backed by Redis Sorted Sets, updated based on verified entries.
4.  **AI Routing System (Gemini + Groq)**
    *   **AI Coach:** Suggests challenges, fitness strategies, and local running routes in the user's neighborhood.
    *   **AI Support/Dispute Assistant:** Answers queries and compiles dispute claims.
    *   **Orchestration:** Google Gemini handles complex reasoning, vision OCR audits, and agent logic. Groq runs fast streaming chats and serves as the query fallback.
5.  **Billing & Entitlements**
    *   ₦15,000/month subscription processed through Paystack and tracked via RevenueCat entitlements.
6.  **WhatsApp Share Loops**
    *   Deep-link message generation for challenge invitations.
7.  **Manual Payout Settlement**
    *   Admin ledgers compiled into CSV exports for manual bank transfer processing.
