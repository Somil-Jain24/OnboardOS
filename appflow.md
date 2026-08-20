# OnboardOS — Application Flow

Version 1.0 | Companion to PRD.md, ui-ux-design.md

---

## 1. Route Map (frontend)

```
/login

/hr                         HR Command Center (default landing for HR)
/hr/employees                Employee list
/hr/employees/new            Create employee
/hr/employees/:id            → redirects to /employees/:id (Command Center is role-aware)
/hr/exceptions                Exception Center

/employees/:id                Employee Command Center (centerpiece)
/employees/:id/plan            Onboarding plan detail
/employees/:id/access          Access Intelligence Graph
/employees/:id/provisioning     Provisioning live view
/employees/:id/timeline         Lifecycle Timeline (extended, P2: Candidate→...→Offboarding)
/employees/:id/whatif           What-If Simulation
/employees/:id/risk             Risk & Readiness detail
/employees/:id/transfer          Internal Transfer Engine (P2)
/employees/:id/offboarding        Intelligent Offboarding workflow (P2)
/employees/:id/mentor              Mentor/Buddy assignment (P2)
/employees/:id/first-week           Smart First-Week Planner (P2)

/manager                     Manager Dashboard (My Team)
/manager/approvals            Approval Center (pending queue)
/manager/approvals/:id         Approval detail

/me                          Employee Dashboard (self)
/me/tasks                     My tasks by day
/me/assistant                  AI Employee Assistant (P1)
/me/help                       IT Helpdesk / raise issue (P1)
/me/first-week                  My First-Week Plan (P2)
/me/mentor                       My Mentor/Buddy (P2)
/me/pulse                         Employee Pulse check-in (P2)

/it                           IT Operations Dashboard
/it/tickets                    Ticket queue (P1)
/it/assets                     Asset management (P1)
/it/offboarding                 Offboarding Security Risk Detection queue (P2)

/admin/roles                  Role/rule configuration
/admin/users                   User & RBAC management

/knowledge                    Company Knowledge Assistant (P1, all roles)
/community                    Employee Community Hub (P2, isolated module, all roles)

/_demo                        Demo Control Panel (seed/reset/inject-failure) — hidden, admin-gated
```

Role-based route guards: ADMIN sees everything; HR sees `/hr/*`, `/employees/*`, `/knowledge`; MANAGER sees `/manager/*`, `/employees/:id` (only direct reports), `/knowledge`; EMPLOYEE sees `/me/*`, `/knowledge`; IT sees `/it/*`, `/employees/:id` (read + retry actions), `/hr/exceptions`.

## 2. Primary User Flows

### 2.1 HR: Create Employee → Generate Plan
```
/hr/employees/new
  → fill Name, Role, Department, Team, Seniority, Location, Employment Type, Manager, Project
  → Submit → POST /api/employees (FR-CTX-01..03)
  → redirect /employees/:id
  → "Generate Onboarding Plan" CTA (empty state, no plan yet)
  → click → AI reasoning loading state ("Analyzing role requirements…")
  → POST /api/employees/:id/plan/generate (FR-PLAN-01..04, FR-ROLE-01..03)
  → Plan renders grouped by category, each item shows status chip + "Why?" link
```

### 2.2 Why? Explanation
```
Plan item → click "Why?"
  → inline expand or side panel
  → shows reason (FR-WHY-01)
  → if AI/Rules disagreed: shows both AI suggestion + enforced decision (FR-WHY-02)
  → shows policy rule reference (rule id + version)
```

### 2.3 Start Provisioning → Live Progress
```
Command Center → "Start Onboarding"
  → POST /api/employees/:id/provisioning/start
  → orchestrator resolves task graph, marks root tasks READY→RUNNING
  → live list updates per task: PENDING → READY → RUNNING → COMPLETED | FAILED | WAITING_APPROVAL
  → dependents of a FAILED task flip to BLOCKED with inline reason (FR-DEP-03..04)
```

### 2.4 Failure → Retry → Recovery
```
Task card shows FAILED (e.g., Jira: "User already exists")
  → shows Impact: "2 downstream tasks blocked"
  → actions: [Retry] [Assign to IT] [Skip with reason]
  → Retry → POST /api/tasks/:id/retry (idempotent attempt #2, FR-INT-03)
  → success → task COMPLETED → dependents auto-unblock → READY → RUNNING (FR-DEP-05)
  → Exception Center entry auto-moves Critical → Resolved
```

### 2.5 Approval Flow
```
Task requires approval (e.g., AWS Dev Access)
  → task state WAITING_APPROVAL
  → Approval record created, routed to Manager (or Manager→Security chain)
  → Manager sees it in /manager/approvals with: employee, requested permission, reason, risk level
  → Approve → POST /api/approvals/:id/approve → task → READY → RUNNING → COMPLETED (FR-APR-04)
  → Reject → task → REJECTED, employee/HR notified, audit logged
  → Request More Info → status stays WAITING_APPROVAL, comment thread appended
```

### 2.6 What-If Simulation
```
/employees/:id/whatif
  → change Role/Department/Team/Level fields (scratch copy only, FR-SIM-01)
  → "Simulate" → POST /api/employees/:id/simulate (no persistence)
  → shows diff: + Access added, − Access removed, approvals delta, risk delta, readiness delta (FR-SIM-02)
  → [Discard] (default on navigate away) or [Apply as Role Change] (explicit, persists, re-runs plan)
```

### 2.7 Readiness Reached
```
Last blocking task COMPLETED
  → readiness engine recomputes (FR-READY-01)
  → Command Center banner: "Rahul Sharma is 100% Day-1 Ready"
  → Timeline shows full history; Audit Trail available in one click
```

## 3. AI Reasoning Loading State (spec)

Not a spinner alone. Sequence (mocked, deterministic timing for demo reliability):
1. "Reading employee context…" (300ms)
2. "Matching role & department rules…" (500ms)
3. "Generating requirement recommendations…" (700ms)
4. "Validating against policy…" (400ms)
5. "Plan ready." → render

This sequence doubles as a visible illustration of the AI→Rules Engine boundary from implementation.md §5, satisfying PRD §8.2 in the UI, not just the API.

## 4. Empty / Error / Loading States (must exist for every list/detail view)

- **Empty**: "No employees yet — create your first hire" (with CTA), not a blank white page.
- **Loading**: skeleton cards matching final layout, never a full-page spinner for partial data.
- **Error**: human-readable message + retry action; never a raw stack trace or console-only failure.
- **Blocked/Failed states**: always paired with an explicit next action, never just a red badge.

## 5. Cross-Cutting: Notification Surface (P1)

Priority-ranked, not per-event chatter (features.md P1-03): a single "🔴 2 actions require your attention" entry point, expandable to the underlying list, present in HR/Manager/Employee/IT headers.

## 6. P2 Flows — Lifecycle & Extension Platform (frontend built in Phase 1, mock data — PRD.md §7.3)

### 6.1 Internal Transfer
```
/employees/:id/transfer
  → change Role/Department/Team/Level (same fields as What-If, §2.6)
  → "Preview Transfer" → diff: access to remove (red-strike), access to add (green), new approvals required
  → "Apply Transfer" → persists, regenerates plan for the new context, creates remove/add tasks (FR-LIFE-01)
```

### 6.2 Intelligent Offboarding
```
Employee Command Center → "Initiate Offboarding"
  → set exit date → status → EXITING
  → POST /api/employees/:id/offboarding/generate (mock in Phase 1)
  → offboarding plan renders grouped by HR / IT / Manager / Finance, same card language as onboarding (FR-LIFE-02)
  → /it/offboarding shows Offboarding Security Risk Detection: any access still ACTIVE past exit date, auto-creates revoke tasks (FR-LIFE-03)
  → Lifecycle Timeline (/employees/:id/timeline) extends to show the full Candidate→Offboarding history (FR-LIFE-04)
```

### 6.3 Smart First-Week Planner
```
Generated automatically alongside the onboarding plan (§2.1) — no separate trigger
  → /employees/:id/first-week (HR/Manager view) and /me/first-week (employee view)
  → day-by-day schedule, role-aware (FR-LIFE-05)
```

### 6.4 Mentor/Buddy
```
/employees/:id/mentor
  → assign Manager (auto-filled) / Mentor / Buddy (pick from employee list)
  → employee sees assignment + a "Schedule Intro" affordance at /me/mentor (FR-LIFE-06)
```

### 6.5 Employee Pulse
```
/me/pulse
  → weekly prompt: 😊🙂😐😞 (single tap, optional comment)
  → HR sees only aggregate trend (no individual-level view) — enforced in UI, not just policy (FR-LIFE-07)
```

### 6.6 Employee Community Hub
```
/community
  → Announcements / Events / Updates / Polls / Knowledge Sharing feed
  → deliberately has no links into /employees/:id/* — isolated module (FR-LIFE-08)
```
