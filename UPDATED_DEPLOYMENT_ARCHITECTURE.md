# FitNaija: Deployment & Infrastructure Specification (Render + Netlify)

This document provides the finalized production-ready deployment and infrastructure specification for **FitNaija**—frozen under Version 4.0. It maps the backend modular monolith and background worker stack to **Render** and the frontend web Progressive Web Application (PWA) fallback to **Netlify**.

---

## 1. High-Level Infrastructure Diagram

```
                             [Cloudflare WAF / DNS]
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼ (HTTPS Port 443)                                    ▼ (HTTPS Port 443)
┌──────────────────────────────────────┐                ┌──────────────────────────────────────┐
│         NETLIFY FRONTEND PWA         │                │         RENDER BACKEND STACK         │
│                                      │                │                                      │
│  * React Vite PWA Static Hosting     │                │  * FastAPI Web Service (Web Server)  │
│  * Edge CDN Caching & Compression   │                │  * Celery Background Workers         │
│  * SPA Routing Fallbacks             │                │  * Redis Cache & Task Queue Broker   │
│  * Production Asset Optimization     │                │  * PostgreSQL + pgvector Database    │
└──────────────────┬───────────────────┘                └──────────────────┬───────────────────┘
                   │                                                       │
                   └───────────────── HTTPS API Queries ───────────────────┘
```

---

## 2. Backend Infrastructure on Render

The backend services are orchestrated using Render’s managed environment configurations via a declarative `render.yaml` configuration.

### 2.1 Render Services Mapping
1.  **FastAPI API Web Service (`web`):**
    *   *Type:* Web Service
    *   *Environment:* Python or Docker
    *   *Build Command:* `pip install -r backend/requirements.txt`
    *   *Start Command:* `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
    *   *Scaling:* Auto-scales based on CPU utilization metrics.
2.  **Celery Background Worker (`worker`):**
    *   *Type:* Background Worker (no public port exposure)
    *   *Build Command:* `pip install -r backend/requirements.txt`
    *   *Start Command:* `celery -A backend.app.celery_worker.celery worker --loglevel=info`
3.  **Celery Beat Scheduler (`cron`):**
    *   *Type:* Background Worker (or Cron Service)
    *   *Build/Start Command:* `celery -A backend.app.celery_worker.celery beat --loglevel=info`
4.  **PostgreSQL Database:**
    *   *Type:* Managed PostgreSQL (version 16) with native `pgvector` support.
5.  **Redis Cache & Broker:**
    *   *Type:* Managed Redis (version 7) configured as an in-memory cache and task queue broker.

### 2.2 PostgreSQL + pgvector Setup on Render
Render's managed PostgreSQL databases support the `pgvector` extension natively.
*   **Initialization:** Database migrations (handled via Alembic) trigger `CREATE EXTENSION IF NOT EXISTS vector;` on app startup. No manual CLI container commands are required.

### 2.3 CORS Configurations
To support secure cross-origin communication between the Netlify frontend domains and the Render API servers, the FastAPI app configures CORS middleware:

```python
# backend/app/core/config.py
from fastapi.middleware.cors import CORSMiddleware

ALLOWED_ORIGINS = [
    "https://fitnaija.netlify.app",        # Target Netlify custom domain
    "https://main--fitnaija.netlify.app", # Netlify preview branch deploys
    "http://localhost:5173",               # Local Vite development
]

def configure_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
```

---

## 3. Frontend Web App on Netlify

Netlify hosts the built static files for the React 18, Vite, and TailwindCSS Progressive Web Application (PWA).

### 3.1 Netlify Build Config (`netlify.toml`)
We deploy a `netlify.toml` file in the project workspace to manage build steps and caching policies:

```toml
[build]
  command = "npm run build"
  publish = "frontend-web/dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

### 3.2 SPA Route Guard Fallback (`_redirects`)
To support browser refreshes on SPA routes (e.g. `/challenges/123`, `/profile`) without triggering 404 errors, a `_redirects` file is written during compilation to the `dist/` directory:
```text
/*    /index.html   200
```

---

## 4. Declarative Infrastructure Blueprint (`render.yaml`)

This template automates the provisioning of databases, caches, web endpoints, and Celery workers on Render.

```yaml
services:
  # 1. FastAPI Web Server
  - type: web
    name: fitnaija-backend-api
    env: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PORT
        value: 10000
      - key: REDIS_URL
        fromService:
          type: redis
          name: fitnaija-redis
          property: connectionString
      - key: DATABASE_URL
        fromService:
          type: database
          name: fitnaija-postgres
          property: connectionString
      - key: TARGET_ENV
        value: production
      - key: GEMINI_API_KEY
        sync: false
      - key: GROQ_API_KEY
        sync: false
      - key: TERMII_API_KEY
        sync: false
      - key: PAYSTACK_SECRET_KEY
        sync: false
      - key: REVENUECAT_API_KEY
        sync: false

  # 2. Celery Worker (No public port)
  - type: worker
    name: fitnaija-celery-worker
    env: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: celery -A backend.app.celery_worker.celery worker --loglevel=info
    envVars:
      - key: REDIS_URL
        fromService:
          type: redis
          name: fitnaija-redis
          property: connectionString
      - key: DATABASE_URL
        fromService:
          type: database
          name: fitnaija-postgres
          property: connectionString
      - key: GEMINI_API_KEY
        sync: false
      - key: REVENUECAT_API_KEY
        sync: false

  # 3. Celery Beat Scheduler
  - type: worker
    name: fitnaija-celery-scheduler
    env: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: celery -A backend.app.celery_worker.celery beat --loglevel=info
    envVars:
      - key: REDIS_URL
        fromService:
          type: redis
          name: fitnaija-redis
          property: connectionString
      - key: DATABASE_URL
        fromService:
          type: database
          name: fitnaija-postgres
          property: connectionString

# Databases & Caches
databases:
  - name: fitnaija-postgres
    plan: starter # Starter plan recommended for pgvector support and custom queries
    postgresMajorVersion: 16

redis:
  - name: fitnaija-redis
    plan: starter
```

---

## 5. Environment Variables & Connection Strategies

### 5.1 Backend Environment Configurations (Render Environment)
Configure these variables securely in the Render dashboard:
*   `DATABASE_URL`: Injected dynamically from `fitnaija-postgres` connection string parameters.
*   `REDIS_URL`: Injected dynamically from `fitnaija-redis` connection parameters.
*   `GEMINI_API_KEY`: API access key for Google Gemini reasoning and screenshot validations.
*   `GROQ_API_KEY`: API access key for Groq streaming coach responses.
*   `TERMII_API_KEY`: Token to send OTPs via SMS and WhatsApp.
*   `PAYSTACK_SECRET_KEY`: Merchant payment validation secret key.
*   `REVENUECAT_API_KEY`: Token managing monthly subscription entitlements.

### 5.2 Frontend Environment Variables (Netlify UI)
Configure these variables in the Netlify project console:
*   `VITE_API_URL`: Points to the live Render endpoint (e.g. `https://fitnaija-backend-api.onrender.com`). *Vite requires the `VITE_` prefix to bundle variables securely into compiled client assets.*

---

## 6. Frontend/Backend Connection Flow

```
[Netlify Client App]
  │
  ├─ 1. POST /api/v1/auth/otp/send ───────────────► [Render Web API Gateway]
  │                                                        │
  │                                                        ▼
  │                                                [Termii SMS OTP]
  │
  ├─ 2. POST /api/v1/activity/sync (Form + Image) ─► [Render Web API Gateway]
  │                                                        │
  │                                                        ▼
  │                                                [Gemini Vision Audit]
  │
  ├─ 3. GET /api/v1/challenges/{id}/leaderboard ───► [Render Web API Gateway]
  │                                                        │
  │                                                        ▼
  │                                                [Redis Sorted Sets]
  │
  └─ 4. POST /api/v1/coach/chat ──────────────────► [Render Web API Gateway]
                                                           │
                                                           ▼
                                                    [Groq Stream / SSE]
```

---

## 7. Deployment Folder Structure

To verify where the build parameters reside, the project repository is scaffolded as follows:
```
fitnaija/
├── netlify.toml               # Netlify configuration file for Frontend Web build
├── render.yaml                # Render blueprint file provisioning Backend + DB + Redis
├── backend/
│   ├── requirements.txt       # Backend dependencies file
│   └── app/
│       └── main.py
└── frontend-web/
    ├── package.json           # Frontend packages
    ├── vite.config.ts         # Vite configuration with PWA service worker rules
    └── public/
        └── _redirects         # Static fallback routing rules
```
