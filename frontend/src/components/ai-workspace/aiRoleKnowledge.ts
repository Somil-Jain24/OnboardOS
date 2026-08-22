import type { UserRole, User } from '../../types';
import type { AIMessage, AISuggestionCard } from './types';
import { client } from '../../services';

export const ROLE_SUGGESTIONS: Record<UserRole, AISuggestionCard[]> = {
  HR: [
    {
      id: 'hr-sug-1',
      title: 'Which tasks for Rahul are overdue?',
      query: 'Which onboarding tasks assigned to Rahul are overdue?',
      iconType: 'status',
      role: 'HR',
    },
    {
      id: 'hr-sug-2',
      title: 'Generate weekly onboarding summary',
      query: 'Generate a weekly onboarding summary for the HR team.',
      iconType: 'shield',
      role: 'HR',
    },
    {
      id: 'hr-sug-3',
      title: 'Summarize HR actions for Rahul',
      query: 'Summarize all HR actions required for Rahul.',
      iconType: 'expert',
      role: 'HR',
    },
    {
      id: 'hr-sug-4',
      title: 'Who is waiting for IT access?',
      query: 'Which employees are waiting for IT access, and for how long?',
      iconType: 'cloud',
      role: 'HR',
    },
    {
      id: 'hr-sug-5',
      title: 'Employees needing HR attention today',
      query: 'Give me a list of employees who need HR attention today.',
      iconType: 'help',
      role: 'HR',
    },
    {
      id: 'hr-sug-6',
      title: 'Tasks completed by Rahul this month',
      query: 'Which onboarding tasks were completed by Rahul this month?',
      iconType: 'code',
      role: 'HR',
    },
  ],
  MANAGER: [
    {
      id: 'mgr-sug-1',
      title: 'Who is overdue in my team?',
      query: 'Who is overdue?',
      iconType: 'status',
      role: 'MANAGER',
    },
    {
      id: 'mgr-sug-2',
      title: 'What did Rahul complete this week?',
      query: 'What did Rahul complete this week?',
      iconType: 'code',
      role: 'MANAGER',
    },
    {
      id: 'mgr-sug-3',
      title: 'Who needs my attention today?',
      query: 'Who needs my attention?',
      iconType: 'expert',
      role: 'MANAGER',
    },
    {
      id: 'mgr-sug-4',
      title: 'Show team performance trends',
      query: 'Show team performance trends.',
      iconType: 'shield',
      role: 'MANAGER',
    },
  ],
  EMPLOYEE: [
    {
      id: 'emp-sug-1',
      title: 'My laptop is not working',
      query: 'My laptop is not working.',
      iconType: 'help',
      role: 'EMPLOYEE',
    },
    {
      id: 'emp-sug-2',
      title: 'Can I get Slack access?',
      query: 'Can I get Slack access?',
      iconType: 'cloud',
      role: 'EMPLOYEE',
    },
    {
      id: 'emp-sug-3',
      title: 'Show my assigned resources',
      query: 'Show my assigned resources.',
      iconType: 'code',
      role: 'EMPLOYEE',
    },
    {
      id: 'emp-sug-4',
      title: "Haven't received Slack invitation",
      query: "I haven't received my Slack invitation.",
      iconType: 'status',
      role: 'EMPLOYEE',
    },
    {
      id: 'emp-sug-5',
      title: 'I need help in my current task',
      query: 'I need help in my current task.',
      iconType: 'expert',
      role: 'EMPLOYEE',
    },
  ],
  IT: [
    {
      id: 'it-sug-1',
      title: 'Which employees are waiting for IT access?',
      query: 'Which employees are waiting for IT access, and for how long?',
      iconType: 'cloud',
      role: 'IT',
    },
    {
      id: 'it-sug-2',
      title: 'Jira API gateway failure',
      query: 'Diagnose the Jira API 503 rate limit exception',
      iconType: 'status',
      role: 'IT',
    },
  ],
  ADMIN: [
    {
      id: 'adm-sug-1',
      title: 'Governance & RBAC audit log',
      query: 'Export full RBAC change log for SOC-2 compliance',
      iconType: 'shield',
      role: 'ADMIN',
    },
    {
      id: 'adm-sug-2',
      title: 'Birthright policy overview',
      query: 'Audit birthright policies across Engineering and Design',
      iconType: 'policy',
      role: 'ADMIN',
    },
  ],
};

export async function generateAIResponse(
  userQuery: string,
  role: UserRole,
  currentUser: User | null
): Promise<Partial<AIMessage>> {
  const q = userQuery.trim().toLowerCase();
  const userName = currentUser?.name || (role === 'EMPLOYEE' ? 'Rahul Sharma' : 'HR Specialist');

  // ==========================================================================
  // 1. HR SPECIFIC RESPONSES
  // ==========================================================================

  // Question 1: "Which onboarding tasks assigned to Rahul are overdue?"
  if (
    q.includes('overdue') &&
    (q.includes('rahul') || q.includes('tasks assigned to rahul'))
  ) {
    return {
      content: `I found **2 overdue onboarding tasks** assigned to Rahul Sharma.\n\n| Task | Due Date | Status | Delay |\n| :--- | :--- | :--- | :--- |\n| Complete Security Training | Aug 19 | 🔴 Overdue | 3 days |\n| Submit Development Environment Checklist | Aug 21 | 🔴 Overdue | 1 day |\n\n**Overall Status:** Rahul is currently at **60% onboarding readiness** with **2 overdue tasks**.\n\n**Recommended Action:**\nSend Rahul a reminder and ask the manager to follow up if the tasks remain incomplete after today.`,
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
        deepLink: '/employees/emp-rahul?tab=tasks',
        deepLinkLabel: "Inspect Rahul's Task DAG",
        tags: ['Overdue Tasks', 'Rahul Sharma', 'Security Training', 'SLA Alert'],
      },
      actions: [
        { label: 'Send Reminder to Rahul', actionKey: 'SEND_REMINDER', primary: true },
        { label: 'Notify Marcus Vance (Manager)', actionKey: 'NOTIFY_MANAGER' },
        { label: 'View Employee Profile', actionKey: 'VIEW_PROFILE', deepLink: '/employees/emp-rahul' },
      ],
    };
  }

  // Question 2: "Generate a weekly onboarding summary for the HR team."
  if (
    q.includes('weekly') &&
    (q.includes('summary') || q.includes('onboarding summary') || q.includes('hr team') || q.includes('report'))
  ) {
    return {
      content: `## Weekly Onboarding Summary\n\n**Period:** Aug 17–Aug 22, 2026\n\n**Overall Progress**\n* 👥 New employees onboarded: **12**\n* ✅ Tasks completed: **47**\n* ⏳ Tasks pending: **18**\n* 🔴 Overdue tasks: **6**\n* 📚 Resources completed: **31**\n* 💻 Access requests processed: **14**\n\n### Key Highlights\n* **8 employees** are progressing normally.\n* **3 employees** require HR follow-up.\n* **1 employee** is blocked due to pending IT access.\n* Average onboarding completion is currently **78%**.\n\n### ⚠️ Attention Required\nThe main bottleneck this week is **IT/tool access provisioning**, accounting for **4 of the 6 overdue activities**.\n\n**HR Recommendation:** Prioritize pending IT approvals and follow up with managers on overdue employee tasks.`,
      evidence: {
        stats: {
          readinessScore: 78,
          riskScore: 24,
          completedTasks: 47,
          totalTasks: 65,
          blockerCount: 6,
        },
        sourceType: 'HYBRID_GRAPH',
        deepLink: '/hr',
        deepLinkLabel: 'Open HR Analytics Dashboard',
        tags: ['Weekly Summary', 'Cohort Metrics', 'HR Intelligence', 'Bottlenecks'],
      },
      actions: [
        { label: 'View Cohort List', actionKey: 'VIEW_COHORT', deepLink: '/hr/employees', primary: true },
        { label: 'Open Exception Center', actionKey: 'VIEW_EXCEPTIONS', deepLink: '/hr/exceptions' },
        { label: 'Export PDF Report', actionKey: 'EXPORT_PDF' },
      ],
    };
  }

  // Question 3: "Summarize all HR actions required for Rahul."
  if (
    (q.includes('summarize') || q.includes('summary') || q.includes('actions required') || q.includes('action')) &&
    q.includes('rahul')
  ) {
    return {
      content: `### Rahul Sharma — HR Action Summary\n\n**Onboarding Progress:** 🟡 **60%**\n\n**HR Actions Required:**\n1. 🔴 Review **2 overdue onboarding tasks**.\n2. 🟡 Follow up on Rahul's pending **Jira access**.\n3. 🟢 Verify completion of mandatory onboarding resources.\n4. 🟡 Confirm Rahul's profile and employment details are approved.\n5. 🟢 No role or department changes are currently required.\n\n### Current Blocker\nRahul's **Jira provisioning is pending**, which may affect his development workflow.\n\n**Priority:** 🔴 **Medium**\n\n**Suggested Next Step:**\nHR should coordinate with IT and Rahul's manager to clear the pending access and overdue tasks.`,
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
        deepLink: '/employees/emp-rahul',
        deepLinkLabel: "Inspect Rahul's Command Center",
        tags: ['HR Action Item', 'Rahul Sharma', 'Jira Blocker', 'Task Checklist'],
      },
      actions: [
        { label: 'Open Employee Command Center', actionKey: 'OPEN_PROFILE', deepLink: '/employees/emp-rahul', primary: true },
        { label: 'Follow up with IT (David Kim)', actionKey: 'PING_IT' },
      ],
    };
  }

  // Question 4: "Which employees are waiting for IT access, and for how long?"
  if (
    (q.includes('waiting for it access') || q.includes('waiting for it') || (q.includes('it access') && q.includes('how long')) || (q.includes('waiting') && q.includes('access')))
  ) {
    return {
      content: `I found **4 employees currently waiting for IT access**.\n\n| Employee | Access | Waiting |\n| :--- | :--- | ---: |\n| Rahul Sharma | Jira | **2 days** |\n| Priya Mehta | AWS | **1 day** |\n| Arjun Patel | GitHub | **3 days** |\n| Neha Verma | VPN | **5 days** |\n\n### ⚠️ Priority Alert\n**Neha Verma** has the longest pending request at **5 days** and should be prioritized.\n\n**Average IT access waiting time:** **2.8 days**\n\n**AI Recommendation:** Escalate requests older than **3 days** to the IT administrator.`,
      evidence: {
        stats: {
          readinessScore: 72,
          blockerCount: 4,
        },
        sourceType: 'HYBRID_GRAPH',
        deepLink: '/it/tickets',
        deepLinkLabel: 'Inspect IT Ticket & Access Queue',
        tags: ['IT Access Queue', 'SLA Breaches', 'VPN', 'GitHub', 'AWS', 'Jira'],
      },
      actions: [
        { label: 'Escalate to IT Admin (David Kim)', actionKey: 'ESCALATE_IT', primary: true },
        { label: 'View IT Access Queue', actionKey: 'VIEW_IT_QUEUE', deepLink: '/it/tickets' },
      ],
    };
  }

  // Question 5: "Give me a list of employees who need HR attention today."
  if (
    (q.includes('attention') && (q.includes('today') || q.includes('hr') || q.includes('need'))) ||
    q.includes('need hr attention') ||
    q.includes('who need attention')
  ) {
    return {
      content: `### 🔔 HR Attention Required Today\n\nI identified **3 employees requiring attention**:\n\n**1. Rahul Sharma — 🔴 High**\n* 2 overdue tasks\n* Jira access pending\n* Onboarding progress: **60%**\n\n**2. Neha Verma — 🟠 Medium**\n* VPN access pending for 5 days\n* Onboarding progress: **72%**\n\n**3. Arjun Patel — 🟠 Medium**\n* GitHub access pending for 3 days\n* Security training incomplete\n\n### Priority Recommendation\n**Rahul → Neha → Arjun**\n\nThese cases have the highest potential impact on onboarding completion.`,
      evidence: {
        stats: {
          readinessScore: 68,
          riskScore: 65,
          blockerCount: 3,
        },
        sourceType: 'RULES_ENGINE',
        deepLink: '/hr/employees',
        deepLinkLabel: 'View Prioritized Employee Cohort',
        tags: ['HR Triage', 'Urgent Attention', 'Risk Priority'],
      },
      actions: [
        { label: 'View Prioritized Employees', actionKey: 'VIEW_LIST', deepLink: '/hr/employees', primary: true },
        { label: 'Open Exception Center', actionKey: 'EXCEPTIONS', deepLink: '/hr/exceptions' },
      ],
    };
  }

  // Question 6: "Which onboarding tasks were completed by Rahul this month?"
  if (
    q.includes('completed by rahul') ||
    (q.includes('rahul') && q.includes('completed') && (q.includes('month') || q.includes('activities')))
  ) {
    return {
      content: `### Rahul Sharma — Monthly Activity\n\nRahul completed **8 onboarding activities** this month.\n\n**Completed:**\n* ✅ Employee profile setup\n* ✅ Welcome & company orientation\n* ✅ Code of Conduct training\n* ✅ Security awareness training\n* ✅ Team introduction\n* ✅ Manager introduction\n* ✅ Google Workspace setup\n* ✅ Slack setup\n\n**Completion Rate:** **8 / 10 activities — 80%**\n\n### Still Pending\n* ⏳ Security Training assessment\n* ⏳ Development Environment Checklist\n\n**Overall Assessment:**\nRahul is progressing well, but the remaining tasks should be completed to avoid delaying his full onboarding readiness.`,
      evidence: {
        stats: {
          readinessScore: 60,
          completedTasks: 8,
          totalTasks: 10,
        },
        deepLink: '/employees/emp-rahul?tab=tasks',
        deepLinkLabel: "View Rahul's Full Task Audit",
        tags: ['Monthly Activity', 'Task Audit', 'Rahul Sharma', 'Progress 80%'],
      },
      actions: [
        { label: 'Open Employee Command Center', actionKey: 'VIEW_PROFILE', deepLink: '/employees/emp-rahul', primary: true },
      ],
    };
  }

  // ==========================================================================
  // 2. MANAGER SPECIFIC RESPONSES
  // ==========================================================================

  // Question 7 & 10: "Who is overdue?"
  if (q.includes('who is overdue') || q.includes('who is overdue?') || (q.includes('overdue') && role === 'MANAGER')) {
    return {
      content: `### 🔴 Team Overdue Report\n\nThere are currently **3 overdue employees** in your team.\n\n**Rahul Sharma**\n* 2 overdue tasks\n* 60% onboarding progress\n* Jira access pending\n\n**Priya Mehta**\n* 1 overdue task\n* 74% onboarding progress\n\n**Arjun Patel**\n* 2 overdue tasks\n* 68% onboarding progress\n\n### Team Impact\n**5 tasks** are currently overdue across your team.\n\n**Recommended Action:**\nPrioritize Rahul first because his overdue tasks are combined with a pending development access request.`,
      evidence: {
        stats: {
          readinessScore: 67,
          riskScore: 58,
          blockerCount: 5,
        },
        deepLink: '/manager/approvals',
        deepLinkLabel: 'Review Pending Team Approvals',
        tags: ['Team Overdue', 'Manager Dashboard', 'Rahul', 'Priya', 'Arjun'],
      },
      actions: [
        { label: 'Schedule Quick Sync with Rahul', actionKey: 'SCHEDULE_SYNC', primary: true },
        { label: 'View Approvals Queue', actionKey: 'VIEW_APPROVALS', deepLink: '/manager/approvals' },
      ],
    };
  }

  // Question 8: "What did Rahul complete this week?"
  if (q.includes('what did rahul complete') || (q.includes('rahul') && q.includes('complete') && q.includes('week'))) {
    return {
      content: `### Rahul Sharma — Weekly Activity\n\nRahul completed **6 onboarding activities** this week.\n\n**Completed**\n* ✅ Google Workspace activation\n* ✅ Slack activation\n* ✅ GitHub access setup\n* ✅ Team introduction\n* ✅ Company security training\n* ✅ Development environment setup\n\n**Progress:** **+20%** this week\n\n### Current Status\n🟢 **3 of 5 required systems activated**\n⏳ **Jira access:** Pending\n📊 **Current onboarding readiness:** **60%**\n\n**Manager Insight:**\nRahul is progressing consistently, but Jira access and two remaining tasks should be followed up before the end of the week.`,
      evidence: {
        stats: {
          readinessScore: 60,
          completedTasks: 6,
          totalTasks: 8,
        },
        deepLink: '/employees/emp-rahul',
        deepLinkLabel: "Inspect Rahul's Activity Log",
        tags: ['Weekly Activity', 'Rahul Sharma', '+20% Progress'],
      },
      actions: [
        { label: 'Open Employee Command Center', actionKey: 'VIEW_PROFILE', deepLink: '/employees/emp-rahul', primary: true },
      ],
    };
  }

  // Question 9: "Who needs my attention?"
  if (q.includes('who needs my attention') || (q.includes('attention') && role === 'MANAGER')) {
    return {
      content: `### 👀 Team Members Requiring Attention\n\nI recommend focusing on **2 employees today**:\n\n**🔴 Rahul Sharma**\n* Onboarding: **60%**\n* 2 overdue tasks\n* Jira access pending\n* New developer who may be blocked by tooling\n\n**🟠 Arjun Patel**\n* Onboarding: **68%**\n* 2 overdue tasks\n* GitHub access pending\n\n### Suggested Manager Actions\n**Rahul:** Check Jira provisioning + discuss overdue tasks.\n**Arjun:** Confirm GitHub access and task completion plan.\n\nOther team members are currently progressing within expected timelines.`,
      evidence: {
        stats: {
          readinessScore: 64,
          blockerCount: 2,
        },
        deepLink: '/manager',
        deepLinkLabel: 'Open Manager Command Center',
        tags: ['Manager Focus', 'Rahul Sharma', 'Arjun Patel'],
      },
      actions: [
        { label: 'Check Jira Status', actionKey: 'CHECK_JIRA', primary: true },
        { label: 'View Team Roster', actionKey: 'TEAM_ROSTER', deepLink: '/manager' },
      ],
    };
  }

  // Question 11: "Show team performance trends."
  if (q.includes('performance trends') || q.includes('team performance') || q.includes('trends')) {
    return {
      content: `### 📈 Team Performance — Last 4 Weeks\n\n**Onboarding Completion**\n* Week 1 → **52%**\n* Week 2 → **64%**\n* Week 3 → **71%**\n* Week 4 → **78%**\n\n**Trend:** 🟢 **+26 percentage points**\n\n### Key Improvements\n* 📈 Task completion increased **18%**\n* ⚡ Average blocker resolution improved by **1.4 days**\n* 📚 Resource completion increased **22%**\n* 💻 Tool activation improved from **61% → 86%**\n\n### Current Risk\nThe main remaining bottleneck is **pending IT/tool access**.\n\n**Overall Team Health:** 🟢 **Good**`,
      evidence: {
        stats: {
          readinessScore: 78,
          riskScore: 22,
        },
        sourceType: 'HYBRID_GRAPH',
        deepLink: '/manager',
        deepLinkLabel: 'View Full Performance Analytics',
        tags: ['Performance Trends', '+26% Improvement', 'Team Health 🟢'],
      },
      actions: [
        { label: 'Open Manager Dashboard', actionKey: 'MGR_DASHBOARD', deepLink: '/manager', primary: true },
      ],
    };
  }

  // ==========================================================================
  // 3. EMPLOYEE SPECIFIC RESPONSES
  // ==========================================================================

  // Question 12: "My laptop is not working."
  if (q.includes('laptop') && (q.includes('not working') || q.includes('issue') || q.includes('problem') || q.includes('broken'))) {
    return {
      content: `I can help you get this resolved.\n\n### 💻 IT Support\n**Issue:** Laptop not working\n**Suggested Priority:** 🟠 Medium\n\nBefore creating a ticket, try:\n1. Check whether the charger/power indicator is active.\n2. Hold the power button for **10 seconds** and restart.\n3. Disconnect external devices and try again.\n\nIf the laptop still doesn't start, I can **create an IT Helpdesk ticket** with your employee details and onboarding context.\n\n**Next Step:**\n👉 **Create IT Ticket**`,
      evidence: {
        sourceType: 'LLM_GROUNDED',
        deepLink: '/me/help',
        deepLinkLabel: 'Open IT Helpdesk Portal',
        tags: ['Hardware Support', 'Laptop Issue', 'IT Helpdesk Ticket'],
      },
      actions: [
        { label: 'Create IT Helpdesk Ticket', actionKey: 'CREATE_TICKET', deepLink: '/me/help', primary: true },
        { label: 'Chat with IT Lead (David Kim)', actionKey: 'CHAT_IT' },
      ],
    };
  }

  // Question 13: "Can I get Slack access?"
  if (q.includes('slack access') || (q.includes('slack') && (q.includes('get') || q.includes('access') || q.includes('claim')))) {
    return {
      content: `Yes. Your Slack provisioning is already **activated**.\n\n### 💬 Slack Access\n**Status:** 🟢 Activated\n**Provisioned:** Today at **3:40 PM**\n**Access Level:** Employee / Member\n**Status:** **Ready to Claim**\n\nYou can claim your Slack account from:\n\n**My Tasks → Onboarding Tool Suite → Slack**\n\nNo additional manager approval is currently required.\n\n**Next Step:**\n👉 **Claim Slack Access**`,
      evidence: {
        whyThisDecision: {
          roleReq: 'Universal Birthright → Slack Enterprise Grid',
          projReq: 'Engineering Workspace (#team-payments-core)',
          policy: 'Auto-provisioned upon identity verification',
          checks: [
            { label: 'Slack Enterprise License Allocated', passed: true },
            { label: 'SSO & OAuth Binding Complete', passed: true },
          ],
        },
        deepLink: '/me/tasks',
        deepLinkLabel: 'Claim Slack in My Tasks',
        tags: ['Slack Enterprise', 'Activated 🟢', 'Ready to Claim'],
      },
      actions: [
        { label: 'Claim Slack Access Now', actionKey: 'CLAIM_SLACK', deepLink: '/me/tasks', primary: true },
        { label: 'Open Tool Suite', actionKey: 'OPEN_SUITE', deepLink: '/me/tasks' },
      ],
    };
  }

  // Question 14: "Show my assigned resources."
  if (q.includes('assigned resources') || q.includes('my resources') || (q.includes('resources') && q.includes('assigned'))) {
    return {
      content: `### 📚 Your Assigned Resources\n\nYou currently have **4 onboarding resources** assigned to you.\n\n| Resource | Category | Status |\n| :--- | :--- | :--- |\n| Engineering Handbook | Company | ✅ Completed |\n| Backend Development Guide | Technical | 🟢 In Progress |\n| Security & Compliance Guide | Security | ⏳ Pending |\n| Git Workflow Guide | Development | ⏳ Pending |\n\n### Progress\n**1 / 4 completed**\n**25% resource completion**\n\n### Recommended Next Resource\n⭐ **Security & Compliance Guide**\n\nThis is a mandatory resource and should be completed before continuing with advanced development access.`,
      evidence: {
        stats: {
          readinessScore: 60,
          completedTasks: 1,
          totalTasks: 4,
        },
        deepLink: '/knowledge',
        deepLinkLabel: 'Open Learning & Knowledge Library',
        tags: ['Assigned Resources', '25% Completed', 'Security Guide Recommended'],
      },
      actions: [
        { label: 'Read Security & Compliance Guide', actionKey: 'READ_GUIDE', deepLink: '/knowledge', primary: true },
        { label: 'View All Resources', actionKey: 'VIEW_ALL_RES', deepLink: '/knowledge' },
      ],
    };
  }

  // Question 15: "I haven't received my Slack invitation."
  if (q.includes("haven't received") || q.includes('not received') || (q.includes('invitation') && q.includes('slack'))) {
    return {
      content: `I checked your onboarding provisioning status.\n\n### 💬 Slack Invitation\n**Provisioning Status:** 🟢 Activated\n**Activation Time:** 3:40 PM\n**Claim Status:** Ready to claim\n\nYour Slack account has been provisioned, but the invitation has **not yet been claimed**.\n\n### Try This\n1. Check your work email inbox.\n2. Check Spam / Junk.\n3. Search for **“Slack invitation”**.\n4. Use **Claim Slack Access** from your Onboarding Tool Suite.\n\nIf you still don't receive the invitation, I can **raise an IT support ticket** for you.\n\n**Next Step:**\n👉 **Resend Invitation** | **Raise IT Ticket**`,
      evidence: {
        deepLink: '/me/tasks',
        deepLinkLabel: 'Check Tool Suite Status',
        tags: ['Slack Invitation', 'Claim Pending', 'Email Notification'],
      },
      actions: [
        { label: 'Resend Slack Invitation Email', actionKey: 'RESEND_INVITE', primary: true },
        { label: 'Raise IT Support Ticket', actionKey: 'RAISE_TICKET', deepLink: '/me/help' },
      ],
    };
  }

  // Question 16: "I need help in my current task."
  if (q.includes('need help in my current task') || q.includes('help in my task') || (q.includes('help') && q.includes('current task'))) {
    return {
      content: `Of course. I checked your current onboarding tasks.\n\n### 🎯 Current Task\n**Development Environment Checklist**\n**Status:** 🔴 Overdue\n**Due:** Aug 21, 2026\n\nThis task requires you to verify your local development environment and confirm that the required tools are installed.\n\n### I can help you with:\n* 💻 Development environment setup\n* 🟢 Git configuration\n* 🐙 GitHub setup\n* 📦 Required dependencies\n* 🔐 Authentication/configuration\n* ✅ Final checklist submission\n\n### Recommended Action\nLet's complete it step-by-step.\n**Step 1:** Verify your **Git installation and GitHub authentication**.\n\n👉 **Start Guided Help**`,
      evidence: {
        stats: {
          readinessScore: 60,
          completedTasks: 4,
          totalTasks: 6,
        },
        deepLink: '/me/tasks',
        deepLinkLabel: 'Open Development Checklist in Tasks',
        tags: ['Current Task', 'Dev Checklist', 'Interactive Guide'],
      },
      actions: [
        { label: 'Start Guided Step-by-Step Help', actionKey: 'START_GUIDE', primary: true },
        { label: 'Ask Mentor Marcus Vance', actionKey: 'ASK_MENTOR', deepLink: '/me/first-week' },
      ],
    };
  }

  // ==========================================================================
  // 4. FALLBACK / GENERAL INTELLIGENCE
  // ==========================================================================
  return {
    content: `I've analyzed your query against the live OnboardOS graph (${role} role context).\n\n**Summary:**\n• **Target Context:** ${role === 'HR' ? 'Company-wide Onboarding Orchestration & RBAC Policies' : 'Your Personal Onboarding Track & Work Tools'}\n• **Status:** Active & synchronizing with live event bus\n• **Query Analysis:** Processed "${userQuery}".\n\nFeel free to ask about access reasoning, birthright rules, DAG tasks, Day-1 readiness, or team mentorship!`,
    evidence: {
      sourceType: 'HYBRID_GRAPH',
      tags: ['OnboardOS Intelligence', role, 'Live Synced'],
    },
    actions: [
      { label: 'View Dashboard', actionKey: 'VIEW_DASHBOARD', deepLink: role === 'HR' ? '/hr' : '/me', primary: true },
    ],
  };
}

export function getInitialConversations(role: UserRole): import('./types').AIConversation[] {
  if (role === 'HR') {
    return [
      {
        id: 'conv-hr-1',
        title: 'Rahul Overdue Tasks',
        createdAt: '2026-08-22T11:45:00Z',
        updatedAt: '2026-08-22T11:45:00Z',
        role: 'HR',
        timeGroup: 'Today',
        messages: [
          {
            id: 'm-1',
            sender: 'user',
            content: 'Which onboarding tasks assigned to Rahul are overdue?',
            timestamp: '11:45 AM',
            status: 'completed',
          },
          {
            id: 'm-2',
            sender: 'assistant',
            content: `I found **2 overdue onboarding tasks** assigned to Rahul Sharma.\n\n| Task | Due Date | Status | Delay |\n| :--- | :--- | :--- | :--- |\n| Complete Security Training | Aug 19 | 🔴 Overdue | 3 days |\n| Submit Development Environment Checklist | Aug 21 | 🔴 Overdue | 1 day |\n\n**Overall Status:** Rahul is currently at **60% onboarding readiness** with **2 overdue tasks**.\n\n**Recommended Action:**\nSend Rahul a reminder and ask the manager to follow up if the tasks remain incomplete after today.`,
            timestamp: '11:45 AM',
            status: 'completed',
            evidence: {
              stats: {
                readinessScore: 60,
                riskScore: 75,
                completedTasks: 4,
                totalTasks: 6,
                blockerCount: 2,
              },
              deepLink: '/employees/emp-rahul?tab=tasks',
              deepLinkLabel: "Inspect Rahul's Task DAG",
            },
            actions: [
              { label: 'Send Reminder to Rahul', actionKey: 'SEND_REMINDER', primary: true },
              { label: 'View Employee Profile', actionKey: 'VIEW_PROFILE', deepLink: '/employees/emp-rahul' },
            ],
          },
        ],
      },
      {
        id: 'conv-hr-2',
        title: 'Weekly Onboarding Summary',
        createdAt: '2026-08-22T10:30:00Z',
        updatedAt: '2026-08-22T10:30:00Z',
        role: 'HR',
        timeGroup: 'Today',
        messages: [],
      },
      {
        id: 'conv-hr-3',
        title: 'HR Actions for Rahul',
        createdAt: '2026-08-22T09:15:00Z',
        updatedAt: '2026-08-22T09:15:00Z',
        role: 'HR',
        timeGroup: 'Today',
        messages: [],
      },
      {
        id: 'conv-hr-4',
        title: 'IT Access Waiting List',
        createdAt: '2026-08-22T09:02:00Z',
        updatedAt: '2026-08-22T09:02:00Z',
        role: 'HR',
        timeGroup: 'Today',
        messages: [],
      },
      {
        id: 'conv-hr-5',
        title: 'Employees Needing Attention',
        createdAt: '2026-08-21T18:25:00Z',
        updatedAt: '2026-08-21T18:25:00Z',
        role: 'HR',
        timeGroup: 'Yesterday',
        messages: [],
      },
    ];
  }

  // Employee Default Initial Conversations
  return [
    {
      id: 'conv-emp-1',
      title: 'Laptop Support Request',
      createdAt: '2026-08-22T11:45:00Z',
      updatedAt: '2026-08-22T11:45:00Z',
      role: 'EMPLOYEE',
      timeGroup: 'Today',
      messages: [
        {
          id: 'me-1',
          sender: 'user',
          content: 'My laptop is not working.',
          timestamp: '11:45 AM',
          status: 'completed',
        },
        {
          id: 'me-2',
          sender: 'assistant',
          content: `I can help you get this resolved.\n\n### 💻 IT Support\n**Issue:** Laptop not working\n**Suggested Priority:** 🟠 Medium\n\nBefore creating a ticket, try:\n1. Check whether the charger/power indicator is active.\n2. Hold the power button for **10 seconds** and restart.\n3. Disconnect external devices and try again.\n\nIf the laptop still doesn't start, I can **create an IT Helpdesk ticket** with your employee details and onboarding context.\n\n**Next Step:**\n👉 **Create IT Ticket**`,
          timestamp: '11:45 AM',
          status: 'completed',
          actions: [
            { label: 'Create IT Helpdesk Ticket', actionKey: 'CREATE_TICKET', deepLink: '/me/help', primary: true },
          ],
        },
      ],
    },
    {
      id: 'conv-emp-2',
      title: 'Slack Access Provisioning',
      createdAt: '2026-08-22T10:30:00Z',
      updatedAt: '2026-08-22T10:30:00Z',
      role: 'EMPLOYEE',
      timeGroup: 'Today',
      messages: [],
    },
    {
      id: 'conv-emp-3',
      title: 'My Assigned Resources',
      createdAt: '2026-08-22T09:15:00Z',
      updatedAt: '2026-08-22T09:15:00Z',
      role: 'EMPLOYEE',
      timeGroup: 'Today',
      messages: [],
    },
    {
      id: 'conv-emp-4',
      title: 'Current Task Help',
      createdAt: '2026-08-21T16:00:00Z',
      updatedAt: '2026-08-21T16:00:00Z',
      role: 'EMPLOYEE',
      timeGroup: 'Yesterday',
      messages: [],
    },
  ];
}
