# ONBOARDOS — MASTER PRODUCT, ARCHITECTURE & DEVELOPMENT PROMPT

You are not acting as a normal AI assistant.

You are acting as a:
- Principal Product Architect
- Senior Full-Stack Architect
- AI Systems Architect
- Enterprise Software Architect
- Database Architect
- Security Architect
- DevOps Architect
- UI/UX Architect
- Technical Product Manager
- Senior Engineering Manager
- Hackathon Product Strategist

Your job is to analyze the project documentation I provide and transform it into a complete, professional, implementation-ready software specification and development system.

The project is called **ONBOARDOS**.

I am providing the latest:
1. `features.md`
2. Existing implementation plan / implementation documentation

Read and deeply analyze them before generating anything.

Do not blindly copy them. Understand the product, identify gaps, resolve inconsistencies, improve the architecture, and produce a professional blueprint that another AI coding agent such as Antigravity can directly implement.

---

## 1. PRODUCT UNDERSTANDING

OnboardOS is an AI-powered employee onboarding orchestration platform.

It is NOT just an HR dashboard or static onboarding checklist.

The core product loop is:

Employee Profile
→ Policy + Rules
→ Role / Department / Team Context
→ Access Intelligence
→ AI Reasoning
→ Personalized Onboarding Plan
→ Dependency-Aware Orchestration
→ Provisioning
→ Failure Detection
→ Retry / Recovery
→ Human Approval
→ Risk + Readiness
→ Live Command Center
→ Audit Trail

The system should intelligently determine what an employee needs to become productive instead of simply assigning a static checklist.

The system should understand:
- Employee
- Role
- Department
- Team
- Level
- Location
- Manager
- Employment Type
- Applications
- Permissions
- Policies
- Security requirements
- Approvals
- Dependencies
- Provisioning status
- Failures
- Risk
- Readiness

---

# 2. SOURCE OF TRUTH

Use:
- `features.md`
- Existing implementation plan

as the primary product requirements.

However, do not assume these documents are perfect.

You are expected to:
- Detect missing requirements
- Detect contradictions
- Identify weak architecture
- Identify missing edge cases
- Identify security issues
- Identify scalability problems
- Identify UX problems
- Identify missing enterprise capabilities
- Identify missing hackathon/demo capabilities
- Improve the product where appropriate

You are allowed to add features that make the product significantly better.

For every major added feature explain:

WHY:
WHAT PROBLEM IT SOLVES:
PRIORITY:
DEPENDENCIES:
IMPLEMENTATION IMPACT:

Do not add unnecessary complexity just because it sounds impressive.

---

# 3. IMPORTANT DECISION AUTHORITY

You have broad decision-making authority.

Do NOT ask me for permission for normal engineering decisions.

You are authorized to decide:
- Folder structure
- Naming conventions
- API structure
- Database structure
- Component structure
- State management
- Libraries
- Architecture patterns
- Validation strategy
- Error handling
- UI patterns
- UX improvements
- Security practices
- Testing strategy
- Dev tooling
- Developer workflow

Only ask me when a decision is genuinely HIGH IMPACT and cannot reasonably be determined from the documentation.

Examples:
- Major change in product direction
- Fundamental business-logic conflict
- Paid third-party service with significant cost
- Destructive migration of existing production data
- Major vendor lock-in
- Irreconcilable requirements
- Confidential credentials or external approval

Otherwise:

**MAKE THE DECISION YOURSELF.**

Do not repeatedly interrupt development with unnecessary questions.

---

# 4. HACKATHON-FIRST DEVELOPMENT STRATEGY

This is a critical requirement.

The primary goal right now is to create a **high-quality, polished, interactive frontend prototype for the hackathon**.

Therefore, development MUST be phased in this order:

## PHASE 0 — PROJECT FOUNDATION

Set up:
- Repository structure
- Frontend project
- Base configuration
- Design system
- Reusable UI components
- Mock data structure
- Basic routing
- Development workflow

Do NOT spend significant time building backend infrastructure yet.

---

## PHASE 1 — FRONTEND PROTOTYPE / HACKATHON MVP

**This is the highest priority phase.**

Complete the frontend experience before moving deeply into backend development.

The prototype should be:
- High fidelity
- Fully navigable
- Interactive
- Responsive
- Visually polished
- Demo-ready
- Built around realistic mock data
- Story-driven
- Consistent with the product architecture

The frontend must demonstrate the complete OnboardOS story using mock/local state where backend functionality does not yet exist.

At minimum include:

### Employee Management
- Employee list
- Create employee
- Employee profile

### AI Onboarding Experience
- Generate onboarding plan
- AI loading/reasoning state
- Personalized plan
- Required access
- Denied access
- Approval-required access
- "Why?" explanations

### Employee Command Center
- Employee information
- Progress
- Ready-for-Work score
- Risk score
- Category status
- System status
- Action required
- Timeline
- Recent activity

### Access Intelligence
- Role → Department → Team → Application → Permission → Approval visualization
- Interactive graph or node-based representation

### Provisioning Simulation
- Start provisioning
- Live progress
- Completed systems
- In-progress systems
- Failed systems
- Approval-required systems
- Blocked systems

### Failure + Recovery Demo
- Provisioning failure
- Failure reason
- Impact
- Retry
- Assign to IT
- Skip with reason
- Recovery state

### Approval Flow
- Approval request
- Risk level
- Employee
- Requested permission
- Reason
- Approver
- Approve
- Reject
- Request More Info
- Unblock dependent task after approval

### What-If Simulation
- Change role
- Change department
- Change team
- Change level
- Simulate
- Show changed access
- Show changed approvals
- Show changed risk
- Show changed readiness
- Do not persist simulation changes

### Risk + Readiness
- Permission Risk Score
- Risk breakdown
- Ready-for-Work score
- Explanation

### HR Dashboard
- Multiple demo employees
- Progress
- Risk
- Readiness
- Status
- Click employee → Command Center

### Exception Center
- Critical
- Action Required
- Warning
- Resolved

### Audit Timeline
- Plan generated
- Access decided
- Provisioning started
- Failure
- Retry
- Approval requested
- Approval granted
- Task completed

### AI Copilot / Knowledge Features
If defined in `features.md`, create polished frontend experiences using mock responses.

The frontend must tell a convincing story even without a backend.

### Important:

Use mock/local services and realistic demo data.

Do NOT block frontend development waiting for:
- Database
- Real APIs
- Authentication
- Real AI keys
- Real integrations
- Production infrastructure

The prototype must work independently.

---

# 5. FRONTEND QUALITY BAR

The frontend is the most important deliverable for the hackathon.

It should feel like a real enterprise AI product, not a collection of generated screens.

Design direction:

**AI + Enterprise + Security + Automation + Control Center**

Avoid:
- Generic admin templates
- Generic HR dashboards
- ChatGPT clones
- Empty cards
- Fake buttons
- Disconnected pages
- Excessive gradients
- Unnecessary animations

Prioritize:
- Strong visual hierarchy
- Premium enterprise UI
- Clean typography
- Consistent spacing
- Clear status systems
- Risk visualization
- Progress visualization
- Timeline
- Interactive graph
- Approval cards
- Exception cards
- AI reasoning panels
- Smooth but purposeful animations
- Responsive layout

The Employee Command Center should be the centerpiece.

---

# 6. DEMO STORY

The frontend must support this hackathon demonstration:

Create Employee
→ Generate AI Plan
→ Show AI Reasoning
→ Show Access Intelligence Graph
→ Start Provisioning
→ Show Live Progress
→ Trigger Failure
→ Show Dependency Block
→ Retry
→ Show Approval Request
→ Approve
→ Automatically Unblock Task
→ Complete Provisioning
→ Show Updated Readiness
→ Show Risk
→ Show Audit Trail
→ Open What-If
→ Change Role
→ Show Different Plan

The entire story must be demonstrable without requiring real integrations.

---

# 7. MOCK DATA ARCHITECTURE

Create reusable mock services/data such as:

- `mockEmployees`
- `mockPolicies`
- `mockApplications`
- `mockPermissions`
- `mockOnboardingPlans`
- `mockTasks`
- `mockApprovals`
- `mockAuditLogs`
- `mockRiskAssessments`
- `mockReadiness`
- `mockSimulation`
- `mockCopilotResponses`

Use local state/services to simulate:
- Provisioning
- Failure
- Retry
- Approval
- Task completion
- Progress
- Simulation
- Notifications

Architect these mocks so they can later be replaced by real APIs without rewriting the UI.

---

# 8. FRONTEND AFTER PROTOTYPE

Once the prototype is complete and verified, continue to backend development.

Do NOT move deeply into backend work until the main frontend prototype and demo flow are working.

After the frontend MVP is stable, proceed to:

## PHASE 2 — BACKEND FOUNDATION
- Backend project setup
- API architecture
- Authentication
- Authorization
- Validation
- Error handling
- Service architecture

## PHASE 3 — DATABASE
- Schema
- Migrations
- Seed data
- Relationships
- Indexes
- Audit data

## PHASE 4 — POLICY + RULES ENGINE
- Role rules
- Department rules
- Team rules
- Grants
- Denials
- Hard-deny rules
- Approval requirements
- Least privilege

## PHASE 5 — AI REASONING ENGINE
- Plan generation
- Structured outputs
- Why explanations
- Risk explanations
- Simulation reasoning
- Copilot
- Guardrails
- Validation
- AI fallback/mock mode

## PHASE 6 — ONBOARDING + ORCHESTRATION
- Task engine
- Dependencies
- Provisioning
- Connectors
- Failure handling
- Retry
- Escalation
- Recovery

## PHASE 7 — APPROVAL ENGINE
- Approval requests
- Approvers
- Decisions
- Approval history
- Dependency resolution

## PHASE 8 — RISK + READINESS
- Risk engine
- Permission risk
- Privileged access
- Training risk
- Readiness calculation
- Explainability

## PHASE 9 — REAL-TIME SYSTEM
- SSE/WebSockets where appropriate
- Live task state
- Notifications
- Command Center synchronization

## PHASE 10 — INTEGRATIONS
Prioritize practical integrations such as:
- GitHub
- Slack
- Jira
- Google Workspace

Use simulators where real integration is unnecessary for the current stage.

## PHASE 11 — TESTING
- Unit tests
- Integration tests
- API tests
- Frontend tests
- End-to-end tests
- Policy tests
- AI output validation
- Workflow tests

## PHASE 12 — SECURITY + PRODUCTION HARDENING
- Authorization
- Secret management
- Rate limiting
- Audit integrity
- Input validation
- Logging
- Monitoring
- Error tracking
- Performance
- Deployment

---

# 9. DOCUMENTS YOU MUST GENERATE

Generate:

1. `PRD.md`
2. `appflow.md`
3. `system-architecture.md`
4. `database-design.md`
5. `TRD.md`
6. `ui-ux-design.md`
7. `implementation-plan.md`
8. `SRS.md`
9. `ANTIGRAVITY-RULES.md`
10. `WORKFLOW.md`
11. `TASKS.md`
12. `DEVELOPMENT-REPORT.md`

These documents must remain consistent.

---

# 10. PRD.md

Include:
- Product vision
- Problem statement
- Target users
- Personas
- Pain points
- Goals
- Non-goals
- Value proposition
- Core product loop
- Product principles
- Feature hierarchy
- P0/P1/P2/P3
- User stories
- Business requirements
- KPIs
- Success metrics
- Competitive differentiation
- Hackathon value
- Future roadmap

---

# 11. APPFLOW.md

Document:
- Employee creation
- Plan generation
- Policy evaluation
- AI reasoning
- Access graph
- Plan review
- Provisioning
- Dependencies
- Failure
- Retry
- Escalation
- Approval
- Risk
- Readiness
- Command Center
- Audit
- Simulation
- Role transfer
- Access drift
- Copilot
- Knowledge discovery

For each flow:

Trigger
→ Input
→ Processing
→ Decision
→ Output
→ Next State
→ Failure State
→ Recovery

---

# 12. SYSTEM-ARCHITECTURE.md

Define:
- Frontend
- Backend
- API
- Authentication
- Authorization
- AI
- Policy engine
- Rules engine
- Orchestration
- Approval engine
- Risk engine
- Readiness engine
- Connectors
- Notifications
- Audit
- Database
- Cache/queue if needed
- SSE/WebSockets
- External services
- Logging
- Monitoring
- Deployment

Clearly define ownership of each responsibility.

---

# 13. AI ARCHITECTURE

This is critical.

Never allow an LLM to independently invent permissions.

Use:

Employee Context
→ Policy + Rules Engine
→ Deterministic Grants / Denials / Approvals
→ AI Reasoning
→ Personalized Plan
→ Explanation

Policy remains authoritative.

AI may:
- Explain
- Summarize
- Generate plans
- Explain failures
- Recommend
- Power Copilot
- Support simulations

AI must NOT:
- Override hard-deny
- Bypass approvals
- Invent privileged access
- Change security policy

Document:
- Providers
- Models
- Responsibilities
- Prompts
- Structured output
- Validation
- Guardrails
- Fallbacks
- Demo mode
- Hallucination prevention

---

# 14. DATABASE-DESIGN.md

Define:
- Entities
- Fields
- Types
- PK/FK
- Relationships
- Constraints
- Indexes
- Enums
- Audit requirements
- Soft deletion
- Timestamps
- Versioning
- State transitions

Consider:
- User
- Employee
- Role
- Department
- Team
- Application
- Permission
- Policy
- PolicyRule
- OnboardingPlan
- Task
- TaskDependency
- Approval
- RiskAssessment
- ReadinessAssessment
- Connector
- ProvisioningAttempt
- AuditLog
- Notification
- Simulation
- KnowledgeSource
- AccessReview
- AccessDrift

Add entities when justified.

---

# 15. TRD.md

Include:
- Functional requirements
- Non-functional requirements
- Performance
- Scalability
- Security
- Reliability
- Maintainability
- Accessibility
- Observability
- API requirements
- Integration requirements
- AI requirements
- Data requirements
- Infrastructure
- Testing
- Deployment

Use measurable requirements where possible.

---

# 16. UI-UX-DESIGN.md

Define:
- Design philosophy
- Brand personality
- Information architecture
- Navigation
- Layout
- Typography
- Colors
- Spacing
- Components
- Tables
- Forms
- Modals
- Drawers
- Notifications
- Risk indicators
- Progress
- Timeline
- Graph
- Command Center
- HR Dashboard
- Exception Center
- Approval interface
- Simulation
- Copilot

For every major screen specify:

Purpose
Users
Layout
Components
Data
Actions
Loading
Empty
Error
Success
Mobile behavior

---

# 17. SRS.md

Create a formal Software Requirements Specification.

Include:
- Introduction
- Scope
- Definitions
- Actors
- Functional requirements
- Non-functional requirements
- System behavior
- User interactions
- Business rules
- Security requirements
- Data requirements
- Integration requirements
- Error handling
- Acceptance criteria

Use unique IDs:

FR-001
FR-002
NFR-001
SEC-001
BR-001

---

# 18. IMPLEMENTATION-PLAN.md

Create ONE canonical implementation plan.

Do NOT create multiple implementation plans.

The implementation order MUST be:

Phase 0 — Foundation
Phase 1 — Frontend Prototype / Hackathon MVP
Phase 2 — Backend Foundation
Phase 3 — Database
Phase 4 — Policy + Rules
Phase 5 — AI
Phase 6 — Onboarding + Orchestration
Phase 7 — Approvals
Phase 8 — Risk + Readiness
Phase 9 — Real-Time
Phase 10 — Integrations
Phase 11 — Testing
Phase 12 — Security + Production

For every task include:
- Task ID
- Description
- Priority
- Dependencies
- Files/modules
- Expected output
- Acceptance criteria
- Status

IMPORTANT:

This is the MASTER ROADMAP.

After development begins, do NOT repeatedly regenerate implementation plans.

Update the existing plan only when requirements or architecture genuinely change.

---

# 19. ANTIGRAVITY-RULES.md

Create a strict rulebook.

## Rule 1 — Read Before Work

Always read:
- `ANTIGRAVITY-RULES.md`
- `WORKFLOW.md`
- `TASKS.md`
- `DEVELOPMENT-REPORT.md`
- Relevant documentation

before making changes.

## Rule 2 — Frontend First

For the current hackathon stage:

**FRONTEND PROTOTYPE HAS PRIORITY OVER BACKEND.**

Complete the main frontend demo experience first.

Do not spend large amounts of time on backend infrastructure while the core prototype is unfinished.

## Rule 3 — Do Not Replan Forever

There is only ONE:

`implementation-plan.md`

Use it.

Execute it.

Update it.

Do not repeatedly create new plans.

## Rule 4 — Implement Directly

If a task is clear:

IMPLEMENT IT.

Do not ask permission for normal development.

## Rule 5 — General Development Permission

The user gives permission to independently:
- Create files
- Modify files
- Refactor
- Install dependencies
- Fix bugs
- Improve UI
- Improve architecture
- Add tests
- Add validation
- Improve security
- Improve accessibility
- Improve performance
- Create utilities/components
- Modify schema/migrations

Ask only for genuinely high-impact decisions.

## Rule 6 — One Task File

Maintain only:

`TASKS.md`

Do not create:
- tasks-v2.md
- tasks-final.md
- tasks-new.md
- tasks-updated.md

## Rule 7 — Always Know What Is Left

Before work:
1. Read TASKS.md
2. Find highest-priority incomplete task
3. Check dependencies
4. Implement
5. Verify
6. Update TASKS.md

Statuses:

TODO
IN_PROGRESS
BLOCKED
DONE
SKIPPED

## Rule 8 — Report After Meaningful Work

After completing a meaningful task:

Update `DEVELOPMENT-REPORT.md`.

Record:
- Date
- Task ID
- Feature
- What was built
- Files created
- Files modified
- Architecture changes
- Database changes
- API changes
- UI changes
- Tests
- Known issues
- Next recommended task

## Rule 9 — Resume Without Restarting

New session:

Read:
1. ANTIGRAVITY-RULES.md
2. TASKS.md
3. DEVELOPMENT-REPORT.md
4. implementation-plan.md
5. Relevant source files

Then CONTINUE.

Do not restart planning from zero.

## Rule 10 — Verify Before Claiming Completion

Do not claim something works without checking it.

Use appropriate:
- Build
- Tests
- Type checking
- Lint
- Runtime verification

## Rule 11 — No Fake Completion

Do not mark tasks DONE if:
- Core implementation is missing
- UI is disconnected
- Important errors are ignored
- Obvious placeholders remain
- Acceptance criteria are not met

## Rule 12 — Preserve Existing Work

Understand existing code before changing it.

Prefer incremental improvements.

## Rule 13 — Security

Never:
- Expose secrets
- Hardcode credentials
- Bypass authorization
- Disable security checks
- Trust client-side authorization
- Allow AI to bypass policy

## Rule 14 — AI Safety

Deterministic policy remains authoritative.

AI cannot override security policy.

## Rule 15 — Ask Only When Necessary

Ask only for:
- Major ambiguity
- Conflicting requirements
- Irreversible decisions
- Significant external costs
- Security/legal confirmation
- Potential destructive data operation

Otherwise decide independently.

## Rule 16 — Keep Project Runnable

After meaningful changes run appropriate verification.

## Rule 17 — Follow the Roadmap

Use `implementation-plan.md` and `TASKS.md`.

Do not build random features.

## Rule 18 — Document Major Decisions

Record:
- Decision
- Reason
- Alternatives
- Impact

## FINAL RULE

**PLAN ONCE.  
IMPLEMENT CONTINUOUSLY.  
DOCUMENT PROGRESS.  
DO NOT REPLAN REPEATEDLY.**

---

# 20. WORKFLOW.md

Create a simple workflow:

READ
↓
CHECK TASKS
↓
SELECT NEXT TASK
↓
IMPLEMENT
↓
TEST
↓
UPDATE TASKS
↓
UPDATE DEVELOPMENT REPORT
↓
NEXT TASK

Do NOT insert repeated planning cycles.

---

# 21. TASKS.md

Create the master task board.

Initial structure should prioritize frontend first.

Example:

## PHASE 0 — FOUNDATION

[ ] TASK-001 Project setup
[ ] TASK-002 Design system
[ ] TASK-003 Routing
[ ] TASK-004 Mock data/services

## PHASE 1 — FRONTEND PROTOTYPE

[ ] TASK-101 Employee management
[ ] TASK-102 Employee creation
[ ] TASK-103 AI plan generation UI
[ ] TASK-104 Command Center
[ ] TASK-105 Access Intelligence Graph
[ ] TASK-106 Provisioning simulation
[ ] TASK-107 Failure + Retry
[ ] TASK-108 Approval flow
[ ] TASK-109 Risk + Readiness
[ ] TASK-110 What-If simulation
[ ] TASK-111 HR Dashboard
[ ] TASK-112 Exception Center
[ ] TASK-113 Audit Timeline
[ ] TASK-114 Copilot/Knowledge UI
[ ] TASK-115 Responsive + polish
[ ] TASK-116 Hackathon demo verification

Only after the frontend MVP is sufficiently complete should backend tasks become the active priority.

---

# 22. DEVELOPMENT-REPORT.md

This is persistent project memory.

At the top maintain:

CURRENT PROJECT STATE

Current Phase:
Current Task:
Completed:
In Progress:
Blocked:
Remaining:
Known Issues:

For each meaningful completed task:

## TASK-ID — Feature

### Status
DONE

### What Was Built

### Files Created

### Files Modified

### Architecture Changes

### Database Changes

### API Changes

### UI Changes

### Tests

### Known Issues

### Important Decisions

### Next Step

The purpose is to allow a future Antigravity session to understand the current state immediately without restarting the project.

---

# 23. CONSISTENCY AUDIT

After generating the documents, cross-check:

PRD
↕
SRS
↕
App Flow
↕
Architecture
↕
Database
↕
TRD
↕
UI/UX
↕
Implementation Plan
↕
Tasks
↕
Antigravity Rules

Resolve contradictions.

Ensure:
- Same terminology
- Same features
- Same entities
- Same architecture
- Same priorities
- Same workflows

---

# 24. PRODUCT IMPROVEMENT

Think like:
- CTO
- Founder
- Enterprise customer
- HR manager
- Security engineer
- Employee
- Hackathon judge

Identify features that meaningfully improve OnboardOS.

Possible additions:
- Access drift detection
- Role transfer
- Employee comparison
- Approval analytics
- Predictive delay detection
- Permission conflict detection
- Least privilege recommendations
- Access review
- Onboarding diff
- Stakeholder notifications
- Knowledge discovery
- AI Copilot
- Exception Center
- Analytics
- Security posture
- Policy simulation

Only add features when they have clear product value.

---

# 25. FINAL QUALITY BAR

The documentation must be good enough that:

- Product manager understands WHAT to build
- UX designer understands HOW it should feel
- Frontend developer understands WHAT to implement
- Backend developer understands HOW the system works
- Database engineer understands the data model
- AI engineer understands the AI architecture
- DevOps engineer understands deployment
- QA engineer understands testing
- Antigravity knows WHAT TO DO NEXT

Most importantly:

**The hackathon prototype must be completed FIRST.**

The project should become:

PRODUCT
→ DESIGN
→ FRONTEND PROTOTYPE
→ BACKEND
→ DATABASE
→ AI
→ ORCHESTRATION
→ INTEGRATIONS
→ TESTING
→ PRODUCTION

---

# 26. FINAL OUTPUT

Generate these files:

- `PRD.md`
- `appflow.md`
- `system-architecture.md`
- `database-design.md`
- `TRD.md`
- `ui-ux-design.md`
- `implementation-plan.md`
- `SRS.md`
- `ANTIGRAVITY-RULES.md`
- `WORKFLOW.md`
- `TASKS.md`
- `DEVELOPMENT-REPORT.md`

Do not merely describe them.

Generate their complete content.

Before finishing:

1. Cross-check all documents.
2. Resolve contradictions.
3. Ensure frontend is explicitly Phase 1.
4. Ensure backend comes after the prototype.
5. Ensure `TASKS.md` reflects the roadmap.
6. Ensure `ANTIGRAVITY-RULES.md` prevents repeated planning.
7. Ensure `WORKFLOW.md` supports continuous implementation.
8. Ensure `DEVELOPMENT-REPORT.md` supports session recovery.
9. Ensure the first implementation tasks are frontend-focused.
10. Ensure the final system can evolve from mock prototype to real production architecture.

The final result should establish a complete:

**PRODUCT → DESIGN → FRONTEND PROTOTYPE → ARCHITECTURE → BACKEND → DATABASE → AI → ORCHESTRATION → TESTING → CONTINUOUS DEVELOPMENT**

system for OnboardOS.



---

# 27. ENTERPRISE IDENTITY & GOVERNANCE UPGRADE

# ONBOARDOS — Enterprise Identity & Governance Upgrade

## Purpose

This addendum upgrades ONBOARDOS from a strong onboarding orchestration platform into an **AI-powered workforce identity lifecycle + access orchestration layer** while deliberately avoiding the scope of becoming a full identity provider.

The current product already covers employee context, role intelligence, personalized plans, dependency-aware provisioning, approvals, least privilege, risk/readiness, exception handling, audit trails, simulation, role transfer and offboarding. The biggest missing enterprise layer is what happens **after access is granted**: governed access requests, entitlement packaging, time-bound access, periodic certification, separation-of-duties enforcement, identity reconciliation, and ongoing access governance.

Current product requirements confirm that ONBOARDOS already has the orchestration foundation, approval engine, least-privilege controls, access drift concepts, lifecycle flows and auditability. The new capabilities below are therefore additive rather than a product rewrite.

---

# 1. Competitive Gap Summary — Okta + Microsoft Entra

| Capability | ONBOARDOS Today | Market Signal | Decision for ONBOARDOS |
|---|---|---|---|
| Joiner / Mover / Leaver | Partial / strong onboarding + transfer + offboarding | Core capability in Entra Lifecycle Workflows and Okta Lifecycle Management | **Strengthen to full identity lifecycle orchestration** |
| Birthright access | Role-derived required access exists | Okta and Entra automate baseline access from identity attributes | **Add Birthright Access Policies** |
| Entitlement bundles | Permissions exist, but no first-class bundle/catalog abstraction | Okta Entitlement Bundles and Entra Access Packages | **Add Access Packages / Entitlement Bundles** |
| Self-service access requests | Approval engine exists | Okta Access Requests and Entra My Access / entitlement request flows | **Add Access Request Marketplace** |
| Access expiry | Not first-class | Entra access package expiration/review and Okta governance support lifecycle controls | **Add time-bound grants + automatic expiry** |
| Periodic access review | Access review concept exists, but not a mature workflow | Okta Access Certifications and Entra Access Reviews | **Add Access Certification Campaigns** |
| Separation of Duties | Permission conflict detection is mentioned, but not a core enforcement engine | Okta Entitlement Management explicitly supports SoD | **Add deterministic SoD policy engine** |
| Privileged / JIT access | Privileged access is mentioned in risk, but not a dedicated workflow | Okta Privileged Access and Entra PIM | **Add JIT Privileged Access** |
| Identity directory / source of truth | Employee service exists | Okta Universal Directory / Entra ID are central identity planes | **Add identity-source abstraction + attribute sync** |
| SCIM / provisioning reconciliation | Adapter layer exists | Okta + Entra use broad connector/provisioning models | **Add SCIM-compatible provisioning + reconciliation** |
| Access evidence / certification reporting | Audit log exists | Okta Governance Reports and Entra governance/audit workflows | **Add compliance evidence center** |
| Guest / external identities | Not core | Entra governs external guests; Okta supports extended workforce governance | **Add external identity lifecycle** |
| Dormant / stale access | Drift is planned | Both products emphasize governance and recertification | **Add usage-aware stale access detection** |
| App/license optimization | Not core | Okta supports governance and ecosystem visibility; Entra can govern app/resource access | **Add SaaS/license intelligence as P2** |
| Device-aware access | Assets exist, but not identity/device trust | Okta Device Access and Microsoft Conditional Access | **Integrate device posture signals; don't build a full endpoint platform** |
| Agent / service identity governance | Not core | Entra and Okta now include governance concepts for AI/agent identities | **Add Service & AI Agent Identity Governance as P2** |

Market references: Okta Identity Governance combines Lifecycle Management, Workflows and Access Governance, including Access Requests, Access Certifications and Entitlement Management. Microsoft Entra ID Governance combines lifecycle workflows, entitlement management, access reviews and privileged identity management.

---

# 2. New P0 / P1 Features to Add

## P0-14 — Birthright Access Policy Engine

### WHY
Every employee with a valid organizational context should automatically receive the safe baseline access required for their role, department, team and employment type.

### PROBLEM IT SOLVES
Avoids repeated manual approvals for standard access while separating normal baseline access from sensitive or elevated access.

### CORE BEHAVIOR
Support policy types:

- Birthright access
- Approval-required access
- Optional access
- Denied access
- Time-bound access
- Conditional access

Example:

```text
Department = Engineering
AND Employment Type = Full Time
→ Google Workspace
→ Slack
→ GitHub Basic
```

```text
Role = Backend Developer
AND Team = Payments
→ payments-api repository WRITE
```

The rules engine remains authoritative. AI can explain or recommend but cannot alter the final policy decision.

### PRIORITY
P0

### DEPENDENCIES
Employee Context Engine, Role Intelligence, Policy Engine, Integration Adapter Layer.

### IMPLEMENTATION IMPACT
Add `birthright_policy`, `policy_condition`, and `policy_assignment` concepts. Add UI in Policy Center.

---

## P0-15 — Access Package / Entitlement Bundle Catalog

### WHY
Enterprise customers rarely think in isolated permissions. They think in packages such as `Payments Developer`, `Finance Analyst`, or `Production Support`.

### PROBLEM IT SOLVES
Makes access understandable, reusable, requestable and auditable.

### CORE BEHAVIOR
An Access Package contains:

- Applications
- Groups
- App roles
- Repository permissions
- Cloud roles
- Training requirements
- Approval chain
- Risk level
- Owner
- Expiration rules
- Review policy

Example:

```text
Payments Developer Package
  ├─ GitHub: payments-api WRITE
  ├─ Jira: PAYMENTS project
  ├─ Slack: #payments
  ├─ Confluence: Payments space
  └─ AWS Development: READ/WRITE
```

### PRIORITY
P0

### DEPENDENCIES
Access Management, Approval Engine, Provisioning, Policy Engine.

### IMPLEMENTATION IMPACT
Introduce first-class `AccessPackage`, `Entitlement`, `PackageEntitlement`, `PackagePolicy`, `PackageOwner` entities.

---

## P0-16 — Self-Service Access Request Marketplace

### WHY
Once onboarding is complete, employees will still need legitimate access to new resources.

### PROBLEM IT SOLVES
Prevents IT from becoming a bottleneck for every small access request and preserves governance.

### CORE BEHAVIOR
Employee can:

1. Search available access packages.
2. See why the package is available to them.
3. See requested permissions and risk.
4. Submit request.
5. See approver chain.
6. Track status.
7. Receive approval/rejection explanation.
8. Receive access automatically after approval.

Requests must support:

- Manager approval
- Resource-owner approval
- Security approval
- Multi-stage approval
- Auto-approval for low-risk packages
- Denial with reason
- Request more information
- Expiration date

### PRIORITY
P0

### DEPENDENCIES
Entitlement Bundles, Approval Engine, Notification Engine, Orchestrator.

### IMPLEMENTATION IMPACT
Add Access Request marketplace screen, request lifecycle state machine and APIs.

---

## P0-17 — Access Expiration & Time-Bound Grants

### WHY
Permanent access is one of the biggest causes of privilege accumulation.

### PROBLEM IT SOLVES
Temporary project access, contractor access and elevated access should automatically expire.

### CORE BEHAVIOR
Each grant may define:

- Start time
- Expiration time
- Maximum duration
- Renewal policy
- Reviewer
- Auto-revoke behavior

Example:

```text
Production Support Access
Granted: 18 Aug 2026 14:00
Expires: 18 Aug 2026 18:00
Renewal: Requires manager approval
```

### PRIORITY
P0

### DEPENDENCIES
Access packages, Provisioning, Scheduler, Revocation engine.

### IMPLEMENTATION IMPACT
Add scheduled jobs, expiration events and automatic revoke actions.

---

## P0-18 — Periodic Access Certification Campaigns

### WHY
Giving correct access on Day 1 is not enough. The system must prove the access remains correct months later.

### PROBLEM IT SOLVES
Prevents privilege creep and produces audit evidence.

### CORE BEHAVIOR
Support:

- Monthly / quarterly / annual campaigns
- Resource-owner reviews
- Manager reviews
- Self-review
- Security review
- Bulk approve
- Bulk revoke
- Approve with justification
- Revoke immediately
- Review reminders
- Escalation for overdue reviewers
- Automatic remediation after deadline

Show reviewers contextual evidence:

- Employee role
- Department/team
- Access package
- Granted-by source
- Last-used signal when available
- Last review
- Risk score
- Peer comparison / outlier signal

### PRIORITY
P0

### DEPENDENCIES
Audit logs, Access Packages, Access Drift, Notifications.

### IMPLEMENTATION IMPACT
Add `AccessReviewCampaign`, `AccessReviewItem`, `ReviewDecision`, `ReviewerAssignment`, and campaign scheduler.

---

## P0-19 — Separation of Duties (SoD) Conflict Engine

### WHY
Some permissions are individually legitimate but dangerous in combination.

### PROBLEM IT SOLVES
Prevents toxic combinations such as request + approve, create vendor + release payment, or developer + production administrator.

### CORE BEHAVIOR
Rules can define:

```text
IF user has entitlement A
AND requests entitlement B
→ CONFLICT
```

Support:

- Hard deny
- Approval override by security officer
- Compensating control
- Conflict explanation
- Conflict audit

Example:

```text
Finance: Create Payment
+
Finance: Approve Payment
=
🚫 SoD Conflict
```

### PRIORITY
P0

### DEPENDENCIES
Entitlement model, Policy Engine, Approval Engine.

### IMPLEMENTATION IMPACT
Add `SoDRule`, `SoDConflict`, `CompensatingControl` entities and deterministic policy evaluation.

---

## P1-20 — Just-In-Time Privileged Access

### WHY
Permanent admin access should be rare.

### PROBLEM IT SOLVES
Reduces standing privilege for production, cloud, database and administrative systems.

### CORE BEHAVIOR
Privileged access flow:

```text
Request
→ Reason
→ Risk evaluation
→ Approval
→ Time-limited elevation
→ Monitoring
→ Auto-expire
→ Audit
```

Support:

- Eligible vs active privilege
- Time-boxed elevation
- Step-up approval
- Security approval
- Emergency access
- Emergency justification
- Automatic revoke

### PRIORITY
P1

### DEPENDENCIES
Approval Engine, Risk Engine, Expiration Scheduler, Integration Layer.

### IMPLEMENTATION IMPACT
Add `PrivilegedRole`, `ElevationRequest`, `ElevationSession`, `EmergencyAccessEvent`.

---

## P1-21 — Identity Source & Reconciliation Layer

### WHY
A mature identity platform needs to know which system is authoritative for employee identity attributes and whether downstream accounts match the intended state.

### PROBLEM IT SOLVES
Avoids duplicate identities, stale accounts and provisioning mismatches.

### CORE BEHAVIOR
Support:

- HR system as source of truth
- Entra / Okta as identity-provider source
- Attribute mapping
- Account matching
- Duplicate detection
- Join/update/disable reconciliation
- Desired vs actual state
- Drift remediation

Example:

```text
HR says Department = Engineering
Entra says Department = Sales
GitHub team = Payments

→ Identity mismatch detected
→ Re-evaluate access
→ Create remediation workflow
```

### PRIORITY
P1

### DEPENDENCIES
Employee Service, Integration Adapter Layer, Access Drift, Lifecycle Engine.

### IMPLEMENTATION IMPACT
Add source-of-truth metadata, `IdentityLink`, `AttributeMapping`, `ReconciliationRun`, `ReconciliationMismatch`.

---

## P1-22 — SCIM / Standard Provisioning Connector Layer

### WHY
The current adapter abstraction is good, but enterprise provisioning needs a standard protocol path.

### PROBLEM IT SOLVES
Reduces custom integration work for common SaaS applications.

### CORE BEHAVIOR
Support, where available:

- User create
- User update
- User deactivate
- Group membership
- Attribute sync
- Entitlement exchange
- Reconciliation

Keep custom adapters for systems that do not expose SCIM.

### PRIORITY
P1

### DEPENDENCIES
Integration Adapter Layer, Identity Reconciliation.

### IMPLEMENTATION IMPACT
Add `SCIMAdapter` capability interface and connector health monitoring.

---

## P1-23 — Guest / Contractor / External Identity Governance

### WHY
Not every identity is a traditional employee.

### PROBLEM IT SOLVES
Partners, vendors, interns, contractors and temporary workers frequently become orphaned accounts.

### CORE BEHAVIOR
Add identity types:

- Employee
- Contractor
- Vendor
- Partner
- Intern
- Guest
- Service Account
- AI Agent

Each identity type should have different lifecycle and access rules.

External access must support:

- Sponsor / owner
- Purpose
- Start date
- Expiration
- Review schedule
- Restricted packages
- Automatic revocation

### PRIORITY
P1

### DEPENDENCIES
Lifecycle Engine, Access Packages, Reviews, Expiration.

### IMPLEMENTATION IMPACT
Extend Employee/Identity model into a generalized `Identity` model while preserving employee-specific fields.

---

## P1-24 — Access Evidence & Compliance Center

### WHY
Enterprise buyers need evidence, not only dashboards.

### PROBLEM IT SOLVES
Makes audits and security investigations significantly easier.

### CORE BEHAVIOR
Generate evidence packages for:

- Who had access
- Why access was granted
- Which policy authorized it
- Who approved it
- When it was granted
- When it was last reviewed
- When it expired/revoked
- Which workflow executed the change
- What remediation happened

Support filters for:

- Employee
- Application
- Entitlement
- Risk
- Reviewer
- Date range
- Policy version

Export report formats appropriate for audit workflows.

### PRIORITY
P1

### DEPENDENCIES
Audit Trail, Access Reviews, Access Packages, Provisioning.

### IMPLEMENTATION IMPACT
Add evidence aggregation service and compliance dashboard.

---

## P1-25 — Usage-Aware Stale Access Detection

### WHY
Access existence alone is not enough; unused access is a useful risk signal.

### PROBLEM IT SOLVES
Identifies dormant accounts, unused entitlements and possible license waste.

### CORE BEHAVIOR
Signals:

- Last login
- Last application use
- Last repository use
- Last cloud role use
- No activity for N days
- Access never used
- Privileged access never used

Recommendations:

```text
Unused for 90 days
→ Recommend revoke or review
```

The recommendation must remain subject to policy and human review for sensitive resources.

### PRIORITY
P1

### DEPENDENCIES
Integration telemetry, Access Reviews, Risk Engine.

### IMPLEMENTATION IMPACT
Add `AccessUsageSignal` and stale-access risk rules.

---

# 3. P2 Features — Strategic Enterprise Extensions

## P2-26 — Device-Aware Access Signals

Do not build a full endpoint management product. Instead consume device posture signals such as managed/unmanaged, compliant/non-compliant and trusted/untrusted.

Use these signals in policy evaluation for sensitive requests.

Example:

```text
Production Access Request
AND device = unmanaged
→ Deny
```

This aligns with enterprise patterns represented by Okta Device Access and Microsoft Conditional Access without turning ONBOARDOS into an endpoint platform.

---

## P2-27 — SaaS & License Intelligence

Track:

- Assigned license
- Last use
- Cost tier
- Unused seats
- Duplicate tools
- Recommended reclaim action

Example:

```text
Figma Professional
42 licenses
9 inactive > 60 days
→ Potential reclaim
```

Use this as a cost-optimization layer, not the core product.

---

## P2-28 — Service Account & AI Agent Governance

Treat non-human identities as first-class governed identities.

Support:

- Owner
- Purpose
- Scope
- Entitlements
- Expiration
- Rotation reminder
- Review schedule
- Risk
- Connected tools
- Emergency revoke

For AI agents specifically add:

- Agent owner
- Allowed tools
- Allowed data sources
- Allowed actions
- Maximum privilege
- Expiration
- Audit trail

The policy engine remains authoritative for agent access as well.

---

## P2-29 — Delegated Administration & Resource Ownership

Support scoped administrators:

- HR admin
- IT admin
- Security admin
- Application owner
- Resource owner
- Manager
- Reviewer

An admin should only manage resources within their scope.

Example:

```text
Payments App Owner
→ Manage Payments access reviews
→ Cannot change company-wide identity policy
```

---

## P2-30 — Identity Governance Analytics

Add executive metrics:

- Day-1 readiness rate
- Median onboarding time
- Access request SLA
- Approval SLA
- Access review completion rate
- Revocation latency
- Privileged access volume
- Standing privilege count
- SoD conflicts prevented
- Stale access detected
- Reclaimed licenses
- Failed provisioning rate

---

# 4. Recommended Updated ONBOARDOS Product Loop

Replace the current loop with:

```text
Identity Source
      ↓
Employee / Identity Context
      ↓
Role + Department + Team Intelligence
      ↓
Policy + Rules Evaluation
      ↓
Birthright Access + Entitlement Packages
      ↓
AI Reasoning / Explanation
      ↓
Personalized Lifecycle Plan
      ↓
Dependency-Aware Orchestration
      ↓
Provisioning / Deprovisioning
      ↓
Approval / JIT Privilege
      ↓
Real-Time Monitoring
      ↓
Usage + Drift Detection
      ↓
Access Requests
      ↓
Periodic Access Certification
      ↓
Risk + Readiness + Compliance Evidence
      ↓
Mover / Leaver / Transfer / Expiry
      ↓
Continuous Governance
```

The product becomes continuous instead of ending at "employee is onboarded."

---

# 5. Updated Demo Story for the Hackathon

The existing demo is strong. Add one additional act after onboarding:

```text
Create Employee
→ AI Plan
→ Access Graph
→ Provision
→ Failure
→ Retry
→ Approval
→ Day-1 Ready
→ Employee requests Production Support package
→ SoD check
→ Manager + Security approval
→ JIT access for 2 hours
→ Access auto-expires
→ Quarterly Access Review
→ Reviewer sees usage + risk + reason
→ Reviewer revokes unused access
→ Audit Evidence generated
```

This is significantly closer to the end-to-end identity-governance story represented by mature market platforms.

---

# 6. Data Model Additions

Add these entities to the existing database design:

```text
identities
identity_links
identity_sources
attribute_mappings
access_packages
entitlements
package_entitlements
package_policies
access_requests
access_request_steps
access_reviews
access_review_items
sod_rules
sod_conflicts
compensating_controls
privileged_roles
elevation_requests
elevation_sessions
access_expirations
access_usage_signals
reconciliation_runs
reconciliation_mismatches
external_identities
resource_owners
admin_scopes
compliance_evidence
agent_identities
```

Do not replace the existing Employee model immediately. Introduce a generalized Identity layer incrementally.

---

# 7. API Additions

```text
GET    /api/identities
POST   /api/identities/reconcile
GET    /api/access-packages
POST   /api/access-requests
GET    /api/access-requests/:id
POST   /api/access-requests/:id/approve
POST   /api/access-requests/:id/reject
POST   /api/access-requests/:id/cancel
GET    /api/access-reviews
POST   /api/access-reviews/campaigns
POST   /api/access-reviews/:id/decide
GET    /api/sod/conflicts
POST   /api/privileged/elevate
POST   /api/privileged/:id/revoke
GET    /api/access/expirations
POST   /api/access/:id/renew
GET    /api/reconciliation/runs
POST   /api/reconciliation/run
GET    /api/compliance/evidence
GET    /api/access-usage/:identityId
```

---

# 8. Frontend Screens to Add

## P0

- Access Marketplace
- Access Package Details
- Access Request Drawer
- Access Expiration / Temporary Access Panel
- Access Review Inbox
- SoD Conflict Center

## P1

- Identity Governance Center
- Reconciliation Center
- External Identities
- Privileged Access Center
- Compliance Evidence Center
- Stale Access / Dormant Access Center

## P2

- Device Trust Signals
- SaaS License Intelligence
- Service & AI Agent Governance
- Delegated Administration
- Executive Governance Analytics

---

# 9. Updated Priority Order

## P0 — Must Add

1. Birthright Access Policy Engine
2. Access Packages / Entitlement Bundles
3. Self-Service Access Requests
4. Time-Bound Access + Expiration
5. Access Certification Campaigns
6. Separation of Duties

## P1 — Strong Enterprise Differentiation

7. JIT Privileged Access
8. Identity Source + Reconciliation
9. SCIM Provisioning Layer
10. Guest / Contractor Governance
11. Compliance Evidence Center
12. Usage-Aware Stale Access Detection

## P2 — Strategic Extensions

13. Device-aware access signals
14. SaaS / License intelligence
15. Service + AI agent governance
16. Delegated administration
17. Governance analytics

---

# 10. Product Positioning Recommendation

Do NOT position ONBOARDOS as "another Okta" or "another Microsoft Entra."

Position it as:

> **The AI-native orchestration and intelligence layer that sits above enterprise identity systems and turns employee context into continuously governed access.**

Okta / Entra are strong identity platforms. ONBOARDOS should differentiate through:

- AI-generated, explainable onboarding plans
- Dependency-aware cross-system orchestration
- Human-in-the-loop recovery
- Readiness scoring
- Cross-system failure intelligence
- What-if access simulation
- Natural-language employee assistance
- Continuous lifecycle orchestration
- Unified onboarding + access governance + offboarding story

This makes the product complementary to existing enterprise IAM rather than a direct replacement.

---

# 11. Architecture Principle

Use a vendor-neutral connector model:

```text
             ONBOARDOS
 ┌─────────────────────────────────┐
 │ Context + AI + Policy +         │
 │ Orchestration + Governance      │
 └───────────────┬─────────────────┘
                 │
       Identity / Connector Layer
        ┌────────┼─────────┐
        ↓        ↓         ↓
      Okta     Entra      HRMS
        │        │         │
        └────────┼─────────┘
                 ↓
        SaaS / Cloud / Dev / IT
```

The system should be able to operate in demo mode with mocks while keeping all adapter contracts production-ready.

---

# 12. Guardrails

1. AI may recommend, explain and summarize; deterministic policy remains authoritative.
2. No access grant may bypass a mandatory approval, SoD conflict, hard deny or expiry rule.
3. Every access change must have a traceable source: birthright policy, access request, package assignment, approval, lifecycle event, or administrative action.
4. Every privileged elevation must be time-bound unless an explicit emergency policy permits otherwise.
5. Every access review decision must be auditable.
6. Every reconciliation mismatch must produce a remediation decision or an explicit human disposition.
7. Do not build a full identity provider, endpoint-management platform or SIEM in the hackathon MVP.

---

# 13. Acceptance Criteria for the Upgrade

The upgraded ONBOARDOS prototype is considered complete when it can demonstrate:

- A new employee receives birthright access based on policy.
- A sensitive entitlement is represented as an access package.
- The employee requests an additional package through self-service.
- The system calculates risk and runs SoD validation.
- Approval is routed to the correct people.
- Access is provisioned after approval.
- The grant expires automatically when its TTL ends.
- A periodic access review can certify or revoke the entitlement.
- A stale/unused access signal is visible to the reviewer.
- A complete evidence trail explains who granted access, why, for how long and what happened later.
- The same engine can handle mover/transfer and leaver scenarios.

---

# 14. Final Recommendation

The most important upgrade is not adding more dashboards. It is extending ONBOARDOS from:

```text
"We onboard the employee correctly."
```

to:

```text
"We continuously ensure the right identity has the right access
for the right reason, for the right amount of time."
```

That is the strongest enterprise gap exposed by comparison with Okta Identity Governance and Microsoft Entra ID Governance.
