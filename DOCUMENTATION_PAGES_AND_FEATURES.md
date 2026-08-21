# OnboardOS Platform — Complete Page, Feature, and Architectural Directory

> **Comprehensive Reference Manual for All Pages, Features, Subtopics, Interactive Workflows, and Database Linkages across OnboardOS.**

---

## Table of Contents
1. [Platform Architecture & Executive Summary](#1-platform-architecture--executive-summary)
2. [Authentication & Persona Switcher](#2-authentication--persona-switcher)
3. [HR Operations Domain](#3-hr-operations-domain)
   - 3.1 [HR Executive Dashboard (`/hr`)](#31-hr-executive-dashboard-hr)
   - 3.2 [Canonical Employee Directory (`/hr/employees`)](#32-canonical-employee-directory-hremployees)
   - 3.3 [Create & Provision Employee Wizard (`/hr/employees/new`)](#33-create--provision-employee-wizard-hremployeesnew)
   - 3.4 [Exception & Failure Center (`/hr/exceptions`)](#34-exception--failure-center-hrexceptions)
4. [Employee Command Center & Deep-Dive Workspaces](#4-employee-command-center--deep-dive-workspaces)
   - 4.1 [Employee Command Center Master (`/employees/:id`)](#41-employee-command-center-master-employeesid)
   - 4.2 [AI Onboarding Plan & Explainability (`/employees/:id/plan`)](#42-ai-onboarding-plan--explainability-employeesidplan)
   - 4.3 [Directed Access Dependency Graph (DAG) (`/employees/:id/access`)](#43-directed-access-dependency-graph-dag-employeesidaccess)
   - 4.4 [Provisioning & Adapter Ledger (`/employees/:id/provisioning`)](#44-provisioning--adapter-ledger-employeesidprovisioning)
   - 4.5 [Real-Time Audit Timeline (`/employees/:id/timeline`)](#45-real-time-audit-timeline-employeesidtimeline)
   - 4.6 [What-If Role Change Simulator (`/employees/:id/whatif`)](#46-what-if-role-change-simulator-employeesidwhatif)
   - 4.7 [Day-1 Readiness & Multi-Factor Risk Score (`/employees/:id/risk`)](#47-day-1-readiness--multi-factor-risk-score-employeesidrisk)
   - 4.8 [Internal Transfer Governance (`/employees/:id/transfer`)](#48-internal-transfer-governance-employeesidtransfer)
   - 4.9 [Offboarding & Zero-Trust Revocation (`/employees/:id/offboarding`)](#49-offboarding--zero-trust-revocation-employeesidoffboarding)
   - 4.10 [Mentor & Buddy Assignment (`/employees/:id/mentor`)](#410-mentor--buddy-assignment-employeesidmentor)
   - 4.11 [First-Week Roadmap & Plan Items (`/employees/:id/first-week`)](#411-first-week-roadmap--plan-items-employeesidfirst-week)
5. [Manager Workspace Domain](#5-manager-workspace-domain)
   - 5.1 [Manager Team Hub (`/manager`)](#51-manager-team-hub-manager)
   - 5.2 [Multi-Stage Approval Queue (`/manager/approvals`)](#52-multi-stage-approval-queue-managerapprovals)
6. [Employee Self-Service Domain (Day-1 Experience)](#6-employee-self-service-domain-day-1-experience)
   - 6.1 [My Onboarding Portal (`/me`)](#61-my-onboarding-portal-me)
   - 6.2 [My Actionable Tasks (`/me/tasks`)](#62-my-actionable-tasks-metasks)
   - 6.3 [AI Onboarding Guide & Policy Q&A (`/me/assistant`)](#63-ai-onboarding-guide--policy-qa-meassistant)
   - 6.4 [Employee IT Helpdesk (`/me/help`)](#64-employee-it-helpdesk-mehelp)
   - 6.5 [My First 5 Days Roadmap (`/me/first-week`)](#65-my-first-5-days-roadmap-mefirst-week)
   - 6.6 [My Mentor & Buddy (`/me/mentor`)](#66-my-mentor--buddy-mementor)
   - 6.7 [Weekly Pulse Sentiment Check (`/me/pulse`)](#67-weekly-pulse-sentiment-check-mepulse)
7. [IT Operations & Hardware Lifecycle Domain](#7-it-operations--hardware-lifecycle-domain)
   - 7.1 [IT Operations Dashboard (`/it`)](#71-it-operations-dashboard-it)
   - 7.2 [IT Service Ticket Queue (`/it/tickets`)](#72-it-service-ticket-queue-ittickets)
   - 7.3 [Hardware Asset Management (`/it/assets`)](#73-hardware-asset-management-itassets)
   - 7.4 [Offboarding Orphan Access Risks (`/it/offboarding`)](#74-offboarding-orphan-access-risks-itoffboarding)
8. [Core Access Governance Domain (P0)](#8-core-access-governance-domain-p0)
   - 8.1 [Role & Permission Scope Catalog (`/admin/roles`)](#81-role--permission-scope-catalog-adminroles)
   - 8.2 [Birthright Policy Engine (`/admin/birthright`)](#82-birthright-policy-engine-adminbirthright)
   - 8.3 [Access Package Bundles Catalog (`/admin/packages`)](#83-access-package-bundles-catalog-adminpackages)
   - 8.4 [Self-Service Access Marketplace (`/admin/marketplace`)](#84-self-service-access-marketplace-adminmarketplace)
   - 8.5 [Time-Bound Grants & TTL Ledger (`/admin/grants`)](#85-time-bound-grants--ttl-ledger-admingrants)
   - 8.6 [Access Certification Campaigns (`/admin/certifications`)](#86-access-certification-campaigns-admincertifications)
   - 8.7 [Separation of Duties (SoD) Conflict Center (`/admin/sod`)](#87-separation-of-duties-sod-conflict-center-adminsod)
9. [Advanced Enterprise Governance Domain (P1)](#9-advanced-enterprise-governance-domain-p1)
   - 9.1 [Just-In-Time (JIT) Elevation (`/admin/jit`)](#91-just-in-time-jit-elevation-adminjit)
   - 9.2 [Identity Source & HRMS/IdP Reconciliation (`/admin/reconciliation`)](#92-identity-source--hrmsidp-reconciliation-adminreconciliation)
   - 9.3 [SCIM 2.0 Provisioning Connectors (`/admin/scim`)](#93-scim-20-provisioning-connectors-adminscim)
   - 9.4 [External Identity & Contractor Governance (`/admin/external-identities`)](#94-external-identity--contractor-governance-adminexternal-identities)
   - 9.5 [Compliance Evidence & Audit Export Center (`/admin/compliance`)](#95-compliance-evidence--audit-export-center-admincompliance)
   - 9.6 [Usage-Aware Stale Access Reclaim (`/admin/stale-access`)](#96-usage-aware-stale-access-reclaim-adminstale-access)
10. [Strategic Governance Extensions Domain (P2)](#10-strategic-governance-extensions-domain-p2)
    - 10.1 [Device Posture & Zero-Trust Signals (`/admin/devices`)](#101-device-posture--zero-trust-signals-admindevices)
    - 10.2 [SaaS & License Intelligence (`/admin/licenses`)](#102-saas--license-intelligence-adminlicenses)
    - 10.3 [AI Agent & Service Account Governance (`/admin/agents`)](#103-ai-agent--service-account-governance-adminagents)
    - 10.4 [Delegated Administration Scopes (`/admin/delegated-admin`)](#104-delegated-administration-scopes-admindelegated-admin)
    - 10.5 [Executive Identity Governance Analytics (`/admin/analytics`)](#105-executive-identity-governance-analytics-adminanalytics)
    - 10.6 [Platform Users & RBAC Administration (`/admin/users`)](#106-platform-users--rbac-administration-adminusers)
11. [Cross-Role Shared Hubs & Demonstrator](#11-cross-role-shared-hubs--demonstrator)
    - 11.1 [Enterprise Knowledge Assistant (`/knowledge`)](#111-enterprise-knowledge-assistant-knowledge)
    - 11.2 [Company Community Hub & Welcome Wall (`/community`)](#112-company-community-hub--welcome-wall-community)
    - 11.3 [Live Demo Controller & Failure Injector (`/_demo`)](#113-live-demo-controller--failure-injector-_demo)

---

## 1. Platform Architecture & Executive Summary

OnboardOS is an **Autonomous Identity & Employee Lifecycle Orchestration Platform**. It connects Human Resources (HR), Hiring Managers, Information Technology (IT), Security Administrators, and New Hires into a cohesive zero-trust workflow engine.

### Key Capabilities
- **56-Table Supabase Backend**: Relational multi-tenant ledger with Row Level Security (RLS), cryptographic audit trails (`sha256`), views, triggers, and RPC procedures.
- **DAG Execution Engine**: Cycle-validated Directed Acyclic Graph orchestrator for parallel integration provisioning.
- **Explainability Engine (WhyService)**: Deterministic policy decision engine explaining *why* an entitlement was granted, blocked, or flagged for approval.
- **Tri-Mode Client Service**: Seamless toggling between `mock` (client state persistence), `api` (Express backend), and `supabase` (live PostgreSQL cloud).

---

## 2. Authentication & Persona Switcher

### Page: Login & Persona Selector (`/login`)
- **Target Role**: Public / All Roles (HR, Manager, Employee, IT, Admin).
- **Core Mission**: Allow frictionless instant switching between enterprise personas with pre-configured session tokens and contextual permissions.

#### Topics & Subtopics:
1. **Interactive Persona Switcher**:
   - *Sarah Chen (HR Director)*: Immediate access to onboarding pipelines, employee creation, and cohort health.
   - *Marcus Vance (Engineering Manager)*: Access to team approval queues and 1:1 onboarding syncs.
   - *Rahul Sharma (New Hire - Junior Backend Engineer)*: Experience Day-1 self-service, task lists, and AI guidance.
   - *David Kim (IT Operations Lead)*: Hardware asset management, provisioning failures, and SCIM health.
   - *Elena Rostova (Chief Information Security Officer / Admin)*: Access certifications, SoD rules, JIT elevations, and compliance audits.
2. **Credential Sign-In Form**:
   - Email and password input with JWT token verification against backend/Supabase.
3. **Session Persistence**:
   - Saves current active user in `localStorage` and synchronizes across navigation tabs.

---

## 3. HR Operations Domain

### 3.1 HR Executive Dashboard (`/hr`)
- **Route**: `/hr`
- **Role**: HR Director / People Operations.
- **Mission**: High-level command center displaying real-time new-hire pipeline health, Day-1 readiness rate, critical blockers, and weekly team pulse trends.

#### Topics & Subtopics:
1. **Top KPI Metrics Bar**:
   - *Total Active Employees*: Count of all active employees in the organization.
   - *Day-1 Ready Rate (%)*: Real-time percentage of incoming cohort who have 100% prerequisite access ready.
   - *Open Provisioning Blockers*: Number of unresolved critical provisioning exceptions.
   - *Pending Manager Approvals*: Approvals approaching SLA deadline.
2. **Cohort Onboarding Velocity Chart**:
   - Breakdown of new hires across `INVITED`, `ACTIVE`, `EXITING`, and `OFFBOARDED` stages.
3. **Active Exception Alert Stream**:
   - Real-time list of failed adapter tasks requiring HR or IT intervention.
4. **Weekly Sentiment Pulse Snapshot**:
   - Aggregate privacy-safe distribution of new hire pulse sentiment (`GREAT`, `GOOD`, `OKAY`, `STRUGGLING`).
5. **Quick Action Shortcuts**:
   - One-click buttons to "Onboard New Employee", "Review Exceptions", or "Inspect DAG".

---

### 3.2 Canonical Employee Directory (`/hr/employees`)
- **Route**: `/hr/employees`
- **Role**: HR Operations, People Ops, Managers.
- **Mission**: Comprehensive, searchable, and filterable table of all organizational personnel with real-time status badges and direct navigation to command centers.

#### Topics & Subtopics:
1. **Multi-Dimensional Filters**:
   - *Search Bar*: Instant fuzzy search by employee name, email, or role title.
   - *Department Dropdown*: Filter by Engineering, Product, HR, Finance, Design, Sales.
   - *Seniority Level*: Filter by Junior, Mid, Senior, Lead, Principal.
   - *Status Pills*: Filter by Invited, Active, Exiting, Offboarded.
2. **Employee Roster Table**:
   - Columns: Employee Name & Avatar, Role & Seniority, Department & Pod, Location & Mode (Hybrid/Remote), Start Date, Status Badge, Readiness Score.
3. **Table Row Actions**:
   - Direct button to launch the **Employee Command Center** (`/employees/:id`).
   - Quick export to CSV / Excel.

---

### 3.3 Create & Provision Employee Wizard (`/hr/employees/new`)
- **Route**: `/hr/employees/new`
- **Role**: HR Operations.
- **Mission**: Step-by-step interactive form to create a new employee profile, automatically trigger birthright rule resolution, generate an onboarding plan, and dispatch provisioning DAGs.

#### Topics & Subtopics:
1. **Step 1: Personal & Contact Information**:
   - Inputs for Full Name, Corporate Email (`name@company.com`), Location/Office.
2. **Step 2: Organizational Placement & Role**:
   - Department selector (Engineering, Product, HR, IT, Finance).
   - Team / Pod selector (e.g. Payments Core, Mobile, Security).
   - Seniority level (Junior, Mid, Senior, Lead).
   - Employment Type (Full Time, Contractor, Intern).
3. **Step 3: Management Hierarchy & Start Date**:
   - Reporting Manager assignment, Official Start Date picker.
4. **Live Birthright Preview Panel**:
   - Side panel showing real-time list of entitlements that will be automatically assigned based on chosen role and department.
5. **Submission & Dispatch Action**:
   - Validates input, persists to Supabase `employees` and `employee_contexts` tables, generates `onboarding_plans`, and redirects directly to the generated employee command center.

---

### 3.4 Exception & Failure Center (`/hr/exceptions`)
- **Route**: `/hr/exceptions`
- **Role**: HR Ops, IT Support, Security.
- **Mission**: Centralized alert triage room for all provisioning failures, API timeouts, HTTP 503 rate limits, and SLA breaches across the organization.

#### Topics & Subtopics:
1. **Severity Classification Cards**:
   - Tally of `CRITICAL` (blocking Day-1), `ACTION_REQUIRED`, `WARNING`, and `RESOLVED` items.
2. **Exception Feed Table**:
   - Columns: Target Employee, Affected System / Tool, Failure Category, Impact Summary (downstream blocked tasks), Timestamp, Severity Pill.
3. **Interactive Resolution Drawer / Modal**:
   - View exact API error details (e.g., `Jira Service Management API HTTP 503 Rate Limit`).
   - Action: **Trigger Idempotent Retry** (re-executes adapter without duplicate accounts).
   - Action: **Manual Override** (marks task complete with mandatory audit reason).
   - Action: **Reassign to IT Support** (creates an IT ticket automatically).

---

## 4. Employee Command Center & Deep-Dive Workspaces

### 4.1 Employee Command Center Master (`/employees/:id`)
- **Route**: `/employees/:id`
- **Role**: HR, Manager, IT, Security, Employee.
- **Mission**: Unified 360-degree command center for an individual employee, providing seamless navigation across all 10 specialized lifecycle tabs.

#### Topics & Subtopics:
1. **Employee Profile Banner**:
   - Full Name, Seniority, Role Title, Department, Team Pod, Location, Reporting Manager, Status Pill.
2. **Day-1 Readiness Gauge & Progress Ring**:
   - Visual completion ring showing completed vs total onboarding tasks and overall readiness percentage.
3. **Lifecycle Sub-Navigation Tabs**:
   - Overview, AI Plan (`/plan`), Access Graph (`/access`), Provisioning (`/provisioning`), Audit Timeline (`/timeline`), What-If Simulation (`/whatif`), Risk & Readiness (`/risk`), Transfer (`/transfer`), Offboarding (`/offboarding`), Mentor (`/mentor`), First Week (`/first-week`).
4. **Executive Summary Grid**:
   - Quick cards summarizing Provisioned Tools (Google, Slack, GitHub, etc.), Active Blockers, Pending Signoffs, and Assigned Mentor.

---

### 4.2 AI Onboarding Plan & Explainability (`/employees/:id/plan`)
- **Route**: `/employees/:id/plan`
- **Role**: HR, Manager, Security Auditor.
- **Mission**: Display the deterministic AI-generated onboarding plan with complete transparency into why each tool is Required, Optional, or Blocked.

#### Topics & Subtopics:
1. **Rule Engine Reasoning Sequence**:
   - Step 1: Context Normalization (extracted role, level, and pod).
   - Step 2: Policy Matching (evaluated against 15+ birthright & department rules).
   - Step 3: Least Privilege & SoD Verification (identified required approvals).
   - Step 4: DAG Assembly (validated graph acyclicity via Tarjan's algorithm).
2. **Plan Items Catalog**:
   - Individual entitlement cards (Google Workspace, Slack, GitHub, Jira, AWS IAM, etc.).
   - Confidence score badge (e.g., `99% Confidence`).
   - Decision badge (`REQUIRED`, `OPTIONAL`, `APPROVAL_REQUIRED`, `BLOCKED`).
   - Detailed Rationale string explaining exact enterprise policy citation.
3. **Plan Item Decision Override Modal**:
   - Allows HR/Security to change a tool from Optional to Required or Blocked with an audit rationale.

---

### 4.3 Directed Access Dependency Graph (DAG) (`/employees/:id/access`)
- **Route**: `/employees/:id/access`
- **Role**: IT Engineers, Systems Architects, HR, Judges.
- **Mission**: Interactive 2D visual dependency graph built with `@xyflow/react`, showing real-time task nodes, execution edges, and live statuses.

#### Topics & Subtopics:
1. **Interactive Canvas Controls**:
   - Zoom in/out, pan, auto-fit view, and mini-map navigation.
2. **Node Visual States**:
   - 🟢 **Completed**: Successfully provisioned and verified.
   - 🔵 **Running / In Progress**: Adapter currently executing.
   - 🟡 **Waiting Approval**: Awaiting human signoff before downstream triggers.
   - 🔴 **Failed / Error**: Provisioning failed (e.g., Jira 503).
   - ⚪ **Blocked / Pending**: Dependent on upstream completion.
3. **Edge Topology**:
   - Visual arrows representing dependencies (e.g., `Google Workspace -> Slack`, `Google Workspace -> GitHub`, `Jira -> Board Assignment`).
4. **Node Detail Inspector Drawer**:
   - Clicking a node reveals adapter type, retry attempt count, idempotency key, and execution timestamp.

---

### 4.4 Provisioning & Adapter Ledger (`/employees/:id/provisioning`)
- **Route**: `/employees/:id/provisioning`
- **Role**: IT Operations, Security Engineers.
- **Mission**: Technical ledger showing all integration adapter executions (Google Workspace, Slack, GitHub, Jira, AWS IAM, SCIM) with idempotency keys and error logs.

#### Topics & Subtopics:
1. **Adapter Status Grid**:
   - Live telemetry cards for each connector showing health status, API latency, and quota utilization.
2. **Execution History Ledger Table**:
   - Columns: Task Name, Adapter Type, Operation (`CREATE_USER`, `ADD_TO_GROUP`, `ATTACH_POLICY`), Idempotency Key, Status, Latency (ms), Timestamp.
3. **Live Action Triggers**:
   - **Retry Provisioning**: Re-dispatches failed tasks to the backend queue.
   - **Trigger Failure Simulation**: Injects test failure (e.g. Jira 503) for live demonstration.

---

### 4.5 Real-Time Audit Timeline (`/employees/:id/timeline`)
- **Route**: `/employees/:id/timeline`
- **Role**: Compliance Officers, SOC2 / ISO Auditors.
- **Mission**: Append-only cryptographic chronological ledger of all lifecycle events, approvals, state transitions, and manual overrides.

#### Topics & Subtopics:
1. **Chronological Milestone Stream**:
   - Visual vertical timeline with distinct icons for creation, approval requests, approvals granted, task completions, and policy evaluations.
2. **Cryptographic Integrity Badges**:
   - SHA-256 evidence checksum badges displayed on each event card.
3. **Actor Identification**:
   - Displays whether an action was performed by `SYSTEM_AI_ENGINE`, `SARAH_CHEN (HR)`, `MARCUS_VANCE (MANAGER)`, or `API_CONNECTOR`.
4. **State Diff Inspector**:
   - Expandable JSON view showing `previousState` vs `newState`.

---

### 4.6 What-If Role Change Simulator (`/employees/:id/whatif`)
- **Route**: `/employees/:id/whatif`
- **Role**: HR Business Partners, Organization Planners.
- **Mission**: Predictive simulation sandbox allowing HR to simulate transferring an employee to another department or role, calculating the exact delta in access, approvals, and risk scores prior to execution.

#### Topics & Subtopics:
1. **Simulation Input Controls**:
   - Target Department dropdown (e.g., switch from Engineering to Finance).
   - Target Seniority level (e.g., Junior to Senior).
   - Target Team / Pod (e.g., Payments to Core Infrastructure).
2. **Access Delta Calculation**:
   - 🟢 **Access Added**: New tools required for the target role (e.g. AWS Production, Datadog).
   - 🔴 **Access Removed / Revoked**: Tools to be decommissioned for least-privilege compliance.
   - ⚪ **Access Unchanged**: Shared baseline tools (e.g. Google Workspace, Slack).
3. **Impact Prediction Metrics**:
   - Approvals Required Delta (e.g. +2 Manager/Security approvals).
   - Risk Score Delta (+15% increased risk due to production database access).
4. **Apply Transfer Shortcut**:
   - One-click button to convert the simulation into a formal **Transfer Request**.

---

### 4.7 Day-1 Readiness & Multi-Factor Risk Score (`/employees/:id/risk`)
- **Route**: `/employees/:id/risk`
- **Role**: HR Directors, Security Leads.
- **Mission**: Multi-factor scoring engine evaluating Day-1 operational readiness and security risk factors across hardware, identity, approvals, and training.

#### Topics & Subtopics:
1. **Readiness Score vs Risk Score Gauge**:
   - Real-time calculated score (0 to 100) combining task completion, approval status, and error states.
2. **Multi-Factor Weighted Risk Breakdown**:
   - *Active Failures Weight*: Points deducted for failed provisioning tasks.
   - *Pending Approvals Weight*: Points deducted for unapproved elevated privileges.
   - *SoD Violation Weight*: Points deducted for active privilege conflicts.
   - *Hardware Delivery Status*: Status of laptop/monitor delivery.
3. **Categorized Readiness Checklist**:
   - Critical Identity (100% complete), Communication Tools (100%), Code Repositories (100%), Project Management (Blocked by Jira), Cloud Access (Pending Signoff).
4. **Automated Recommendation Panel**:
   - Actionable AI-suggested steps to bring the score to 100% before Day-1 morning.

---

### 4.8 Internal Transfer Governance (`/employees/:id/transfer`)
- **Route**: `/employees/:id/transfer`
- **Role**: HR Operations, Department Heads.
- **Mission**: Formal workflow for moving an employee laterally or vertically, ensuring automatic entitlement reclamation to eliminate privilege creep.

#### Topics & Subtopics:
1. **From Context vs To Context Cards**:
   - Side-by-side comparison of current department/role vs proposed new position.
2. **Automated Entitlement Diff Engine**:
   - Exact list of entitlements to be automatically revoked upon transfer date.
   - Exact list of new birthright entitlements to be provisioned.
3. **Transfer Approval Chain**:
   - Dual-manager signoff tracking (releasing manager + receiving manager).
4. **Execution Action**:
   - "Apply Transfer Immediately" or "Schedule for Next Sprint" button.

---

### 4.9 Offboarding & Zero-Trust Revocation (`/employees/:id/offboarding`)
- **Route**: `/employees/:id/offboarding`
- **Role**: HR Ops, IT Security.
- **Mission**: Zero-trust automated exit orchestrator that schedules and executes complete access deprovisioning, asset recovery, and handover tasks.

#### Topics & Subtopics:
1. **Exit Timeline & Last Working Day**:
   - Exit date picker, reason selector (Resignation, End of Contract, Transition).
2. **Automated Revocation Checklist**:
   - Instant token revocation across Google Workspace, Slack, GitHub, Jira, AWS.
   - Immediate password reset and active session invalidation.
3. **Hardware Asset Return Tracking**:
   - Checklist for MacBook Pro, security keys, and access badges.
4. **Knowledge Handover & Manager Signoff**:
   - Handover documentation verification before final termination event.

---

### 4.10 Mentor & Buddy Assignment (`/employees/:id/mentor`)
- **Route**: `/employees/:id/mentor`
- **Role**: HR, Hiring Manager, Employee.
- **Mission**: Facilitate social integration by pairing the new hire with a dedicated technical Mentor and cultural Onboarding Buddy with pre-scheduled syncs.

#### Topics & Subtopics:
1. **Assigned Mentor Card**:
   - Mentor Name, Role Title, Email, Slack Handle, Department.
2. **Assigned Cultural Buddy Card**:
   - Buddy Name, Role Title, Email, Slack Handle.
3. **Pre-Scheduled Syncs Schedule**:
   - List of 1:1 sessions (e.g. Day-1 Welcome & Codebase Tour, Day-2 Architecture Deep Dive, Day-3 First PR Review).
   - Status indicators (`SCHEDULED`, `COMPLETED`).
4. **Edit / Reassign Action**:
   - Modal to change assigned mentor or add new calendar milestones.

---

### 4.11 First-Week Roadmap & Plan Items (`/employees/:id/first-week`)
- **Route**: `/employees/:id/first-week`
- **Role**: HR, Manager, Employee.
- **Mission**: Structured 5-day onboarding agenda guiding the new hire from Day-1 unboxing to their first production-ready contribution.

#### Topics & Subtopics:
1. **Day-by-Day Agenda Tabs (Days 1 to 5)**:
   - *Day 1: Setup & Welcome*: Hardware unboxing, security keys, welcome 1:1.
   - *Day 2: Architecture Deep Dive*: Payments microservice walkthrough with Kavita Rao.
   - *Day 3: Development Environment*: Local Docker setup, seed data, Good First Issue.
   - *Day 4: Code Review & CI/CD*: Pull request workflow, automated test suites.
   - *Day 5: Week 1 Retrospective*: 1:1 check-in with Marcus Vance, pulse feedback.
2. **Interactive Checkbox Tracking**:
   - Real-time completion checkboxes with category tags (`SETUP`, `MEETING`, `TRAINING`, `CHECKIN`).

---

## 5. Manager Workspace Domain

### 5.1 Manager Team Hub (`/manager`)
- **Route**: `/manager`
- **Role**: Engineering Managers, People Managers.
- **Mission**: Operational hub for hiring managers to monitor their direct reports' onboarding trajectories, upcoming start dates, and required signoffs.

#### Topics & Subtopics:
1. **Team Onboarding Snapshot**:
   - Count of incoming direct reports, current cohort readiness, and pending approval items.
2. **Direct Reports Status Grid**:
   - Cards for Rahul Sharma, Priya Mehta, and other team members showing their current onboarding step.
3. **High-Priority Action Alerts**:
   - Elevated privilege requests requiring immediate manager attention to prevent Day-1 blockers.
4. **Quick Links to 1:1 Agendas**:
   - Direct access to the first-week sync schedule and mentor pairings.

---

### 5.2 Multi-Stage Approval Queue (`/manager/approvals`)
- **Route**: `/manager/approvals`
- **Role**: Managers, Security Officers, System Admins.
- **Mission**: Triage and decision interface for high-privilege access requests and elevated tool permissions with SLA countdowns and risk context.

#### Topics & Subtopics:
1. **Filter Tabs**:
   - `PENDING` (needs action), `APPROVED`, `REJECTED`, `ALL`.
2. **Approval Request Cards**:
   - Employee Name & Role, Requested Resource (e.g. AWS Production Cloud Access), Current Stage (Stage 1 of 2), Approver Role Required, Time Elapsed & SLA Target (e.g., 2 hours remaining).
   - Risk Level Badge (`HIGH`, `CRITICAL`).
   - Employee Justification string.
3. **Interactive Decision Actions**:
   - **Approve Button**: Signs off the request, advances to next stage or triggers instant provisioning via Supabase RPC `approve_access_request`.
   - **Reject Button**: Rejects request with mandatory explanatory note.
   - **Request More Info**: Pings requester for additional business justification.

---

## 6. Employee Self-Service Domain (Day-1 Experience)

### 6.1 My Onboarding Portal (`/me`)
- **Route**: `/me`
- **Role**: Employee (New Hire).
- **Mission**: Personalized, welcoming, and empowering home page for new hires on their first day, showing their progress, assigned team, and quick actions.

#### Topics & Subtopics:
1. **Personalized Welcome Banner**:
   - "Welcome to OnboardOS, Rahul Sharma! 🎉", Role Title, Team Pod, Start Date.
2. **My Progress Meter**:
   - Percentage of onboarding tasks finished with an encouraging milestone indicator.
3. **Today's Action Items**:
   - Next 3 urgent tasks to complete today.
4. **My Support Team Quick Cards**:
   - One-click contact cards for Reporting Manager (Marcus Vance), Mentor (Kavita Rao), and Buddy (Alex Rivera).
5. **Quick Launchpad**:
   - Direct links to Email, Slack, GitHub, IT Helpdesk, and Knowledge Base.

---

### 6.2 My Actionable Tasks (`/me/tasks`)
- **Route**: `/me/tasks`
- **Role**: Employee.
- **Mission**: Clean, interactive checklist of personal onboarding action items, compliance acknowledgments, and workspace setups.

#### Topics & Subtopics:
1. **Category Filter Tabs**:
   - All Tasks, Identity & Security, Communication, Development Tools, Training & Compliance.
2. **Task Card Items**:
   - Task Title (e.g., "Configure YubiKey & Password Manager"), Status Badge (`COMPLETED`, `IN_PROGRESS`, `PENDING`), Description, Est. Duration.
3. **Interactive Check & Launch**:
   - Checkbox to toggle task completion status with instant visual feedback.

---

### 6.3 AI Onboarding Guide & Policy Q&A (`/me/assistant`)
- **Route**: `/me/assistant`
- **Role**: Employee.
- **Mission**: Interactive AI copilot trained on internal company policies, cloud security guidelines, benefits, and development standards with cited answers.

#### Topics & Subtopics:
1. **Natural Language Query Input**:
   - Interactive prompt bar with suggested query chips (e.g. *"How do I request AWS access?"*, *"What is our git branching policy?"*, *"How does PTO work?"*).
2. **AI Answer Stream**:
   - Comprehensive markdown responses generated with context citations.
3. **Source Citations Card**:
   - Clickable references showing the exact Wiki document and paragraph where the answer originated.

---

### 6.4 Employee IT Helpdesk (`/me/help`)
- **Route**: `/me/help`
- **Role**: Employee.
- **Mission**: Frictionless self-service portal for new hires to report hardware issues, access errors, or request equipment assistance.

#### Topics & Subtopics:
1. **Submit Ticket Form**:
   - Subject, Category (Access & Permissions, Hardware / Laptop, Software License, Network / VPN), Priority, Description.
2. **My Active Tickets Table**:
   - List of previously submitted requests with real-time status badges (`OPEN`, `IN_PROGRESS`, `RESOLVED`) and IT assignment notes.

---

### 6.5 My First 5 Days Roadmap (`/me/first-week`)
- **Route**: `/me/first-week`
- **Role**: Employee.
- **Mission**: Dedicated self-service view of the 5-day onboarding agenda tailored for the new hire with personal completion tracking.

#### Topics & Subtopics:
- Daily agendas (Days 1–5), time slots, meeting links, checklist markers, and retrospective notes.

---

### 6.6 My Mentor & Buddy (`/me/mentor`)
- **Route**: `/me/mentor`
- **Role**: Employee.
- **Mission**: Personal view to connect directly with the assigned technical mentor and culture buddy, view scheduled 1:1 sessions, and prepare meeting topics.

#### Topics & Subtopics:
- Mentor & Buddy bios, Slack deep links, scheduled sync calendar, and shared note topics.

---

### 6.7 Weekly Pulse Sentiment Check (`/me/pulse`)
- **Route**: `/me/pulse`
- **Role**: Employee.
- **Mission**: Simple, anonymous 1-click weekly sentiment submission allowing employees to share how supported they feel without social pressure.

#### Topics & Subtopics:
1. **Sentiment Emoji Selection**:
   - 🤩 **Great** ("Everything is smooth and fast")
   - 🙂 **Good** ("On track, no major blockers")
   - 😐 **Okay** ("A few confusing steps or delays")
   - 😟 **Struggling** ("Blocked on key tools or access")
2. **Optional Note / Feedback Field**:
   - Textarea for anonymous suggestions or blockers.
3. **Submission Confirmation**:
   - Saves to Supabase `pulse_responses` table and updates aggregate `pulse_trends` view.

---

## 7. IT Operations & Hardware Lifecycle Domain

### 7.1 IT Operations Dashboard (`/it`)
- **Route**: `/it`
- **Role**: IT Operations Lead, System Administrators.
- **Mission**: Infrastructure oversight dashboard monitoring hardware asset utilization, open provisioning tickets, SCIM connector health, and orphan account risks.

#### Topics & Subtopics:
1. **IT KPI Statistics**:
   - *Assigned Laptops / Devices*: Total active fleet count.
   - *Open Provisioning Tickets*: Unresolved IT issues.
   - *SCIM Sync Health (% rate)*: Average sync success rate across identity connectors.
   - *Active Orphan Access Risks*: Deprovisioning risks flagged on exiting employees.
2. **Hardware Fleet Health Chart**:
   - Distribution of assets across `ASSIGNED`, `RECEIVED`, `DAMAGED`, `LOST`, `RETURNED`.
3. **Recent IT Ticket Stream**:
   - Quick list of new tickets requiring hardware dispatch or manual provisioning.

---

### 7.2 IT Service Ticket Queue (`/it/tickets`)
- **Route**: `/it/tickets`
- **Role**: IT Support Specialists.
- **Mission**: Full queue management system for employee support tickets with AI classification suggestions, team reassignment, and resolution workflows.

#### Topics & Subtopics:
1. **Filter & Sort Controls**:
   - Filter by status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), Priority (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), or Assigned Team.
2. **Ticket List Table**:
   - Columns: Ticket ID, Requester Name, Subject, Category, AI Suggested Priority, Assigned Pod, Status, Created Timestamp.
3. **AI Classification Insights**:
   - Displays AI-recommended priority, category, and suggested resolution actions.
4. **Resolution Modal**:
   - Input resolution notes, mark as resolved, and notify requester.

---

### 7.3 Hardware Asset Management (`/it/assets`)
- **Route**: `/it/assets`
- **Role**: IT Asset Managers, Logistics.
- **Mission**: Complete hardware inventory management for laptops, monitors, peripherals, and security badges across the entire employee lifecycle.

#### Topics & Subtopics:
1. **Asset Fleet Summary Cards**:
   - Total Laptops (e.g. MacBook Pro M3 Max), Monitors (Dell UltraSharp 4K), Keyboards, Access Badges.
2. **Inventory Roster Table**:
   - Columns: Asset Tag (`AST-MBP-091`), Model Name, Serial Number, Assigned Employee, State (`ASSIGNED`, `RECEIVED`, `DAMAGED`, `LOST`, `RETURNED`), Assigned Date.
3. **Assign New Asset Modal**:
   - Form to register a new device serial number and assign it to an employee.
4. **Update Asset State Action**:
   - Quick dropdown to mark hardware as received, damaged, or returned upon offboarding.

---

### 7.4 Offboarding Orphan Access Risks (`/it/offboarding`)
- **Route**: `/it/offboarding`
- **Role**: IT Security, Identity Admins.
- **Mission**: Automated risk detector that scans all target SaaS platforms (AWS, GitHub, Slack, Jira) to flag remaining active permissions on exiting employees.

#### Topics & Subtopics:
1. **Orphan Risk Table**:
   - Columns: Employee Name, Target SaaS System, Detected Anomaly (e.g. "Active AWS Production deployer key after last working day"), Severity (`CRITICAL`), Detection Timestamp.
2. **Remediation Action**:
   - **Enforce Immediate Kill-Switch**: Calls revocation RPC and logs compliance evidence.

---

## 8. Core Access Governance Domain (P0)

### 8.1 Role & Permission Scope Catalog (`/admin/roles`)
- **Route**: `/admin/roles`
- **Role**: System Admin, Security Architect.
- **Mission**: Definitive catalog of all organizational roles, departments, seniority tiers, and standard permission boundaries.

#### Topics & Subtopics:
1. **Department & Role Hierarchy Tree**:
   - Visual breakdown of Engineering (Backend, Frontend, DevOps), Product, HR, IT, Finance.
2. **Role Entitlement Scope Table**:
   - Entitlements mapped to each role tier with risk rating.
3. **Add Role / Permission Modal**:
   - Form to create new role definitions and set baseline access profiles.

---

### 8.2 Birthright Policy Engine (`/admin/birthright`)
- **Route**: `/admin/birthright`
- **Role**: Identity Architects, Security Leads.
- **Mission**: Rule configuration engine defining automatic Day-1 access policies based on employee attributes (Department, Role, Location, Employment Type).

#### Topics & Subtopics:
1. **Active Policy List**:
   - Cards for Engineering Backend Birthright, Design Suite Birthright, Executive Tool Suite.
2. **Condition Builder**:
   - Visual rule builder with fields (`department`, `employmentType`, `seniority`), operators (`EQUALS`, `IN`, `CONTAINS`), and values.
3. **Granted Entitlements Mapping**:
   - Multi-select list of tools automatically provisioned upon matching conditions.
4. **Priority & Versioning**:
   - Rule execution priority order and audit version history.

---

### 8.3 Access Package Bundles Catalog (`/admin/packages`)
- **Route**: `/admin/packages`
- **Role**: Security Admin, IT Leads.
- **Mission**: Catalog of curated access bundles grouped by function (e.g., "Core Developer Suite", "Production Payments Infrastructure") with defined approval stages and TTL durations.

#### Topics & Subtopics:
1. **Package Grid View**:
   - Package Name, Code (`PKG-CORE-DEV`), Category (`DEVELOPMENT`, `FINANCE`), Risk Level (`LOW`, `HIGH`), Max Duration (e.g. 90 Days), Active Grants Count.
2. **Approval Stages Configuration**:
   - Define multi-stage signoffs (Stage 1: Manager, Stage 2: Security Lead) and SLA hours.
3. **Package Creator Modal**:
   - Create new bundle, select entitlements, configure review frequency and auto-approve conditions.

---

### 8.4 Self-Service Access Marketplace (`/admin/marketplace`)
- **Route**: `/admin/marketplace`
- **Role**: All Employees, Contractors, Admins.
- **Mission**: Enterprise app store where employees can browse, discover, and request access packages with automated multi-stage approvals.

#### Topics & Subtopics:
1. **Category Filtering**:
   - All, Development, Finance, Infrastructure, Marketing, Security.
2. **Package Cards with "Request Access" Trigger**:
   - Displays package description, included permissions, risk level, and required approvers.
3. **Request Submission Modal**:
   - Input field for Business Justification and Duration slider (e.g. 14 Days, 30 Days, 90 Days).
   - Real-time SoD conflict pre-check warning before submission.

---

### 8.5 Time-Bound Grants & TTL Ledger (`/admin/grants`)
- **Route**: `/admin/grants`
- **Role**: Security Operations, Compliance Officers.
- **Mission**: Real-time monitor of all active time-bound permissions across the enterprise, tracking expiration countdowns and renewal eligibility.

#### Topics & Subtopics:
1. **Active Grants Overview**:
   - Total active grants, grants expiring in < 7 days, revoked grants.
2. **Grants Ledger Table**:
   - Columns: Employee Name, Entitlement Name, Target App, Granted Timestamp, Expiration Date, Remaining Hours, Status (`ACTIVE`, `EXPIRING_SOON`, `EXPIRED`, `REVOKED`).
3. **Action Triggers**:
   - **Renew Grant**: Extends duration with justification.
   - **Revoke Grant Immediately**: Executes `revoke_access_grant` RPC.

---

### 8.6 Access Certification Campaigns (`/admin/certifications`)
- **Route**: `/admin/certifications`
- **Role**: Security Directors, Department Managers.
- **Mission**: Periodic access review campaign manager enabling managers to certify or revoke existing access permissions to maintain zero-trust hygiene.

#### Topics & Subtopics:
1. **Campaign Header & Progress**:
   - Campaign Name (e.g. "Q3 Quarterly Security & Engineering Certification"), Deadline, Review Completion Rate (e.g. 94%).
2. **Review Items Table**:
   - Columns: Employee Name, Entitlement, Target System, Peer Comparison Metric (e.g. "95% of peers have this" vs "Anomaly / Outlier (only 5% have)"), Decision.
3. **1-Click Review Actions**:
   - **Certify (Keep)**, **Revoke (Remove)**, **Revoke with Exception**.

---

### 8.7 Separation of Duties (SoD) Conflict Center (`/admin/sod`)
- **Route**: `/admin/sod`
- **Role**: Security & Governance Architects, Risk Officers.
- **Mission**: Policy enforcement engine detecting toxic combinations of permissions (e.g. Payment Creator vs Payment Releaser; Code Committer vs Production Deployer).

#### Topics & Subtopics:
1. **SoD Rules Definition Catalog**:
   - Rule Name, Conflicting Entitlement A vs Entitlement B, Enforcement Action (`HARD_DENY` vs `SECURITY_OVERRIDE_REQUIRED`).
2. **Active Conflicts Table**:
   - Employee Name, Existing Entitlement, Conflicting Requested Entitlement, Risk Level (`CRITICAL`), Status (`ACTIVE_VIOLATION`, `BLOCKED_REQUEST`, `OVERRIDDEN_APPROVED`).
3. **Resolution Action Modal**:
   - Overrule with mandatory Compensating Control Note or Enforce Revocation.

---

## 9. Advanced Enterprise Governance Domain (P1)

### 9.1 Just-In-Time (JIT) Elevation (`/admin/jit`)
- **Route**: `/admin/jit`
- **Role**: DevOps Engineers, Security Admins.
- **Mission**: Ephemeral privilege elevation workflow granting time-boxed access to production infrastructure with automatic revocation after session expiry.

#### Topics & Subtopics:
1. **Active Elevation Sessions**:
   - Requester Name, Target System (AWS Production, Prod Postgres), Privileged Role, Remaining Minutes countdown, Status (`ACTIVE`, `EXPIRED`).
2. **Request JIT Elevation Modal**:
   - Target System selector, Duration (15 min, 30 min, 60 min, 120 min), Emergency Break-Glass toggle, Mandatory Ticket ID.
3. **Emergency Revoke Button**:
   - Instantly terminates active JIT token.

---

### 9.2 Identity Source & HRMS/IdP Reconciliation (`/admin/reconciliation`)
- **Route**: `/admin/reconciliation`
- **Role**: Identity Admins, Directory Engineers.
- **Mission**: Automated synchronization monitor comparing authoritative HRMS data (Workday) against downstream IdPs (Okta, Microsoft Entra) to detect attribute drift.

#### Topics & Subtopics:
1. **Connected Identity Sources**:
   - Workday HRMS (`AUTHORITATIVE`), Okta Universal Directory, Active Directory with sync status and account counts.
2. **Detected Drift & Mismatch Table**:
   - Columns: Employee Name, Attribute (e.g. Department, Manager, Job Title), Authoritative HRMS Value vs Target IdP Value, Status (`UNRESOLVED`, `AUTO_REMEDIATED`).
3. **1-Click Auto-Remediate**:
   - Pushes authoritative HRMS attributes to downstream directory via SCIM.

---

### 9.3 SCIM 2.0 Provisioning Connectors (`/admin/scim`)
- **Route**: `/admin/scim`
- **Role**: IT Engineers, Integration Specialists.
- **Mission**: Configuration and health monitor for automated SCIM 2.0 provisioning endpoints (Slack, GitHub, Jira, AWS IAM, Okta).

#### Topics & Subtopics:
1. **Connector Cards**:
   - App Name, Endpoint URL, SCIM Version, Auth Type (Bearer / OAuth2), Health Status (`ONLINE`, `DEGRADED`), Sync Success Rate (e.g. 99.8%), Total Synced Users.
2. **Connector Test Trigger**:
   - Real-time ping button measuring API round-trip latency and verifying schema handshake.

---

### 9.4 External Identity & Contractor Governance (`/admin/external-identities`)
- **Route**: `/admin/external-identities`
- **Role**: Vendor Managers, Procurement, Security.
- **Mission**: Specialized lifecycle governance for non-employees (Contractors, Vendors, Partners, Temporary Staff) with sponsor accountability and hard expiration dates.

#### Topics & Subtopics:
1. **Contractor Roster Table**:
   - External Name, Vendor Organization, Identity Type (`CONTRACTOR`, `VENDOR`), Internal Sponsor Name, Start Date, Expiration Date, Days Remaining countdown, Status.
2. **Register External Identity Modal**:
   - Form to onboard third-party staff with mandatory business purpose and internal sponsor assignment.

---

### 9.5 Compliance Evidence & Audit Export Center (`/admin/compliance`)
- **Route**: `/admin/compliance`
- **Role**: External Auditors, Compliance Leads.
- **Mission**: Cryptographically verified audit export hub generating SOC2, ISO 27001, and SOX-ready evidence archives with SHA-256 integrity checksums.

#### Topics & Subtopics:
1. **Evidence Record Stream**:
   - Timestamp, Employee Name, Action (`GRANT`, `REVOKE`, `EXPIRE`, `CERTIFY`, `ELEVATE`), Authorized Policy, Approved By, SHA-256 Checksum.
2. **Audit Package Export Filter**:
   - Date range picker, system filter, action filter.
3. **1-Click Export Archive**:
   - Generates downloadable CSV / JSON audit package with verification checksum.

---

### 9.6 Usage-Aware Stale Access Reclaim (`/admin/stale-access`)
- **Route**: `/admin/stale-access`
- **Role**: Security Admins, FinOps.
- **Mission**: Inactive entitlement detector analyzing last-activity timestamps to identify unused high-privilege access and unused paid licenses.

#### Topics & Subtopics:
1. **Stale Access Candidates Table**:
   - Employee Name, Entitlement Name, Target App, Days Inactive (e.g. 90+ days), Monthly Cost ($USD), Risk Score, AI Recommendation (`REVOKE_IMMEDIATE`, `SCHEDULE_REVIEW`).
2. **Reclaim Action**:
   - 1-click batch revocation to reduce attack surface and SaaS expenditure.

---

## 10. Strategic Governance Extensions Domain (P2)

### 10.1 Device Posture & Zero-Trust Signals (`/admin/devices`)
- **Route**: `/admin/devices`
- **Role**: Endpoint Security Admins.
- **Mission**: Correlates endpoint management telemetry (MDM, disk encryption, OS patch level) with identity access privileges for conditional access control.

#### Topics & Subtopics:
1. **Fleet Device Trust Cards**:
   - Managed vs Unmanaged devices, Encrypted vs Unencrypted, Compliant percentage.
2. **Device Posture Signals Table**:
   - Device ID, Assigned Employee, Device Model (MacBook Pro, ThinkPad), OS Version, Disk Encrypted (Yes/No), Compliance Status (`COMPLIANT`, `NON_COMPLIANT`), Trust Score (0–100).

---

### 10.2 SaaS & License Intelligence (`/admin/licenses`)
- **Route**: `/admin/licenses`
- **Role**: FinOps, Procurement, IT Directors.
- **Mission**: Optimization dashboard identifying abandoned seats and inactive licenses across enterprise tools (GitHub Enterprise, Figma, Slack Grid) to calculate potential monthly savings.

#### Topics & Subtopics:
1. **Financial Savings Summary**:
   - Total Potential Monthly Savings ($USD), Total Managed Seats, Reclaim Candidates.
2. **SaaS Application Breakdown Table**:
   - App Name, Tier, Total Seats, Assigned Seats, Inactive Seats (30d), Cost Per Seat, Monthly Savings Opportunity, Status (`OPTIMAL`, `RECLAIM_RECOMMENDED`).

---

### 10.3 AI Agent & Service Account Governance (`/admin/agents`)
- **Route**: `/admin/agents`
- **Role**: AI Platform Leads, Security Architects.
- **Mission**: Governance and permission scoping for non-human identities (AI Agents, CI/CD Bots, Automated Microservice Service Accounts).

#### Topics & Subtopics:
1. **Agent Identity Roster Table**:
   - Agent Name, Type (`AI_AGENT`, `CI_CD_BOT`), Owner Name, Allowed Tool Scope (JSON tools), Max Privilege Level (`READ_ONLY`, `SCOPED_WRITE`, `CLUSTER_ADMIN`), Environment (`PRODUCTION`, `DEVELOPMENT`), Status (`ACTIVE`, `PAUSED`).
2. **Register Agent / Bot Modal**:
   - Form to register automated agent with bounded tool scopes and expiration dates.
3. **Emergency Pause Action**:
   - 1-click kill switch to pause an active agent identity.

---

### 10.4 Delegated Administration Scopes (`/admin/delegated-admin`)
- **Role**: Platform Administrators.
- **Route**: `/admin/delegated-admin`
- **Mission**: Granular decentralization of administration rights, allowing department leads or app owners to manage policies without granting global admin permissions.

#### Topics & Subtopics:
1. **Delegated Scope Table**:
   - Admin Name, Scope Type (`APPLICATION_OWNER`, `RESOURCE_OWNER`, `DEPARTMENT_SECURITY_LEAD`), Assigned Scope (e.g. "Payments Applications", "Engineering Dept"), Permissions (`Can Approve`, `Can Review`, `Can Manage Policies`).
2. **Add Delegated Scope Modal**:
   - Assign user to scoped boundaries with tailored checkboxes.

---

### 10.5 Executive Identity Governance Analytics (`/admin/analytics`)
- **Route**: `/admin/analytics`
- **Role**: CISO, CIO, VP of People Operations.
- **Mission**: High-level executive dashboard aggregating enterprise identity hygiene, onboarding velocity, standing privilege counts, and compliance postures.

#### Topics & Subtopics:
1. **Executive Scorecard**:
   - *Day 1 Readiness Rate*: 92.0%
   - *Median Onboarding Time*: 3.2 Days
   - *Avg Access Approval Time*: 4.5 Hours
   - *Review Completion Rate*: 94.0%
   - *Active Standing Privileges*: 6
   - *SoD Conflicts Prevented*: 12
   - *Stale Entitlements Reclaimed*: 18
   - *Monthly License Savings*: $1,450.00 / month
2. **Interactive Historical Velocity Charts**:
   - Longitudinal trends showing reduction in onboarding friction and privilege risks over time.

---

### 10.6 Platform Users & RBAC Administration (`/admin/users`)
- **Route**: `/admin/users`
- **Role**: Global Admins.
- **Mission**: Manage system user accounts, assign platform roles (`ADMIN`, `HR`, `IT`, `MANAGER`, `EMPLOYEE`), and link user logins to canonical employee records.

#### Topics & Subtopics:
1. **User Accounts Table**:
   - User ID, Name, Email, Platform Role Badge, Linked Employee Profile, Created Date.
2. **Edit User Role Modal**:
   - Change assigned RBAC tier with real-time permission sync.

---

## 11. Cross-Role Shared Hubs & Demonstrator

### 11.1 Enterprise Knowledge Assistant (`/knowledge`)
- **Route**: `/knowledge`
- **Role**: All Employees, HR, IT, Managers.
- **Mission**: Organization-wide searchable knowledge base powered by semantic vector embeddings and categorized markdown documentation.

#### Topics & Subtopics:
1. **Semantic Search Prompt**:
   - Real-time search across internal wiki pages, IT policies, and architectural standards.
2. **Knowledge Document Catalog**:
   - Cards categorized by Security, Engineering, People Ops, and IT Architecture.
3. **Interactive Document Reader**:
   - Full markdown renderer displaying document contents with revision dates.

---

### 11.2 Company Community Hub & Welcome Wall (`/community`)
- **Route**: `/community`
- **Role**: All Employees.
- **Mission**: Social engagement hub welcoming new cohort hires, sharing company-wide announcements, and celebrating onboarding milestones.

#### Topics & Subtopics:
1. **New Hire Welcome Feed**:
   - Cohort announcements highlighting incoming team members with role and department tags.
2. **Social Interaction Controls**:
   - Like button, Comment counter, and reaction emojis.
3. **Create Announcement Modal**:
   - Form for HR / Leadership to post company announcements, events, and onboarding milestones.

---

### 11.3 Live Demo Controller & Failure Injector (`/_demo`)
- **Route**: `/_demo`
- **Role**: Hackathon Judges, Presenters, QA Engineers.
- **Mission**: Dedicated demonstration control center allowing presenters to trigger pre-scripted workflow scenarios, inject live adapter errors, and reset test states in 1 click.

#### Topics & Subtopics:
1. **Active Demo State Inspector**:
   - Displays current data mode (`mock`, `api`, `supabase`), current active user, and Rahul Sharma's live status.
2. **1-Click Scripted Scenario Triggers**:
   - ⚡ **Inject Jira Rate Limit (HTTP 503)**: Injects failure on Rahul's Jira task, triggering downstream task blocks, exception events, and IT ticket creation.
   - 🔄 **Trigger Idempotent Retry**: Re-executes Jira adapter, unblocking downstream Payments board tasks.
   - 🛡️ **Trigger AWS Manager Signoff**: Simulates Marcus Vance's approval, completing the provisioning DAG.
   - ♻️ **Reset All Demo State**: Restores clean baseline seed data across all 56 tables.

---

## 12. Supabase Database Schema Matrix (56 Tables)

| # | Table Name | Domain Category | Key Columns & Foreign Keys | RLS Policy Scope |
|---|---|---|---|---|
| 1 | `organizations` | Multi-Tenant Core | `id, name, domain, created_at` | Global Tenant Isolation |
| 2 | `departments` | Organizational Structure | `id, org_id, name, code` | Multi-tenant Org Member Read |
| 3 | `teams` | Organizational Structure | `id, org_id, department_id, name` | Multi-tenant Org Member Read |
| 4 | `projects` | Organizational Structure | `id, org_id, team_id, name, code` | Multi-tenant Org Member Read |
| 5 | `roles` | Organizational Structure | `id, org_id, department_id, title, level` | Multi-tenant Org Member Read |
| 6 | `employees` | Personnel Master | `id, org_id, name, email, role_id, department_id, status` | HR / Admin Manage, Member Read |
| 7 | `employee_contexts` | Identity Context | `id, org_id, employee_id, raw_vector` | Contextual Audit Read |
| 8 | `users` | Platform RBAC | `id, org_id, auth_user_id, email, role, employee_id` | User Self Read, Admin Manage |
| 9 | `requirement_rules` | Policy Rules Engine | `id, org_id, requirement_name, category, decision` | Admin / HR Manage, Member Read |
| 10 | `sod_rules` | Security & SoD | `id, org_id, code, name, enforcement_action` | Security / Admin Manage |
| 11 | `onboarding_plans` | Orchestration Plans | `id, org_id, employee_id, status, reasoning_sequence` | Employee / Manager / HR Read |
| 12 | `plan_items` | Plan Detail | `id, org_id, plan_id, name, final_decision, ai_rationale` | Employee / Manager / HR Read |
| 13 | `tasks` | Execution DAG | `id, org_id, employee_id, name, status, adapter_type` | Employee / Manager / HR Read |
| 14 | `task_dependencies` | Graph Topology | `id, org_id, task_id, depends_on_task_id` | Enforces Cycle Detection Trigger |
| 15 | `approvals` | Governance Approvals | `id, org_id, task_id, approver_role, status, sla_target_at` | Approver Role / Manager Manage |
| 16 | `integration_adapter_actions` | Adapter Ledger | `id, org_id, task_id, adapter_type, idempotency_key` | **Append-Only** (No Client Delete) |
| 17 | `access_packages` | Access Bundles | `id, org_id, code, name, category, max_duration_days` | Member Read, Admin Manage |
| 18 | `entitlements` | Entitlement Catalog | `id, org_id, app_name, permission_name, risk_level` | Member Read, Admin Manage |
| 19 | `time_bound_grants` | Legacy Grants | `id, org_id, employee_id, entitlement_id, expires_at` | Member Read, Admin Manage |
| 20 | `audit_logs` | Cryptographic Audit | `id, org_id, employee_id, actor_role, sha256_checksum` | **Append-Only** (No Client Delete) |
| 21 | `notifications` | In-App Alerts | `id, org_id, user_id, priority, title, read_at` | User Self Read / Manage |
| 22 | `exception_events` | Failure Triage | `id, org_id, employee_id, task_id, severity, resolved_at` | HR / IT / Admin Manage |
| 23 | `risk_assessments` | Readiness Analytics | `id, org_id, employee_id, risk_score, day_one_ready` | HR / Manager / Admin Read |
| 24 | `tickets` | IT Helpdesk | `id, org_id, employee_id, subject, priority, status` | Requester Read, IT Manage |
| 25 | `assets` | Hardware Inventory | `id, org_id, employee_id, asset_tag, serial_number, state` | IT / Admin Manage, Employee Read |
| 26 | `access_grants` | Live Access Grants | `id, org_id, employee_id, entitlement_id, status, expires_at` | Member Read, RPC Managed |
| 27 | `access_requests` | Self-Service Requests | `id, org_id, package_id, requester_employee_id, status` | Requester / Approver Manage |
| 28 | `access_request_approvals` | Multi-Stage Signoffs | `id, org_id, access_request_id, stage, approver_role` | Approver Role Manage |
| 29 | `access_package_entitlements`| Package Mapping | `id, org_id, package_id, entitlement_id` | Member Read, Admin Manage |
| 30 | `access_package_approval_stages`| Approval Definition| `id, org_id, package_id, stage, approver_role, sla_hours` | Member Read, Admin Manage |
| 31 | `birthright_policies` | Policy Engine | `id, org_id, name, policy_type, status, priority` | Security / Admin Manage |
| 32 | `policy_conditions` | Rule Conditions | `id, org_id, policy_id, field, operator, value` | Security / Admin Manage |
| 33 | `policy_entitlements` | Policy Grant Mapping | `id, org_id, policy_id, entitlement_id, decision` | Security / Admin Manage |
| 34 | `sod_conflicts` | Toxic Combinations | `id, org_id, sod_rule_id, employee_id, status` | Security / Admin Manage |
| 35 | `access_review_campaigns`| Certification Campaigns| `id, org_id, name, deadline, status, reviewer_role` | Reviewer / Admin Manage |
| 36 | `access_review_items` | Certification Items | `id, org_id, campaign_id, access_grant_id, decision` | Reviewer / Admin Manage |
| 37 | `knowledge_documents` | Semantic Wiki | `id, org_id, title, category, source, content` | Member Read, Admin Manage |
| 38 | `knowledge_chunks` | Vector Embeddings | `id, org_id, document_id, content, embedding (vector)` | Member Read, Semantic Search |
| 39 | `transfer_requests` | Internal Transfers | `id, org_id, employee_id, to_context, status` | HR / Manager Manage |
| 40 | `offboarding_plans` | Offboarding Plans | `id, org_id, employee_id, exit_date, status` | HR / IT / Admin Manage |
| 41 | `offboarding_risk_flags`| Orphan Access Risks | `id, org_id, employee_id, system_name, severity` | IT / Security Manage |
| 42 | `mentor_assignments` | Social Onboarding | `id, org_id, employee_id, mentor_name, scheduled_syncs` | Employee / Mentor Read |
| 43 | `first_week_plan_items`| 5-Day Agenda Items | `id, org_id, employee_id, day, time_slot, completed` | Employee / Manager Manage |
| 44 | `pulse_responses` | Weekly Sentiment | `id, org_id, employee_id, value, note, submitted_at` | Employee Insert (HR View via aggregate) |
| 45 | `community_posts` | Welcome Social Wall | `id, org_id, author_user_id, title, likes_count` | Member Read / Write |
| 46 | `identity_sources` | HRMS / IdP Sources | `id, org_id, name, type, is_authoritative, status` | IT / Admin Manage |
| 47 | `reconciliation_mismatches`| Attribute Drift | `id, org_id, employee_id, attribute_name, status` | IT / Admin Manage |
| 48 | `scim_connectors` | SCIM 2.0 Connectors | `id, org_id, app_name, endpoint_url, sync_success_rate` | IT / Admin Manage |
| 49 | `external_identities` | Contractor Governance | `id, org_id, name, organization_name, expiration_date` | Vendor Mgr / Admin Manage |
| 50 | `external_identity_packages`| Contractor Bundles | `id, org_id, external_identity_id, package_id` | Vendor Mgr / Admin Manage |
| 51 | `stale_access_findings` | Dormant Accounts | `id, org_id, employee_id, days_inactive, status` | Security / FinOps Manage |
| 52 | `device_posture_signals`| Zero-Trust Telemetry | `id, org_id, device_id, employee_id, trust_score` | IT / Security Read |
| 53 | `saas_licenses` | License Optimization | `id, org_id, app_name, total_seats, potential_savings` | FinOps / IT Manage |
| 54 | `agent_identities` | AI Agent Governance | `id, org_id, name, max_privilege_level, status` | Security / AI Platform Manage |
| 55 | `delegated_admin_scopes`| Scoped Administration | `id, org_id, admin_name, scope_type, assigned_scope` | Admin Manage |
| 56 | `compliance_evidence` | Cryptographic Proof | `id, org_id, timestamp, action, evidence_checksum` | **Append-Only** (No Client Delete) |

---

*Generated for OnboardOS Autonomous Lifecycle & Access Governance Platform.*
