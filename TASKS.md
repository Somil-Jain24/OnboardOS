# TASKS.md — OnboardOS Master Task Board

Statuses: `TODO` `IN_PROGRESS` `BLOCKED` `DONE` `SKIPPED`
This is the only task file. See ANTIGRAVITY-RULES.md Rule 6.

> **Structure note**: Phase 1 builds the FULL product UI (P0 + P1 + P2) on mock data. Phases 2–9 then build the backend for all of it, in the same P0 → P1 → P2 order, so every backend phase is wiring an already-built screen to a real service, not designing UI. See implementation-plan.md §1.

## PHASE 0 — FOUNDATION
- [x] TASK-001 DONE — Monorepo/project setup (frontend, backend, prisma, docs folders)
- [x] TASK-002 DONE — Design system (Tailwind tokens, shadcn/ui, ui-ux-design.md §2)
- [x] TASK-003 DONE — Routing skeleton + role-based layout shells (appflow.md §1)
- [x] TASK-004 DONE — Mock data/services (full product, incl. P1/P2 entities) + `OnboardOSClient` interface (system-architecture.md §6)

## PHASE 1 — FRONTEND PROTOTYPE: FULL PRODUCT (highest priority; all on mock data)

### 1a. P0 — Core Orchestration
- [x] TASK-101 DONE — Employee management (list, create, profile) — FR-CTX-*
- [x] TASK-102 DONE — AI plan generation UI (reasoning sequence, plan render) — FR-PLAN-*, appflow.md §3
- [x] TASK-103 DONE — Why? explanation panel — FR-WHY-*
- [x] TASK-104 DONE — Employee Command Center (centerpiece) — ui-ux-design.md §3.1
- [x] TASK-105 DONE — Access Intelligence Graph (React Flow) — FR-GRAPH-*
- [x] TASK-106 DONE — Provisioning simulation (live progress, scriptable failure) — FR-INT-*, FR-FAIL-*
- [x] TASK-107 DONE — Failure + Retry UI — FR-FAIL-*
- [x] TASK-108 DONE — Approval flow UI — FR-APR-*
- [x] TASK-109 DONE — Risk + Readiness UI — FR-RISK-*, FR-READY-01
- [x] TASK-110 DONE — What-If Simulation UI — FR-SIM-*
- [x] TASK-111 DONE — HR Command Center dashboard — FR-DASH-01
- [x] TASK-112 DONE — Manager Dashboard & Approval Center — FR-DASH-02
- [x] TASK-113 DONE — Employee Dashboard — FR-DASH-03
- [x] TASK-114 DONE — Exception Center — FR-FAIL-04
- [x] TASK-115 DONE — Audit Timeline — FR-AUDIT-*
- [x] TASK-116 DONE — Demo Control Panel (seed/reset/inject-failure) — PRD.md §8.6

### 1b. P1 — Advanced Intelligence (mocked)
- [x] TASK-131 DONE — AI Employee Assistant UI (mocked, context-aware) — FR-AI-01
- [x] TASK-132 DONE — AI Risk Detection surfaced in Command Center + Exception Center — PRD §8.4
- [x] TASK-133 DONE — Smart Notification Engine UI (priority-ranked)
- [x] TASK-134 DONE — Company Knowledge Assistant UI (mocked RAG-style, citation chips) — FR-AI-02
- [x] TASK-135 DONE — IT Helpdesk raise-issue + AI Ticket Triage UI — FR-AI-03
- [x] TASK-136 DONE — Role-Based Training Path UI
- [x] TASK-137 DONE — Asset Management UI — FR-AST-*
- [x] TASK-138 DONE — IT Operations Dashboard — FR-DASH-04

### 1c. P2 — Lifecycle & Extension Platform (mocked — PRD.md §7.3)
- [x] TASK-151 DONE — Internal Transfer Engine UI (change role/dept/team, preview + apply diff) — FR-LIFE-01
- [x] TASK-152 DONE — Intelligent Offboarding UI (HR/IT/Manager/Finance exit workflow) — FR-LIFE-02
- [x] TASK-153 DONE — Offboarding Security Risk Detection UI (residual-access flags) — FR-LIFE-03
- [x] TASK-154 DONE — Employee Lifecycle Platform / extended Timeline (Candidate→...→Offboarding) — FR-LIFE-04
- [x] TASK-155 DONE — Smart First-Week Planner UI — FR-LIFE-05
- [x] TASK-156 DONE — Mentor/Buddy System UI — FR-LIFE-06
- [x] TASK-157 DONE — Employee Pulse UI (submission + HR aggregate trend) — FR-LIFE-07
- [x] TASK-158 DONE — Employee Community Hub UI (isolated module) — FR-LIFE-08

### 1d. Wrap-up
- [x] TASK-171 DONE — Responsive + polish pass (all of 1a–1c) — NFR-08, ui-ux-design.md §4/5
- [x] TASK-172 DONE — Full-product demo verification (core demo, PRD.md §9, + full-lifecycle walkthrough onboard→transfer→offboard, all on mock data)

## PHASE 2 — BACKEND FOUNDATION
- [ ] TASK-201 TODO — Project setup (Express+TS), env/config — TRD.md §1
- [ ] TASK-202 TODO — Auth (JWT, Argon2) — NFR-05
- [ ] TASK-203 TODO — RBAC middleware — NFR-03
- [ ] TASK-204 TODO — Prisma schema from database-design.md + migrations
- [ ] TASK-205 TODO — Employee CRUD API — FR-CTX-*

## PHASE 3 — INTELLIGENCE
- [ ] TASK-301 TODO — EmployeeContext capture/normalize — FR-CTX-02
- [ ] TASK-302 TODO — RequirementRule model + versioning — FR-ROLE-03, PRD §8.3
- [ ] TASK-303 TODO — Deterministic Role Intelligence Engine — FR-ROLE-01
- [ ] TASK-304 TODO — AI Service (structured JSON) — FR-ROLE-02, TRD.md §3
- [ ] TASK-305 TODO — Rules Engine (AI validation/override) — FR-ROLE-*, system-architecture.md §4
- [ ] TASK-306 TODO — Plan Generator (PlanItem creation) — FR-PLAN-*
- [ ] TASK-307 TODO — Why explanation API — FR-WHY-*

## PHASE 4 — ORCHESTRATION
- [ ] TASK-401 TODO — Task state machine — system-architecture.md §5
- [ ] TASK-402 TODO — TaskDependency graph + cycle validation — FR-DEP-01
- [ ] TASK-403 TODO — Orchestrator (plan → task DAG) — FR-DEP-02
- [ ] TASK-404 TODO — Blocking propagation + auto-unblock — FR-DEP-03..05

## PHASE 5 — INTEGRATIONS
- [ ] TASK-501 TODO — IntegrationAdapter interface + idempotency ledger — FR-INT-01/03, PRD §8.1
- [ ] TASK-502 TODO — GoogleWorkspaceAdapter (mock, contract-real)
- [ ] TASK-503 TODO — SlackAdapter (mock, contract-real)
- [ ] TASK-504 TODO — GitHubAdapter (mock, contract-real)
- [ ] TASK-505 TODO — JiraAdapter (mock, contract-real, scriptable failure) — demo-critical
- [ ] TASK-506 SKIPPED (optional) — AWS/HRMS/VPN/Asset stub adapters

## PHASE 6 — FAILURE + APPROVAL
- [ ] TASK-601 TODO — Failure & Exception Engine — FR-FAIL-*
- [ ] TASK-602 TODO — Retry (idempotent) — FR-FAIL-02
- [ ] TASK-603 TODO — Assign-to-IT / Skip-with-reason — FR-FAIL-03
- [ ] TASK-604 TODO — Approval Engine (single/multi-stage) — FR-APR-01..04
- [ ] TASK-605 TODO — Approval SLA + escalation — FR-APR-05, PRD §8.4
- [ ] TASK-606 TODO — Workflow resume on approval/retry — FR-DEP-05, FR-APR-04

## PHASE 7 — DASHBOARDS (live data)
- [ ] TASK-701 TODO — HR Command Center wired to live API — FR-DASH-01, NFR-10
- [ ] TASK-702 TODO — Manager Dashboard wired to live API — FR-DASH-02
- [ ] TASK-703 TODO — Employee Dashboard wired to live API — FR-DASH-03
- [ ] TASK-704 TODO — IT Operations Dashboard wired to live API — FR-DASH-04
- [ ] TASK-705 TODO — Risk Engine (live) — FR-RISK-*
- [ ] TASK-706 TODO — Readiness computation (live) — FR-READY-01

## PHASE 8 — ADVANCED INTELLIGENCE BACKEND (P1 — wires TASK-131..138 UI to real services)
- [ ] TASK-801 TODO — AI Employee Assistant backend — FR-AI-01
- [ ] TASK-802 TODO — AI Risk Detection backend (SLA-driven) — PRD §8.4
- [ ] TASK-803 TODO — Smart Notification Engine backend
- [ ] TASK-804 TODO — Access Drift Detection backend — PRD §8.5
- [ ] TASK-805 TODO — Company Knowledge Assistant backend (pgvector RAG) — FR-AI-02
- [ ] TASK-806 TODO — IT Helpdesk + AI Ticket Triage backend — FR-AI-03
- [ ] TASK-807 TODO — Role-Based Training Path backend
- [ ] TASK-808 TODO — Asset Management backend

## PHASE 9 — LIFECYCLE & EXTENSION BACKEND (P2 — wires TASK-151..158 UI to real services, PRD.md §7.3)
- [ ] TASK-901 TODO — Internal Transfer Engine backend (reuses Rules/Dependency/What-If diff engine) — FR-LIFE-01
- [ ] TASK-902 TODO — Offboarding Security Risk Detection backend (extends Access Drift Detection to EXITING status) — FR-LIFE-03
- [ ] TASK-903 TODO — Intelligent Offboarding workflow backend (reuses Orchestrator) — FR-LIFE-02
- [ ] TASK-904 TODO — Employee Lifecycle Platform backend (extends Audit Log) — FR-LIFE-04
- [ ] TASK-905 TODO — Smart First-Week Planner backend (generated alongside onboarding plan) — FR-LIFE-05
- [ ] TASK-906 TODO — Mentor/Buddy System backend — FR-LIFE-06
- [ ] TASK-907 TODO — Employee Pulse backend (aggregate-only, no clinical inference) — FR-LIFE-07
- [ ] TASK-908 TODO — Employee Community Hub backend (isolated, no FKs into core) — FR-LIFE-08

## PHASE 10 — POLISH & DEMO HARDENING
- [ ] TASK-1001 TODO — Empty/loading/error states audit (all screens, P0+P1+P2) — appflow.md §4
- [ ] TASK-1002 TODO — Full seed data finalized (incl. P2 lifecycle data) — database-design.md §6
- [ ] TASK-1003 TODO — Playwright E2E demo-script test (core + full-lifecycle) — TRD.md §8, implementation-plan.md §12
- [ ] TASK-1004 TODO — Security test pass — SRS.md §Testing
- [ ] TASK-1005 TODO — Final responsive/accessibility pass — ui-ux-design.md §5/6

---
**Current focus**: PHASE 0, starting at TASK-001. Within PHASE 1, build order is 1a (P0) → 1b (P1) → 1c (P2) → 1d (wrap-up) — see implementation-plan.md §3. Do not start PHASE 2 (backend) until PHASE 1 is fully DONE across 1a, 1b, and 1c.
