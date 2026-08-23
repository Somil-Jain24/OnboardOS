import type { AIIntentResult } from './intentDefinitions';

export const MANAGER_INTENTS: Record<string, AIIntentResult> = {
  // Manager 7 & 10: Who is overdue?
  MGR_WHO_IS_OVERDUE: {
    intent: 'MGR_WHO_IS_OVERDUE',
    ownerRole: 'MANAGER',
    badge: '✓ OnboardOS Intelligence',
    content: `### 🔴 Team Overdue Report

There are currently **3 overdue employees** in your team.

**Rahul Sharma**
* 2 overdue tasks
* 60% onboarding progress
* Jira access pending

**Priya Mehta**
* 1 overdue task
* 74% onboarding progress

**Arjun Patel**
* 2 overdue tasks
* 68% onboarding progress

### Team Impact
**5 tasks** are currently overdue across your team.

**Recommended Action:**
Prioritize Rahul first because his overdue tasks are combined with a pending development access request.`,
    evidence: {
      stats: {
        readinessScore: 67,
        riskScore: 58,
        blockerCount: 5,
      },
      sourceType: 'DETERMINISTIC_KB',
      deepLink: '/manager/approvals',
      deepLinkLabel: 'Review Pending Team Approvals',
      tags: ['Team Overdue', 'Manager Dashboard', 'Rahul', 'Priya', 'Arjun'],
      isDeterministic: true,
    },
    actions: [
      { label: 'Schedule Quick Sync with Rahul', actionKey: 'SCHEDULE_SYNC', primary: true },
      { label: 'View Approvals Queue', actionKey: 'VIEW_APPROVALS', deepLink: '/manager/approvals' },
    ],
  },

  // Manager 8: What did Rahul complete this week?
  MGR_WHAT_RAHUL_COMPLETED_WEEK: {
    intent: 'MGR_WHAT_RAHUL_COMPLETED_WEEK',
    ownerRole: 'MANAGER',
    badge: '✓ OnboardOS Intelligence',
    content: `### Rahul Sharma — Weekly Activity

Rahul completed **6 onboarding activities** this week.

**Completed**
* ✅ Google Workspace activation
* ✅ Slack activation
* ✅ GitHub access setup
* ✅ Team introduction
* ✅ Company security training
* ✅ Development environment setup

**Progress:** **+20%** this week

### Current Status
🟢 **3 of 5 required systems activated**
⏳ **Jira access:** Pending
📊 **Current onboarding readiness:** **60%**

**Manager Insight:**
Rahul is progressing consistently, but Jira access and two remaining tasks should be followed up before the end of the week.`,
    evidence: {
      stats: {
        readinessScore: 60,
        completedTasks: 6,
        totalTasks: 8,
      },
      sourceType: 'DETERMINISTIC_KB',
      deepLink: '/employees/emp-rahul',
      deepLinkLabel: "Inspect Rahul's Activity Log",
      tags: ['Weekly Activity', 'Rahul Sharma', '+20% Progress'],
      isDeterministic: true,
    },
    actions: [
      { label: 'Open Employee Command Center', actionKey: 'VIEW_PROFILE', deepLink: '/employees/emp-rahul', primary: true },
    ],
  },

  // Manager 9: Who needs my attention?
  MGR_WHO_NEEDS_ATTENTION: {
    intent: 'MGR_WHO_NEEDS_ATTENTION',
    ownerRole: 'MANAGER',
    badge: '✓ OnboardOS Intelligence',
    content: `### 👀 Team Members Requiring Attention

I recommend focusing on **2 employees today**:

**🔴 Rahul Sharma**
* Onboarding: **60%**
* 2 overdue tasks
* Jira access pending
* New developer who may be blocked by tooling

**🟠 Arjun Patel**
* Onboarding: **68%**
* 2 overdue tasks
* GitHub access pending

### Suggested Manager Actions
**Rahul:** Check Jira provisioning + discuss overdue tasks.
**Arjun:** Confirm GitHub access and task completion plan.

Other team members are currently progressing within expected timelines.`,
    evidence: {
      stats: {
        readinessScore: 64,
        blockerCount: 2,
      },
      sourceType: 'DETERMINISTIC_KB',
      deepLink: '/manager',
      deepLinkLabel: 'Open Manager Command Center',
      tags: ['Manager Focus', 'Rahul Sharma', 'Arjun Patel'],
      isDeterministic: true,
    },
    actions: [
      { label: 'Check Jira Status', actionKey: 'CHECK_JIRA', primary: true },
      { label: 'View Team Roster', actionKey: 'TEAM_ROSTER', deepLink: '/manager' },
    ],
  },

  // Manager 10: Show team performance trends.
  MGR_TEAM_PERFORMANCE_TRENDS: {
    intent: 'MGR_TEAM_PERFORMANCE_TRENDS',
    ownerRole: 'MANAGER',
    badge: '✓ OnboardOS Intelligence',
    content: `### 📈 Team Performance — Last 4 Weeks

**Onboarding Completion**
* Week 1 → **52%**
* Week 2 → **64%**
* Week 3 → **71%**
* Week 4 → **78%**

**Trend:** 🟢 **+26 percentage points**

### Key Improvements
* 📈 Task completion increased **18%**
* ⚡ Average blocker resolution improved by **1.4 days**
* 📚 Resource completion increased **22%**
* 💻 Tool activation improved from **61% → 86%**

### Current Risk
The main remaining bottleneck is **pending IT/tool access**.

**Overall Team Health:** 🟢 **Good**`,
    evidence: {
      stats: {
        readinessScore: 78,
        riskScore: 22,
      },
      sourceType: 'DETERMINISTIC_KB',
      deepLink: '/manager',
      deepLinkLabel: 'View Full Performance Analytics',
      tags: ['Performance Trends', '+26% Improvement', 'Team Health 🟢'],
      isDeterministic: true,
    },
    actions: [
      { label: 'Open Manager Dashboard', actionKey: 'MGR_DASHBOARD', deepLink: '/manager', primary: true },
    ],
  },
};
