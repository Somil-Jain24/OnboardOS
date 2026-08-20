# OnboardOS — Product Requirements Document (PRD)

Version 1.0 | Status: Approved for Hackathon Build | Source: features.md, implementation.md, ONBOARDOS_MASTER_PROMPT.md

---

## 1. Product Summary

OnboardOS is an **AI-assisted employee onboarding orchestration platform**. It is not a checklist app. It ingests an employee's context (role, department, team, seniority, location, employment type, manager, project), reasons about what that specific employee needs, explains every decision in plain language, coordinates the work across multiple systems (email, Slack, GitHub, Jira, AWS, etc.), tracks dependency-aware execution state, detects and explains failures, routes sensitive decisions to a human approver, and reports live readiness and risk — end to end, auditable, and demoable without any real backend integrations.

**Positioning statement:** An intelligent employee onboarding orchestration platform that understands employee context, determines what they actually need, explains why, coordinates setup across systems, detects failures, handles dependencies, and escalates human decisions instead of silently breaking.

---

## 2. Problem Statement

When a new employee joins, HR and IT coordinate access across many systems by hand — email, chat, source control, project tools, docs, security systems, physical assets, and approvals. This is slow, inconsistent between employees in the same role, opaque to the employee ("what do I actually need, and why don't I have it yet?"), and unsafe (nothing stops a downstream step from silently proceeding after an upstream failure, and nothing enforces least-privilege by default).

## 3. Goals

| Goal | Metric (hackathon-appropriate) |
|---|---|
| Personalize onboarding by role/context, not a static checklist | Two employees in different roles receive demonstrably different plans |
| Make every AI decision explainable | 100% of REQUIRED/NOT_REQUIRED/APPROVAL_REQUIRED requirements carry a human-readable reason |
| Model real dependency-aware execution, not a flat list | A failed task visibly blocks its dependents and the block is explained |
| Keep security-critical decisions deterministic, never AI-authorized | Every approval-gated access is enforced by the rules engine, with AI only ever "recommending" |
| Give every role a live, truthful view of state | HR/Manager/Employee/IT dashboards read from the same underlying task state — no hardcoded numbers |
| Ship a demo-ready, backend-independent frontend first | Full demo story runs end-to-end on mock services with zero backend dependency |

## 4. Non-Goals

- Full HRMS/payroll replacement (OnboardOS integrates with these systems via adapters; it does not become them)
- Real production integrations with GitHub/Slack/Jira/AWS/Google Workspace on day one (adapters are mocked behind a real interface for the hackathon; live wiring is a Phase 5+ task, not dropped scope)
- A generic, full-blown calendar platform or ITSM replacement (the Smart First-Week Planner and IT Helpdesk are scoped, purpose-built versions of these, not general-purpose clones — see §7)
- Clinical/mental-health inference from the optional Employee Pulse signal (voluntary engagement signal only, never a diagnostic claim)

> **Scope note:** Everything listed as P2 in earlier drafts of this document (Mentor/Buddy, Smart First-Week Planner, Internal Transfer Engine, Employee Lifecycle Platform, Intelligent Offboarding, Offboarding Security Risk Detection, Employee Pulse, Employee Community Hub) is **in scope for this project**. Its frontend is built in Phase 1 alongside P0 and P1; its backend is built in Phase 9. It is not cut — see §7.3 and `implementation-plan.md` §3.3/§11 and `TASKS.md` Phase 1c/Phase 9.

## 5. Target Users / Personas

| Persona | Primary need |
|---|---|
| **HR Ops** | See every new hire's status at a glance; know who's blocked and why; act fast |
| **IT / Helpdesk** | See failed provisioning, retry or fix it, resolve tickets |
| **Manager** | Approve/reject access for direct reports with enough context to decide responsibly |
| **New Employee** | Know exactly what's done, what's next, and why something is stuck |
| **Security/Compliance (implicit)** | Trust that sensitive access always passes deterministic policy, never an LLM's opinion |
| **Admin** | Configure roles, rules, and org structure |

## 6. Core Product Loop

```
Employee Profile → Policy + Rules → Role/Department/Team Context → Access Intelligence
→ AI Reasoning → Personalized Onboarding Plan → Dependency-Aware Orchestration
→ Provisioning → Failure Detection → Retry/Recovery → Human Approval
→ Risk + Readiness → Live Command Center → Audit Trail
```

## 7. Feature Set (source of truth: features.md, reconciled)

### P0 — MVP (must ship for hackathon demo)
1. Employee Context Engine
2. Role Intelligence Engine (deterministic rule mapping + AI-assisted reasoning)
3. Dynamic Personalized Onboarding Plan (REQUIRED / OPTIONAL / NOT_APPLICABLE / APPROVAL_REQUIRED / BLOCKED)
4. Explainability ("Why This Task?") on every decision
5. Dependency Engine (task graph, cascading BLOCKED state)
6. Multi-System Action Engine (adapter abstraction; Google Workspace, Slack, GitHub, Jira live-mocked; AWS/HRMS/VPN/Asset optional mocks)
7. Failure & Exception Engine (reason, impact, affected downstream tasks, retry, escalate)
8. Human Approval Engine (manager + security approval chains, AI never authorizes)
9. Least-Privilege Access View
10. HR Command Center
11. Manager Dashboard & Approval Center
12. Employee Dashboard
13. Employee Lifecycle Timeline
14. **What-If Simulation** (change role/department/team/level, preview access/approvals/risk/readiness deltas without persisting)
15. **Access Intelligence Graph** (Role→Dept→Team→App→Permission→Approval, interactive)
16. **Exception Center** (Critical / Action Required / Warning / Resolved)
17. **Audit Trail** (every state transition, who/what/when/why/before/after)

> Items 14–17 are called out explicitly in the master prompt's Phase 1 scope and are treated as P0, not P1, to match the demo story in §9.

### P1 — Strong advanced features (post-P0-stable)
- AI Employee Assistant (context-aware, grounded in real employee/task data)
- AI Risk Detection (onboarding-stall signal → HR/Manager notification)
- Smart Notification Engine (priority-based, not chatter)
- AI Company Knowledge Assistant (RAG over HR/IT/security policy docs)
- IT Helpdesk Integration + AI Ticket Triage
- Role-Based Training Path
- Asset Management
- IT Operations Dashboard

### 7.3 P2 — Lifecycle & Extension Platform (in scope — frontend built in Phase 1 alongside everything else)

These are **committed features of this project**, not aspirational extras, and — per explicit build direction — their **frontend is built in Phase 1** together with P0 and P1, on mock data, so the full product is navigable and demoable before any backend work starts. Only the *backend* for these lands later (Phase 9, after the P0/P1 backend is done), because they extend the core orchestration engine to the rest of the employee lifecycle (transfer, exit) and to adjacent workplace surfaces (mentorship, planning, engagement, community), and their backend logic is cheapest to build once the Rules/Dependency/Approval/Audit engines it reuses already exist end-to-end:

- **Mentor/Buddy System** — assign manager/mentor/buddy, meeting scheduling, introductions, mentor visibility to the employee
- **Smart First-Week Planner** — role-aware first-week schedule generated alongside the onboarding plan
- **Internal Transfer Engine** — role-change workflow that removes/adds/updates access, training, manager, and team using the *same* Rules/Dependency/Approval engines as onboarding (this reuses What-If Simulation's diff engine directly — see §8.5)
- **Employee Lifecycle Platform** — the full Candidate → Onboarding → Day 1 → First Week → 30/60/90 Days → Transfer/Promotion → Offboarding timeline, built on the existing Audit Trail/Timeline infrastructure
- **Intelligent Offboarding** — generates an exit workflow across HR/IT/Manager/Finance using the same orchestration/dependency engine as onboarding, run in reverse (revoke instead of provision)
- **Offboarding Security Risk Detection** — on EXITING status, diffs active access against "should have none," flags residual access as a security risk, auto-creates revocation tasks (reuses the Access Drift Detection engine, §8.5)
- **Employee Pulse** — lightweight voluntary engagement signal (😊🙂😐😞), trend-visible to HR only in aggregate; explicitly never a clinical or diagnostic signal (see §4 Non-Goals)
- **Employee Community Hub** — announcements, events, team updates, polls, knowledge sharing; kept as a clearly separate module/route from the core onboarding workflow so it never competes with the orchestration UI for attention

**Why this reuse strategy matters:** because Internal Transfer, Offboarding, and Offboarding Security Risk Detection all reuse the Rules Engine, Dependency Engine, Approval Engine, and Access Drift computation already built for P0/P1 (system-architecture.md §3), their *backend* phase is primarily wiring an already-designed UI to existing infrastructure, not a second product. Mentor/Buddy, Smart Planner, Lifecycle Timeline-extension, Pulse, and Community Hub are additive UI/data modules with light coupling to the core engine. See `implementation-plan.md` §3.3 for the Phase 1 frontend build list and §11 for the Phase 9 backend build list.

---

## 8. Improvements Added Beyond Source Docs

For each: WHY / WHAT PROBLEM IT SOLVES / PRIORITY / DEPENDENCIES / IMPLEMENTATION IMPACT.

### 8.1 Idempotent Execution Ledger
- **WHY:** Retries and re-runs of provisioning steps are core to the failure story (P0-07); without idempotency, a retry could double-provision (e.g., two GitHub invites).
- **WHAT PROBLEM IT SOLVES:** Prevents duplicate side effects across retries, reconnects, and concurrent orchestrator runs.
- **PRIORITY:** P0 (foundational to Multi-System Action Engine).
- **DEPENDENCIES:** Task state machine, Integration Adapter interface.
- **IMPLEMENTATION IMPACT:** Every adapter call carries a stable `idempotencyKey` (`taskId:attempt`); adapters store last-seen keys; low cost, high safety payoff.

### 8.2 AI Recommendation Confidence & Rationale Object
- **WHY:** features.md demands explainability; a bare string reason is weak evidence of "real reasoning" to a judge or an auditor.
- **WHAT PROBLEM IT SOLVES:** Makes AI output inspectable and makes the AI/rules boundary visible in the UI (§5 of implementation.md).
- **PRIORITY:** P0.
- **DEPENDENCIES:** Intelligence Service, Rules Engine.
- **IMPLEMENTATION IMPACT:** AI returns `{ requirement, recommendedStatus, confidence, rationale, policyRefs[] }`; Rules Engine can override `recommendedStatus`, and the UI shows both the AI's suggestion and the enforced final decision when they differ. This *is* the "AI recommends → Rules validates → Final decision" flow in implementation.md §5, made visible instead of implicit.

### 8.3 Policy & Rule Versioning
- **WHY:** implementation.md §6 already asks for versioned rules; without it, "why did Rahul's plan differ from last month's Rahul" is unanswerable.
- **WHAT PROBLEM IT SOLVES:** Auditability of *policy change*, not just employee state change.
- **PRIORITY:** P0 (cheap: add `version`, `effectiveFrom`, `supersedes` to the Rule table).
- **DEPENDENCIES:** Database design.
- **IMPLEMENTATION IMPACT:** Minor schema addition; plans store the rule-set version they were generated against.

### 8.4 Approval SLA & Escalation Timer
- **WHY:** P1-02 (Risk Detection) needs a concrete signal; "pending approval" with no clock is not a risk signal.
- **WHAT PROBLEM IT SOLVES:** Turns a stalled approval into a detectable, explainable risk ("4 critical tasks incomplete after 5 days" pattern from features.md §P1-02).
- **PRIORITY:** P1.
- **DEPENDENCIES:** Approval Engine, Notification Engine, Risk Engine.
- **IMPLEMENTATION IMPACT:** Each approval gets a target SLA by risk level; a scheduled job (or, for the hackathon, a computed-on-read staleness check) flags overdue approvals into the Exception Center.

### 8.5 Access Drift Detection (pulled up from P2 list, redefined as P1)
- **WHY:** features.md's own "possible additions" list (§24) names this as valuable; it also strengthens the least-privilege story (P0-09) into something continuous rather than one-time.
- **WHAT PROBLEM IT SOLVES:** Detects when an employee's *actual* granted access no longer matches what their *current* role/team requires (e.g., after a manual grant, or after a role change that wasn't reflected).
- **PRIORITY:** P1.
- **DEPENDENCIES:** Role Intelligence Engine, Access model, What-If Simulation engine (reuses the same "compute required access for context X" function).
- **IMPLEMENTATION IMPACT:** Reuses the What-If computation against the employee's *current* context instead of a hypothetical one; diff against granted access; surface as Exception Center entries.

### 8.6 Demo Control Panel (Seed / Reset / Inject Failure)
- **WHY:** master-prompt §6 and implementation.md §34 script an exact failure demo (Jira fails on purpose). A judge-facing product needs this to be reliable and repeatable, not hand-edited in devtools.
- **WHAT PROBLEM IT SOLVES:** Deterministic, repeatable hackathon demos; also doubles as a QA tool.
- **PRIORITY:** P0 (frontend-only, mock-data phase).
- **DEPENDENCIES:** Mock service layer.
- **IMPLEMENTATION IMPACT:** Hidden/admin-only panel: reset all mock state, seed the 3 canonical employees, force the next Jira call to fail. Zero backend risk, pure mock-layer feature.

---

## 9. Killer Demo Script (authoritative — see appflow.md for full flow)

1. Create **Rahul Sharma** — Backend Developer, Engineering, Payments, Junior.
2. Generate AI plan → "14 onboarding actions across 5 systems."
3. Click **Why?** on GitHub, Jira, Production AWS.
4. **Start Onboarding** → Email ✓, Slack ✓, GitHub ✓, **Jira ❌ (user already exists)**.
5. System shows 2 downstream tasks BLOCKED, explains the chain.
6. IT retries Jira → succeeds → downstream unblocks.
7. AWS Dev Access requires **Manager Approval** → Manager approves → task executes.
8. Readiness reaches **100% Day-1 Ready**; Risk shown; Audit Timeline shown.
9. Open **What-If**, change Rahul's role to Senior Backend Developer → show changed access/approvals/risk/readiness, discard.

## 10. Definition of "Day-1 Ready"

Not `completed / total`. A binary gate:
```
Day-1 Ready = (all CRITICAL tasks COMPLETED)
          AND (all REQUIRED access COMPLETED or not blocking)
          AND (all REQUIRED training COMPLETED)
          AND (0 unresolved blocking failures)
          AND (0 pending mandatory approvals)
```
OPTIONAL items never block readiness. See `database-design.md` §Requirement.criticality and `SRS.md` FR-READY-01.

## 11. Success Criteria (hackathon)

A judge watches: New Employee → System Understands Role → Personalized Plan → Why? → Dependency Graph → Automated Multi-System Setup → Failure → Blocked Tasks → Human Approval → Workflow Resume → 100% Day-1 Ready — and concludes this is an orchestration engine, not a checklist app.

## 12. Constraints & Principles

- AI never grants access directly; the Rules Engine is the sole authority (implementation.md §5, §37).
- 4 real adapter contracts implemented well (Google/Slack/GitHub/Jira) beat 15 fake ones (features.md §P0-06).
- Frontend must be fully demoable on mock data with zero backend dependency (master-prompt §4).
- Every AI-influenced decision must carry a reason string a non-technical HR user can read.

## 13. Open Questions (HIGH IMPACT — require stakeholder input, not resolved by this doc)

1. Which LLM provider/model and budget ceiling for the hackathon (cost-bearing decision — master-prompt §3 escalation rule).
2. Do we need real OAuth against actual GitHub/Slack/Jira/Google test tenants for the demo, or is a convincingly-animated mock sufficient? (Vendor lock-in / external approval consideration.)
3. Is there a real org chart / HRIS to seed from, or do we own all seed data?

Everything else in this document set is decided unilaterally per the master prompt's decision-authority grant (§3).
