import type { AIIntentResult } from './intentDefinitions';

export const HR_INTENTS: Record<string, AIIntentResult> = {
  // HR 1: Which onboarding tasks assigned to Rahul are overdue?
  HR_OVERDUE_TASKS_RAHUL: {
    intent: 'HR_OVERDUE_TASKS_RAHUL',
    ownerRole: 'HR',
    badge: '✓ OnboardOS Intelligence',
    content: `I found **2 overdue onboarding tasks** assigned to Rahul Sharma.

| Task | Due Date | Status | Delay |
| :--- | :--- | :--- | :--- |
| Complete Security Training | Aug 19 | 🔴 Overdue | 3 days |
| Submit Development Environment Checklist | Aug 21 | 🔴 Overdue | 1 day |

**Overall Status:** Rahul is currently at **60% onboarding readiness** with **2 overdue tasks**.

**Recommended Action:**
Send Rahul a reminder and ask the manager to follow up if the tasks remain incomplete after today.`,
    evidence: {
      stats: {
        readinessScore: 60,
        riskScore: 75,
        completedTasks: 4,
        totalTasks: 6,
        blockerCount: 2,
      },
      whyThisDecision: {
        roleReq: 'Junior Backend Developer → Payments Core',
        projReq: 'Security Clearance & Dev Environment Baseline',
        policy: 'SLA Rule #SLA-04: Security modules must be completed within 48h of start.',
        checks: [
          { label: 'Security Training Module', passed: false, detail: 'Due Aug 19 (3 days overdue)' },
          { label: 'Development Checklist', passed: false, detail: 'Due Aug 21 (1 day overdue)' },
          { label: 'Google Workspace & Slack', passed: true, detail: 'Completed Day 1' },
        ],
      },
      sourceType: 'DETERMINISTIC_KB',
      deepLink: '/employees/emp-rahul?tab=tasks',
      deepLinkLabel: "Inspect Rahul's Task DAG",
      tags: ['Overdue Tasks', 'Rahul Sharma', 'Security Training', 'SLA Alert'],
      isDeterministic: true,
    },
    actions: [
      { label: 'Send Reminder to Rahul', actionKey: 'SEND_REMINDER', primary: true },
      { label: 'Notify Marcus Vance (Manager)', actionKey: 'NOTIFY_MANAGER' },
      { label: 'View Employee Profile', actionKey: 'VIEW_PROFILE', deepLink: '/employees/emp-rahul' },
    ],
  },

  // HR 2: Generate a weekly onboarding summary for the HR team.
  HR_WEEKLY_ONBOARDING_SUMMARY: {
    intent: 'HR_WEEKLY_ONBOARDING_SUMMARY',
    ownerRole: 'HR',
    badge: '✓ OnboardOS Intelligence',
    content: `## Weekly Onboarding Summary

**Period:** Aug 17–Aug 22, 2026

**Overall Progress**
* 👥 New employees onboarded: **12**
* ✅ Tasks completed: **47**
* ⏳ Tasks pending: **18**
* 🔴 Overdue tasks: **6**
* 📚 Resources completed: **31**
* 💻 Access requests processed: **14**

### Key Highlights
* **8 employees** are progressing normally.
* **3 employees** require HR follow-up.
* **1 employee** is blocked due to pending IT access.
* Average onboarding completion is currently **78%**.

### ⚠️ Attention Required
The main bottleneck this week is **IT/tool access provisioning**, accounting for **4 of the 6 overdue activities**.

**HR Recommendation:** Prioritize pending IT approvals and follow up with managers on overdue employee tasks.`,
    evidence: {
      stats: {
        readinessScore: 78,
        riskScore: 24,
        completedTasks: 47,
        totalTasks: 65,
        blockerCount: 6,
      },
      sourceType: 'DETERMINISTIC_KB',
      deepLink: '/hr',
      deepLinkLabel: 'Open HR Analytics Dashboard',
      tags: ['Weekly Summary', 'Cohort Metrics', 'HR Intelligence', 'Bottlenecks'],
      isDeterministic: true,
    },
    actions: [
      { label: 'View Cohort List', actionKey: 'VIEW_COHORT', deepLink: '/hr/employees', primary: true },
      { label: 'Open Exception Center', actionKey: 'VIEW_EXCEPTIONS', deepLink: '/hr/exceptions' },
      { label: 'Export PDF Report', actionKey: 'EXPORT_PDF' },
    ],
  },

  // HR 3: Summarize all HR actions required for Rahul.
  HR_SUMMARIZE_ACTIONS_RAHUL: {
    intent: 'HR_SUMMARIZE_ACTIONS_RAHUL',
    ownerRole: 'HR',
    badge: '✓ OnboardOS Intelligence',
    content: `### Rahul Sharma — HR Action Summary

**Onboarding Progress:** 🟡 **60%**

**HR Actions Required:**
1. 🔴 Review **2 overdue onboarding tasks**.
2. 🟡 Follow up on Rahul's pending **Jira access**.
3. 🟢 Verify completion of mandatory onboarding resources.
4. 🟡 Confirm Rahul's profile and employment details are approved.
5. 🟢 No role or department changes are currently required.

### Current Blocker
Rahul's **Jira provisioning is pending**, which may affect his development workflow.

**Priority:** 🔴 **Medium**

**Suggested Next Step:**
HR should coordinate with IT and Rahul's manager to clear the pending access and overdue tasks.`,
    evidence: {
      stats: {
        readinessScore: 60,
        riskScore: 70,
        completedTasks: 4,
        totalTasks: 6,
        blockerCount: 2,
      },
      whyThisDecision: {
        roleReq: 'Junior Backend Developer',
        projReq: 'Payments Engine v2',
        policy: 'HR Action Gate Checklist v2.4',
        checks: [
          { label: 'Overdue Task Signoff', passed: false, detail: '2 tasks pending review' },
          { label: 'Jira Access Provisioning', passed: false, detail: 'Blocked at IT Gateway' },
          { label: 'Employment Verification', passed: true, detail: 'Verified by HR' },
        ],
      },
      sourceType: 'DETERMINISTIC_KB',
      deepLink: '/employees/emp-rahul',
      deepLinkLabel: "Inspect Rahul's Command Center",
      tags: ['HR Action Item', 'Rahul Sharma', 'Jira Blocker', 'Task Checklist'],
      isDeterministic: true,
    },
    actions: [
      { label: 'Open Employee Command Center', actionKey: 'OPEN_PROFILE', deepLink: '/employees/emp-rahul', primary: true },
      { label: 'Follow up with IT (David Kim)', actionKey: 'PING_IT' },
    ],
  },

  // HR 4: Which employees are waiting for IT access, and for how long?
  HR_WAITING_IT_ACCESS: {
    intent: 'HR_WAITING_IT_ACCESS',
    ownerRole: 'HR',
    badge: '✓ OnboardOS Intelligence',
    content: `I found **4 employees currently waiting for IT access**.

| Employee | Access | Waiting |
| :--- | :--- | ---: |
| Rahul Sharma | Jira | **2 days** |
| Priya Mehta | AWS | **1 day** |
| Arjun Patel | GitHub | **3 days** |
| Neha Verma | VPN | **5 days** |

### ⚠️ Priority Alert
**Neha Verma** has the longest pending request at **5 days** and should be prioritized.

**Average IT access waiting time:** **2.8 days**

**AI Recommendation:** Escalate requests older than **3 days** to the IT administrator.`,
    evidence: {
      stats: {
        readinessScore: 72,
        blockerCount: 4,
      },
      sourceType: 'DETERMINISTIC_KB',
      deepLink: '/it/tickets',
      deepLinkLabel: 'Inspect IT Ticket & Access Queue',
      tags: ['IT Access Queue', 'SLA Breaches', 'VPN', 'GitHub', 'AWS', 'Jira'],
      isDeterministic: true,
    },
    actions: [
      { label: 'Escalate to IT Admin (David Kim)', actionKey: 'ESCALATE_IT', primary: true },
      { label: 'View IT Access Queue', actionKey: 'VIEW_IT_QUEUE', deepLink: '/it/tickets' },
    ],
  },

  // HR 5: Give me a list of employees who need HR attention today.
  HR_NEED_ATTENTION_TODAY: {
    intent: 'HR_NEED_ATTENTION_TODAY',
    ownerRole: 'HR',
    badge: '✓ OnboardOS Intelligence',
    content: `### 🔔 HR Attention Required Today

I identified **3 employees requiring attention**:

**1. Rahul Sharma — 🔴 High**
* 2 overdue tasks
* Jira access pending
* Onboarding progress: **60%**

**2. Neha Verma — 🟠 Medium**
* VPN access pending for 5 days
* Onboarding progress: **72%**

**3. Arjun Patel — 🟠 Medium**
* GitHub access pending for 3 days
* Security training incomplete

### Priority Recommendation
**Rahul → Neha → Arjun**

These cases have the highest potential impact on onboarding completion.`,
    evidence: {
      stats: {
        readinessScore: 68,
        riskScore: 65,
        blockerCount: 3,
      },
      sourceType: 'DETERMINISTIC_KB',
      deepLink: '/hr/employees',
      deepLinkLabel: 'View Prioritized Employee Cohort',
      tags: ['HR Triage', 'Urgent Attention', 'Risk Priority'],
      isDeterministic: true,
    },
    actions: [
      { label: 'View Prioritized Employees', actionKey: 'VIEW_LIST', deepLink: '/hr/employees', primary: true },
      { label: 'Open Exception Center', actionKey: 'EXCEPTIONS', deepLink: '/hr/exceptions' },
    ],
  },

  // HR 6: Which onboarding tasks were completed by Rahul this month?
  HR_COMPLETED_TASKS_RAHUL_MONTH: {
    intent: 'HR_COMPLETED_TASKS_RAHUL_MONTH',
    ownerRole: 'HR',
    badge: '✓ OnboardOS Intelligence',
    content: `### Rahul Sharma — Monthly Activity

Rahul completed **8 onboarding activities** this month.

**Completed:**
* ✅ Employee profile setup
* ✅ Welcome & company orientation
* ✅ Code of Conduct training
* ✅ Security awareness training
* ✅ Team introduction
* ✅ Manager introduction
* ✅ Google Workspace setup
* ✅ Slack setup

**Completion Rate:** **8 / 10 activities — 80%**

### Still Pending
* ⏳ Security Training assessment
* ⏳ Development Environment Checklist

**Overall Assessment:**
Rahul is progressing well, but the remaining tasks should be completed to avoid delaying his full onboarding readiness.`,
    evidence: {
      stats: {
        readinessScore: 60,
        completedTasks: 8,
        totalTasks: 10,
      },
      sourceType: 'DETERMINISTIC_KB',
      deepLink: '/employees/emp-rahul?tab=tasks',
      deepLinkLabel: "View Rahul's Full Task Audit",
      tags: ['Monthly Activity', 'Task Audit', 'Rahul Sharma', 'Progress 80%'],
      isDeterministic: true,
    },
    actions: [
      { label: 'Open Employee Command Center', actionKey: 'VIEW_PROFILE', deepLink: '/employees/emp-rahul', primary: true },
    ],
  },
};
