# OpticGuard AI — Tri-System Architecture Specification

> **Full-Stack Automated Visual Intelligence & Anomaly Detection Platform**  
> Architected into three decoupled systems: **Client** (Vercel), **Server** (Edge Gateway & Live Stream Hub), and **Backend** (Render + Supabase & Gemini Vision AI Core).

---

## 1. Tri-System Topology

```text
       ┌────────────────────────────────────────────────────────┐
       │                   1. CLIENT (Vercel)                   │
       │  React 18 + Vite + Tailwind CSS + Lucide + Recharts    │
       │  - Deploy Target: Vercel (vercel.json)                 │
       │  - Dedicated Env: client/.env                          │
       │  - Uses: VITE_SUPABASE_ANON_KEY & VITE_SUPABASE_URL    │
       └────────────────────────┬──────────────────────┬────────┘
                                │                      │
                 HTTP REST / WS │                      │ Supabase Realtime Channels
                                ▼                      ▼
       ┌────────────────────────┴────────┐   ┌───────────────────────────┐
       │     2. SERVER (Edge Gateway)    │   │      SUPABASE CLOUD       │
       │  Express + WebSocket Relay      │   │  Postgres DB & Storage    │
       │  - Dedicated Env: server/.env   │   │  - schema.sql             │
       │  - Port: 5001                   │   │  - RLS Policies           │
       │  - Stream telemetry & caching   │   │  - Realtime Publications  │
       └────────────────┬────────────────┘   └─────────────▲─────────────┘
                        │                                  │
         Forward / Sync │                                  │ Service Role Key & CRUD
                        ▼                                  │
       ┌────────────────┴──────────────────────────────────┴────────────┐
       │                  3. BACKEND CORE (Render)                      │
       │  Express + Google Gemini Vision 2.5 Flash + Local Fallback     │
       │  - Deploy Target: Render (render.yaml / Dockerfile)            │
       │  - Dedicated Env: backend/.env                                 │
       │  - Uses: SUPABASE_URL, SUPABASE_ANON_KEY &                     │
       │          SUPABASE_SERVICE_ROLE_KEY                             │
       │  - Port: 5000 (Local) / 10000 (Render)                         │
       └────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure & Dedicated `.env` Files

```text
Power Rangers/
├── client/                     # [SYSTEM 1] Vercel Web Application
│   ├── .env                    # Vercel Client Environment File
│   ├── .env.example            # Client Template
│   ├── vercel.json             # Vercel Route Rewrites & Caching Rules
│   ├── src/
│   │   ├── services/
│   │   │   ├── api.js          # REST Client (Points to VITE_API_URL)
│   │   │   ├── socket.js       # WebSocket Client (Points to VITE_WS_URL)
│   │   │   └── supabaseClient.js # Browser Supabase (VITE_SUPABASE_ANON_KEY)
│   │   └── ...                 # UI Components, Canvas, Pages
│   └── package.json
│
├── server/                     # [SYSTEM 2] Edge Gateway & Stream Relay
│   ├── .env                    # Server Gateway Environment File
│   ├── .env.example            # Server Template
│   ├── src/
│   │   └── server.js           # WebSocket Relay Hub & Gateway
│   └── package.json
│
├── backend/                    # [SYSTEM 3] Core Backend Service (Render + Supabase)
│   ├── .env                    # Backend Environment File (Supabase Keys)
│   ├── .env.example            # Backend Template
│   ├── render.yaml             # Render Blueprint Deploy Specification
│   ├── Dockerfile              # Production Container for Render
│   ├── supabase/
│   │   └── schema.sql          # Supabase SQL Schema, Tables, RLS & Seed
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js          # Backend Config Parser
│   │   │   └── supabase.js     # Supabase Service-Role Client
│   │   ├── services/
│   │   │   ├── supabaseService.js # Supabase Cloud CRUD with Local Fallback
│   │   │   ├── geminiVisionService.js # Multimodal AI Vision
│   │   │   └── localVisionService.js  # Edge Fallback Engine
│   │   └── server.js
│   └── package.json
│
├── .env                        # Master Root Reference
├── .env.example                # Master Root Template
├── render.yaml                 # Root Render Blueprint
└── dev-runner.js               # Concurrently boots all 3 systems
```

---

## 3. Dedicated `.env` Files Reference

### System 1: `client/.env` (Vercel)
```env
# Backend API (Render deployment or local)
VITE_API_URL=http://localhost:5000/api

# WebSocket Server (Render deployment or local)
VITE_WS_URL=ws://localhost:5000/ws

# Supabase Public Anon Credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
```

### System 2: `server/.env` (Edge Gateway)
```env
PORT=5001
NODE_ENV=development
HOST=0.0.0.0
CLIENT_ORIGIN=http://localhost:3000,http://localhost:5173
BACKEND_SERVICE_URL=http://localhost:5000

# Supabase Credentials for Gateway Event Mirroring
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
```

### System 3: `backend/.env` (Render + Supabase Core)
```env
PORT=5000
NODE_ENV=development
HOST=0.0.0.0
CLIENT_ORIGIN=http://localhost:3000,http://localhost:5173

# Supabase Cloud Database & Storage Credentials (Includes Service Role Secret Key)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_key_here

# Google Gemini Visual Intelligence
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Thresholds & Storage
ANOMALY_CONFIDENCE_THRESHOLD=0.65
ENABLE_SIMULATED_STREAMS=true
ALERT_SOUND_ENABLED=true
ALERT_WEBHOOK_URL=https://webhook.site/opticguard-demo-endpoint
STORAGE_DIR=./uploads
DATABASE_FILE=./src/database/opticguard.db.json
```

---

## 4. Supabase Setup Instructions

1. Create a project at [https://supabase.com](https://supabase.com).
2. Open the **SQL Editor** tab in your Supabase dashboard.
3. Paste and run the contents of [`backend/supabase/schema.sql`](file:///c:/Users/shive/Power%20Rangers/backend/supabase/schema.sql).
   - Creates `cameras`, `incidents`, `inspections`, and `settings` tables.
   - Sets up Row Level Security (RLS) policies.
   - Enables Supabase Realtime publication.
   - Populates initial camera feeds and baseline incident data.
4. Copy your project credentials from **Project Settings -> API**:
   - `Project URL` -> `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - `anon public` -> `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
   - `service_role secret` -> `SUPABASE_SERVICE_ROLE_KEY`
5. Paste these into `backend/.env` and `client/.env`.

---

## 5. Deployment Guide

### Deploy Backend on Render
1. Push this repository to GitHub/GitLab.
2. In [Render Dashboard](https://dashboard.render.com/), click **New -> Blueprint**.
3. Select this repository. Render automatically reads [`render.yaml`](file:///c:/Users/shive/Power%20Rangers/render.yaml).
4. Fill in the environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
5. Click **Apply**. Render will deploy the web service with automatic health checks on `/api/health`.

### Deploy Client on Vercel
1. In [Vercel Dashboard](https://vercel.com/new), import this repository.
2. Set **Root Directory** to `client`.
3. Add the environment variables:
   - `VITE_API_URL`: Your Render backend URL (e.g. `https://opticguard-backend.onrender.com/api`)
   - `VITE_WS_URL`: Your Render WebSocket URL (e.g. `wss://opticguard-backend.onrender.com/ws`)
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
4. Click **Deploy**. Vercel will build the React SPA using [`client/vercel.json`](file:///c:/Users/shive/Power%20Rangers/client/vercel.json).

---

## 6. Local Development

Run all 3 systems simultaneously with one command:
```powershell
npm run dev
```

Or run each system individually:
```powershell
# Run Client (Port 3000)
npm run dev:client

# Run Gateway Server (Port 5001)
npm run dev:server

# Run Backend Service (Port 5000)
npm run dev:backend
```
