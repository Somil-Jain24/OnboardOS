# OnboardOS — Employee Experience Features

## Purpose

Extend the existing OnboardOS employee-facing experience into a complete enterprise employee portal without replacing or disrupting the existing onboarding workflow.

These features are additions to the existing product. Existing Employee Dashboard, My Tasks, AI Assistant, Helpdesk, First-Week Planner, Mentor/Buddy, Employee Pulse and Community Hub must remain intact.

---

# P0 — Core Employee Experience

## P0-01 — My Access Center

### Purpose
Give employees a clear view of all applications, permissions and access currently assigned to them.

### Features
- Current applications and services
- Access/package name
- Role or permission level
- Access status
- Granted date
- Source of access
- Permanent vs temporary access
- Expiration date
- Risk/restriction indicator
- Search and filtering

### Example

```text
My Access

GitHub
Role: Developer
Status: Active
Source: Birthright Access

AWS Development
Role: Developer
Status: Active
Expires: Sep 02, 2026

Production AWS
Status: Restricted
Approval Required
```

---

## P0-02 — Request Access

### Purpose
Allow employees to request additional access without depending entirely on HR or IT.

### Features
- Browse available applications/access packages
- Search access catalog
- View package description
- View permissions included
- View business justification
- Risk level
- Approval requirements
- Request access
- Request status

### Example

```text
Request Access

AWS Production
Risk: HIGH
Approval: Manager + Security

Reason:
[ Explain why you need this access ]

[ Request Access ]
```

---

## P0-03 — My Requests & Approvals

### Purpose
Give employees visibility into access and onboarding requests they have submitted.

### Features
- Pending requests
- Approved requests
- Rejected requests
- Cancelled requests
- Expired requests
- Current approver
- Approval stage
- Request timeline
- Rejection reason
- Request clarification
- Cancel request

### Example

```text
AWS Production Access

Manager Approval     ✓ Approved
Security Approval    ● Pending
Provisioning         ○ Waiting

Current approver:
Security Team

Requested:
Aug 21, 2026
```

---

## P0-04 — Access Expiration & Renewal

### Purpose
Make temporary access visible and prevent employees from unexpectedly losing required access.

### Features
- Expiring access list
- Expiration countdown
- Expiration date
- Reason for temporary access
- Renewal request
- Renewal justification
- Renewal status
- Expired access history

### Example

```text
Expiring Access

AWS Development
Expires in: 2d 14h

[ Renew Access ]

Figma Pro
Expires in: 7 days

[ Renew Access ]
```

---

# P1 — Security & Employee Operations

## P1-01 — My Security Center

### Purpose
Provide employees with a personal security overview.

### Features
- Security score
- MFA status
- Security training status
- Account security status
- Recent security activity
- Risk alerts
- Required security actions
- Security recommendations

### Example

```text
Security Score
        92 / 100

✓ MFA Enabled
✓ Security Training Complete
✓ Account Protected

⚠ Device verification required
```

Security recommendations must be informational unless an existing policy requires an action.

---

## P1-02 — My Devices

### Purpose
Allow employees to see company-managed devices associated with their identity.

### Features
- Laptop
- Mobile device
- Monitor
- Other managed devices
- Device status
- Assignment date
- Device health
- Compliance status
- Last seen
- Report lost/stolen device
- Device issue reporting

### Example

```text
MacBook Pro
Status: Compliant
Last Seen: Today, 10:32 AM
Assigned: Aug 18, 2026

[ Report Issue ]
[ Report Lost ]
```

---

## P1-03 — My Documents

### Purpose
Provide a centralized employee location for important company and onboarding documents.

### Features
- HR documents
- Company policies
- Onboarding documents
- Agreements
- Security policies
- Documents requiring acknowledgement
- Document search
- Download/view
- Acknowledge document
- Acknowledgement history

---

## P1-04 — My HR & Benefits

### Purpose
Provide employees with quick access to relevant HR information.

### Features
- Benefits overview
- Leave information
- Holiday calendar
- Payroll information/link
- HR contacts
- Company policies
- Employee information
- Important HR resources

This should remain a lightweight employee information module rather than becoming a complete payroll/HRIS system.

---

## P1-05 — My Goals & Progress

### Purpose
Extend onboarding into measurable first-month and first-quarter employee progress.

### Features
- 30-day goals
- 60-day goals
- 90-day goals
- Onboarding milestones
- Training progress
- Assigned objectives
- Completion percentage
- Manager feedback/status
- Upcoming milestones

### Example

```text
First 30 Days

Onboarding      █████████░ 90%
Training        ████████░░ 80%
Team Setup      ██████████ 100%

Next Milestone:
Complete Security Architecture Training
```

---

## P1-06 — People Directory

### Purpose
Help new and existing employees quickly discover people inside the organization.

### Features
- Employee search
- Name
- Role
- Department
- Team
- Manager
- Location
- Contact information
- Profile
- Skills/interests where available
- Organization relationship

---

## P1-07 — Team Hub

### Purpose
Provide a focused workspace for an employee's immediate team.

### Features
- Team members
- Team manager
- Team announcements
- Current projects
- Useful links
- Team resources
- Upcoming team events
- Team contacts

---

# P2 — Growth & Employee Engagement

## P2-01 — My Learning Hub

### Purpose
Centralize role-based learning and professional development.

### Features
- Required courses
- Recommended courses
- Course progress
- Certifications
- Training deadlines
- Completed courses
- Learning recommendations
- Role/team-based learning paths

---

## P2-02 — My Career Profile

### Purpose
Allow employees to maintain a professional internal profile.

### Features
- Skills
- Interests
- Certifications
- Career goals
- Areas of expertise
- Learning interests
- Preferred career direction
- Profile completeness

---

## P2-03 — Internal Opportunities

### Purpose
Help employees discover relevant internal opportunities.

### Features
- Internal jobs
- Projects
- Temporary assignments
- Skill matching
- Department
- Location
- Opportunity details
- Apply/express interest

Recommendations should be based on available employee context and skills, not protected/sensitive attributes.

---

## P2-04 — Feedback Center

### Purpose
Provide a structured place for employees to share onboarding and workplace feedback.

### Features
- Onboarding feedback
- Manager/team feedback
- Suggestion submission
- Experience rating
- Feedback history
- Anonymous option where supported
- Status of submitted feedback

Do not turn this module into a clinical or mental-health assessment system.

---

## P2-05 — Personal Activity & Audit

### Purpose
Give employees transparency into important actions affecting their identity and onboarding.

### Features
- Access granted
- Access requested
- Access approved/rejected
- Access expired
- Profile changes
- Security events
- Device changes
- Important onboarding events
- Timestamp
- Action/result

Employees should only see events they are authorized to view.

---

# Employee Portal Navigation

Recommended employee-facing navigation:

```text
Employee Portal

├── Home
├── My Onboarding
├── My Tasks
├── My Access
│   ├── Current Access
│   ├── Request Access
│   ├── My Requests
│   └── Expiring Access
├── My Security
│   └── Devices
├── My Learning
├── My Documents
├── My HR & Benefits
├── My Goals
├── People Directory
├── Team Hub
├── Career
│   ├── Career Profile
│   └── Internal Opportunities
├── Help & AI Assistant
├── Feedback
├── Activity
└── Profile
```

# Integration With Existing OnboardOS

These features must extend the existing employee experience rather than create a separate product.

Existing modules remain:

- Employee Dashboard
- My Tasks
- AI Employee Assistant
- IT Helpdesk
- Company Knowledge
- First-Week Planner
- Mentor/Buddy
- Employee Pulse
- Community Hub

The new Employee Experience modules should reuse existing:

- Employee context
- Role intelligence
- Access intelligence
- Approval engine
- Risk/readiness concepts
- Notifications
- Audit timeline
- Mock data/services
- Existing design system
- Existing routing/layout

# Frontend-First Requirement

For the current hackathon frontend phase:

- Build all employee-facing UI using mock/local data.
- Do not require backend APIs.
- Do not break existing routes.
- Do not replace existing employee pages.
- Reuse existing components and design system.
- Every important action should have a realistic mock state transition.
- Provide loading, empty, success, error and permission states where appropriate.
- Keep sensitive authorization decisions out of client-side logic; the frontend only represents the state provided by the eventual backend.

# Priority Summary

### P0
1. My Access Center
2. Request Access
3. My Requests & Approvals
4. Access Expiration & Renewal

### P1
5. My Security Center
6. My Devices
7. My Documents
8. My HR & Benefits
9. My Goals & Progress
10. People Directory
11. Team Hub

### P2
12. My Learning Hub
13. My Career Profile
14. Internal Opportunities
15. Feedback Center
16. Personal Activity & Audit

These are additive employee-experience features and must not remove or replace existing OnboardOS functionality.
