# ANTIGRAVITY-RULES.md — OnboardOS Agent Operating Rules

These rules govern any AI coding agent (e.g., Antigravity) working on OnboardOS across sessions. Binding until amended.

## Rule 1 — Documents Are Source of Truth
Read in this order before writing any code: `PRD.md`, `SRS.md`, `appflow.md`, `system-architecture.md`, `database-design.md`, `TRD.md`, `ui-ux-design.md`, `implementation-plan.md`, `TASKS.md`, `DEVELOPMENT-REPORT.md`. If a contradiction is found between documents, `implementation-plan.md` phasing and `SRS.md` requirement IDs win; log the contradiction and fix the doc in the same session (see Rule 18).

## Rule 2 — Phase Order Is Binding
Follow `implementation-plan.md` §1 phase order. Do not begin backend work before the Phase 1 frontend prototype is sufficiently complete, per master-prompt §4 and implementation-plan.md.

## Rule 3 — Frontend-First, Mock-First
Never block frontend progress on database, real APIs, authentication, real AI keys, real integrations, or production infrastructure during Phase 0–1. Always build against the `OnboardOSClient` mock interface (system-architecture.md §6).

## Rule 4 — AI Never Authorizes
The AI/Intelligence Service may only recommend. The Rules Engine is the sole authority for REQUIRED / APPROVAL_REQUIRED / BLOCKED decisions and for any approval-gated or production-sensitive access. Never wire AI output directly to a grant, an approval, or a security decision.

## Rule 5 — Independent Engineering Authority
The agent is authorized to independently: create/modify/refactor files, install dependencies, fix bugs, improve UI/architecture/security/accessibility/performance, add tests/validation, create utilities/components, modify schema/migrations. Ask only for genuinely HIGH IMPACT decisions (Rule 15).

## Rule 6 — One Task File
Maintain only `TASKS.md`. Never create `tasks-v2.md`, `tasks-final.md`, `tasks-new.md`, `tasks-updated.md`, or similar forks.

## Rule 7 — Always Know What Is Left
Before starting work: (1) read `TASKS.md`, (2) find the highest-priority incomplete task whose dependencies are satisfied, (3) implement, (4) verify, (5) update `TASKS.md`. Task statuses: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`, `SKIPPED`.

## Rule 8 — Report After Meaningful Work
After completing a meaningful task, append an entry to `DEVELOPMENT-REPORT.md` recording: date, task ID, feature, what was built, files created/modified, architecture/database/API/UI changes, tests, known issues, next recommended task.

## Rule 9 — Resume Without Restarting
At the start of a new session, read in order: `ANTIGRAVITY-RULES.md` → `TASKS.md` → `DEVELOPMENT-REPORT.md` → `implementation-plan.md` → relevant source files. Then continue. Never restart planning from zero.

## Rule 10 — Verify Before Claiming Completion
Never claim something works without checking it: run build, tests, type-check, lint, and/or runtime verification appropriate to the change before marking a task `DONE`.

## Rule 11 — No Fake Completion
Do not mark a task `DONE` if: core implementation is missing, UI is disconnected from real state, important errors are ignored, obvious placeholders remain, or the task's `SRS.md` acceptance criteria are not met.

## Rule 12 — Preserve Existing Work
Understand existing code before changing it. Prefer incremental improvement over rewrites unless a rewrite is explicitly the task.

## Rule 13 — Security
Never: expose secrets, hardcode credentials, bypass authorization, disable security checks, trust client-side authorization/role claims, or allow AI output to bypass policy (Rule 4).

## Rule 14 — AI Safety
Deterministic policy (Rules Engine) remains authoritative in all cases. AI cannot override security policy — enforced structurally (system-architecture.md §4), not just by convention.

## Rule 15 — Ask Only When Necessary
Ask the user only for: major ambiguity, conflicting requirements the docs don't resolve, irreversible decisions, significant external/paid-service costs, security/legal confirmation, or a potentially destructive data operation. Otherwise, decide independently and record the decision (Rule 18).

## Rule 16 — Keep Project Runnable
After meaningful changes, run appropriate verification (build/tests/lint) so the project remains runnable at every commit boundary.

## Rule 17 — Follow the Roadmap
Use `implementation-plan.md` and `TASKS.md` as the roadmap. Do not build features outside current-phase scope, and do not pull P1/P2 features forward without updating `TASKS.md` and recording why (Rule 18).

## Rule 18 — Document Major Decisions
For every major decision made independently, record: the decision, the reason, alternatives considered, and the impact — either inline in `DEVELOPMENT-REPORT.md` under the relevant task, or as an addition to the relevant spec doc if it changes product/architecture direction.

## FINAL RULE

**PLAN ONCE. IMPLEMENT CONTINUOUSLY. DOCUMENT PROGRESS. DO NOT REPLAN REPEATEDLY.**
