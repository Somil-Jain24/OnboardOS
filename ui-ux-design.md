# OnboardOS — UI/UX Design

Version 1.0 | Companion to appflow.md | Direction: AI + Enterprise + Security + Automation + Control Center

---

## 1. Design Principles

- Looks like a real enterprise security/automation product, not a generated admin template or a ChatGPT clone (master-prompt §5).
- Every screen answers one of: *What's happening? What's blocked? What needs me?*
- Status is always a first-class visual element — never buried in a table cell.
- No empty cards, no fake/dead buttons, no disconnected pages — every element on screen does something (master-prompt §5 "avoid" list).
- Motion is purposeful only: state-transition emphasis (a task flipping to FAILED, an unblock cascading), never decorative.

## 2. Visual System

- **Typography**: one grotesque/humanist sans for UI (e.g., Inter) + one monospace for IDs, rule keys, and audit payloads (reinforces "system of record" feel).
- **Color as status language** (consistent everywhere — plan list, graph, timeline, dashboards):
  - Completed / Granted → green
  - Required / In progress → blue
  - Approval Required / Warning → amber
  - Failed / Critical / Denied → red
  - Blocked → slate/gray with a lock glyph
  - Optional / Not Applicable → neutral outline, low emphasis
- **Density**: enterprise-dense but not cramped — command-center screens (HR, IT) favor information density; employee-facing screens favor calm and clarity.
- **Elevation**: flat/bordered cards over heavy shadows or gradients (avoids "generic admin template," master-prompt §5).

## 3. Core Screens

### 3.1 Employee Command Center — the centerpiece
Layout: left = identity + context card (role/department/team/manager/project); center = Ready-for-Work score (large, prominent) + Risk score; right = category status grid (Identity/Communication/Development/Project/Security/Cloud/Training); below = System Status list (per system: Granted/Pending/Blocked/Failed) and Action Required panel; footer = Recent Activity feed (last 5 audit events) with link to full Timeline.

### 3.2 AI Plan Generation
Loading state is a **visible reasoning sequence** (see appflow.md §3), not a spinner — this is a demo-critical moment that proves "reasoning," not "loading." Result renders as grouped category sections; each item is a row with: status chip, name, "Why?" affordance, and (if relevant) an AI-vs-Rules divergence indicator.

### 3.3 Access Intelligence Graph
React Flow node graph: Role → Department → Team → Application → Permission → Approval. Node color follows the status language (§2). Clicking a node opens the same "why" panel as the plan list (single source of truth, appflow.md §2.3 note). Default layout auto-arranges top-to-bottom; pan/zoom enabled; a legend is always visible (not a mystery-graph).

### 3.4 Provisioning Live View
Per-system rows transition live (poll-driven, TRD.md §6). A FAILED row expands in place to show reason/impact/actions — no modal required for the primary recovery action (keeps the demo's "retry" moment on-screen and visible to the whole room).

### 3.5 Approval Card
Employee, requested permission + risk level badge, reason, requested-at + SLA countdown, approver actions (Approve/Reject/Request More Info) each requiring/allowing a short note. Approving visibly triggers the "unblocked downstream task" state change if the manager stays on screen (cross-navigates to Command Center on demand, doesn't force it).

### 3.6 What-If Simulation
Split view: left = adjustable context fields (role/department/team/level), right = live diff (added access in green, removed in red-strike, approval deltas, risk delta with arrow, readiness delta). Persistent banner: "Simulation only — not saved" with an explicit "Apply as Role Change" button, never an accidental persist.

### 3.7 HR Command Center
Top-line stat strip (New Hires / Completed / In Progress / Blocked / Failed) computed live (NFR-10) — never static numbers. Below: sortable/filterable employee table with inline status; click row → Employee Command Center.

### 3.8 Manager Dashboard
"My Team" list: name, progress %, status glyph (✓/⚠/🔴 mapped to the color system). Click → same Command Center, scoped to what a manager should see, with a summary line answering "why is this person stuck" inline before they even click through.

### 3.9 Employee Dashboard
"My First Week," grouped by day, checklist-style but state-rich (✓ done, ⚠ needs attention, ○ upcoming) — never a flat todo list. Answers "what do I do next" in the first viewport.

### 3.10 Exception Center
Kanban-style columns: Critical / Action Required / Warning / Resolved. Cards carry the same reason/impact/action pattern as provisioning failures — this screen is the aggregation point, not a new UI language.

### 3.11 Audit Timeline
Vertical timeline, one entry per audit record, icon per action type, timestamp, actor, and a one-line summary; expandable to full before/after state for power users.

### 3.12 Demo Control Panel (admin/hidden)
Minimal utility UI: Reset, Seed 3 employees, Inject Jira failure toggle. Deliberately plain — this is a tool, not a showcase surface.

### 3.13 Internal Transfer Engine (P2)
Same split-view pattern as What-If Simulation (§3.6) but with a persisting "Apply Transfer" action instead of discard-only; on apply, shows a brief confirmation of tasks created (remove/add) before returning to Command Center.

### 3.14 Intelligent Offboarding (P2)
Mirrors the Provisioning Live View (§3.4) visually but runs in reverse: rows show REVOKE operations, category grouping is HR/IT/Manager/Finance instead of Identity/Communication/Development/etc. Uses the same status color language (§2) so it reads as "the same system," not a bolted-on second product.

### 3.15 Offboarding Security Risk Detection (P2)
Lives inside the Exception Center pattern (§3.10) as a filtered view: cards show employee, system, "still active N days after exit," and a one-click Revoke action.

### 3.16 Employee Lifecycle Timeline — extended (P2)
Same vertical timeline as §3.11, extended with phase markers (Candidate / Onboarding / Day 1 / First Week / 30-60-90 / Transfer / Offboarding) as a horizontal progress rail above the chronological entries.

### 3.17 Smart First-Week Planner (P2)
Calendar-style day-by-day view, visually consistent with the Employee Dashboard's "My First Week" pattern (§3.9) — this is intentionally the same component, populated further out.

### 3.18 Mentor/Buddy (P2)
Simple assignment card (Manager/Mentor/Buddy with avatar + name + role) plus a "Schedule Intro" button; kept low-emphasis, supporting content rather than a competing focal point.

### 3.19 Employee Pulse (P2)
Employee-facing: a single large 4-emoji tap target, weekly cadence, optional one-line comment. HR-facing: a trend line only (no individual response ever surfaced to HR in the UI — this is an interface-level guarantee, not just a policy note, per FR-LIFE-07).

### 3.20 Employee Community Hub (P2)
Card-feed layout (announcement/event/update/poll/knowledge tags, color-coded by type using neutral tones distinct from the status-language palette in §2, so the Hub never visually reads as part of the orchestration system). Deliberately the most "normal app" looking screen in the product — this is fine, it is not the product's core surface.

## 4. States Checklist (every list/detail screen must define all four)

Empty · Loading (skeleton, shaped like final content) · Error (message + retry) · Populated — see appflow.md §4 for the underlying rule.

## 5. Responsiveness

Desktop-first (this is an enterprise ops tool), but every core screen must degrade gracefully to ~360px (NFR-08): command-center grid stacks to single column, tables collapse to cards, graph view gets a "view on larger screen" affordance rather than an unusable squeeze.

## 6. Accessibility Baseline

Status is never color-only (icon/glyph + text label always paired with color); all interactive elements keyboard-reachable; form fields labeled; contrast meets WCAG AA against the chosen palette.

## 7. Component Inventory (reusable, drives ui component library structure)

`StatusChip`, `WhyPanel`, `TaskCard`, `DependencyBadge`, `ApprovalCard`, `RiskGauge`, `ReadinessScore`, `CategorySection`, `ExceptionCard`, `TimelineItem`, `AccessGraphNode`, `SimDiffRow`, `EmptyState`, `LoadingSkeleton`, `ErrorState`, `NotificationBell`, `DemoControlPanel`, `TransferDiffPanel`, `OffboardingTaskRow`, `RiskFlagCard`, `LifecyclePhaseRail`, `FirstWeekDayCard`, `MentorAssignmentCard`, `PulseCheckIn`, `CommunityPostCard`.
