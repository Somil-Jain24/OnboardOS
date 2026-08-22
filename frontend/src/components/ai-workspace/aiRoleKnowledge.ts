import type { UserRole, User } from '../../types';
import type { AIMessage, AISuggestionCard } from './types';
import { client } from '../../services';

export const ROLE_SUGGESTIONS: Record<UserRole, AISuggestionCard[]> = {
  HR: [
    {
      id: 'hr-sug-1',
      title: 'Why did Rahul get AWS access?',
      query: 'Why did Rahul get AWS access?',
      iconType: 'cloud',
      role: 'HR',
    },
    {
      id: 'hr-sug-2',
      title: 'Who is expert in Jira?',
      query: 'Who is expert in Jira?',
      iconType: 'expert',
      role: 'HR',
    },
    {
      id: 'hr-sug-3',
      title: 'Onboarding status of Rahul',
      query: 'Show onboarding status of Rahul',
      iconType: 'status',
      role: 'HR',
    },
    {
      id: 'hr-sug-4',
      title: 'Resources for Backend Dev',
      query: 'What resources are provisioned for Backend Developer?',
      iconType: 'code',
      role: 'HR',
    },
    {
      id: 'hr-sug-5',
      title: 'Employees ready for Day 1',
      query: 'Who is ready for Day 1 onboarding?',
      iconType: 'shield',
      role: 'HR',
    },
    {
      id: 'hr-sug-6',
      title: "Why wasn't Figma assigned?",
      query: "Why wasn't Figma assigned to Rahul?",
      iconType: 'policy',
      role: 'HR',
    },
  ],
  EMPLOYEE: [
    {
      id: 'emp-sug-1',
      title: 'Why did I get AWS & GitHub?',
      query: 'Why did I get AWS and GitHub access?',
      iconType: 'cloud',
      role: 'EMPLOYEE',
    },
    {
      id: 'emp-sug-2',
      title: 'What is Jira & how to use it?',
      query: 'What is Jira and how do I use it for sprint tracking?',
      iconType: 'help',
      role: 'EMPLOYEE',
    },
    {
      id: 'emp-sug-3',
      title: "What's pending in my onboarding?",
      query: "What's pending in my onboarding tasks?",
      iconType: 'status',
      role: 'EMPLOYEE',
    },
    {
      id: 'emp-sug-4',
      title: 'Who can help me with Jira?',
      query: 'Who can help me with Jira and tools setup?',
      iconType: 'expert',
      role: 'EMPLOYEE',
    },
    {
      id: 'emp-sug-5',
      title: 'Who is my assigned mentor?',
      query: 'Who is my assigned mentor and when is our 1-on-1?',
      iconType: 'expert',
      role: 'EMPLOYEE',
    },
    {
      id: 'emp-sug-6',
      title: 'How do I request another tool?',
      query: 'How do I request another software tool like Docker or Figma?',
      iconType: 'code',
      role: 'EMPLOYEE',
    },
  ],
  MANAGER: [
    {
      id: 'mgr-sug-1',
      title: "Rahul's Day-1 readiness",
      query: "What is Rahul Sharma's Day-1 readiness score and blockers?",
      iconType: 'status',
      role: 'MANAGER',
    },
    {
      id: 'mgr-sug-2',
      title: 'Pending access approvals',
      query: 'Show pending access approvals waiting for my signoff',
      iconType: 'shield',
      role: 'MANAGER',
    },
    {
      id: 'mgr-sug-3',
      title: 'Team skill matrix',
      query: 'Show team skill coverage and Java/TypeScript expertise',
      iconType: 'code',
      role: 'MANAGER',
    },
    {
      id: 'mgr-sug-4',
      title: 'Resolve Jira provisioning error',
      query: 'Why is Jira provisioning failing for my new hires?',
      iconType: 'help',
      role: 'MANAGER',
    },
  ],
  IT: [
    {
      id: 'it-sug-1',
      title: 'Jira API gateway failure',
      query: 'Diagnose the Jira API 503 rate limit exception',
      iconType: 'status',
      role: 'IT',
    },
    {
      id: 'it-sug-2',
      title: 'Hardware asset allocation',
      query: 'Which laptops are currently pending shipment?',
      iconType: 'code',
      role: 'IT',
    },
    {
      id: 'it-sug-3',
      title: 'SOC-2 Offboarding revocation',
      query: 'Show automated access revocation audit logs',
      iconType: 'shield',
      role: 'IT',
    },
    {
      id: 'it-sug-4',
      title: 'SCIM Connector health',
      query: 'Check Okta SCIM sync status and webhook latencies',
      iconType: 'cloud',
      role: 'IT',
    },
  ],
  ADMIN: [
    {
      id: 'adm-sug-1',
      title: 'Birthright policy overview',
      query: 'Audit birthright policies across Engineering and Design',
      iconType: 'policy',
      role: 'ADMIN',
    },
    {
      id: 'adm-sug-2',
      title: 'SoD Separation of Duties',
      query: 'Check for toxic combinations and SoD policy violations',
      iconType: 'shield',
      role: 'ADMIN',
    },
    {
      id: 'adm-sug-3',
      title: 'License optimization savings',
      query: 'Show inactive SaaS licenses ready for reclamation',
      iconType: 'cloud',
      role: 'ADMIN',
    },
    {
      id: 'adm-sug-4',
      title: 'Governance audit log',
      query: 'Export full RBAC change log for SOC-2 compliance',
      iconType: 'status',
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

  // Let's attempt live data gathering if available
  let employees: any[] = [];
  try {
    employees = await client.getEmployees();
  } catch {}

  const rahul = employees.find((e) => e.id === 'emp-rahul' || e.name?.toLowerCase().includes('rahul'));
  const priya = employees.find((e) => e.id === 'emp-priya' || e.name?.toLowerCase().includes('priya'));
  const aman = employees.find((e) => e.id === 'emp-aman' || e.name?.toLowerCase().includes('aman'));

  // ==========================================================================
  // 1. HR SPECIFIC RESPONSES
  // ==========================================================================
  if (role === 'HR') {
    if (q.includes('aws') && (q.includes('rahul') || q.includes('why') || q.includes('access'))) {
      return {
        content: `**Rahul Sharma** received **AWS Development Sandbox Access** because his role is **Junior Backend Developer** assigned to the **Payments Engine v2** project in the Engineering department.\n\nUnder the **Engineering Access Policy (SOC-2 Type II compliant)**, all Backend Engineers require cloud development environments. Provisioning was scheduled via the DAG orchestrator once his background verification and identity confirmation cleared.`,
        evidence: {
          whyThisDecision: {
            roleReq: 'Backend Developer → AWS Development Environment',
            projReq: 'Payments Engine v2 → AWS IAM (Dev Sandbox)',
            policy: 'Engineering Access Policy #ENG-204 (SOC-2 Type II)',
            checks: [
              { label: 'Role Requirement: Backend Developer profile matched', passed: true, detail: 'Auto-mapped by RBAC policy' },
              { label: 'Project Requirement: Payments Core microservices repository', passed: true, detail: 'Assigned by Manager Marcus Vance' },
              { label: 'Security Approval: Least-privilege IAM profile attached', passed: true, detail: 'No Root/Prod permissions granted' },
              { label: 'DAG Dependency: Identity & SSO verification completed', passed: true, detail: 'Google Workspace active' },
            ],
          },
          stats: {
            readinessScore: 65,
            riskScore: 75,
            completedTasks: 4,
            totalTasks: 6,
            blockerCount: 1,
          },
          sourceType: 'HYBRID_GRAPH',
          deepLink: '/employees/emp-rahul?tab=access',
          deepLinkLabel: "Inspect Rahul's Access Graph",
          tags: ['AWS Cloud', 'RBAC Birthright', 'Engineering Policy', 'SOC-2'],
        },
        actions: [
          { label: 'View Employee Command Center', actionKey: 'VIEW_PROFILE', deepLink: '/employees/emp-rahul', primary: true },
          { label: 'Review Access Policy #ENG-204', actionKey: 'VIEW_POLICY', deepLink: '/admin/roles' },
          { label: 'Trigger IAM Re-Audit', actionKey: 'AUDIT_IAM' },
        ],
      };
    }

    if (q.includes('jira') && (q.includes('expert') || q.includes('who') || q.includes('help'))) {
      return {
        content: `Based on organizational skill mapping and IT administrative rights, here are the primary **Jira Experts** in the company:\n\n1. **David Kim** — *IT Lead & Systems Admin* (Global Jira Administrator, Board Configuration, API Integrations)\n2. **Marcus Vance** — *Engineering Manager* (Payments Core Sprint Master, Backlog Management)\n3. **Sarah Chen** — *People Operations Lead* (Workflow Approvals & Onboarding Board)\n\nDavid Kim is the best point of contact for technical provisioning errors, while Marcus Vance handles project board access and sprint onboarding.`,
        evidence: {
          policySnippet: 'Jira Software enterprise administration is delegated to IT Operations with secondary escalation to Engineering Leads.',
          sourceType: 'LLM_GROUNDED',
          tags: ['Subject Matter Experts', 'Jira Software', 'IT Support', 'Engineering'],
        },
        actions: [
          { label: 'View IT Ticket Queue', actionKey: 'VIEW_IT', deepLink: '/it/tickets', primary: true },
          { label: 'Message David Kim (Slack)', actionKey: 'MSG_EXPERT' },
        ],
      };
    }

    if (q.includes('status') || (q.includes('onboarding') && q.includes('rahul'))) {
      return {
        content: `**Onboarding Summary for Rahul Sharma (Backend Developer):**\n\n• **Status:** ACTIVE (Start Date: Sep 1, 2026)\n• **Day-1 Readiness Score:** **65%** (Moderate Risk)\n• **Completed:** 4 of 6 automated tasks (Google Workspace, Slack Enterprise, GitHub Collaborator, 1Password).\n• **Current Blocker:** Jira Account Provisioning failed due to an external API 503 rate limit on the Atlassian gateway.\n• **Pending Approval:** AWS Dev IAM Sandbox awaiting final signoff from Manager Marcus Vance.`,
        evidence: {
          stats: {
            readinessScore: 65,
            riskScore: 75,
            completedTasks: 4,
            totalTasks: 6,
            blockerCount: 1,
          },
          whyThisDecision: {
            roleReq: 'Junior Backend Developer',
            projReq: 'Payments Engine v2',
            policy: 'Standard 14-Day Employee Ramp Plan',
            checks: [
              { label: 'Identity Provisioning (Google Workspace)', passed: true },
              { label: 'Collaboration Setup (Slack Enterprise)', passed: true },
              { label: 'Source Control (GitHub Org)', passed: true },
              { label: 'Issue Tracker (Jira Cloud)', passed: false, detail: 'Failed: HTTP 503 Rate Limit' },
              { label: 'Cloud Sandbox (AWS IAM)', passed: false, detail: 'Waiting for Manager Approval' },
            ],
          },
          sourceType: 'RULES_ENGINE',
          deepLink: '/employees/emp-rahul?tab=tasks',
          deepLinkLabel: 'Open Full Task Orchestration DAG',
          tags: ['Onboarding Status', 'Day 1 Readiness', 'DAG Orchestration'],
        },
        actions: [
          { label: 'Open Employee Command Center', actionKey: 'VIEW_PROFILE', deepLink: '/employees/emp-rahul', primary: true },
          { label: 'Retry Jira Step', actionKey: 'RETRY_JIRA' },
          { label: 'Notify Marcus Vance', actionKey: 'NOTIFY_MANAGER' },
        ],
      };
    }

    if (q.includes('resource') || (q.includes('backend') && q.includes('provision'))) {
      return {
        content: `**Birthright Package for Role: Backend Developer (Engineering)**\n\nStandard resources automatically orchestrated for all Backend Developers include:\n\n1. **Core Identity:** Google Workspace, Slack Enterprise, 1Password Enterprise\n2. **Engineering Stack:** GitHub Organization Collaborator, AWS Dev IAM Sandbox, Datadog (Read-only)\n3. **Work Management:** Jira Software (Payments Core Board), Confluence Developer Space\n4. **Hardware Asset:** 16-inch MacBook Pro M3 Max (32GB RAM, 1TB SSD) + YubiKey 5C NFC Security Key.`,
        evidence: {
          policySnippet: 'Birthright Rule #BR-ENG-01: Auto-grants identity, source control, and local developer sandbox with zero manual ticket overhead.',
          sourceType: 'RULES_ENGINE',
          deepLink: '/admin/birthright',
          deepLinkLabel: 'View Birthright Matrix',
          tags: ['Birthright', 'Developer Stack', 'Hardware Kit', 'Automated Grants'],
        },
        actions: [
          { label: 'Edit Birthright Policy', actionKey: 'EDIT_POLICY', deepLink: '/admin/birthright', primary: true },
          { label: 'View Access Marketplace', actionKey: 'VIEW_MARKETPLACE', deepLink: '/admin/marketplace' },
        ],
      };
    }

    if (q.includes('ready') || q.includes('day 1') || q.includes('day-1')) {
      return {
        content: `**Day-1 Readiness Review Across All Cohorts:**\n\n1. **Aman Verma** (HR Executive) — **100% Ready** 🟢 (All 5 identity & access grants verified)\n2. **Priya Mehta** (UI/UX Designer) — **92% Ready** 🟢 (Figma Enterprise active, laptop delivery in transit)\n3. **Rahul Sharma** (Backend Developer) — **65% At Risk** 🟡 (Blocked on Jira 503 error; AWS approval pending)\n\n**Recommended Action:** Resolve the Jira API rate-limit incident in the Exception Center to bring Rahul to 100% readiness before Day 1.`,
        evidence: {
          stats: {
            readinessScore: 85,
            riskScore: 28,
            completedTasks: 16,
            totalTasks: 18,
            blockerCount: 1,
          },
          sourceType: 'HYBRID_GRAPH',
          deepLink: '/hr/exceptions',
          deepLinkLabel: 'Open Exception Center',
          tags: ['Day 1 Readiness', 'Cohort Metrics', 'Automated Risk Scoring'],
        },
        actions: [
          { label: 'Open Exception Center', actionKey: 'OPEN_EXCEPTIONS', deepLink: '/hr/exceptions', primary: true },
          { label: 'View Cohort List', actionKey: 'VIEW_LIST', deepLink: '/hr/employees' },
        ],
      };
    }

    if (q.includes('figma') && (q.includes('rahul') || q.includes("wasn't") || q.includes('not'))) {
      return {
        content: `**Figma Enterprise** was not automatically assigned to **Rahul Sharma** because Figma is configured as a role-specific birthright entitlement exclusively for the **Design Department** (e.g. *UI/UX Designer*, *Product Designer*).\n\nSince Rahul is a **Backend Developer**, he has access to GitHub and AWS instead. If Rahul requires Figma view-only or editor access for design-system handoffs, he can submit a self-service request through the **Access Marketplace**, which will route to Marcus Vance for 1-click approval.`,
        evidence: {
          whyThisDecision: {
            roleReq: 'UI/UX Designer → Figma Enterprise (Full Editor License)',
            projReq: 'Engineering → GitHub / AWS Dev (Default)',
            policy: 'License Optimization & Least Privilege Policy #SEC-108',
            checks: [
              { label: 'Role Scope Match: Backend Developer != Design', passed: false, detail: 'Birthright filtered' },
              { label: 'Cost Optimization: Saves $540/yr unused editor seat', passed: true, detail: 'Auto-enforced by OnboardOS' },
              { label: 'Self-Service Path: Available via Marketplace', passed: true, detail: '1-Click Request available' },
            ],
          },
          sourceType: 'RULES_ENGINE',
          deepLink: '/admin/marketplace',
          deepLinkLabel: 'Access Marketplace Catalog',
          tags: ['Figma', 'License Optimization', 'Role Filtering', 'Self-Service'],
        },
        actions: [
          { label: 'Open Access Marketplace', actionKey: 'OPEN_MARKETPLACE', deepLink: '/admin/marketplace', primary: true },
          { label: 'Grant Temporary 14-Day Pass', actionKey: 'GRANT_TEMP' },
        ],
      };
    }

    if (q.includes('java') || q.includes('spring') || q.includes('developer')) {
      return {
        content: `**Identified Java & Spring Boot Engineers:**\n\n• **Rahul Sharma** — *Junior Backend Developer* (Java 21, Spring Boot, Microservices, PostgreSQL) — *Team: Payments Core*\n• **Alex Chen** — *Senior Staff Engineer* (Java Performance Tuning, Distributed Systems) — *Team: Core Platform*\n• **Elena Rostova** — *Security & Systems Architect* (Spring Security, OAuth2/OIDC, Cryptography)\n\nRahul's onboarding profile highlights active Java microservices ramp-up for the Payments Engine v2 milestone.`,
        evidence: {
          policySnippet: 'Skills matrix extracted from internal resumes, GitHub commit telemetry, and HRIS skill tags.',
          sourceType: 'LLM_GROUNDED',
          tags: ['Skill Search', 'Java / Spring Boot', 'Talent Directory'],
        },
        actions: [
          { label: "View Rahul's Skills Profile", actionKey: 'VIEW_SKILLS', deepLink: '/employees/emp-rahul', primary: true },
        ],
      };
    }

    if (q.includes('blocker') || q.includes('exception') || q.includes('failed')) {
      return {
        content: `**Current Onboarding Blockers Overview:**\n\n1. **[CRITICAL] Jira API Rate Limit (HTTP 503)** — *Impacted: Rahul Sharma (Backend Developer)*. The Atlassian provisioning connector hit gateway limits during batch setup. Auto-retry is scheduled.\n2. **[HIGH] AWS IAM Approval Pending** — *Impacted: Rahul Sharma*. Waiting for manager sign-off from Marcus Vance (sent 4h ago).\n3. **[LOW] Hardware Delivery Address Confirmation** — *Impacted: Priya Mehta*. Tracking ID active with DHL.\n\nResolve the Jira incident in Exception Center to restore automated DAG flow.`,
        evidence: {
          stats: {
            readinessScore: 65,
            riskScore: 75,
            blockerCount: 2,
          },
          sourceType: 'HYBRID_GRAPH',
          deepLink: '/hr/exceptions',
          deepLinkLabel: 'Resolve Exceptions',
          tags: ['Blockers', 'Exceptions', 'DAG Halt', 'Rate Limits'],
        },
        actions: [
          { label: 'Go to Exception Center', actionKey: 'GO_EXCEPTIONS', deepLink: '/hr/exceptions', primary: true },
          { label: 'Re-trigger DAG Orchestrator', actionKey: 'RETRIGGER_DAG' },
        ],
      };
    }
  }

  // ==========================================================================
  // 2. EMPLOYEE SPECIFIC RESPONSES (Scoped to current employee context)
  // ==========================================================================
  if (role === 'EMPLOYEE') {
    if (q.includes('aws') || q.includes('github') || q.includes('why did i get')) {
      return {
        content: `Hello **${userName}**! You were automatically provisioned **GitHub Organization Access** and **AWS Development Sandbox** because you are joining the **Payments Core team** as a **Junior Backend Developer**.\n\n• **GitHub** allows you to clone repositories, create pull requests, and contribute to the Payments Engine v2 codebase.\n• **AWS Dev Sandbox** provides an isolated cloud environment where you can deploy microservices without affecting production systems.\n\nAll access has been set up following company security best practices.`,
        evidence: {
          whyThisDecision: {
            roleReq: 'Backend Developer → GitHub Collaborator & AWS IAM',
            projReq: 'Payments Engine v2 Project Workspace',
            policy: 'Engineering Developer Birthright Policy',
            checks: [
              { label: 'GitHub Repository Permissions: payments-engine-v2 (Write)', passed: true },
              { label: 'AWS IAM Dev Account: Assigned with MFA enforcement', passed: true },
              { label: 'Security Baseline: Standard Developer Clearance', passed: true },
            ],
          },
          deepLink: '/me/tasks',
          deepLinkLabel: 'View Your Active Access & Tasks',
          tags: ['Your Access', 'GitHub', 'AWS Cloud', 'Payments Team'],
        },
        actions: [
          { label: 'View My Tasks', actionKey: 'MY_TASKS', deepLink: '/me/tasks', primary: true },
          { label: 'Open First Week Schedule', actionKey: 'FIRST_WEEK', deepLink: '/me/first-week' },
        ],
      };
    }

    if (q.includes('jira') && (q.includes('what is') || q.includes('how') || q.includes('use'))) {
      return {
        content: `**Jira Software Quick Guide for New Joiners:**\n\nJira is our team's project and sprint management tool. Here is how your team uses it:\n\n1. **Sprint Backlog:** Every two-week sprint, tasks and tickets are assigned to you on the *Payments Core Board*.\n2. **Moving Tickets:** When you start a task, drag it from **To Do** → **In Progress**. When finished, move to **In Code Review**.\n3. **Linking PRs:** Paste your Jira ticket ID (e.g. \`PAY-104\`) in your GitHub commit message or pull request title to auto-link them.\n\n*Note: Your Jira account is currently finishing automated provisioning and will be fully ready within a few minutes.*`,
        evidence: {
          policySnippet: 'Jira Software is integrated with GitHub: commits prefixed with PAY-XXX automatically update ticket status in real time.',
          sourceType: 'LLM_GROUNDED',
          tags: ['Jira Guide', 'Sprint Workflow', 'Payments Board'],
        },
        actions: [
          { label: 'Go to Payments Sprint Board', actionKey: 'OPEN_JIRA', primary: true },
          { label: 'Read Onboarding Handbook', actionKey: 'KNOWLEDGE_BASE', deepLink: '/knowledge' },
        ],
      };
    }

    if (q.includes('pending') || q.includes('task') || q.includes("what's next")) {
      return {
        content: `Here is what is currently pending in your onboarding checklist:\n\n1. 📋 **Sign NDA & Employee IP Agreement** (Electronic signature required)\n2. 🔐 **Set up 2-Factor Authentication (2FA)** on 1Password & Google Workspace\n3. 🎓 **Complete Day-1 Security & Compliance Module** (15 mins on KnowBe4)\n4. ☕ **Schedule 1-on-1 Coffee Chat with Marcus Vance** (Engineering Manager)\n\nYou have completed **4 out of 6** automated setup milestones!`,
        evidence: {
          stats: {
            readinessScore: 65,
            completedTasks: 4,
            totalTasks: 6,
          },
          deepLink: '/me/tasks',
          deepLinkLabel: 'Complete Next Pending Task',
          tags: ['Checklist', 'Pending Tasks', 'Day 1 Prep'],
        },
        actions: [
          { label: 'Complete Pending Tasks', actionKey: 'COMPLETE_TASKS', deepLink: '/me/tasks', primary: true },
          { label: 'View Week 1 Schedule', actionKey: 'WEEK_1', deepLink: '/me/first-week' },
        ],
      };
    }

    if (q.includes('mentor') || (q.includes('who') && (q.includes('help') || q.includes('buddy')))) {
      return {
        content: `Your assigned onboarding mentor is **Marcus Vance** (*Engineering Manager, Payments Core*).\n\n• **Email:** \`marcus.vance@onboardos.internal\`\n• **Slack:** \`@marcus.vance\` (Channel: \`#team-payments-core\`)\n• **1-on-1 Sync:** Scheduled for **Tuesdays at 10:30 AM**\n\nFor IT and tool issues (like password resets or YubiKey setup), you can also reach out directly to **David Kim** on \`#it-helpdesk\`.`,
        evidence: {
          policySnippet: 'Buddy & Mentor Program: New engineers are paired with senior team leads for the first 90 days.',
          sourceType: 'RULES_ENGINE',
          deepLink: '/me/first-week',
          deepLinkLabel: 'View Mentor Details & Calendar',
          tags: ['Mentor', 'Marcus Vance', '1-on-1 Sync', 'Support'],
        },
        actions: [
          { label: 'Open First Week Plan', actionKey: 'OPEN_MENTOR', deepLink: '/me/first-week', primary: true },
          { label: 'Open Helpdesk Ticket', actionKey: 'OPEN_TICKET', deepLink: '/me/help' },
        ],
      };
    }

    if (q.includes('request') || q.includes('another tool') || q.includes('marketplace') || q.includes('docker') || q.includes('figma')) {
      return {
        content: `You can easily request additional software tools, cloud access, or hardware upgrades via the **Access Marketplace**:\n\n1. Click **Access Marketplace** in the sidebar or top navigation.\n2. Browse available packages (e.g. *Docker Pro*, *Figma Viewer*, *Datadog APM*, *Postman Enterprise*).\n3. Click **Request Access** and provide a brief business justification.\n4. Your manager **Marcus Vance** will receive a 1-click Slack approval notification. Access is provisioned instantly once approved!`,
        evidence: {
          policySnippet: 'Self-service marketplace requests for standard developer tooling are pre-authorized with manager signoff within 4 business hours.',
          sourceType: 'RULES_ENGINE',
          deepLink: '/me/marketplace',
          deepLinkLabel: 'Browse Access Marketplace',
          tags: ['Access Marketplace', 'Self-Service', 'Tool Requests'],
        },
        actions: [
          { label: 'Open Access Marketplace', actionKey: 'OPEN_MARKETPLACE', deepLink: '/me/marketplace', primary: true },
        ],
      };
    }
  }

  // ==========================================================================
  // 3. GENERAL / FALLBACK INTELLIGENCE
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
        title: 'Why did Rahul get AWS access?',
        createdAt: '2026-08-22T11:45:00Z',
        updatedAt: '2026-08-22T11:45:00Z',
        role: 'HR',
        timeGroup: 'Today',
        messages: [
          {
            id: 'm-1',
            sender: 'user',
            content: 'Why did Rahul get AWS access?',
            timestamp: '11:45 AM',
            status: 'completed',
          },
          {
            id: 'm-2',
            sender: 'assistant',
            content: `**Rahul Sharma** received **AWS Development Sandbox Access** because his role is **Junior Backend Developer** in the **Payments Core** team under the Engineering department.\n\nUnder **Engineering Access Policy #ENG-204**, all Backend Developers are granted isolated AWS Dev IAM access with least-privilege security boundaries upon identity confirmation.`,
            timestamp: '11:45 AM',
            status: 'completed',
            evidence: {
              whyThisDecision: {
                roleReq: 'Backend Developer → AWS Development Sandbox',
                projReq: 'Payments Engine v2 → AWS IAM (Dev Sandbox)',
                policy: 'Engineering Access Policy #ENG-204 (SOC-2 Type II)',
                checks: [
                  { label: 'Role requirement: Backend Developer profile matched', passed: true },
                  { label: 'Project requirement: Payments Core repository', passed: true },
                  { label: 'Policy: Engineering access policy (SOC-2 Type II)', passed: true },
                ],
              },
              deepLink: '/employees/emp-rahul?tab=access',
              deepLinkLabel: "Inspect Rahul's Access Graph",
              tags: ['AWS Cloud', 'RBAC Birthright', 'Engineering Policy'],
            },
            actions: [
              { label: 'View Employee Command Center', actionKey: 'VIEW_PROFILE', deepLink: '/employees/emp-rahul', primary: true },
            ],
          },
        ],
      },
      {
        id: 'conv-hr-2',
        title: 'Who is expert in Jira?',
        createdAt: '2026-08-22T10:30:00Z',
        updatedAt: '2026-08-22T10:30:00Z',
        role: 'HR',
        timeGroup: 'Today',
        messages: [
          {
            id: 'm-3',
            sender: 'user',
            content: 'Who is expert in Jira?',
            timestamp: '10:30 AM',
            status: 'completed',
          },
          {
            id: 'm-4',
            sender: 'assistant',
            content: `The primary Jira administrators and workflow experts are:\n1. **David Kim** (IT Lead — Systems Admin)\n2. **Marcus Vance** (Engineering Manager — Sprint Master)\n3. **Sarah Chen** (People Operations — Workflow Approvals)`,
            timestamp: '10:30 AM',
            status: 'completed',
            actions: [
              { label: 'View IT Tickets', actionKey: 'VIEW_IT', deepLink: '/it/tickets', primary: true },
            ],
          },
        ],
      },
      {
        id: 'conv-hr-3',
        title: 'Onboarding status of Rahul',
        createdAt: '2026-08-22T09:15:00Z',
        updatedAt: '2026-08-22T09:15:00Z',
        role: 'HR',
        timeGroup: 'Today',
        messages: [],
      },
      {
        id: 'conv-hr-4',
        title: 'Resources for Backend Dev',
        createdAt: '2026-08-22T09:02:00Z',
        updatedAt: '2026-08-22T09:02:00Z',
        role: 'HR',
        timeGroup: 'Today',
        messages: [],
      },
      {
        id: 'conv-hr-5',
        title: 'Employees ready for Day 1',
        createdAt: '2026-08-21T18:25:00Z',
        updatedAt: '2026-08-21T18:25:00Z',
        role: 'HR',
        timeGroup: 'Yesterday',
        messages: [],
      },
      {
        id: 'conv-hr-6',
        title: "Why wasn't Figma assigned?",
        createdAt: '2026-08-21T17:40:00Z',
        updatedAt: '2026-08-21T17:40:00Z',
        role: 'HR',
        timeGroup: 'Yesterday',
        messages: [],
      },
      {
        id: 'conv-hr-7',
        title: 'Find Java developers',
        createdAt: '2026-08-21T16:12:00Z',
        updatedAt: '2026-08-21T16:12:00Z',
        role: 'HR',
        timeGroup: 'Yesterday',
        messages: [],
      },
      {
        id: 'conv-hr-8',
        title: 'Access comparison',
        createdAt: '2026-08-18T10:00:00Z',
        updatedAt: '2026-08-18T10:00:00Z',
        role: 'HR',
        timeGroup: 'Earlier',
        messages: [],
      },
      {
        id: 'conv-hr-9',
        title: 'Pending onboardings',
        createdAt: '2026-08-18T09:00:00Z',
        updatedAt: '2026-08-18T09:00:00Z',
        role: 'HR',
        timeGroup: 'Earlier',
        messages: [],
      },
    ];
  }

  // Employee Default Initial Conversations
  return [
    {
      id: 'conv-emp-1',
      title: 'Why did I get AWS & GitHub?',
      createdAt: '2026-08-22T11:45:00Z',
      updatedAt: '2026-08-22T11:45:00Z',
      role: 'EMPLOYEE',
      timeGroup: 'Today',
      messages: [
        {
          id: 'me-1',
          sender: 'user',
          content: 'Why did I get AWS and GitHub access?',
          timestamp: '11:45 AM',
          status: 'completed',
        },
        {
          id: 'me-2',
          sender: 'assistant',
          content: `You received **GitHub** and **AWS Development Sandbox** access because you are a **Backend Developer** working on the **Payments Core** team.\n\nThis gives you access to the code repository and a secure cloud sandbox to test microservices.`,
          timestamp: '11:45 AM',
          status: 'completed',
          evidence: {
            whyThisDecision: {
              roleReq: 'Backend Developer → GitHub & AWS Dev',
              projReq: 'Payments Engine v2 Repository',
              policy: 'Engineering Developer Access Policy',
              checks: [
                { label: 'GitHub Repository Permissions (Write)', passed: true },
                { label: 'AWS IAM Dev Account Assigned', passed: true },
              ],
            },
            deepLink: '/me/tasks',
            deepLinkLabel: 'View Your Active Access',
          },
        },
      ],
    },
    {
      id: 'conv-emp-2',
      title: 'What is Jira?',
      createdAt: '2026-08-22T10:30:00Z',
      updatedAt: '2026-08-22T10:30:00Z',
      role: 'EMPLOYEE',
      timeGroup: 'Today',
      messages: [],
    },
    {
      id: 'conv-emp-3',
      title: 'My onboarding pending tasks',
      createdAt: '2026-08-22T09:15:00Z',
      updatedAt: '2026-08-22T09:15:00Z',
      role: 'EMPLOYEE',
      timeGroup: 'Today',
      messages: [],
    },
    {
      id: 'conv-emp-4',
      title: 'Who is my mentor Marcus?',
      createdAt: '2026-08-21T16:00:00Z',
      updatedAt: '2026-08-21T16:00:00Z',
      role: 'EMPLOYEE',
      timeGroup: 'Yesterday',
      messages: [],
    },
    {
      id: 'conv-emp-5',
      title: 'Requesting Docker license',
      createdAt: '2026-08-18T14:20:00Z',
      updatedAt: '2026-08-18T14:20:00Z',
      role: 'EMPLOYEE',
      timeGroup: 'Earlier',
      messages: [],
    },
  ];
}
