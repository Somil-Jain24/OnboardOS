# TASKS.md — OnboardOS Master Task Board

Statuses: `TODO` `IN_PROGRESS` `BLOCKED` `DONE` `SKIPPED`
This is the only task file. See ANTIGRAVITY-RULES.md Rule 6.

> **Structure note**: Phase 1 builds the FULL product UI (P0 + P1 + P2 + Enterprise Identity) on mock data. Phases 2–9 then build the backend for all of it, in the same P0 → P1 → P2 order, so every backend phase is wiring an already-built screen to a real service, not designing UI. See implementation-plan.md §1.

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

### 1e. P0 — Enterprise Identity & Access Governance UI (mocked)
- [x] TASK-121 DONE — Birthright Access Policy Engine UI (policy builder, conditions, birthright vs approval) — P0-14
- [x] TASK-122 DONE — Access Package & Entitlement Bundle Catalog UI (app roles, groups, risk, review policy) — P0-15
- [x] TASK-123 DONE — Self-Service Access Request Marketplace & Request Drawer UI (discover, request, multi-stage approval tracker) — P0-16
- [x] TASK-124 DONE — Access Expiration & Time-Bound Grants UI (TTL, auto-revoke countdown, renewal workflow) — P0-17
- [x] TASK-125 DONE — Periodic Access Certification Campaigns & Review Inbox UI (bulk approve/revoke, contextual signals) — P0-18
- [x] TASK-126 DONE — Separation of Duties (SoD) Conflict Center UI (toxic combinations, hard deny, compensating controls) — P0-19

### 1f. P1 — Enterprise Identity & Governance Advanced UI (mocked)
- [x] TASK-141 DONE — Just-In-Time (JIT) Privileged Access Center UI (elevation requests, break-glass, session timer) — P1-20
- [x] TASK-142 DONE — Identity Source & Reconciliation Center UI (HR/IdP attribute mapping, mismatch diff & remediation) — P1-21
- [x] TASK-143 DONE — SCIM / Standard Provisioning Connector Status UI (SCIM 2.0 connector health & logs) — P1-22
- [x] TASK-144 DONE — Guest, Contractor & External Identity Governance UI (sponsored access, expiry, restricted packages) — P1-23
- [x] TASK-145 DONE — Compliance Evidence & Audit Export Center UI (evidence packages, filters, audit-ready exports) — P1-24
- [x] TASK-146 DONE — Usage-Aware Stale Access Detection UI (dormant accounts, unused permissions, reclaim actions) — P1-25

### 1g. P2 — Enterprise Strategic Extensions UI (mocked)
- [x] TASK-161 DONE — Device-Aware Access Signals UI (managed/unmanaged, posture-based conditional access) — P2-26
- [x] TASK-162 DONE — SaaS & License Intelligence UI (seat utilization, cost tier, inactive seat reclamation) — P2-27
- [x] TASK-163 DONE — Service Account & AI Agent Identity Governance UI (non-human identities, tool scopes, max privileges) — P2-28
- [x] TASK-164 DONE — Delegated Administration & Resource Ownership UI (scoped admins: App Owner, Security Admin) — P2-29
- [x] TASK-165 DONE — Identity Governance Executive Analytics UI (readiness rate, SLA metrics, SoD/stale trends) — P2-30

### 1h. Interactive Drawers & Modal Extensions UI (mocked)
- [x] TASK-181 DONE — Interactive Hardware Asset Assignment & Lifecycle Drawer UI (employee, serial, model, status transitions) — FR-AST-*
- [x] TASK-182 DONE — IT Helpdesk Resolution & AI Triage Drawer UI (AI classification, SLA countdown, reassign, resolve) — FR-TICK-*
- [x] TASK-183 DONE — Manual Provisioning Payload Inspector & Override Drawer UI (JSON viewer, headers, idempotency, audit override) — FR-INT-02
- [x] TASK-184 DONE — Interactive Compliance Training Module Modal UI (SOC2/GDPR courses, quiz, e-signature, cert badge) — FR-PLAN-05
- [x] TASK-185 DONE — Global Smart Notification Center Drawer UI (real-time badge, priority filters, action routing, mark read) — FR-NOTIF-*
- [x] TASK-186 DONE — Peer Access Drift & Anomaly Inspector Drawer UI (cohort baseline vector, drift meter, remediation trigger) — FR-ROLE-04

### 1d. Wrap-up
- [x] TASK-171 DONE — Responsive + polish pass (all of 1a–1c, 1e–1h) — NFR-08, ui-ux-design.md §4/5
- [x] TASK-172 DONE — Full-product demo verification (core demo, PRD.md §9, + full-lifecycle walkthrough onboard→transfer→offboard, all on mock data)

## PHASE 2 — BACKEND FOUNDATION
- [ ] TASK-201 TODO — Project setup (Express+TS), env/config — TRD.md §1
- [ ] TASK-202 TODO — Auth (JWT, Argon2) — NFR-05
- [ ] TASK-203 TODO — RBAC middleware — NFR-03
- [ ] TASK-204 TODO — Prisma schema from database-design.md + migrations
- [ ] TASK-205 TODO — Employee CRUD API — FR-CTX-*
- [ ] TASK-206 TODO — Enterprise Identity data models & Prisma schema additions (`Identity`, `IdentitySource`, `AccessPackage`, `Entitlement`, `SoDRule`, `AccessReviewCampaign`, etc.)

## PHASE 3 — INTELLIGENCE & POLICY ENGINE
- [ ] TASK-301 TODO — EmployeeContext capture/normalize — FR-CTX-02
- [ ] TASK-302 TODO — RequirementRule model + versioning — FR-ROLE-03, PRD §8.3
- [ ] TASK-303 TODO — Deterministic Role Intelligence Engine — FR-ROLE-01
- [ ] TASK-304 TODO — AI Service (structured JSON) — FR-ROLE-02, TRD.md §3
- [ ] TASK-305 TODO — Rules Engine (AI validation/override) — FR-ROLE-*, system-architecture.md §4
- [ ] TASK-306 TODO — Plan Generator (PlanItem creation) — FR-PLAN-*
- [ ] TASK-307 TODO — Why explanation API — FR-WHY-*
- [ ] TASK-308 TODO — Birthright Access Policy Engine (deterministic baseline evaluation) — P0-14
- [ ] TASK-309 TODO — Separation of Duties (SoD) Conflict Engine (toxic combination matrix & compensating controls) — P0-19

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
- [ ] TASK-507 TODO — SCIM 2.0 Connector Layer (User/Group sync protocol interface) — P1-22

## PHASE 6 — FAILURE, APPROVAL & ACCESS GOVERNANCE
- [ ] TASK-601 TODO — Failure & Exception Engine — FR-FAIL-*
- [ ] TASK-602 TODO — Retry (idempotent) — FR-FAIL-02
- [ ] TASK-603 TODO — Assign-to-IT / Skip-with-reason — FR-FAIL-03
- [ ] TASK-604 TODO — Approval Engine (single/multi-stage) — FR-APR-01..04
- [ ] TASK-605 TODO — Approval SLA + escalation — FR-APR-05, PRD §8.4
- [ ] TASK-606 TODO — Workflow resume on approval/retry — FR-DEP-05, FR-APR-04
- [ ] TASK-607 TODO — Access Package Catalog & Self-Service Request API — P0-15, P0-16
- [ ] TASK-608 TODO — Time-Bound Grants & Automatic Expiration Scheduler — P0-17
- [ ] TASK-609 TODO — Access Certification Campaign Lifecycle & Decision Engine — P0-18
- [ ] TASK-610 TODO — JIT Privileged Elevation & Emergency Break-Glass Workflow — P1-20

## PHASE 7 — DASHBOARDS (live data)
- [ ] TASK-701 TODO — HR Command Center wired to live API — FR-DASH-01, NFR-10
- [ ] TASK-702 TODO — Manager Dashboard wired to live API — FR-DASH-02
- [ ] TASK-703 TODO — Employee Dashboard wired to live API — FR-DASH-03
- [ ] TASK-704 TODO — IT Operations Dashboard wired to live API — FR-DASH-04
- [ ] TASK-705 TODO — Risk Engine (live) — FR-RISK-*
- [ ] TASK-706 TODO — Readiness computation (live) — FR-READY-01

## PHASE 8 — ADVANCED INTELLIGENCE & GOVERNANCE BACKEND (P1 — wires TASK-131..146 UI to real services)
- [ ] TASK-801 TODO — AI Employee Assistant backend — FR-AI-01
- [ ] TASK-802 TODO — AI Risk Detection backend (SLA-driven) — PRD §8.4
- [ ] TASK-803 TODO — Smart Notification Engine backend
- [ ] TASK-804 TODO — Access Drift Detection backend — PRD §8.5
- [ ] TASK-805 TODO — Company Knowledge Assistant backend (pgvector RAG) — FR-AI-02
- [ ] TASK-806 TODO — IT Helpdesk + AI Ticket Triage backend — FR-AI-03
- [ ] TASK-807 TODO — Role-Based Training Path backend
- [ ] TASK-808 TODO — Asset Management backend
- [ ] TASK-809 TODO — Identity Source & Reconciliation Engine (HR/IdP attribute sync & mismatch remediation) — P1-21
- [ ] TASK-810 TODO — External Identity & Contractor Lifecycle Backend — P1-23
- [ ] TASK-811 TODO — Compliance Evidence Aggregator & Report Export API — P1-24
- [ ] TASK-812 TODO — Usage-Aware Stale Access Detection & Inactive Reclaim Engine — P1-25

## PHASE 9 — LIFECYCLE & ENTERPRISE EXTENSIONS BACKEND (P2 — wires TASK-151..165 UI to real services, PRD.md §7.3)
- [ ] TASK-901 TODO — Internal Transfer Engine backend (reuses Rules/Dependency/What-If diff engine) — FR-LIFE-01
- [ ] TASK-902 TODO — Offboarding Security Risk Detection backend (extends Access Drift Detection to EXITING status) — FR-LIFE-03
- [ ] TASK-903 TODO — Intelligent Offboarding workflow backend (reuses Orchestrator) — FR-LIFE-02
- [ ] TASK-904 TODO — Employee Lifecycle Platform backend (extends Audit Log) — FR-LIFE-04
- [ ] TASK-905 TODO — Smart First-Week Planner backend (generated alongside onboarding plan) — FR-LIFE-05
- [ ] TASK-906 TODO — Mentor/Buddy System backend — FR-LIFE-06
- [ ] TASK-907 TODO — Employee Pulse backend (aggregate-only, no clinical inference) — FR-LIFE-07
- [ ] TASK-908 TODO — Employee Community Hub backend (isolated, no FKs into core) — FR-LIFE-08
- [ ] TASK-909 TODO — Device Posture Signal Integration & Conditional Access Policy Evaluator — P2-26
- [ ] TASK-910 TODO — SaaS License Utilization & Cost Optimizer Backend — P2-27
- [ ] TASK-911 TODO — Non-Human & AI Agent Identity Governance Backend — P2-28
- [ ] TASK-912 TODO — Delegated Administration & Scoped RBAC Engine — P2-29
- [ ] TASK-913 TODO — Identity Governance Analytics Engine & Executive Metrics API — P2-30

## PHASE 10 — POLISH & DEMO HARDENING
- [ ] TASK-1001 TODO — Empty/loading/error states audit (all screens, P0+P1+P2+Enterprise) — appflow.md §4
- [ ] TASK-1002 TODO — Full seed data finalized (incl. P2 lifecycle + Enterprise Identity bundles & campaigns) — database-design.md §6
- [ ] TASK-1003 TODO — Playwright E2E demo-script test (core + full-lifecycle) — TRD.md §8, implementation-plan.md §12
- [ ] TASK-1004 TODO — Security test pass — SRS.md §Testing
- [ ] TASK-1005 TODO — Final responsive/accessibility pass — ui-ux-design.md §5/6
- [ ] TASK-1006 TODO — End-to-End Enterprise Identity Demo Scenario (Onboarding → Self-service Request → SoD Check → Multi-stage/JIT Approval → Expiration → Certification Campaign → Evidence Export) — Act 2 Demo

---
**Current focus**: Enterprise Identity & Access Governance expansion. No backend work will start until explicitly directed.

