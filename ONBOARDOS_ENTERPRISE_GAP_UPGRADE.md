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
