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
      id: 'emp-sug-blocker',
      title: 'What is blocking my onboarding?',
      query: 'What is blocking my onboarding?',
      iconType: 'shield',
      role: 'EMPLOYEE',
    },
    {
      id: 'emp-sug-next',
      title: 'What should I do next?',
      query: 'What should I do next?',
      iconType: 'status',
      role: 'EMPLOYEE',
    },
    {
      id: 'emp-sug-progress',
      title: 'Show my onboarding progress',
      query: 'Show my onboarding progress.',
      iconType: 'code',
      role: 'EMPLOYEE',
    },
    {
      id: 'emp-sug-task-help',
      title: 'Help with my current task',
      query: 'I need help with my current task.',
      iconType: 'expert',
      role: 'EMPLOYEE',
    },
    {
      id: 'emp-sug-github',
      title: 'I need GitHub access',
      query: 'I need GitHub access.',
      iconType: 'cloud',
      role: 'EMPLOYEE',
    },
    {
      id: 'emp-sug-res',
      title: 'Show my assigned resources',
      query: 'Show my assigned resources.',
      iconType: 'code',
      role: 'EMPLOYEE',
    },
    {
      id: 'emp-sug-laptop',
      title: 'My laptop is not working',
      query: 'My laptop is not working.',
      iconType: 'help',
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

  // HR 1: "Which onboarding tasks assigned to Rahul are overdue?"
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

  // HR 2: "Generate a weekly onboarding summary for the HR team."
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

  // HR 3: "Summarize all HR actions required for Rahul."
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

  // HR 4: "Which employees are waiting for IT access, and for how long?"
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

  // HR 5: "Give me a list of employees who need HR attention today."
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

  // HR 6: "Which onboarding tasks were completed by Rahul this month?"
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

  // Manager 7 & 10: "Who is overdue?"
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

  // Manager 8: "What did Rahul complete this week?"
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

  // Manager 9: "Who needs my attention?"
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

  // Manager 10: "Show team performance trends."
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
  // 3. EMPLOYEE AI COPILOT REASONING-BASED RESPONSES
  // ==========================================================================

  // 🔥 7. Sabse powerful demo question: "What is blocking my onboarding?"
  if (
    q.includes('blocking my onboarding') ||
    q.includes('what is blocking') ||
    q.includes('any blocker') ||
    q.includes('my blockers') ||
    q.includes('blocking me')
  ) {
    return {
      content: `I reviewed your current tasks, resources, access requests, and approval status.\n\nYour onboarding is **80% complete**, and there is currently **one external blocker**:\n\n### 🔴 Jira Access — Pending IT Provisioning\n\nYour profile, manager approval, Slack access, GitHub access, and mandatory documentation are already complete.\n\n**What you can do now:**\nYou don't need to wait for Jira. You can complete the **Development Environment Checklist** and your remaining learning resource in parallel.\n\n**Blocker Owner:** IT\n**Employee Action Required:** Complete remaining checklist\n**Impact:** Medium\n\n**AI Recommendation:** Continue the available onboarding activities while IT completes Jira provisioning. Once Jira is activated, your onboarding should be ready for final completion.\n\n\`Continue Onboarding →\` | \`View Jira Request →\``,
      evidence: {
        stats: {
          readinessScore: 80,
          completedTasks: 8,
          totalTasks: 10,
          blockerCount: 1,
        },
        whyThisDecision: {
          roleReq: 'Junior Backend Developer',
          projReq: 'Payments Engine v2',
          policy: 'Blocker Classification: External IT Dependency (Jira API)',
          checks: [
            { label: 'Jira Access Provisioning', passed: false, detail: 'Awaiting IT Administrator approval' },
            { label: 'Development Checklist Submission', passed: false, detail: 'Actionable by Employee right now' },
            { label: 'GitHub & Slack Access', passed: true, detail: 'Fully provisioned' },
          ],
        },
        deepLink: '/me/tasks',
        deepLinkLabel: 'Inspect Blocker Graph in My Tasks',
        tags: ['Multi-System DAG Reasoning', 'Jira Blocker', '80% Readiness', 'Action Recommendation'],
      },
      actions: [
        { label: 'Continue Onboarding →', actionKey: 'CONTINUE_ONBOARDING', deepLink: '/me/tasks', primary: true },
        { label: 'View Jira Request →', actionKey: 'VIEW_JIRA_REQ', deepLink: '/me/tasks' },
      ],
    };
  }

  // 1. Employee: "What should I do next?"
  if (
    q.includes('what should i do next') ||
    q.includes('what to do next') ||
    q.includes('what should i do now') ||
    q.includes('next step for me')
  ) {
    return {
      content: `> Based on your current onboarding status, your next priority is to complete the **Development Environment Checklist**.\n>\n> You have completed **8 of 10 assigned onboarding tasks**, and your overall onboarding readiness is currently **80%**. Your profile and company orientation are complete, and Slack/GitHub access has already been activated.\n>\n> The remaining blocker is **Jira access**, which is still awaiting IT provisioning. While waiting for that access, you can complete the **Security & Compliance resource** and the development environment checklist.\n>\n> **Recommended order:**\n> ① Complete Development Environment Checklist\n> ② Finish Security & Compliance resource\n> ③ Follow up on Jira access\n>\n> Once these are completed, your onboarding should be ready for final manager review.\n>\n> **Next Action:** \`Continue Development Setup →\``,
      evidence: {
        stats: {
          readinessScore: 80,
          completedTasks: 8,
          totalTasks: 10,
          blockerCount: 1,
        },
        whyThisDecision: {
          roleReq: 'Junior Backend Developer',
          projReq: 'Payments Engine v2',
          policy: 'Critical Path Priority: Dev Setup before Sprint Assignment',
          checks: [
            { label: 'Development Environment Checklist', passed: false, detail: 'Priority #1' },
            { label: 'Security & Compliance Resource', passed: false, detail: 'Priority #2' },
            { label: 'Jira Access Follow-up', passed: false, detail: 'Priority #3 (IT Dependency)' },
          ],
        },
        deepLink: '/me/tasks',
        deepLinkLabel: 'Open Development Setup Checklist',
        tags: ['Contextual Priority', 'Development Setup', '80% Readiness'],
      },
      actions: [
        { label: 'Continue Development Setup →', actionKey: 'CONTINUE_DEV_SETUP', deepLink: '/me/tasks', primary: true },
      ],
    };
  }

  // 2. Employee: "Show my onboarding progress."
  if (
    q.includes('onboarding progress') ||
    q.includes('my progress') ||
    (q.includes('show') && q.includes('progress') && role === 'EMPLOYEE')
  ) {
    return {
      content: `> ### Your Onboarding Overview\n>\n> **Overall Readiness: 80% 🟢**\n>\n> You have completed **8 of 10 onboarding tasks**, with **4 of 5 assigned resources** completed. Your employee profile has been approved and your primary communication and development tools are already active.\n>\n> **Completed**\n>\n> * ✅ Employee profile & documentation\n> * ✅ Company orientation\n> * ✅ Security training\n> * ✅ Team introduction\n> * ✅ Slack & GitHub setup\n>\n> **Still Pending**\n>\n> * ⏳ Development Environment Checklist\n> * ⏳ Jira access\n>\n> **AI Insight:** Your onboarding is progressing normally. The only external dependency is Jira provisioning; the remaining checklist can be completed without waiting for IT.\n>\n> **Estimated remaining onboarding effort:** ~30–45 minutes.`,
      evidence: {
        stats: {
          readinessScore: 80,
          completedTasks: 8,
          totalTasks: 10,
          blockerCount: 1,
        },
        deepLink: '/me',
        deepLinkLabel: 'Open Employee Command Center',
        tags: ['Onboarding Overview', '80% Readiness', '30-45 min remaining'],
      },
      actions: [
        { label: 'Open My Tasks', actionKey: 'OPEN_TASKS', deepLink: '/me/tasks', primary: true },
      ],
    };
  }

  // 3. Employee: "I need help with my current task."
  if (
    q.includes('help with my current task') ||
    q.includes('help in my current task') ||
    (q.includes('help') && q.includes('task'))
  ) {
    return {
      content: `> Your current priority is the **Development Environment Checklist**, which is required before you begin your first development assignment.\n>\n> I found that your basic development setup is already completed, including **GitHub access and repository access**. The remaining steps are environment verification and configuration.\n>\n> **You still need to verify:**\n>\n> * Git installation and authentication\n> * Required runtime/dependencies\n> * Repository cloning\n> * Environment configuration\n> * Successful test/build execution\n>\n> I can guide you through these steps one at a time and help identify any configuration issue before you submit the checklist.\n>\n> **Recommended:** Start with **Git & repository verification**.\n>\n> \`Start Guided Setup →\``,
      evidence: {
        stats: {
          readinessScore: 80,
          completedTasks: 8,
          totalTasks: 10,
        },
        deepLink: '/me/tasks',
        deepLinkLabel: 'Open Guided Task Setup',
        tags: ['Interactive Setup', 'Dev Checklist', 'Step-by-Step'],
      },
      actions: [
        { label: 'Start Guided Setup →', actionKey: 'START_GUIDED_SETUP', primary: true },
      ],
    };
  }

  // 4. Employee: "My laptop is not working."
  if (
    q.includes('laptop') &&
    (q.includes('not working') || q.includes('issue') || q.includes('problem') || q.includes('broken'))
  ) {
    return {
      content: `> I can help you troubleshoot this before escalating it to IT.\n>\n> Your assigned device is currently registered in OnboardOS, but there is **no active hardware incident associated with it**.\n>\n> Please first check the charger connection and power indicator, then hold the power button for approximately 10 seconds and try restarting the device.\n>\n> If the laptop still doesn't respond, I can create an **IT Helpdesk request** with your employee profile and device information so you don't have to enter everything manually.\n>\n> **Current IT Status:** 🟢 No existing ticket\n> **Recommended Priority:** 🟠 Medium\n>\n> \`Run Quick Troubleshooting →\`\n> \`Create IT Ticket →\``,
      evidence: {
        sourceType: 'LLM_GROUNDED',
        deepLink: '/me/help',
        deepLinkLabel: 'Open IT Support Portal',
        tags: ['Hardware Incident Triage', 'Device Diagnostics', 'IT Helpdesk'],
      },
      actions: [
        { label: 'Run Quick Troubleshooting →', actionKey: 'RUN_TROUBLESHOOT', primary: true },
        { label: 'Create IT Ticket →', actionKey: 'CREATE_IT_TICKET', deepLink: '/me/help' },
      ],
    };
  }

  // 5. Employee: "I need GitHub access."
  if (
    q.includes('github') &&
    (q.includes('access') || q.includes('need') || q.includes('claim') || q.includes('get'))
  ) {
    return {
      content: `> Your GitHub access request has already been provisioned.\n>\n> **Current Status:** 🟢 Ready to Claim\n> **Access Type:** Development / Repository Contributor\n> **Requested For:** Your current engineering team\n>\n> You don't need to submit another request. Your access can be claimed directly from the **Onboarding Tool Suite**.\n>\n> I also found that your **Jira access is still pending IT approval**, so you may not be able to access the complete development workflow yet.\n>\n> **Recommended:** Claim GitHub access now and continue with your available onboarding tasks while Jira provisioning is completed.\n>\n> \`Claim GitHub Access →\``,
      evidence: {
        whyThisDecision: {
          roleReq: 'Backend Developer → Payments Core',
          policy: 'Universal Engineering Birthright Provisioning',
          checks: [
            { label: 'GitHub Enterprise License Allocated', passed: true },
            { label: 'Payments Core Repo Contributor Added', passed: true },
            { label: 'Jira Access Request', passed: false, detail: 'Pending IT approval' },
          ],
        },
        deepLink: '/me/tasks',
        deepLinkLabel: 'Claim GitHub in Tool Suite',
        tags: ['GitHub Provisioned', 'Ready to Claim', 'Jira Dependency'],
      },
      actions: [
        { label: 'Claim GitHub Access →', actionKey: 'CLAIM_GITHUB', deepLink: '/me/tasks', primary: true },
      ],
    };
  }

  // 6. Employee: "Show my assigned resources."
  if (
    q.includes('assigned resources') ||
    q.includes('my resources') ||
    (q.includes('resources') && (q.includes('show') || q.includes('assigned')))
  ) {
    return {
      content: `> ### Your Learning & Onboarding Resources\n>\n> You currently have **5 resources assigned** based on your role and onboarding stage.\n>\n> **Completed**\n>\n> * ✅ Engineering Handbook\n> * ✅ Company Security & Compliance\n> * ✅ Developer Onboarding Guide\n>\n> **In Progress**\n>\n> * 🟡 Backend Development Standards\n>\n> **Recommended**\n>\n> * ⭐ Git Workflow & Branching Guide\n>\n> Your resource completion is currently **60%**.\n>\n> **AI Recommendation:** Complete the Git Workflow guide next because it directly supports your development environment setup and will help you complete your remaining onboarding task.\n>\n> \`Open Recommended Resource →\``,
      evidence: {
        stats: {
          readinessScore: 80,
          completedTasks: 3,
          totalTasks: 5,
        },
        deepLink: '/knowledge',
        deepLinkLabel: 'Open Knowledge & Learning Base',
        tags: ['Curated Resources', '60% Completed', 'Git Workflow Recommended'],
      },
      actions: [
        { label: 'Open Recommended Resource →', actionKey: 'OPEN_REC_RES', deepLink: '/knowledge', primary: true },
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
      id: 'conv-emp-blocker',
      title: 'What is blocking my onboarding?',
      createdAt: '2026-08-22T11:45:00Z',
      updatedAt: '2026-08-22T11:45:00Z',
      role: 'EMPLOYEE',
      timeGroup: 'Today',
      messages: [
        {
          id: 'me-1',
          sender: 'user',
          content: 'What is blocking my onboarding?',
          timestamp: '11:45 AM',
          status: 'completed',
        },
        {
          id: 'me-2',
          sender: 'assistant',
          content: `I reviewed your current tasks, resources, access requests, and approval status.\n\nYour onboarding is **80% complete**, and there is currently **one external blocker**:\n\n### 🔴 Jira Access — Pending IT Provisioning\n\nYour profile, manager approval, Slack access, GitHub access, and mandatory documentation are already complete.\n\n**What you can do now:**\nYou don't need to wait for Jira. You can complete the **Development Environment Checklist** and your remaining learning resource in parallel.\n\n**Blocker Owner:** IT\n**Employee Action Required:** Complete remaining checklist\n**Impact:** Medium\n\n**AI Recommendation:** Continue the available onboarding activities while IT completes Jira provisioning. Once Jira is activated, your onboarding should be ready for final completion.\n\n\`Continue Onboarding →\` | \`View Jira Request →\``,
          timestamp: '11:45 AM',
          status: 'completed',
          evidence: {
            stats: {
              readinessScore: 80,
              completedTasks: 8,
              totalTasks: 10,
              blockerCount: 1,
            },
            whyThisDecision: {
              roleReq: 'Junior Backend Developer',
              projReq: 'Payments Engine v2',
              policy: 'Blocker Classification: External IT Dependency (Jira API)',
              checks: [
                { label: 'Jira Access Provisioning', passed: false, detail: 'Awaiting IT Administrator approval' },
                { label: 'Development Checklist Submission', passed: false, detail: 'Actionable by Employee right now' },
                { label: 'GitHub & Slack Access', passed: true, detail: 'Fully provisioned' },
              ],
            },
            deepLink: '/me/tasks',
            deepLinkLabel: 'Inspect Blocker Graph in My Tasks',
          },
          actions: [
            { label: 'Continue Onboarding →', actionKey: 'CONTINUE_ONBOARDING', deepLink: '/me/tasks', primary: true },
            { label: 'View Jira Request →', actionKey: 'VIEW_JIRA_REQ', deepLink: '/me/tasks' },
          ],
        },
      ],
    },
    {
      id: 'conv-emp-next',
      title: 'What should I do next?',
      createdAt: '2026-08-22T10:30:00Z',
      updatedAt: '2026-08-22T10:30:00Z',
      role: 'EMPLOYEE',
      timeGroup: 'Today',
      messages: [],
    },
    {
      id: 'conv-emp-progress',
      title: 'Onboarding Overview',
      createdAt: '2026-08-22T09:15:00Z',
      updatedAt: '2026-08-22T09:15:00Z',
      role: 'EMPLOYEE',
      timeGroup: 'Today',
      messages: [],
    },
    {
      id: 'conv-emp-task-help',
      title: 'Current Task Setup',
      createdAt: '2026-08-21T16:00:00Z',
      updatedAt: '2026-08-21T16:00:00Z',
      role: 'EMPLOYEE',
      timeGroup: 'Yesterday',
      messages: [],
    },
  ];
}
