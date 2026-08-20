# OnboardOS — Software Requirements Specification (SRS)

Version 1.0 | Companion to PRD.md | IEEE-830-inspired, trimmed for hackathon scope

---

## 1. Scope

Defines functional and non-functional requirements for OnboardOS P0 (MVP) and P1 (advanced) scope as prioritized in `PRD.md` §7. Requirement IDs are referenced by `TASKS.md`, `implementation-plan.md`, and test plans.

## 2. Actors

- **HR** — creates employees, views command center, manages exceptions
- **IT** — resolves failures, retries provisioning, manages tickets/assets
- **MANAGER** — approves/rejects access for direct reports
- **EMPLOYEE** — views own onboarding, uses assistant, raises IT issues
- **ADMIN** — manages roles, rules, org structure, users
- **SYSTEM (Orchestrator)** — internal actor executing workflow steps

## 3. Functional Requirements

### 3.1 Employee Context (FR-CTX)
- **FR-CTX-01**: System shall capture employee name, department, role, seniority, team, location, employment type, manager, project on creation.
- **FR-CTX-02**: System shall normalize captured fields into a structured `EmployeeContext` object used as sole input to the Role Intelligence Engine.
- **FR-CTX-03**: System shall reject employee creation missing any required context field, with field-level validation errors.

### 3.2 Role Intelligence (FR-ROLE)
- **FR-ROLE-01**: System shall map `EmployeeContext` to a candidate requirement set via deterministic rules keyed on role/department/team/project/seniority.
- **FR-ROLE-02**: System shall allow AI-assisted recommendation of requirements not covered by explicit rules, tagged with confidence and rationale (PRD §8.2).
- **FR-ROLE-03**: Rules shall be versioned; every generated plan records the rule-set version used (PRD §8.3).

### 3.3 Plan Generation (FR-PLAN)
- **FR-PLAN-01**: System shall classify every candidate requirement into exactly one of: REQUIRED, OPTIONAL, NOT_APPLICABLE, APPROVAL_REQUIRED, BLOCKED.
- **FR-PLAN-02**: Two employees with different role/department/team shall receive demonstrably different plans (acceptance test, not just code review).
- **FR-PLAN-03**: Every plan item shall carry a category (Identity, Communication, Development, Project, Security, Cloud, Training, Assets, People).
- **FR-PLAN-04**: Plan generation shall be re-runnable (regenerate) without duplicating existing in-progress tasks.

### 3.4 Explainability (FR-WHY)
- **FR-WHY-01**: Every plan item shall expose a human-readable reason answering "why is/isn't this required."
- **FR-WHY-02**: Where AI and Rules Engine disagree, the UI/API shall expose both the AI recommendation and the enforced decision (PRD §8.2).

### 3.5 Dependency Engine (FR-DEP)
- **FR-DEP-01**: Tasks shall declare zero or more upstream dependencies forming a DAG (no cycles).
- **FR-DEP-02**: A task shall only transition to READY when all its dependencies are COMPLETED.
- **FR-DEP-03**: When a task transitions to FAILED, all direct and transitive dependents shall transition to BLOCKED automatically.
- **FR-DEP-04**: System shall produce a human-readable block explanation naming the root-cause failed task ("T5 is blocked because T4 depends on T3, which depends on failed T2").
- **FR-DEP-05**: When the root-cause task is resolved (COMPLETED via retry or manual resolution), all BLOCKED dependents whose other dependencies are satisfied shall automatically transition back to READY/RUNNING.

### 3.6 Multi-System Action / Integration (FR-INT)
- **FR-INT-01**: System shall define a common `IntegrationAdapter` interface: `createUser, disableUser, addToGroup, addToTeam, grantAccess, revokeAccess, checkStatus`.
- **FR-INT-02**: System shall implement adapters (mocked, contract-real) for Google Workspace, Slack, GitHub, Jira at minimum.
- **FR-INT-03**: Every adapter call shall be idempotent via a stable idempotency key (PRD §8.1).
- **FR-INT-04**: Adapter failures shall be surfaced with a machine-readable error code and human-readable reason, never a silent no-op.

### 3.7 Failure & Exception Engine (FR-FAIL)
- **FR-FAIL-01**: On task failure, system shall record reason, impact (count/list of blocked downstream tasks), and recommended action(s): Retry / Assign to IT / Resolve Manually.
- **FR-FAIL-02**: System shall support manual retry of a failed task, re-attempting via the same adapter with a new idempotency attempt number.
- **FR-FAIL-03**: System shall support "Assign to IT" (creates/links a ticket) and "Skip with reason" (requires justification text, logged to audit).
- **FR-FAIL-04**: All failures shall appear in the Exception Center with severity classification (Critical/Action Required/Warning), and clear to Resolved on fix.

### 3.8 Human Approval Engine (FR-APR)
- **FR-APR-01**: System shall support single- and multi-stage approval chains (e.g., Manager → Security for Production access).
- **FR-APR-02**: AI shall never be the final authority for an approval-gated action; only a human Approve action transitions the task past WAITING_APPROVAL.
- **FR-APR-03**: Approvers shall be able to Approve, Reject, or Request More Info, each with optional/required reason text.
- **FR-APR-04**: On Approve, dependent tasks blocked solely on that approval shall automatically become READY (workflow resume).
- **FR-APR-05**: Each approval shall have an SLA target by risk level; overdue approvals surface in Exception Center and feed Risk Detection (PRD §8.4).

### 3.9 Access & Least Privilege (FR-ACC)
- **FR-ACC-01**: System shall present, per employee, the full set of systems with status: Granted / Not Required / Restricted-Pending-Approval.
- **FR-ACC-02**: System shall never recommend access beyond the minimum implied by role/department/team rules unless explicitly requested and approved.

### 3.10 What-If Simulation (FR-SIM)
- **FR-SIM-01**: User shall be able to change role/department/team/seniority on a scratch copy of an employee's context and re-run plan generation without persisting.
- **FR-SIM-02**: Simulation output shall show a diff: access added/removed, approvals added/removed, risk delta, readiness delta.
- **FR-SIM-03**: Simulation state shall be discarded on navigation away unless explicitly "Applied."

### 3.11 Access Intelligence Graph (FR-GRAPH)
- **FR-GRAPH-01**: System shall render Role→Department→Team→Application→Permission→Approval as an interactive node graph for a given employee.
- **FR-GRAPH-02**: Node selection shall reveal the same "why" explanation as the plan list view (single source of truth).

### 3.12 Dashboards (FR-DASH)
- **FR-DASH-01 (HR)**: Command Center shows counts (new hires, completed, in progress, blocked, failed) computed live from task/employee state, never hardcoded.
- **FR-DASH-02 (Manager)**: Team view lists direct reports with progress %, status, and pending-approval count; drill-in explains blockers.
- **FR-DASH-03 (Employee)**: Shows only the employee's own plan, grouped by day/category, with clear next actions.
- **FR-DASH-04 (IT)**: Shows pending access/laptop/software/VPN requests by priority.

### 3.13 Timeline & Audit (FR-AUDIT)
- **FR-AUDIT-01**: Every meaningful state transition (plan generated, access decided, provisioning started/failed/retried, approval requested/granted/rejected, task completed) shall write an immutable audit record: who, what, when, why, previous state, new state, result.
- **FR-AUDIT-02**: Employee Lifecycle Timeline shall be derived from audit records, not maintained separately.

### 3.14 Readiness & Risk (FR-READY, FR-RISK)
- **FR-READY-01**: Day-1 Ready = all CRITICAL tasks COMPLETED AND all REQUIRED access COMPLETED/non-blocking AND all REQUIRED training COMPLETED AND 0 unresolved blocking failures AND 0 pending mandatory approvals (PRD §10).
- **FR-RISK-01**: System shall compute a risk score per employee from: overdue critical tasks, failed integrations, overdue approvals, elapsed days since start.
- **FR-RISK-02**: Risk breakdown shall be explainable (contributing factors listed, not just a number).

### 3.15 P1 — AI Assistant, Knowledge, Tickets (FR-AI)
- **FR-AI-01**: Employee Assistant answers shall be grounded in the employee's real onboarding/task/approval state (no hallucinated status).
- **FR-AI-02**: Company Knowledge Assistant answers shall cite/retrieve from an approved document set (RAG); no answer without a retrieved source is presented as policy fact.
- **FR-AI-03**: Ticket Triage shall classify category/priority/team/SLA from free-text issue description.

### 3.16 P2 — Lifecycle & Extension Platform (FR-LIFE) — committed scope, Phase 10
- **FR-LIFE-01 (Transfer)**: A role/department/team change on an existing employee shall produce a diff (access to remove, access to add, approvals newly required) via the same Rules/Dependency engines used for onboarding, and shall generate a task set to execute that diff.
- **FR-LIFE-02 (Offboarding)**: Setting employee status to EXITING shall generate an offboarding plan spanning HR, IT, Manager, and Finance categories, using the same Plan Generator/Orchestrator as onboarding.
- **FR-LIFE-03 (Offboarding Risk)**: On EXITING status, system shall diff currently-active access against "required access for an exited employee" (none) and flag any residual active access as a security risk, auto-creating revocation tasks.
- **FR-LIFE-04 (Timeline)**: The Lifecycle Timeline shall represent a continuous history per employee across Candidate → Onboarding → Day 1 → First Week → 30/60/90 Days → Transfer/Promotion → Offboarding, derived from the same Audit Log as FR-AUDIT-02.
- **FR-LIFE-05 (Planner)**: A role-aware first-week schedule shall be generated alongside the onboarding plan (not a separate manual step).
- **FR-LIFE-06 (Mentor/Buddy)**: System shall support assigning manager/mentor/buddy to an employee, with employee-visible identity and a lightweight meeting-scheduling affordance.
- **FR-LIFE-07 (Pulse)**: System shall allow an employee to submit a voluntary weekly engagement signal (one of 4 states) and shall surface only aggregate trends to HR — never an individual clinical or diagnostic inference (binding constraint, not just a UX preference).
- **FR-LIFE-08 (Community Hub)**: Announcements/events/polls/knowledge-sharing shall live in an isolated route/module and shall not appear inside the core onboarding orchestration screens (Command Center, Plan, Provisioning, Approvals).

## 4. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | Frontend prototype must run fully on mock/local state with zero backend/network dependency (master-prompt §4). |
| NFR-02 | All security-critical authorization decisions are deterministic (Rules Engine); AI output is advisory only (implementation.md §5). |
| NFR-03 | RBAC enforced server-side on every protected endpoint; never trust client-side role claims. |
| NFR-04 | Secrets never in frontend code or version control; environment variables only. |
| NFR-05 | Passwords hashed with Argon2 or bcrypt; sessions/JWTs expire and are revocable. |
| NFR-06 | All API inputs server-side validated (schema validation, e.g., Zod). |
| NFR-07 | Every protected mutation is audit-logged (FR-AUDIT-01). |
| NFR-08 | UI responsive from ~360px to desktop widths; no horizontal scroll on core flows. |
| NFR-09 | Adapter operations idempotent (FR-INT-03); safe to retry without duplicate side effects. |
| NFR-10 | Dashboard figures always computed from live application state, never hardcoded (FR-DASH-01). |
| NFR-11 | P95 API response time < 500ms for read endpoints against seeded demo dataset. |
| NFR-12 | RAG/knowledge assistant must resist prompt injection from ingested documents (implementation.md §28). |

## 5. Data Requirements

See `database-design.md` for full schema. Minimum entities: Employee, Role, Department, Team, Project, Manager relation, RequirementRule (versioned), OnboardingPlan, PlanItem, Task, TaskDependency, IntegrationAdapterAction, Approval, AuditLog, RiskAssessment, ExceptionEvent, Notification, User (RBAC), and P1 entities Ticket, Asset, KnowledgeDocument.

## 6. Traceability

Every FR-* maps to one or more `TASKS.md` task IDs and one or more acceptance criteria in `implementation-plan.md` §Testing. Do not introduce a feature without a corresponding FR-*; do not close a TASK without satisfying its FR-*.
