# OnboardOS — System Architecture

Version 1.0 | Companion to TRD.md, database-design.md

---

## 1. Architecture Style

**Modular monolith** (implementation.md §37 principle 1) for the hackathon: one deployable backend service, internally organized into isolated modules with clean interfaces, so it can later split into services without a rewrite. Frontend is a fully independent SPA that runs against either the real API or a mock service layer with an identical interface (critical for Phase 1 "frontend without backend").

## 2. High-Level Diagram

```
┌───────────────────────────────────────────────────────────┐
│                        React SPA                          │
│   HR | IT | Manager | Employee | Admin  (route-guarded)   │
│                                                             │
│   services/api/*  ──switchable──  services/mock/*          │
│        (identical TypeScript interface; see §6)            │
└───────────────────────────┬────────────────────────────────┘
                             │ HTTPS / JSON (only when API mode)
                             ▼
┌───────────────────────────────────────────────────────────┐
│                     REST API Layer                        │
│     AuthN (JWT) · AuthZ (RBAC) · Validation (Zod)          │
└───────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼─────────────────────┐
        ▼                    ▼                      ▼
┌───────────────┐   ┌─────────────────┐    ┌──────────────────┐
│ Employee       │   │ Onboarding       │    │ Auth / RBAC      │
│ Service        │   │ Orchestrator     │    │ Module           │
└───────────────┘   └────────┬─────────┘    └──────────────────┘
                              │
      ┌───────────────┬──────┴───────┬──────────────────┐
      ▼               ▼              ▼                  ▼
┌───────────┐  ┌──────────────┐ ┌───────────────┐ ┌──────────────┐
│Intelligence│  │ Rules Engine │ │ Dependency     │ │ Approval      │
│/ AI Service│  │ (versioned)  │ │ Engine (DAG)   │ │ Engine        │
└───────────┘  └──────────────┘ └───────────────┘ └──────────────┘
      │                                    │
      │                                    ▼
      │                        ┌──────────────────────┐
      │                        │ Integration Adapter    │
      │                        │ Layer (idempotent)      │
      │                        └──────────┬───────────────┘
      │                     ┌──────────────┼───────────────┐
      │                     ▼              ▼               ▼
      │                  GitHub         Slack            Jira
      │                     │              │               │
      │                     └──────────────┼───────────────┘
      │                                    ▼
      │                        Google Workspace / AWS / Mock
      ▼
┌───────────────────┐   ┌────────────────┐   ┌──────────────────┐
│ Risk Engine        │   │ Notification    │   │ Audit Log        │
│ (P0 basic, P1 full) │   │ Engine (P1)     │   │ Service          │
└───────────────────┘   └────────────────┘   └──────────────────┘

              PostgreSQL (Prisma) [+ pgvector for P1 RAG]
```

## 3. Module Responsibilities

| Module | Responsibility | Key FRs |
|---|---|---|
| **Auth/RBAC** | login, session/JWT issuance, role-based route + endpoint guards | NFR-03..05 |
| **Employee Service** | CRUD employee, org context, manager/team assignment | FR-CTX-* |
| **Intelligence/AI Service** | calls LLM with structured-output prompt, returns candidate requirements w/ confidence+rationale; never writes final decision | FR-ROLE-02, FR-WHY-02 |
| **Rules Engine** | deterministic policy evaluation over versioned rules; sole authority for REQUIRED/APPROVAL_REQUIRED/BLOCKED | FR-ROLE-01/03, NFR-02 |
| **Onboarding Orchestrator** | owns plan generation lifecycle, converts approved requirements into a Task DAG, drives state transitions | FR-PLAN-*, FR-DEP-* |
| **Dependency Engine** | DAG validation (no cycles), propagates BLOCKED/READY transitions | FR-DEP-* |
| **Integration Adapter Layer** | common interface + per-system adapters, idempotency | FR-INT-* |
| **Approval Engine** | approval chain construction, SLA tracking, approve/reject/more-info | FR-APR-* |
| **Failure & Exception Engine** | classifies failures, computes impact, feeds Exception Center | FR-FAIL-* |
| **Risk Engine** | computes risk score + readiness gate | FR-RISK-*, FR-READY-01 |
| **Notification Engine (P1)** | priority-ranked digesting of events into actionable notices | FR-AI n/a; features P1-03 |
| **Audit Log Service** | immutable append-only record of every transition | FR-AUDIT-* |
| **Knowledge/RAG (P1)** | ingest policy docs, embed, retrieve, ground assistant answers | FR-AI-02 |
| **Ticketing (P1)** | IT helpdesk ticket lifecycle + AI triage | FR-AI-03 |

## 4. AI/Rules Boundary (authoritative)

```
Employee Context → [AI Service: recommend candidates + confidence + rationale]
                 → [Rules Engine: validate/override against versioned policy]
                 → Approved Requirement Set (final)
                 → Onboarding Plan
```
The Rules Engine can only make an AI recommendation *stricter* (e.g., downgrade REQUIRED→APPROVAL_REQUIRED) — it never grants access the AI didn't at least surface as a candidate, and the AI never finalizes an approval-gated or security-sensitive decision. This satisfies implementation.md §5 and PRD §8.2, and is enforced in code as a hard module boundary: the AI Service module has no database write access to `Task` or `Approval` tables — only the Orchestrator and Approval Engine do.

## 5. Task State Machine (implementation.md §9, adopted verbatim)

```
PENDING → READY → RUNNING → COMPLETED
                        ├──→ FAILED ──→ RETRY ──→ RUNNING
                        │           └──→ HUMAN_INTERVENTION
                        └──→ WAITING_APPROVAL ──→ READY
                                              └──→ REJECTED
BLOCKED → (dependency resolved) → READY
```
`done: boolean` is explicitly disallowed as the primary state representation.

## 6. Mock-First Frontend Contract

`frontend/src/services/index.ts` exports one interface (`OnboardOSClient`) implemented twice:
- `services/mock/*` — in-memory store + simulated latency/failure, used for Phase 1
- `services/api/*` — real HTTP calls, used from Phase 4 onward

A single env flag (`VITE_DATA_MODE=mock|api`) switches implementations. No component ever imports a mock or API module directly — only the interface — so backend readiness never blocks frontend work (master-prompt §4) and swapping later touches one file.

## 7. Integration Adapter Contract

```ts
interface IntegrationAdapter {
  createUser(input): Promise<AdapterResult>
  disableUser(input): Promise<AdapterResult>
  addToGroup(input): Promise<AdapterResult>
  addToTeam(input): Promise<AdapterResult>
  grantAccess(input): Promise<AdapterResult>
  revokeAccess(input): Promise<AdapterResult>
  checkStatus(input): Promise<AdapterResult>
}
// AdapterResult = { success, externalId?, errorCode?, reason?, idempotencyKey }
```
Implemented for: `GoogleWorkspaceAdapter`, `SlackAdapter`, `GitHubAdapter`, `JiraAdapter` (all "mocked but contract-real": deterministic simulated latency + a scriptable failure mode for the demo). `AWSAdapter`, `HRMSAdapter`, `VPNAdapter`, `AssetAdapter` are stub/optional mocks.

## 8. Deployment (hackathon-pragmatic)

- Frontend: static build → Vercel/Netlify (or any static host).
- Backend: single Node process → Render/Railway/Fly.io, containerized (Dockerfile provided).
- DB: managed PostgreSQL (Neon/Supabase/Railway).
- Env vars for all secrets (LLM API key, DB URL, JWT secret) — never committed.
- No k8s/microservices for this phase (implementation.md §37 principle 1).

## 9. Cross-Cutting Concerns

- **Idempotency**: PRD §8.1 — every adapter/task-retry call keyed by `taskId:attempt`.
- **Observability**: structured logs per state transition (also feeds Audit Log); minimum viable tracing via request id.
- **Security**: see `SRS.md` §4 NFR-02..07, and `implementation-plan.md` §Security.
- **Extensibility path**: Adapter Layer and Rules Engine are the two seams designed for post-hackathon real-integration and multi-tenant policy work.
