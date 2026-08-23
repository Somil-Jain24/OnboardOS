import type { UserRole, User } from '../../types';
import type { AIMessage, AISuggestionCard } from './types';
import { handleAIQuery } from '../../ai';

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
  ],
  IT: [
    {
      id: 'it-sug-1',
      title: 'Pending access requests queue',
      query: 'Show all high-priority IT access requests waiting for approval',
      iconType: 'cloud',
      role: 'IT',
    },
    {
      id: 'it-sug-2',
      title: 'Hardware & laptop asset audit',
      query: 'Audit unassigned hardware assets for upcoming new hires',
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

export function isWithinOnboardOSDomain(query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;

  // General greetings & capabilities
  const generalGreetings = [
    'hi', 'hello', 'hey', 'help', 'who are you', 'what can you do',
    'guide', 'menu', 'commands', 'start', 'how do you work', 'good morning', 'good evening'
  ];
  if (generalGreetings.some((g) => q === g || q.startsWith(`${g} `) || q.includes(g))) {
    return true;
  }

  // Explicit OnboardOS / Enterprise Onboarding Keywords
  const domainKeywords = [
    'onboard', 'onboarding', 'hire', 'hiring', 'employee', 'worker', 'member', 'cohort', 'candidate',
    'rahul', 'priya', 'arjun', 'neha', 'sarah', 'marcus', 'david', 'elena', 'amit',
    'task', 'checklist', 'milestone', 'overdue', 'pending', 'complete', 'completed', 'progress', 'status',
    'blocker', 'blocked', 'delay', 'issue', 'exception', 'risk', 'remediation', 'recovery',
    'access', 'jira', 'github', 'slack', 'aws', 'vpn', 'gitlab', 'permission', 'provision', 'provisioning',
    'approval', 'signoff', 'request', 'ticket', 'asset', 'laptop', 'hardware', 'equipment',
    'hr', 'manager', 'it', 'admin', 'role', 'team', 'mentor', 'buddy', 'department',
    'readiness', 'passport', 'score', 'outcome', 'parameter', 'metric', 'skill', 'matrix', 'benchmark',
    'policy', 'birthright', 'entitlement', 'resource', 'handbook', 'training', 'compliance', 'transfer',
    'offboard', 'offboarding', 'recommendation', 'assignment', 'project', 'fit', 'simulation',
    'day 1', 'day-1', 'orientation', 'workspace', 'document', 'guide', 'handbook'
  ];

  return domainKeywords.some((keyword) => q.includes(keyword));
}

export async function generateAIResponse(
  userQuery: string,
  role: UserRole,
  currentUser: User | null
): Promise<Partial<AIMessage>> {
  const result = await handleAIQuery(userQuery, role, currentUser);
  return {
    content: result.content,
    evidence: result.evidence as any,
    actions: result.actions as any,
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
