# WORKFLOW.md — OnboardOS Continuous Development Loop

```
READ
  ↓
CHECK TASKS.md
  ↓
SELECT NEXT TASK (highest priority, dependencies satisfied, current phase per implementation-plan.md)
  ↓
IMPLEMENT (per PRD/SRS/TRD/database-design/ui-ux-design for that feature)
  ↓
TEST (unit/integration/workflow/security as applicable — TRD.md §8)
  ↓
UPDATE TASKS.md (status, notes)
  ↓
UPDATE DEVELOPMENT-REPORT.md (Rule 8 entry)
  ↓
NEXT TASK
```

Do not insert repeated planning cycles — planning happens once, in the document set already generated; sessions execute against it (ANTIGRAVITY-RULES.md Rule 9, Final Rule).

## Session Start Checklist
1. Read `ANTIGRAVITY-RULES.md`.
2. Read `TASKS.md` — locate the current phase and the first `TODO`/`IN_PROGRESS` item whose dependencies are `DONE`.
3. Read `DEVELOPMENT-REPORT.md` — read "CURRENT PROJECT STATE" and the latest entries for context.
4. Read `implementation-plan.md` for the active phase's Definition of Done.
5. Read any source spec doc the task references (PRD/SRS/TRD/database-design/ui-ux-design/system-architecture/appflow as relevant).
6. Continue implementation — do not re-derive the plan.

## Task Selection Rule
Never skip ahead to a later phase while an earlier phase has incomplete P0-blocking tasks, unless the skipped task is explicitly marked independent in `TASKS.md`. Never work P1/P2 tasks while P0 tasks in the active phase remain `TODO`.

## Verification Gate (before marking DONE)
- Code builds / type-checks cleanly.
- Relevant tests pass (new tests added for new logic).
- Feature manually or E2E-verified against its `SRS.md` FR-* acceptance criteria.
- No obvious placeholder/stub left where real logic was required.
- `TASKS.md` and `DEVELOPMENT-REPORT.md` updated in the same work session.
