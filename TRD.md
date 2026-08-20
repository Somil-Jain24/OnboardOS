# OnboardOS — Technical Requirements Document (TRD)

Version 1.0 | Companion to system-architecture.md, database-design.md

---

## 1. Technology Stack (decided — implementation.md §2, adopted)

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | fast dev loop, wide ecosystem |
| Styling | Tailwind CSS + shadcn/ui | premium enterprise look fast, avoids generic-template feel with custom tokens (see ui-ux-design.md) |
| Routing | React Router v6 | standard, nested routes fit role-based layouts |
| Server state | TanStack Query | caching, works identically against mock/API client (system-architecture.md §6) |
| Client/UI state | Zustand | lightweight, for simulation scratch state, demo control panel |
| Charts | Recharts | dashboards, risk/readiness visualizations |
| Graph | React Flow | Access Intelligence Graph (interactive node/edge) |
| Backend | Node.js + Express + TypeScript | API-driven orchestration fit (implementation.md §2) |
| ORM/DB | Prisma + PostgreSQL | relational entity fit (database-design.md) |
| Auth | JWT (access + refresh), Argon2 password hashing | stateless, simple RBAC |
| Validation | Zod (shared frontend/backend schemas where practical) | NFR-06 |
| AI | LLM API (Anthropic Claude) with structured/JSON output mode | structured requirement recommendations |
| RAG (P1) | pgvector extension on the same Postgres instance | avoid extra infra (implementation.md §2 "avoid another database unless necessary") |
| Testing | Vitest/Jest (unit), Supertest (API/integration), Playwright (E2E demo flow) | covers SRS §Testing Strategy |
| Deployment | Docker + Render/Railway/Fly (API+DB), Vercel/Netlify (frontend) | hackathon-pragmatic |

## 2. API Surface (representative — full contract lives in code via OpenAPI/Zod schemas)

```
POST   /api/auth/login
GET    /api/auth/me

GET    /api/employees
POST   /api/employees
GET    /api/employees/:id
PATCH  /api/employees/:id

POST   /api/employees/:id/plan/generate
GET    /api/employees/:id/plan
GET    /api/employees/:id/plan/items/:itemId/why

POST   /api/employees/:id/provisioning/start
GET    /api/employees/:id/tasks
POST   /api/tasks/:id/retry
POST   /api/tasks/:id/skip

GET    /api/employees/:id/access-graph

POST   /api/employees/:id/simulate          (What-If, no persistence)
POST   /api/employees/:id/apply-role-change  (persists, regenerates plan)

GET    /api/approvals?status=PENDING&approverRole=MANAGER
POST   /api/approvals/:id/approve
POST   /api/approvals/:id/reject
POST   /api/approvals/:id/request-info

GET    /api/employees/:id/risk
GET    /api/employees/:id/readiness
GET    /api/employees/:id/timeline
GET    /api/employees/:id/audit

GET    /api/hr/command-center
GET    /api/manager/team
GET    /api/it/operations

GET    /api/exceptions
PATCH  /api/exceptions/:id/resolve

-- P1 --
POST   /api/assistant/query
POST   /api/knowledge/query
POST   /api/tickets
GET    /api/tickets
POST   /api/tickets/:id/triage

-- Demo control (admin-gated, non-production) --
POST   /api/_demo/reset
POST   /api/_demo/seed
POST   /api/_demo/inject-failure
```

Every mutating endpoint: JWT required, RBAC role check, Zod-validated body, audit-logged on success.

## 3. AI Integration Contract

**Request (Intelligence Service → LLM):**
```json
{
  "employeeContext": { "role": "Backend Developer", "department": "Engineering", "team": "Payments", "seniority": "Junior", "...": "..." },
  "candidateCatalog": ["GitHub", "Jira", "Slack", "AWS Dev", "Figma", "Production DB", "..."],
  "instruction": "Return ONLY JSON matching the schema. Recommend a decision per candidate with confidence and rationale. Do not authorize approval-gated or production access as REQUIRED — recommend APPROVAL_REQUIRED instead."
}
```
**Response (structured JSON, validated against Zod schema before use):**
```json
{
  "recommendations": [
    { "requirement": "GitHub", "recommendedDecision": "REQUIRED", "confidence": 0.94, "rationale": "Role involves source-code management and repository collaboration." },
    { "requirement": "Production Database", "recommendedDecision": "NOT_APPLICABLE", "confidence": 0.88, "rationale": "Role does not require production database access." }
  ]
}
```
This response is **never** written directly to `PlanItem.finalDecision`. It is passed through the Rules Engine, which may downgrade/override; only the Rules Engine output populates `finalDecision` (system-architecture.md §4).

## 4. Error Handling Convention

- All API errors return `{ code, message, details? }`; `message` is always safe to show a non-technical user.
- Adapter failures map to a stable `errorCode` taxonomy (e.g., `USER_ALREADY_EXISTS`, `RATE_LIMITED`, `AUTH_FAILED`, `UNKNOWN`) so the UI can render consistent recommended actions.
- No unhandled promise rejections reach the client as raw stack traces (NFR / appflow §4).

## 5. Performance & Scale (hackathon-appropriate targets)

- NFR-11: P95 < 500ms on seeded demo dataset (dozens of employees, hundreds of tasks) — no premature scale engineering.
- Frontend: route-level code splitting; avoid re-render storms on live provisioning updates (poll or lightweight SSE, not aggressive websockets infra for v1).

## 6. Real-Time Update Strategy

For the hackathon: **polling with TanStack Query `refetchInterval`** on active provisioning views (e.g., every 2s while any task is RUNNING, stop when settled). This is simpler and more demo-reliable than websockets; documented as a deliberate v1 tradeoff — a real-time transport (SSE/WebSocket) is the natural post-hackathon upgrade and the polling hook is isolated behind one custom hook (`useLiveTaskUpdates`) for a clean swap.

## 7. Security Requirements (implementation.md §28, consolidated)

RBAC, server-side authorization, input validation, Argon2/bcrypt hashing, HTTPS in deployment, env-var secrets, no frontend API keys, audit logging, rate limiting, CORS allowlist, least privilege by default, mandatory approval workflows for sensitive access, minimized sensitive-data footprint, prompt-injection resistance for RAG (P1), and an explicit access check before every protected action — enforced as Express middleware applied per-route, not per-handler ad hoc.

## 8. Testing Strategy (implementation.md §30, adopted)

- **Unit**: rules engine, requirement mapping, dependency evaluation (cycle detection, blocking propagation), permission checks, risk scoring, state transitions.
- **Integration**: each adapter (Google/Slack/GitHub/Jira) against its mock contract, including the scripted failure path.
- **Workflow (E2E)**: success path, failure path, retry, blocked-dependency propagation, approval, rejection, resume — this is the demo script itself, automated as a Playwright test so "does the demo still work" is answerable at any time.
- **Security**: unauthorized access attempt, cross-role access attempt, privilege escalation attempt, invalid/forged approval, direct API access without permission.
