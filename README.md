# FinOS: Personal Finance Operating System

FinOS is a self-hosted personal finance and wealth intelligence platform designed to unify fragmented banking records, track real-time cash flow, enforce category budgets, and deliver financial insights backed by deterministic analytics and AI.

---

## 1. Overview

Managing personal finances often involves fragmented tools: banking apps for daily UPI payments, separate portals for investments, and manual spreadsheets that quickly become obsolete. This fragmentation leaves users with two critical blind spots:
1. Cash Flow Visibility: Understanding exactly where money flows each month across income, fixed obligations, and discretionary spending.
2. Wealth Clarity: Understanding whether net savings and investments are keeping pace with real inflation.

FinOS bridges these gaps. It provides an automated double-entry-style cash flow ledger, bank statement ingestion for CSV and PDF records, monthly category budgets with zero rollover, milestone savings goals, and an AI financial assistant grounded strictly in verified numbers.

---

## 2. Key Features

- Cash Flow Ledger: Track income and expenses with decimal-precision arithmetic, a controlled 18-category taxonomy, real-time debounced search (350ms), and multi-criteria filtering.
- Statement Ingestion Engine: Upload CSV and text-based PDF bank statements up to 10MB. Features automatic delimiter sniffing, column detection, scanned-document screening, and 4-tuple duplicate transaction fingerprinting.
- Server-Side Stored Previews: Uploaded statements generate temporary previews with a 24-hour expiration window before committing transactions to the primary ledger.
- Monthly Category Budgets: Configure monthly expense limits with real-time spending aggregation from transactions, automatic status derivation (On Track, Near Limit, Over Budget), and an explicit no-rollover policy.
- Financial Milestone Goals: Track progress toward target savings amounts with automatic progress percentages and completion states.
- Lightweight SVG Visualizations: Zero-dependency responsive SVG charts for monthly cash flow trends and category spending distributions.
- Two-Tier Auto-Categorization: Instant regex normalization for 40+ common merchants, falling back to Groq Cloud (Qwen 3.8 27B) with strict JSON Schema output.
- Human-in-the-Loop AI Mutations: AI category suggestions remain in a pending state until explicitly approved or rejected by the user. Core financial data is never modified autonomously.
- Grounded AI Financial Assistant: Interactive natural-language interface answering spending queries using pre-calculated deterministic figures. Declines speculative investment and tax advice.
- Tenant Isolation: End-to-end user isolation powered by PostgreSQL Row-Level Security (RLS) on all tables, Supabase Auth, and FastAPI Bearer token verification.

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend Framework | Next.js (App Router) | 15.1.7 | Server and client rendering, route handling, edge middleware |
| UI Library | React | 19.0.0 | Component rendering, interactive dashboard views |
| Language (Frontend) | TypeScript | 5.7.3 | Static typing and shared data contracts |
| Styling | Tailwind CSS | 3.4.17 | Dashboard layout and utility styling |
| Icons | Lucide React | 0.475.0 | Dashboard iconography |
| Auth & SSR Client | @supabase/ssr, @supabase/supabase-js | 0.5.2, 2.49.1 | Cookie-based session management and browser auth |
| Backend Framework | FastAPI | 0.110.0+ | Asynchronous REST API server with automatic OpenAPI generation |
| ASGI Server | Uvicorn | 0.28.0+ | High-performance Python async runtime |
| Language (Backend) | Python | 3.11+ / 3.13 | API routes, business logic, data parsing |
| Data Validation | Pydantic, Pydantic Settings | 2.6.0+ | Runtime validation, decimal constraints, settings management |
| Database & Auth | Supabase (PostgreSQL 15+) | Managed | Relational persistence, Row-Level Security, user auth |
| File Parsing | pypdf, python-multipart | 5.0.0+, 0.0.9+ | PDF text extraction and multipart file upload handling |
| AI Inference | Groq SDK (Qwen 3.8 27B) | 1.7.0+ | Structured output generation for categorization and insights |

---

## 4. Repository Structure

```text
FinOS/
|-- backend/
|   |-- app/
|   |   |-- api/
|   |   |   |-- deps.py                  # Bearer token auth dependency
|   |   |   \-- routes/                  # API route controllers (8 modules)
|   |   |-- core/                        # Configuration and settings parser
|   |   |-- db/                          # Supabase client singleton
|   |   |-- schemas/                     # Pydantic request and response contracts
|   |   |-- services/                    # Business logic, normalizers, and parsers
|   |   \-- main.py                      # FastAPI app entry point and CORS setup
|   |-- supabase/
|   |   \-- migrations/                  # 5 sequential SQL migration files
|   |-- requirements.txt                 # Backend Python dependencies
|   |-- run.py                           # Development server runner
|   \-- .env.example                     # Backend environment template
|
|-- frontend/
|   |-- app/
|   |   |-- (auth)/                      # Login and signup routes
|   |   |-- dashboard/                   # Authenticated user pages (Overview, Ledger, etc.)
|   |   |-- layout.tsx                   # Root HTML layout
|   |   |-- page.tsx                     # Public landing page
|   |   \-- globals.css                  # Tailwind styles
|   |-- components/                      # Reusable UI components and SVG charts
|   |-- lib/                             # Supabase clients and API fetch layer
|   |-- middleware.ts                    # Edge session refresh and route protection
|   |-- package.json                     # Frontend dependencies and npm scripts
|   \-- .env.example                     # Frontend environment template
|
|-- README.md                            # Project overview and architecture summary
|-- RUN_INSTRUCTIONS.md                  # Step-by-step local execution guide
|-- ENGINEERING.md                       # Deep architectural manual and system reference
|-- HOSTING.md                           # Production deployment guide
\-- FEATURES.md                          # End-user feature manual
```

---

## 5. Quick Start

### Step 1: Database Setup
1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor and execute all 5 migrations in order from `backend/supabase/migrations/`:
   - `001_initial_schema.sql`
   - `002_transactions_schema.sql`
   - `003_statement_imports_schema.sql`
   - `004_ai_suggestions_schema.sql`
   - `005_financial_planning_schema.sql`
3. Under Authentication -> Providers -> Email, set Confirm email to OFF for local testing.

### Step 2: Backend Configuration and Startup
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux / macOS:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your SUPABASE_URL, SUPABASE_KEY, and GROQ_API_KEY
python run.py
```
- Backend API runs at `http://localhost:8000`
- Interactive Swagger docs available at `http://localhost:8000/docs`

### Step 3: Frontend Configuration and Startup
Open a second terminal window:
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npm run dev
```
- Frontend application runs at `http://localhost:3000`

---

## 6. Documentation Index

- [RUN_INSTRUCTIONS.md](file:///c:/Users/Vansh%20Gupta/Desktop/FinOS/RUN_INSTRUCTIONS.md): Detailed local execution, environment setup, testing, and linting procedures.
- [ENGINEERING.md](file:///c:/Users/Vansh%20Gupta/Desktop/FinOS/ENGINEERING.md): Exhaustive engineering specification covering data flow, database schemas, API contracts, algorithms, design decisions, and failure modes.
- [HOSTING.md](file:///c:/Users/Vansh%20Gupta/Desktop/FinOS/HOSTING.md): Production deployment manual for Vercel, Render, Supabase, and Groq Cloud.
- [FEATURES.md](file:///c:/Users/Vansh%20Gupta/Desktop/FinOS/FEATURES.md): Functional user guide detailing each feature, navigation path, and usage workflow.
