# OnboardOS — Implementation Plan

Version 1.0 | Synthesizes implementation.md + master-prompt phasing | Companion to TASKS.md

---

## 1. Governing Order (updated — full-scope frontend prototype first, per explicit direction)

```
PHASE 0  Foundation (frontend project, design system, mock data, routing)
PHASE 1  Frontend Prototype — FULL PRODUCT (P0 + P1 + P2, all mock-driven)  ← highest priority
PHASE 2  Backend Foundation (auth, RBAC, DB, employee CRUD)
PHASE 3  Intelligence (context, role engine, rules engine, plan generator, why)
PHASE 4  Orchestration (task states, dependencies, workflow engine)
PHASE 5  Integrations (Google/Slack/GitHub/Jira adapters, real wiring behind the mock-first contract)
PHASE 6  Failure + Approval (failure engine, retry, blocked tasks, approvals, resume)
PHASE 7  Dashboards wired to real backend (HR/IT/Manager/Employee/IT-Ops)
PHASE 8  Advanced Intelligence backend (P1: AI assistant, risk detection, notifications, knowledge assistant, ticket triage)
PHASE 9  Lifecycle & Extension backend (P2: transfer, offboarding, mentor/buddy, planner, pulse, community — see PRD.md §7.3)
PHASE 10 Polish & Demo Hardening
```
**Change from v1.0**: Phase 1 now builds the *entire* product experience — P0 core, P1 advanced features, and P2 lifecycle/extension features — as a fully interactive, fully navigable frontend on mock data, before any backend work starts. Backend phases (2–9) then implement everything the frontend already demonstrates, in the same P0→P1→P2 order, so nothing in Phase 1 waits on a backend that doesn't exist yet, and nothing in the backend gets built without a UI already proving what it needs to do. Do not reorder phases without a documented HIGH IMPACT reason (see ANTIGRAVITY-RULES.md Rule 15).

## 2. Phase 0 — Foundation

- Initialize monorepo: `frontend/`, `backend/`, `prisma/`, `docs/` (structure per system-architecture.md / implementation.md §32).
- Frontend: Vite+React+TS, Tailwind, shadcn/ui installed, design tokens per ui-ux-design.md §2.
- Routing skeleton per appflow.md §1, role-based layout shells (HR/IT/Manager/Employee/Admin).
- Mock data architecture (full product, not just P0): `mockEmployees`, `mockPolicies`, `mockApplications`, `mockPermissions`, `mockOnboardingPlans`, `mockTasks`, `mockApprovals`, `mockAuditLogs`, `mockRiskAssessments`, `mockReadiness`, `mockSimulation`, `mockCopilotResponses`, `mockTickets`, `mockAssets`, `mockKnowledgeDocs`, `mockNotifications`, `mockTransferRequests`, `mockOffboardingPlans`, `mockMentorAssignments`, `mockFirstWeekPlans`, `mockPulseResponses`, `mockCommunityPosts` — all behind the `OnboardOSClient` interface (system-architecture.md §6).
- **Definition of Done**: `npm run dev` shows a navigable shell across all role routes with empty states, zero backend.

## 3. Phase 1 — Frontend Prototype: Full Product (highest priority)

Build, against mock services only. **Everything the product does is represented in this phase** — P0, P1, and P2 — so the prototype tells the complete OnboardOS story end to end before a single backend line is written.

### 3.1 P0 — Core Orchestration (build first within Phase 1)
1. Employee management (list, create, profile)
2. AI plan generation UI (reasoning sequence, plan render, Why panel)
3. Employee Command Center (centerpiece)
4. Access Intelligence Graph
5. Provisioning simulation (live progress, scriptable failure)
6. Failure + Retry UI
7. Approval flow UI
8. Risk + Readiness UI
9. What-If Simulation
10. HR Dashboard
11. Manager Dashboard & Approval Center
12. Employee Dashboard
13. Exception Center
14. Audit Timeline
15. Demo Control Panel (seed/reset/inject-failure)

### 3.2 P1 — Advanced Intelligence (build second within Phase 1, mock responses)
16. AI Employee Assistant UI (mocked, context-aware responses)
17. AI Risk Detection UI (surfaced in Command Center + Exception Center)
18. Smart Notification Engine UI (priority-ranked bell/inbox)
19. Company Knowledge Assistant UI (mocked RAG-style answers with citation chips)
20. IT Helpdesk / Ticket raise + AI Ticket Triage UI
21. Role-Based Training Path UI
22. Asset Management UI
23. IT Operations Dashboard

### 3.3 P2 — Lifecycle & Extension Platform (build third within Phase 1, mock data — PRD.md §7.3)
24. Internal Transfer Engine UI (change role/dept/team, preview + apply diff)
25. Intelligent Offboarding UI (exit workflow across HR/IT/Manager/Finance)
26. Offboarding Security Risk Detection UI (residual-access flags on EXITING employees)
27. Employee Lifecycle Platform / extended Timeline (Candidate → Onboarding → 30/60/90 → Transfer → Offboarding)
28. Smart First-Week Planner UI
29. Mentor/Buddy System UI (assignment, scheduling, visibility)
30. Employee Pulse UI (submission + HR aggregate trend view)
31. Employee Community Hub UI (announcements/events/polls/knowledge sharing, isolated module)

### 3.4 Wrap-up
32. Responsive + polish pass across all of 3.1–3.3
33. Full-product demo verification (run PRD.md §9 core demo **and** a full-lifecycle walkthrough — onboard → transfer → offboard — end to end on mock data)

**Definition of Done**: the entire product — every screen in 3.1, 3.2, and 3.3 — is navigable, interactive, and demoable on mock data alone, reset-able via the Demo Control Panel, with zero backend dependency.

## 4. Phase 2 — Backend Foundation

Project setup, Auth (JWT + Argon2), RBAC middleware, Prisma schema from database-design.md, Employee CRUD endpoints.
**DoD**: HR can create and view an employee via the real API (implementation.md §31 Phase 1 DoD).

## 5. Phase 3 — Intelligence

Employee Context capture/normalize, Role Intelligence Engine (deterministic rules), Rules Engine (versioned), AI Service (structured JSON, TRD.md §3), Plan Generator, Why explanations.
**DoD**: a Backend Developer and a Designer receive different plans through the real API (implementation.md §31 Phase 2 DoD).

## 6. Phase 4 — Orchestration

Task state machine, TaskDependency graph + cycle validation, Orchestrator converts plan → task DAG, workflow execution loop.
**DoD**: a 3+ step dependency chain executes automatically end to end (implementation.md §31 Phase 3 DoD).

## 7. Phase 5 — Integrations

Implement `IntegrationAdapter` contract; Google Workspace, Slack, GitHub, Jira adapters (mocked-but-contract-real, deterministic latency, scriptable failure); idempotency ledger (`IntegrationAdapterAction`).
**DoD**: at least 3–4 adapters demonstrate realistic execution end to end (implementation.md §31 Phase 4 DoD).

## 8. Phase 6 — Failure + Approval

Failure/Exception Engine, retry, Approval Engine (single + multi-stage chains), SLA timer, workflow resume on approval/retry.
**DoD**: one failed task blocks downstream tasks, receives human intervention, and resumes after resolution (implementation.md §31 Phase 5 DoD) — this is the automated Playwright test named in TRD.md §8.

## 9. Phase 7 — Dashboards (live data)

Swap `VITE_DATA_MODE` to `api` for HR/IT/Manager/Employee/IT-Ops dashboards; verify all figures are computed live (NFR-10), not mock leftovers.
**DoD**: each role sees correct, live, role-appropriate information and actions (implementation.md §31 Phase 6 DoD).

## 10. Phase 8 — Advanced Intelligence backend (P1)

Wire the already-built Phase 1 P1 UI (§3.2) to real services: AI Employee Assistant, Risk Detection (SLA-driven, PRD §8.4), Smart Notifications, Company Knowledge Assistant (pgvector RAG), Ticket Triage. Because the UI already exists from Phase 1, this phase is backend-only wiring, not UI design.

## 11. Phase 9 — Lifecycle & Extension backend (P2)

Wire the already-built Phase 1 P2 UI (§3.3) to real services, in order of engine reuse (cheapest/highest-leverage first — same rationale as before, now backend-only since the UI is already live):

1. **Internal Transfer Engine** — reuses Rules Engine + Dependency Engine + What-If diff engine (PRD §8.5) to compute remove/add/update access on a role change.
2. **Access Drift Detection → Offboarding Security Risk Detection** — extends the same drift-diff computation to the EXITING status case; auto-creates revocation tasks via the existing Orchestrator, run "in reverse."
3. **Intelligent Offboarding workflow** — HR/IT/Manager/Finance exit checklist, generated the same way onboarding plans are generated, reusing Task/Dependency/Approval infrastructure.
4. **Employee Lifecycle Platform (timeline extension)** — extends the existing Audit Trail/Timeline across Candidate → Onboarding → 30/60/90 Days → Transfer/Promotion → Offboarding.
5. **Smart First-Week Planner** — generated alongside the onboarding plan in Phase 3's Plan Generator; additive output, not a new engine.
6. **Mentor/Buddy System** — lightweight module (assignment + scheduling + visibility), light coupling to core engine.
7. **Employee Pulse** — voluntary signal capture + aggregate trend view for HR; explicitly no diagnostic/clinical framing (PRD §4).
8. **Employee Community Hub** — deliberately isolated route/module so it never competes with the orchestration UI (PRD §7.3).

**Definition of Done for Phase 9**: a role change flows through the Internal Transfer Engine end-to-end against the real backend; an EXITING employee triggers Offboarding Security Risk Detection and a generated offboarding workflow that reaches "fully revoked" state; the Lifecycle Timeline shows a continuous history from Candidate through Offboarding for at least one seeded employee — all through the API, matching what Phase 1's mock UI already demonstrated.

## 12. Demo Failure Scenario (authoritative script — implementation.md §34, reconciled with PRD §9)

1. Create Rahul → 2. Generate plan → 3. Show context → 4. Why GitHub required → 5. Start onboarding → 6. Email ✓ → 7. Slack ✓ → 8. GitHub ✓ → 9. Jira ❌ (intentional) → 10. Show failure reason → 11. Show 2 downstream BLOCKED → 12. Create IT intervention → 13. Retry Jira → resolves → 14. AWS approval becomes available → 15. Manager approves → 16. AWS task executes → 17. Progress → 100% → 18. Show timeline → 19. Show Day-1 Ready. Then open What-If, change role, show delta, discard.

## 13. What NOT to Build Early — Backend Only (implementation.md §36, sequencing rule scoped to backend)

This rule now applies to **backend build order, not frontend scope**: do not spend Phases 2–7 backend effort on transfer/offboarding/mentor/pulse/community/full LMS/full ITSM backend logic, complex microservices, or 20+ real integrations — those backends land in Phase 8–9. The frontend for all of it is already built in Phase 1 (§3.2, §3.3), so "not yet" here means "not yet wired to a real database," not "not yet visible in the product." A generic, open-ended chatbot remains out of scope permanently — the AI Assistant and Knowledge Assistant are purpose-built and grounded in real data (SRS.md FR-AI-01/02), never a general-purpose chat surface.

## 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| LLM latency/cost blocks demo reliability | Deterministic mocked reasoning sequence in Phase 1; real LLM call cached/short-circuited for demo dataset in Phase 3+ |
| Real integrations unavailable/rate-limited on demo day | Adapters are mock-first by design; live wiring is additive, not required for the core demo |
| Full-scope Phase 1 (31 screens) takes longer than a narrower MVP would | Build order within Phase 1 is still P0 → P1 → P2 (§3.1–3.3); if time runs short, P0 is demo-complete on its own and P1/P2 screens can ship in a visibly "coming soon" state without breaking the core story |
| Backend delay blocking frontend | Mock-first client contract (system-architecture.md §6) removes this dependency entirely |
| Backend scope (Phases 2–9) is now larger, since it must eventually match the full Phase 1 frontend | Phases 8–9 are explicitly wiring-only (UI pre-built), which keeps backend effort focused on services/data, not design |
