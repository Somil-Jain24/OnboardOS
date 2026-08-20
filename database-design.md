# OnboardOS — Database Design

Version 1.0 | PostgreSQL + Prisma | Companion to system-architecture.md

---

## 1. Design Principles

- Relational (PostgreSQL) — entities are highly relational: employees, roles, tasks, dependencies, approvals (implementation.md §2 rationale).
- Explicit state, never booleans, for anything workflow-related (`TaskStatus` enum, not `done: boolean`).
- Every table that represents a decision or transition carries `reason`/`rationale` text — explainability is a data requirement, not just a UI feature.
- Soft-delete (`deletedAt`) on Employee/User only; everything else is append-mostly (audit-friendly).
- All monetary/PII-adjacent fields avoided entirely — this system stores work-identity data, not personal sensitive data.

## 2. Entity Overview

```
Organization ─┬─ Department ─┬─ Team ─┬─ Employee ──manager──> Employee
              │               │        │
              │               │        ├─ EmployeeContext (denormalized snapshot)
              │               │        ├─ OnboardingPlan ──┬─ PlanItem ──> RequirementRule
              │               │        │                    └─ Task ──> TaskDependency
              │               │        ├─ Approval ──> Task
              │               │        ├─ RiskAssessment
              │               │        ├─ ExceptionEvent
              │               │        └─ AuditLog
              │               └─ Project
              └─ Role ──> RequirementRule (versioned)

User (RBAC) ──> Employee (optional 1:1, for EMPLOYEE-role login)
IntegrationAdapterAction ──> Task
Notification ──> User
Ticket ──> Employee            (P1)
Asset ──> Employee              (P1)
KnowledgeDocument / Chunk       (P1, pgvector)
```

## 3. Core Tables (Prisma-style shorthand)

### Organization / Department / Team / Project
```
Organization { id, name }
Department   { id, orgId, name }
Team         { id, departmentId, name }
Project      { id, teamId, name, code }
```

### Role
```
Role { id, title, departmentId, level (JUNIOR|MID|SENIOR|LEAD), createdAt }
```

### Employee
```
Employee {
  id, name, email,
  roleId, departmentId, teamId, projectId,
  seniority (JUNIOR|MID|SENIOR|LEAD),
  location, employmentType (FULL_TIME|CONTRACT|INTERN),
  managerId (self-relation → Employee),
  status (INVITED|ACTIVE|EXITING|OFFBOARDED),
  startDate, createdAt, updatedAt, deletedAt
}
```

### EmployeeContext (immutable snapshot used for plan generation, PRD §7 alignment)
```
EmployeeContext {
  id, employeeId, capturedAt,
  roleTitle, department, team, seniority, location, employmentType,
  managerId, projectId,
  raw JSONB   -- normalized structured context passed to AI, matches implementation.md §7 shape
}
```
> Why a snapshot table and not just reading Employee live: a plan must remain explainable against the context *at generation time*, even if the employee's role changes later (see Access Drift Detection, PRD §8.5, which explicitly diffs "current context" vs "plan-time context").

### RequirementRule (versioned policy — PRD §8.3)
```
RequirementRule {
  id, version, effectiveFrom, supersedesId (nullable self-relation),
  scope JSONB,        -- e.g. {role:"Backend Developer", department:"Engineering"}
  requirementName,     -- e.g. "GitHub Access"
  category,             -- Identity|Communication|Development|Project|Security|Cloud|Training|Assets|People
  decision (REQUIRED|OPTIONAL|NOT_APPLICABLE|APPROVAL_REQUIRED),
  approvalChain JSONB,   -- e.g. ["MANAGER"] or ["MANAGER","SECURITY"]
  riskLevel (LOW|MEDIUM|HIGH),
  reasonTemplate,         -- human-readable explanation template
  createdBy, createdAt
}
```

### OnboardingPlan / PlanItem
```
OnboardingPlan {
  id, employeeId, employeeContextId, ruleSetVersion,
  generatedAt, status (DRAFT|ACTIVE|SUPERSEDED)
}

PlanItem {
  id, planId, requirementRuleId (nullable if pure-AI-sourced),
  name, category,
  finalDecision (REQUIRED|OPTIONAL|NOT_APPLICABLE|APPROVAL_REQUIRED|BLOCKED),
  reason,                       -- final human-readable reason (FR-WHY-01)
  aiRecommendedDecision,         -- nullable, PRD §8.2
  aiConfidence FLOAT,            -- nullable
  aiRationale,                   -- nullable
  riskLevel (LOW|MEDIUM|HIGH),
  taskId (nullable → Task, once orchestrated)
}
```

### Task / TaskDependency (the execution graph)
```
Task {
  id, planItemId, employeeId, name, category,
  status (PENDING|READY|RUNNING|COMPLETED|FAILED|WAITING_APPROVAL|BLOCKED|REJECTED|HUMAN_INTERVENTION|SKIPPED),
  adapterType (GOOGLE|SLACK|GITHUB|JIRA|AWS|HRMS|VPN|ASSET|NONE),
  attempt INT DEFAULT 0,
  idempotencyKey,
  failureReason, failureCode,
  createdAt, startedAt, completedAt
}

TaskDependency {
  id, taskId, dependsOnTaskId
}
```

### IntegrationAdapterAction (execution ledger — PRD §8.1)
```
IntegrationAdapterAction {
  id, taskId, adapterType, operation, idempotencyKey UNIQUE,
  success, externalId, errorCode, reason, requestedAt, respondedAt
}
```

### Approval (FR-APR-*)
```
Approval {
  id, taskId, employeeId,
  stage INT,                 -- 1 = Manager, 2 = Security, etc.
  approverRole (MANAGER|SECURITY|ADMIN),
  approverUserId (nullable until claimed),
  status (PENDING|APPROVED|REJECTED|MORE_INFO_REQUESTED),
  requestedAt, respondedAt, slaTargetAt, reason, responseNote
}
```

### ExceptionEvent (Exception Center)
```
ExceptionEvent {
  id, employeeId, taskId (nullable), approvalId (nullable),
  severity (CRITICAL|ACTION_REQUIRED|WARNING|RESOLVED),
  title, description, impactSummary,
  createdAt, resolvedAt, resolvedBy
}
```

### RiskAssessment / Readiness
```
RiskAssessment {
  id, employeeId, computedAt,
  riskScore INT, riskLevel (LOW|MEDIUM|HIGH),
  factors JSONB,       -- [{factor, weight, detail}]
  dayOneReady BOOLEAN,
  readinessBreakdown JSONB  -- {criticalTasksComplete, requiredAccessComplete, requiredTrainingComplete, blockingFailures, pendingApprovals}
}
```

### AuditLog (FR-AUDIT-01, append-only)
```
AuditLog {
  id, employeeId, actorUserId, actorRole,
  action, entityType, entityId,
  previousState JSONB, newState JSONB,
  reason, result, createdAt
}
```

### User / RBAC
```
User {
  id, email, passwordHash, role (ADMIN|HR|IT|MANAGER|EMPLOYEE),
  employeeId (nullable 1:1), createdAt, deletedAt
}
```

### P1 tables
```
Ticket   { id, employeeId, category, priority, team, slaHours, status, description, aiClassification JSONB, createdAt, resolvedAt }
Asset    { id, employeeId, type (LAPTOP|MONITOR|KEYBOARD|MOUSE|ID_CARD|ACCESS_CARD), state (ASSIGNED|RECEIVED|DAMAGED|LOST|RETURNED), assignedAt }
KnowledgeDocument { id, title, source, updatedAt }
KnowledgeChunk    { id, documentId, content, embedding VECTOR(1536) }  -- pgvector
Notification      { id, userId, priority (CRITICAL|HIGH|MEDIUM|LOW), title, body, read, createdAt, refType, refId }
```

## 4. Key Constraints & Indexes

- `TaskDependency(taskId, dependsOnTaskId)` unique; application-level DAG cycle check on insert (no self-reference chains).
- `IntegrationAdapterAction.idempotencyKey` unique — the enforcement point for PRD §8.1.
- `RequirementRule(scope, requirementName, version)` unique — versioning integrity.
- Index `Task(employeeId, status)`, `Approval(status, approverRole)`, `ExceptionEvent(severity, resolvedAt)` for dashboard queries (NFR-11).
- `AuditLog` has no update/delete path at the application layer (insert-only).

## 5. Readiness Computation (maps to PRD §10 / FR-READY-01)

Computed on read (or cached in `RiskAssessment.readinessBreakdown`), never stored as a single stale boolean on Employee:
```sql
dayOneReady =
  NOT EXISTS (critical Task where status NOT IN ('COMPLETED'))
  AND NOT EXISTS (required PlanItem where finalDecision='REQUIRED' AND Task.status NOT IN ('COMPLETED'))
  AND NOT EXISTS (required training Task where status != 'COMPLETED')
  AND NOT EXISTS (Task where status='FAILED' AND NOT resolved)
  AND NOT EXISTS (Approval where status='PENDING' AND stage IS mandatory)
```

## 5a. Phase 10 Tables (Lifecycle & Extension Platform — committed scope, PRD.md §7.3, SRS.md §3.16)

```
TransferRequest {
  id, employeeId, fromContextId, toContextId (→ EmployeeContext snapshots),
  diffAccessAdded JSONB, diffAccessRemoved JSONB, diffApprovals JSONB,
  status (DRAFT|APPLIED), appliedAt, createdBy
}

OffboardingPlan {
  id, employeeId, initiatedAt, exitDate,
  status (DRAFT|ACTIVE|COMPLETE)
}
-- reuses PlanItem/Task/TaskDependency/Approval tables (category values extended: HR_EXIT, IT_REVOKE, MANAGER_HANDOVER, FINANCE)

OffboardingRiskFlag {
  id, employeeId, system, detectedAt, resolvedAt,
  description   -- e.g. "GitHub access still ACTIVE 2 days after EXITING status"
}

MentorAssignment {
  id, employeeId, mentorEmployeeId, buddyEmployeeId, assignedAt
}

FirstWeekPlanItem {
  id, employeeId, day INT, time, title, description
}

PulseResponse {
  id, employeeId, submittedAt, value (GREAT|GOOD|OKAY|STRUGGLING)
}
-- aggregate-only read model for HR; no individual-level clinical inference is computed or stored (FR-LIFE-07)

CommunityPost {
  id, authorUserId, type (ANNOUNCEMENT|EVENT|UPDATE|POLL|KNOWLEDGE),
  title, body, createdAt
}
-- isolated from Employee/Task/Approval tables by design (FR-LIFE-08); no foreign keys into the orchestration core
```

## 6. Seed Data

Three canonical employees (implementation.md §33), each producing visibly different plans:
1. Rahul Sharma — Backend Developer / Engineering / Payments / Junior
2. Priya Mehta — UI/UX Designer / Design / Product / Junior
3. Aman Verma — HR Executive / Human Resources / People Operations / Mid-Level

Plus: base RequirementRule set covering Backend Developer, UI/UX Designer, HR Executive (v1), one Admin user, one HR user, one Manager user, one IT user, one Employee user (mapped to Rahul).
