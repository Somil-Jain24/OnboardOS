import type {
  Employee,
  EmployeeContext,
  RequirementRule,
  OnboardingPlan,
  PlanItem,
  Task,
  Approval,
  ExceptionEvent,
  RiskAssessment,
  AuditLog,
  Ticket,
  Asset,
  KnowledgeDocument,
  NotificationItem,
  TransferRequest,
  OffboardingPlan,
  OffboardingRiskFlag,
  MentorAssignment,
  FirstWeekPlanItem,
  PulseResponse,
  PulseTrendData,
  CommunityPost,
} from '../../types';

export interface MockDataStore {
  employees: Employee[];
  contexts: Record<string, EmployeeContext>;
  rules: RequirementRule[];
  plans: Record<string, OnboardingPlan>;
  tasks: Record<string, Task[]>;
  approvals: Approval[];
  exceptions: ExceptionEvent[];
  riskAssessments: Record<string, RiskAssessment>;
  auditLogs: AuditLog[];
  tickets: Ticket[];
  assets: Asset[];
  knowledgeDocs: KnowledgeDocument[];
  notifications: NotificationItem[];
  transfers: TransferRequest[];
  offboardingPlans: Record<string, OffboardingPlan>;
  offboardingRisks: OffboardingRiskFlag[];
  mentorAssignments: Record<string, MentorAssignment>;
  firstWeekPlans: Record<string, FirstWeekPlanItem[]>;
  pulseResponses: PulseResponse[];
  pulseTrends: PulseTrendData[];
  communityPosts: CommunityPost[];
  birthrightPolicies: import('../../types').BirthrightPolicy[];
  accessPackages: import('../../types').AccessPackage[];
  accessRequests: import('../../types').AccessRequest[];
  accessGrants: import('../../types').AccessGrant[];
  certificationCampaigns: import('../../types').AccessReviewCampaign[];
  sodRules: import('../../types').SoDRule[];
  sodConflicts: import('../../types').SoDConflict[];
  elevationSessions: import('../../types').ElevationSession[];
  identitySources: import('../../types').IdentitySource[];
  reconciliationMismatches: import('../../types').ReconciliationMismatch[];
  scimConnectors: import('../../types').SCIMConnector[];
  externalIdentities: import('../../types').ExternalIdentity[];
  complianceEvidence: import('../../types').ComplianceEvidenceItem[];
  staleAccessItems: import('../../types').StaleAccessItem[];
  devicePostureSignals: import('../../types').DevicePostureSignal[];
  saasLicenses: import('../../types').SaaSLicense[];
  agentIdentities: import('../../types').AgentIdentity[];
  delegatedAdminScopes: import('../../types').DelegatedAdminScope[];
  governanceAnalytics: import('../../types').GovernanceAnalyticsData;
}

const STORAGE_KEY = 'onboardos_persistent_store_v1';

export function saveMockData(store: MockDataStore): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      console.warn('[MockStore] Failed to save state to localStorage:', e);
    }
  }
}

export function clearMockData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getInitialMockData(): MockDataStore {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.employees && parsed.employees.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn('[MockStore] Failed to parse saved state, using default:', e);
      }
    }
  }

  const employees: Employee[] = [
    {
      id: 'emp-rahul',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@onboardos.internal',
      roleId: 'role-backend-jr',
      roleTitle: 'Backend Developer',
      departmentId: 'dept-eng',
      departmentName: 'Engineering',
      teamId: 'team-payments',
      teamName: 'Payments Core',
      projectId: 'proj-payments',
      projectName: 'Payments Engine v2',
      seniority: 'JUNIOR',
      location: 'Bengaluru, India (Hybrid)',
      employmentType: 'FULL_TIME',
      managerId: 'emp-marcus',
      managerName: 'Marcus Vance',
      status: 'ACTIVE',
      startDate: '2026-09-01',
      createdAt: '2026-08-19T09:00:00Z',
      updatedAt: '2026-08-19T10:45:00Z',
    },
    {
      id: 'emp-priya',
      name: 'Priya Mehta',
      roleId: 'role-designer-jr',
      email: 'priya.mehta@onboardos.internal',
      roleTitle: 'UI/UX Designer',
      departmentId: 'dept-design',
      departmentName: 'Design',
      teamId: 'team-product',
      teamName: 'Product Design',
      seniority: 'JUNIOR',
      location: 'San Francisco, USA (Remote)',
      employmentType: 'FULL_TIME',
      managerId: 'emp-marcus',
      managerName: 'Marcus Vance',
      status: 'INVITED',
      startDate: '2026-09-01',
      createdAt: '2026-08-19T09:30:00Z',
      updatedAt: '2026-08-19T09:30:00Z',
    },
    {
      id: 'emp-aman',
      name: 'Aman Verma',
      email: 'aman.verma@onboardos.internal',
      roleId: 'role-hr-mid',
      roleTitle: 'HR Executive',
      departmentId: 'dept-hr',
      departmentName: 'Human Resources',
      teamId: 'team-people',
      teamName: 'People Operations',
      seniority: 'MID',
      location: 'London, UK (Onsite)',
      employmentType: 'FULL_TIME',
      managerId: 'emp-sarah',
      managerName: 'Sarah Chen',
      status: 'ACTIVE',
      startDate: '2026-08-15',
      createdAt: '2026-08-15T09:00:00Z',
      updatedAt: '2026-08-18T17:00:00Z',
    },
  ];

  const contexts: Record<string, EmployeeContext> = {
    'emp-rahul': {
      id: 'ctx-rahul',
      employeeId: 'emp-rahul',
      capturedAt: '2026-08-19T09:00:00Z',
      roleTitle: 'Backend Developer',
      department: 'Engineering',
      team: 'Payments Core',
      seniority: 'JUNIOR',
      location: 'Bengaluru, India (Hybrid)',
      employmentType: 'FULL_TIME',
      managerId: 'emp-marcus',
      managerName: 'Marcus Vance',
      projectId: 'proj-payments',
      projectName: 'Payments Engine v2',
      raw: {
        skills: ['Node.js', 'PostgreSQL', 'TypeScript', 'Docker'],
        securityClearance: 'STANDARD_DEVELOPER',
      },
    },
  };

  const rules: RequirementRule[] = [
    {
      id: 'rule-google-all',
      version: 1,
      effectiveFrom: '2026-01-01T00:00:00Z',
      scope: {},
      requirementName: 'Google Workspace Account',
      category: 'Identity',
      decision: 'REQUIRED',
      riskLevel: 'LOW',
      reasonTemplate: 'Universal identity and mailbox requirement for all corporate staff.',
      createdBy: 'Elena Rostova',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'rule-github-eng',
      version: 1,
      effectiveFrom: '2026-01-01T00:00:00Z',
      scope: { department: 'Engineering' },
      requirementName: 'GitHub Organization & Repo Access',
      category: 'Development',
      decision: 'REQUIRED',
      riskLevel: 'LOW',
      reasonTemplate: 'Source code management and code reviews for software engineers.',
      createdBy: 'Elena Rostova',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'rule-slack-all',
      version: 1,
      effectiveFrom: '2026-01-01T00:00:00Z',
      scope: {},
      requirementName: 'Slack Team Channels',
      category: 'Communication',
      decision: 'REQUIRED',
      riskLevel: 'LOW',
      reasonTemplate: 'Team chat and automated notification channels.',
      createdBy: 'Elena Rostova',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'rule-jira-eng',
      version: 1,
      effectiveFrom: '2026-01-01T00:00:00Z',
      scope: { department: 'Engineering' },
      requirementName: 'Jira Software Project Backlog',
      category: 'Project',
      decision: 'REQUIRED',
      riskLevel: 'LOW',
      reasonTemplate: 'Agile sprint tracking and task ownership for developers.',
      createdBy: 'Elena Rostova',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'rule-aws-jr-eng',
      version: 1,
      effectiveFrom: '2026-01-01T00:00:00Z',
      scope: { department: 'Engineering', seniority: 'JUNIOR' },
      requirementName: 'AWS Production Cloud Access',
      category: 'Cloud',
      decision: 'APPROVAL_REQUIRED',
      approvalChain: ['MANAGER'],
      riskLevel: 'HIGH',
      reasonTemplate: 'Junior engineers require explicit manager authorization prior to cloud production deployment rights.',
      createdBy: 'Elena Rostova',
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];

  const rahulPlanItems: PlanItem[] = [
    {
      id: 'pi-rahul-1',
      planId: 'plan-rahul',
      requirementRuleId: 'rule-google-all',
      name: 'Google Workspace Account',
      category: 'Identity',
      finalDecision: 'REQUIRED',
      reason: 'Universal identity and mailbox requirement for all corporate staff.',
      aiRecommendedDecision: 'REQUIRED',
      aiConfidence: 0.99,
      aiRationale: 'Standard identity bootstrap.',
      riskLevel: 'LOW',
      taskId: 'task-rahul-google',
    },
    {
      id: 'pi-rahul-2',
      planId: 'plan-rahul',
      requirementRuleId: 'rule-github-eng',
      name: 'GitHub Organization & Repo Access',
      category: 'Development',
      finalDecision: 'REQUIRED',
      reason: 'Source code management and code reviews for software engineers.',
      aiRecommendedDecision: 'REQUIRED',
      aiConfidence: 0.98,
      aiRationale: 'Engineering backend engineer daily workflow.',
      riskLevel: 'LOW',
      taskId: 'task-rahul-github',
    },
    {
      id: 'pi-rahul-3',
      planId: 'plan-rahul',
      requirementRuleId: 'rule-slack-all',
      name: 'Slack Team Channels (#payments, #engineering)',
      category: 'Communication',
      finalDecision: 'REQUIRED',
      reason: 'Team chat and automated notification channels.',
      aiRecommendedDecision: 'REQUIRED',
      aiConfidence: 0.99,
      aiRationale: 'Department and team communication channels.',
      riskLevel: 'LOW',
      taskId: 'task-rahul-slack',
    },
    {
      id: 'pi-rahul-4',
      planId: 'plan-rahul',
      requirementRuleId: 'rule-jira-eng',
      name: 'Jira Software Project Backlog',
      category: 'Project',
      finalDecision: 'REQUIRED',
      reason: 'Agile sprint tracking and task ownership for developers.',
      aiRecommendedDecision: 'REQUIRED',
      aiConfidence: 0.96,
      aiRationale: 'Payments sprint backlog assignment.',
      riskLevel: 'LOW',
      taskId: 'task-rahul-jira',
    },
    {
      id: 'pi-rahul-5',
      planId: 'plan-rahul',
      requirementRuleId: 'rule-aws-jr-eng',
      name: 'AWS Production Cloud Access',
      category: 'Cloud',
      finalDecision: 'APPROVAL_REQUIRED',
      reason: 'Junior engineers require explicit manager authorization prior to cloud production deployment rights.',
      aiRecommendedDecision: 'REQUIRED',
      aiConfidence: 0.92,
      aiRationale: 'AI suggested REQUIRED; Rules Engine downgraded to APPROVAL_REQUIRED per least-privilege policy.',
      riskLevel: 'HIGH',
      approvalChain: ['MANAGER'],
      taskId: 'task-rahul-aws',
    },
  ];

  const plans: Record<string, OnboardingPlan> = {
    'emp-rahul': {
      id: 'plan-rahul',
      employeeId: 'emp-rahul',
      employeeContextId: 'ctx-rahul',
      ruleSetVersion: 1,
      generatedAt: '2026-08-19T09:05:00Z',
      status: 'ACTIVE',
      items: rahulPlanItems,
    },
  };

  const tasks: Record<string, Task[]> = {
    'emp-rahul': [
      {
        id: 'task-rahul-google',
        planItemId: 'pi-rahul-1',
        employeeId: 'emp-rahul',
        name: 'Create Google Workspace Mailbox & User',
        category: 'Identity',
        status: 'COMPLETED',
        adapterType: 'GOOGLE',
        attempt: 1,
        idempotencyKey: 'idemp-rahul-google-1',
        createdAt: '2026-08-19T09:10:00Z',
        startedAt: '2026-08-19T09:10:05Z',
        completedAt: '2026-08-19T09:10:07Z',
      },
      {
        id: 'task-rahul-github',
        planItemId: 'pi-rahul-2',
        employeeId: 'emp-rahul',
        name: 'Invite to GitHub Org & Payments Repo',
        category: 'Development',
        status: 'COMPLETED',
        adapterType: 'GITHUB',
        attempt: 1,
        idempotencyKey: 'idemp-rahul-github-1',
        dependsOnTaskIds: ['task-rahul-google'],
        createdAt: '2026-08-19T09:10:08Z',
        startedAt: '2026-08-19T09:10:09Z',
        completedAt: '2026-08-19T09:10:12Z',
      },
      {
        id: 'task-rahul-slack',
        planItemId: 'pi-rahul-3',
        employeeId: 'emp-rahul',
        name: 'Provision Slack User & Add to Channels',
        category: 'Communication',
        status: 'COMPLETED',
        adapterType: 'SLACK',
        attempt: 1,
        idempotencyKey: 'idemp-rahul-slack-1',
        dependsOnTaskIds: ['task-rahul-google'],
        createdAt: '2026-08-19T09:10:08Z',
        startedAt: '2026-08-19T09:10:09Z',
        completedAt: '2026-08-19T09:10:11Z',
      },
      {
        id: 'task-rahul-jira',
        planItemId: 'pi-rahul-4',
        employeeId: 'emp-rahul',
        name: 'Add to Jira Project & Payments Board',
        category: 'Project',
        status: 'FAILED',
        adapterType: 'JIRA',
        attempt: 1,
        idempotencyKey: 'idemp-rahul-jira-1',
        failureReason: 'Rate limit exceeded on Jira Service Management API (HTTP 503).',
        failureCode: 'JIRA_API_RATE_LIMIT',
        impactSummary: 'Blocks 2 downstream tasks (Sprint Backlog Assignment, On-Call Rota Setup).',
        affectedDownstreamIds: ['task-rahul-board', 'task-rahul-sprint'],
        dependsOnTaskIds: ['task-rahul-google'],
        createdAt: '2026-08-19T09:10:08Z',
        startedAt: '2026-08-19T09:10:09Z',
      },
      {
        id: 'task-rahul-board',
        employeeId: 'emp-rahul',
        name: 'Payments Jira Board Sprint Assignment',
        category: 'Project',
        status: 'BLOCKED',
        adapterType: 'JIRA',
        attempt: 0,
        dependsOnTaskIds: ['task-rahul-jira'],
        createdAt: '2026-08-19T09:10:08Z',
      },
      {
        id: 'task-rahul-aws',
        planItemId: 'pi-rahul-5',
        employeeId: 'emp-rahul',
        name: 'AWS Production Cloud Access Grant',
        category: 'Cloud',
        status: 'WAITING_APPROVAL',
        adapterType: 'AWS',
        attempt: 0,
        dependsOnTaskIds: ['task-rahul-google'],
        createdAt: '2026-08-19T09:10:08Z',
      },
    ],
  };

  const approvals: Approval[] = [
    {
      id: 'appr-rahul-aws',
      taskId: 'task-rahul-aws',
      taskName: 'AWS Production Cloud Access Grant',
      employeeId: 'emp-rahul',
      employeeName: 'Rahul Sharma',
      stage: 1,
      approverRole: 'MANAGER',
      approverUserId: 'user-manager-1',
      approverUserName: 'Marcus Vance',
      status: 'PENDING',
      riskLevel: 'HIGH',
      requestedAt: '2026-08-19T09:10:15Z',
      slaTargetAt: '2026-08-19T13:10:15Z',
      reason: 'Junior Backend Developer requesting production cloud access. Manager signoff required.',
    },
  ];

  const exceptions: ExceptionEvent[] = [
    {
      id: 'ex-rahul-jira',
      employeeId: 'emp-rahul',
      employeeName: 'Rahul Sharma',
      taskId: 'task-rahul-jira',
      taskName: 'Add to Jira Project & Payments Board',
      severity: 'CRITICAL',
      title: 'Jira Provisioning HTTP 503 Failure',
      description: 'Jira Adapter encountered rate limit error during user project assignment.',
      impactSummary: 'Blocks 2 downstream tasks on Payments board.',
      createdAt: '2026-08-19T09:10:14Z',
    },
  ];

  const riskAssessments: Record<string, RiskAssessment> = {
    'emp-rahul': {
      id: 'risk-rahul',
      employeeId: 'emp-rahul',
      computedAt: '2026-08-19T10:45:00Z',
      riskScore: 75,
      riskLevel: 'HIGH',
      dayOneReady: false,
      readinessScore: 65,
      factors: [
        {
          factor: 'Active Provisioning Failure',
          weight: 40,
          detail: 'Jira failure is currently halting downstream project backlog assignment.',
          severity: 'HIGH',
        },
        {
          factor: 'Pending Production Privilege Approval',
          weight: 35,
          detail: 'AWS production grant awaiting manager signoff.',
          severity: 'HIGH',
        },
      ],
      readinessBreakdown: {
        criticalTasksTotal: 5,
        criticalTasksComplete: 3,
        requiredAccessTotal: 5,
        requiredAccessComplete: 3,
        requiredTrainingTotal: 1,
        requiredTrainingComplete: 0,
        blockingFailures: 1,
        pendingApprovals: 1,
      },
    },
  };

  const auditLogs: AuditLog[] = [
    {
      id: 'aud-1',
      employeeId: 'emp-rahul',
      employeeName: 'Rahul Sharma',
      actorName: 'System (Orchestrator)',
      actorRole: 'ADMIN',
      action: 'TASK_FAILED',
      entityType: 'Task',
      entityId: 'task-rahul-jira',
      reason: 'Jira Adapter returned HTTP 503 rate limit',
      result: 'FAILED (attempt 1). Downstream tasks set to BLOCKED.',
      createdAt: '2026-08-19T09:10:14Z',
    },
    {
      id: 'aud-2',
      employeeId: 'emp-rahul',
      employeeName: 'Rahul Sharma',
      actorName: 'System (Orchestrator)',
      actorRole: 'ADMIN',
      action: 'TASK_COMPLETED',
      entityType: 'Task',
      entityId: 'task-rahul-github',
      result: 'SUCCESS. User invited to Payments repo.',
      createdAt: '2026-08-19T09:10:12Z',
    },
    {
      id: 'aud-3',
      employeeId: 'emp-rahul',
      employeeName: 'Rahul Sharma',
      actorName: 'System (Orchestrator)',
      actorRole: 'ADMIN',
      action: 'TASK_COMPLETED',
      entityType: 'Task',
      entityId: 'task-rahul-slack',
      result: 'SUCCESS. Added to #engineering and #payments.',
      createdAt: '2026-08-19T09:10:11Z',
    },
    {
      id: 'aud-4',
      employeeId: 'emp-rahul',
      employeeName: 'Rahul Sharma',
      actorName: 'System (Orchestrator)',
      actorRole: 'ADMIN',
      action: 'TASK_COMPLETED',
      entityType: 'Task',
      entityId: 'task-rahul-google',
      result: 'SUCCESS. Google Workspace account initialized.',
      createdAt: '2026-08-19T09:10:07Z',
    },
    {
      id: 'aud-5',
      employeeId: 'emp-rahul',
      employeeName: 'Rahul Sharma',
      actorName: 'Elena Rostova',
      actorRole: 'HR',
      action: 'PLAN_GENERATED',
      entityType: 'OnboardingPlan',
      entityId: 'plan-rahul',
      reason: 'Onboarded Junior Backend Developer',
      result: '5 PlanItems created with deterministic policy overrides.',
      createdAt: '2026-08-19T09:05:00Z',
    },
  ];

  const tickets: Ticket[] = [
    {
      id: 'TICK-101',
      employeeId: 'emp-rahul',
      employeeName: 'Rahul Sharma',
      category: 'Provisioning',
      priority: 'HIGH',
      team: 'IT Operations',
      slaHours: 4,
      status: 'OPEN',
      description: 'Jira board access returning 403 Forbidden due to adapter rate limit.',
      aiClassification: {
        suggestedCategory: 'Access & Provisioning',
        suggestedPriority: 'HIGH',
        confidence: 0.97,
        recommendedActions: ['Run Jira Adapter Idempotent Retry', 'Check API Token Quota'],
      },
      createdAt: '2026-08-19T09:15:00Z',
    },
    {
      id: 'TICK-102',
      employeeId: 'emp-priya',
      employeeName: 'Priya Mehta',
      category: 'Software License',
      priority: 'MEDIUM',
      team: 'IT Operations',
      slaHours: 24,
      status: 'IN_PROGRESS',
      description: 'Figma Enterprise Organization License Invite requested.',
      aiClassification: {
        suggestedCategory: 'Software License',
        suggestedPriority: 'MEDIUM',
        confidence: 0.94,
        recommendedActions: ['Assign seat from Design Figma pool'],
      },
      createdAt: '2026-08-19T09:35:00Z',
    },
  ];

  const assets: Asset[] = [
    {
      id: 'AST-091',
      employeeId: 'emp-rahul',
      employeeName: 'Rahul Sharma',
      type: 'LAPTOP',
      serialNumber: 'C02G894LMD6R',
      model: 'MacBook Pro 16" M3 Max (36GB/1TB)',
      state: 'ASSIGNED',
      assignedAt: '2026-08-19T08:30:00Z',
    },
    {
      id: 'AST-092',
      employeeId: 'emp-priya',
      employeeName: 'Priya Mehta',
      type: 'MONITOR',
      serialNumber: 'CN-0K7938-74261',
      model: 'Dell UltraSharp 27" 4K Monitor',
      state: 'RECEIVED',
      assignedAt: '2026-08-18T14:00:00Z',
    },
  ];

  const knowledgeDocs: KnowledgeDocument[] = [
    {
      id: 'doc-1',
      title: 'Engineering Security & Cloud Deployment Policy',
      category: 'Security',
      source: 'Internal Wiki: /security/cloud-policy',
      content: 'All production cloud resources require least-privilege role assignment. Junior engineers require Engineering Manager authorization before cloud IAM grants are activated.',
      updatedAt: '2026-08-01T00:00:00Z',
    },
    {
      id: 'doc-2',
      title: 'Payments Core Service Architecture & SLA Guide',
      category: 'Architecture',
      source: 'Internal Wiki: /engineering/payments-v2',
      content: 'The Payments Core service handles credit card settlement and webhook verification. Developers require GitHub repository access and Jira Payments backlog assignment.',
      updatedAt: '2026-08-10T00:00:00Z',
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      userId: 'user-hr-1',
      priority: 'CRITICAL',
      title: 'Jira Provisioning Failed for Rahul Sharma',
      body: 'Rate limit error (HTTP 503). 2 downstream tasks are BLOCKED.',
      read: false,
      createdAt: '2026-08-20T09:10:15Z',
      refType: 'Task',
      refId: 'task-rahul-jira',
    },
    {
      id: 'notif-2',
      userId: 'user-manager-1',
      priority: 'HIGH',
      title: 'Manager Approval Required: AWS Production Access',
      body: 'Rahul Sharma (Junior Backend Developer) requested AWS access. SLA: 4 hours remaining.',
      read: false,
      createdAt: '2026-08-20T08:30:00Z',
      refType: 'Approval',
      refId: 'appr-rahul-aws',
    },
    {
      id: 'notif-3',
      userId: 'user-admin-1',
      priority: 'HIGH',
      title: 'Access Review Campaign: Q1 2026 Engineering UAR',
      body: '48 user access review items pending manager certification. 14 days remaining.',
      read: false,
      createdAt: '2026-08-20T07:15:00Z',
      refType: 'Campaign',
      refId: 'camp-q1-2026',
    },
    {
      id: 'notif-4',
      userId: 'user-emp-1',
      priority: 'MEDIUM',
      title: 'Weekly Employee Sentiment Pulse is Ready',
      body: 'Share how your first week onboarding is going with HR Operations.',
      read: false,
      createdAt: '2026-08-19T14:20:00Z',
      refType: 'Pulse',
      refId: 'pulse-week-1',
    },
    {
      id: 'notif-5',
      userId: 'user-admin-1',
      priority: 'MEDIUM',
      title: 'Authoritative Identity Drift Flagged',
      body: 'Workday HRMS job title differs from Okta IdP profile for Devin Larson.',
      read: false,
      createdAt: '2026-08-19T11:00:00Z',
      refType: 'Reconciliation',
      refId: 'recon-devin',
    },
    {
      id: 'notif-6',
      userId: 'user-emp-1',
      priority: 'LOW',
      title: 'Welcome to OnboardOS Community Hub',
      body: 'Meet your mentor Marcus Vance and join your team discussion channels.',
      read: true,
      createdAt: '2026-08-18T10:00:00Z',
      refType: 'Community',
      refId: 'post-welcome',
    },
  ];

  const transfers: TransferRequest[] = [];

  const offboardingPlans: Record<string, OffboardingPlan> = {};

  const offboardingRisks: OffboardingRiskFlag[] = [
    {
      id: 'risk-flag-1',
      employeeId: 'emp-exiting-1',
      employeeName: 'James Wilson',
      system: 'GitHub Enterprise',
      detectedAt: '2026-08-17T11:00:00Z',
      description: 'Employee status changed to EXITING 2 days ago, but write access to payments-backend repository remains active.',
      severity: 'CRITICAL',
    },
  ];

  const mentorAssignments: Record<string, MentorAssignment> = {
    'emp-rahul': {
      id: 'mentor-rahul',
      employeeId: 'emp-rahul',
      employeeName: 'Rahul Sharma',
      mentorName: 'Kavita Rao',
      mentorRole: 'Staff Backend Engineer',
      mentorEmail: 'kavita.rao@onboardos.internal',
      mentorSlack: '@kavita.rao',
      buddyName: 'Alex Rivera',
      buddyRole: 'Product Designer',
      buddyEmail: 'alex.rivera@onboardos.internal',
      buddySlack: '@alex.rivera',
      assignedAt: '2026-08-19T09:00:00Z',
      scheduledSyncs: [
        { date: '2026-09-01', time: '11:00 AM', topic: 'Welcome & Codebase Tour', status: 'SCHEDULED' },
        { date: '2026-09-02', time: '03:00 PM', topic: 'Architecture & CI/CD Walkthrough', status: 'SCHEDULED' },
        { date: '2026-09-04', time: '02:00 PM', topic: 'First PR Review & Retro', status: 'SCHEDULED' },
      ],
    },
  };

  const firstWeekPlans: Record<string, FirstWeekPlanItem[]> = {
    'emp-rahul': [
      { id: 'fw-1', employeeId: 'emp-rahul', day: 1, time: '09:30 AM', title: 'Hardware Unboxing & Security Keys', description: 'Configure YubiKey and password manager.', category: 'SETUP', completed: true },
      { id: 'fw-2', employeeId: 'emp-rahul', day: 1, time: '11:00 AM', title: 'Welcome 1:1 with Marcus Vance', description: 'Overview of Q3 Payments milestones and team norms.', category: 'MEETING', completed: false },
      { id: 'fw-3', employeeId: 'emp-rahul', day: 1, time: '01:00 PM', title: 'Team Welcome Lunch', description: 'Casual lunch with the Payments Core pod.', category: 'MEETING', completed: false },
      { id: 'fw-4', employeeId: 'emp-rahul', day: 2, time: '10:00 AM', title: 'Payments Microservices Deep Dive', description: 'Architecture walkthrough with Kavita Rao.', category: 'TRAINING', completed: false },
      { id: 'fw-5', employeeId: 'emp-rahul', day: 3, time: '02:00 PM', title: 'Submit First Pull Request', description: 'Fix Good First Issue in payments-backend repo.', category: 'SETUP', completed: false },
    ],
  };

  const pulseResponses: PulseResponse[] = [];

  const pulseTrends: PulseTrendData[] = [
    { week: 'Week 30', greatPercent: 75, goodPercent: 15, okayPercent: 10, strugglingPercent: 0, totalResponses: 20 },
    { week: 'Week 31', greatPercent: 80, goodPercent: 15, okayPercent: 5, strugglingPercent: 0, totalResponses: 22 },
    { week: 'Week 32', greatPercent: 70, goodPercent: 20, okayPercent: 10, strugglingPercent: 0, totalResponses: 18 },
  ];

  const communityPosts: CommunityPost[] = [
    {
      id: 'post-1',
      authorName: 'Sarah Chen',
      authorRole: 'HR Operations Lead',
      type: 'ANNOUNCEMENT',
      title: 'Welcome our Q3 New Hires!',
      body: 'Please join us in welcoming Rahul Sharma (Engineering), Priya Mehta (Design), and Aman Verma (HR) to the team! 🎉',
      createdAt: '2026-08-19T09:00:00Z',
      likesCount: 14,
      commentsCount: 3,
    },
  ];

  const birthrightPolicies: import('../../types').BirthrightPolicy[] = [
    {
      id: 'POL-BR-001',
      name: 'Engineering Baseline Birthright',
      description: 'Standard baseline developer collaboration tools auto-provisioned Day-1 for all full-time engineering hires.',
      policyType: 'BIRTHRIGHT',
      status: 'ACTIVE',
      priority: 10,
      version: 1,
      updatedAt: '2026-08-19T10:00:00Z',
      author: 'Security Policy Admin',
      conditions: [
        { field: 'department', operator: 'EQUALS', value: 'Engineering' },
        { field: 'employmentType', operator: 'EQUALS', value: 'FULL_TIME' },
      ],
      grantedEntitlements: [
        { id: 'ent-gw-1', name: 'Google Workspace Account', app: 'Google Workspace', accessType: 'Standard User', riskLevel: 'LOW', isBirthright: true, requiresApproval: false, description: 'Corporate email, calendar, and Google Drive access' },
        { id: 'ent-slack-1', name: 'Slack Engineering Channels', app: 'Slack', accessType: 'Member', riskLevel: 'LOW', isBirthright: true, requiresApproval: false, description: 'Default workspace member + #engineering, #dev-announcements' },
        { id: 'ent-gh-1', name: 'GitHub Organization Member', app: 'GitHub', accessType: 'Read/Write (Base)', riskLevel: 'LOW', isBirthright: true, requiresApproval: false, description: 'Base organization membership and internal repo read' },
        { id: 'ent-jira-1', name: 'Jira Software Standard', app: 'Jira', accessType: 'Contributor', riskLevel: 'LOW', isBirthright: true, requiresApproval: false, description: 'Issue creation and sprint board tracking' },
      ],
    },
    {
      id: 'POL-BR-002',
      name: 'Payments Core Team Scoped Repositories',
      description: 'Authorizes read/write permissions to sensitive financial and checkout transaction repositories for Payments team members.',
      policyType: 'BIRTHRIGHT',
      status: 'ACTIVE',
      priority: 20,
      version: 1,
      updatedAt: '2026-08-19T10:30:00Z',
      author: 'Engineering VP',
      conditions: [
        { field: 'department', operator: 'EQUALS', value: 'Engineering' },
        { field: 'team', operator: 'EQUALS', value: 'Payments' },
      ],
      grantedEntitlements: [
        { id: 'ent-gh-pay-api', name: 'payments-api Repository', app: 'GitHub', accessType: 'Write / PR Contributor', riskLevel: 'MEDIUM', isBirthright: true, requiresApproval: false, description: 'Direct commit via PR to core payment gateway microservices' },
        { id: 'ent-gh-pay-web', name: 'checkout-web Repository', app: 'GitHub', accessType: 'Write / PR Contributor', riskLevel: 'MEDIUM', isBirthright: true, requiresApproval: false, description: 'Checkout web UI codebase' },
        { id: 'ent-aws-dev-pay', name: 'AWS Development Sandbox (Payments)', app: 'AWS', accessType: 'Dev IAM Role', riskLevel: 'LOW', isBirthright: true, requiresApproval: false, description: 'Isolated development environment for payment engine testing' },
      ],
    },
    {
      id: 'POL-GATED-003',
      name: 'Production Cloud & Database Elevation Policy',
      description: 'Mandatory approval gate for any production AWS account, Kubernetes clusters, or live database write access.',
      policyType: 'APPROVAL_REQUIRED',
      status: 'ACTIVE',
      priority: 100,
      version: 2,
      updatedAt: '2026-08-18T14:00:00Z',
      author: 'Chief Information Security Officer',
      conditions: [
        { field: 'department', operator: 'EQUALS', value: 'Engineering' },
        { field: 'roleTitle', operator: 'CONTAINS', value: 'Developer' },
      ],
      grantedEntitlements: [
        { id: 'ent-aws-prod', name: 'AWS Production Read/Write', app: 'AWS', accessType: 'Prod Admin / Ops', riskLevel: 'CRITICAL' as any, isBirthright: false, requiresApproval: true, ttlHours: 24, description: 'Live production VPC and infrastructure access' },
        { id: 'ent-db-prod', name: 'Production Database Client', app: 'Database', accessType: 'Direct Connection', riskLevel: 'CRITICAL' as any, isBirthright: false, requiresApproval: true, ttlHours: 8, description: 'Live PostgreSQL production cluster query access' },
      ],
      approvalChain: [
        { step: 1, approverRole: 'MANAGER', slaHours: 24 },
        { step: 2, approverRole: 'SECURITY', slaHours: 8 },
      ],
    },
    {
      id: 'POL-BR-004',
      name: 'Product Design Suite Birthright',
      description: 'Automated workspace provisioning for product designers across Figma, Miro, and Adobe Creative Cloud.',
      policyType: 'BIRTHRIGHT',
      status: 'ACTIVE',
      priority: 15,
      version: 1,
      updatedAt: '2026-08-17T11:00:00Z',
      author: 'Design Operations',
      conditions: [
        { field: 'department', operator: 'EQUALS', value: 'Design' },
      ],
      grantedEntitlements: [
        { id: 'ent-figma-1', name: 'Figma Enterprise Organization', app: 'Figma', accessType: 'Editor License', riskLevel: 'LOW', isBirthright: true, requiresApproval: false, description: 'Design system library access and UI/UX editor' },
        { id: 'ent-miro-1', name: 'Miro Team Workspace', app: 'Miro', accessType: 'Member', riskLevel: 'LOW', isBirthright: true, requiresApproval: false, description: 'Collaborative wireframing and user journey mapping' },
      ],
    },
    {
      id: 'POL-BR-005',
      name: 'HR & People Operations Baseline',
      description: 'Provisioning for HR personnel into employee directories and onboarding workflow operations.',
      policyType: 'BIRTHRIGHT',
      status: 'ACTIVE',
      priority: 15,
      version: 1,
      updatedAt: '2026-08-16T15:00:00Z',
      author: 'Head of People',
      conditions: [
        { field: 'department', operator: 'EQUALS', value: 'HR' },
      ],
      grantedEntitlements: [
        { id: 'ent-hris-1', name: 'Workday HRIS Portal', app: 'Workday', accessType: 'HR Specialist', riskLevel: 'HIGH', isBirthright: true, requiresApproval: false, description: 'Employee records management and compensation lookup' },
        { id: 'ent-bg-1', name: 'Checkr Background Portal', app: 'Checkr', accessType: 'Requester', riskLevel: 'MEDIUM', isBirthright: true, requiresApproval: false, description: 'Background verification report audit' },
      ],
    },
    {
      id: 'POL-TIME-006',
      name: 'Contractor Restricted 90-Day Baseline',
      description: 'Enforces time-bound access limits (90-day expiry) and restricts external contractors from sensitive internal repositories.',
      policyType: 'TIME_BOUND',
      status: 'ACTIVE',
      priority: 50,
      version: 1,
      updatedAt: '2026-08-15T09:00:00Z',
      author: 'Legal & InfoSec',
      conditions: [
        { field: 'employmentType', operator: 'EQUALS', value: 'CONTRACT' },
      ],
      grantedEntitlements: [
        { id: 'ent-gw-ext', name: 'Google Workspace (External Tagged)', app: 'Google Workspace', accessType: 'Guest Domain', riskLevel: 'LOW', isBirthright: true, requiresApproval: false, ttlHours: 2160, description: '90-day time-bound contractor mailbox' },
        { id: 'ent-slack-guest', name: 'Slack Single-Channel Guest', app: 'Slack', accessType: 'Multi-Channel Guest', riskLevel: 'LOW', isBirthright: true, requiresApproval: true, ttlHours: 2160, description: 'Channel-specific guest restricted from public rooms' },
      ],
    },
  ];

  const accessPackages: import('../../types').AccessPackage[] = [
    {
      id: 'PKG-PAY-DEV',
      name: 'Payments Core Developer Bundle',
      code: 'DEV-PAY-01',
      description: 'Comprehensive repository, database sandbox, and pipeline permissions for engineers contributing to payment transaction flows.',
      category: 'DEVELOPMENT',
      riskLevel: 'MEDIUM',
      ownerName: 'Marcus Vance',
      ownerEmail: 'marcus.vance@onboardos.internal',
      maxDurationDays: 180,
      reviewFrequencyDays: 90,
      requestCount: 14,
      activeGrantCount: 8,
      availableToScopes: { departments: ['Engineering'], teams: ['Payments', 'Core Infra'] },
      approvalStages: [
        { stage: 1, approverRole: 'MANAGER', slaHours: 24 },
        { stage: 2, approverRole: 'RESOURCE_OWNER', slaHours: 24 },
      ],
      entitlements: [
        { id: 'pe-1', name: 'payments-api repo', app: 'GitHub', type: 'REPO_PERM', permission: 'Write (PR Merge)', riskLevel: 'MEDIUM' },
        { id: 'pe-2', name: 'checkout-web repo', app: 'GitHub', type: 'REPO_PERM', permission: 'Write', riskLevel: 'LOW' },
        { id: 'pe-3', name: 'AWS Payments Dev Sandbox', app: 'AWS', type: 'CLOUD_ROLE', permission: 'PowerUserDev', riskLevel: 'LOW' },
        { id: 'pe-4', name: 'Jira PAYMENTS Board', app: 'Jira', type: 'APP_ROLE', permission: 'Sprint Contributor', riskLevel: 'LOW' },
      ],
    },
    {
      id: 'PKG-PROD-OPS',
      name: 'Production Cloud Operations & Superuser',
      code: 'INFRA-PROD-99',
      description: 'Elevated production environment access including Kubernetes cluster management, live VPC routing, and production database client.',
      category: 'INFRASTRUCTURE',
      riskLevel: 'CRITICAL' as any,
      ownerName: 'CISO / Cloud Lead',
      ownerEmail: 'security-leads@onboardos.internal',
      maxDurationDays: 30,
      reviewFrequencyDays: 30,
      requestCount: 5,
      activeGrantCount: 2,
      availableToScopes: { departments: ['Engineering'], roles: ['Staff Engineer', 'DevOps Specialist', 'Backend Developer'] },
      approvalStages: [
        { stage: 1, approverRole: 'MANAGER', slaHours: 12 },
        { stage: 2, approverRole: 'SECURITY', slaHours: 8 },
      ],
      entitlements: [
        { id: 'pe-5', name: 'AWS Production Management Console', app: 'AWS', type: 'CLOUD_ROLE', permission: 'AdministratorAccess', riskLevel: 'CRITICAL' as any },
        { id: 'pe-6', name: 'Production PostgreSQL Cluster', app: 'Database', type: 'APP_ROLE', permission: 'DB_SUPERUSER', riskLevel: 'CRITICAL' as any },
      ],
    },
    {
      id: 'PKG-FIN-AP',
      name: 'Accounts Payable & Vendor Ledger',
      code: 'FIN-AP-02',
      description: 'Vendor invoice creation, batch reconciliation, and bank payout authorization suite.',
      category: 'FINANCE',
      riskLevel: 'HIGH',
      ownerName: 'Head of Finance',
      ownerEmail: 'finance-director@onboardos.internal',
      maxDurationDays: 365,
      reviewFrequencyDays: 90,
      requestCount: 3,
      activeGrantCount: 2,
      availableToScopes: { departments: ['Finance'] },
      approvalStages: [
        { stage: 1, approverRole: 'MANAGER', slaHours: 24 },
        { stage: 2, approverRole: 'RESOURCE_OWNER', slaHours: 48 },
      ],
      entitlements: [
        { id: 'pe-7', name: 'NetSuite AP Module', app: 'NetSuite', type: 'APP_ROLE', permission: 'Create Invoice & Bill', riskLevel: 'HIGH' },
        { id: 'pe-8', name: 'Stripe Corporate Billing', app: 'Stripe', type: 'APP_ROLE', permission: 'Payout Reviewer', riskLevel: 'HIGH' },
      ],
    },
  ];

  const accessRequests: import('../../types').AccessRequest[] = [
    {
      id: 'REQ-2026-0081',
      packageId: 'PKG-PROD-OPS',
      packageName: 'Production Cloud Operations & Superuser',
      packageCategory: 'INFRASTRUCTURE',
      riskLevel: 'CRITICAL' as any,
      requesterId: 'emp-rahul',
      requesterName: 'Rahul Sharma',
      requesterRole: 'Backend Developer',
      requesterDepartment: 'Engineering',
      justification: 'Need 2-day elevated VPC troubleshooting access for Payments Gateway v2 deployment rollout.',
      durationDays: 2,
      status: 'PENDING',
      requestedAt: '2026-08-20T08:30:00Z',
      currentStage: 1,
      totalStages: 2,
      approvers: [
        { stage: 1, approverName: 'Marcus Vance', approverRole: 'MANAGER', status: 'PENDING' },
        { stage: 2, approverName: 'Elena Rostova', approverRole: 'SECURITY', status: 'PENDING' },
      ],
      sodConflictsDetected: ['Potential SoD Warning: Requester has Development Commit rights.'],
    },
    {
      id: 'REQ-2026-0079',
      packageId: 'PKG-PAY-DEV',
      packageName: 'Payments Core Developer Bundle',
      packageCategory: 'DEVELOPMENT',
      riskLevel: 'MEDIUM',
      requesterId: 'emp-priya',
      requesterName: 'Priya Mehta',
      requesterRole: 'UI/UX Designer',
      requesterDepartment: 'Design',
      justification: 'Design system tokens validation in checkout-web repository.',
      durationDays: 14,
      status: 'APPROVED',
      requestedAt: '2026-08-19T14:15:00Z',
      currentStage: 2,
      totalStages: 2,
      approvers: [
        { stage: 1, approverName: 'Marcus Vance', approverRole: 'MANAGER', status: 'APPROVED', decisionDate: '2026-08-19T15:00:00Z' },
        { stage: 2, approverName: 'Marcus Vance', approverRole: 'RESOURCE_OWNER', status: 'APPROVED', decisionDate: '2026-08-19T15:30:00Z' },
      ],
    },
  ];

  const accessGrants: import('../../types').AccessGrant[] = [
    {
      id: 'GNT-901',
      employeeId: 'emp-rahul',
      employeeName: 'Rahul Sharma',
      employeeEmail: 'rahul.sharma@onboardos.internal',
      packageId: 'PKG-PAY-DEV',
      packageName: 'Payments Core Developer Bundle',
      entitlementName: 'payments-api Write Access',
      app: 'GitHub',
      grantedAt: '2026-08-19T10:00:00Z',
      expiresAt: '2027-02-15T10:00:00Z',
      remainingHours: 4300,
      status: 'ACTIVE',
      grantedBy: 'Birthright Policy (POL-BR-002)',
      renewalEligible: true,
      riskLevel: 'MEDIUM',
    },
    {
      id: 'GNT-902',
      employeeId: 'emp-rahul',
      employeeName: 'Rahul Sharma',
      employeeEmail: 'rahul.sharma@onboardos.internal',
      packageName: 'JIT Emergency DB Session',
      entitlementName: 'Production Read Replica Query',
      app: 'Database',
      grantedAt: '2026-08-20T12:00:00Z',
      expiresAt: '2026-08-20T16:00:00Z',
      remainingHours: 3,
      status: 'EXPIRING_SOON',
      grantedBy: 'JIT Elevation Request (ELV-881)',
      renewalEligible: false,
      riskLevel: 'HIGH',
    },
  ];

  const certificationCampaigns: import('../../types').AccessReviewCampaign[] = [
    {
      id: 'CMP-2026-Q3-SEC',
      name: 'Q3 Enterprise Security & Sensitive Access Certification',
      scope: 'All employees holding AWS Prod, GitHub Write, or HRIS Access',
      deadline: '2026-09-15T23:59:59Z',
      status: 'ACTIVE',
      reviewerRole: 'MANAGER',
      totalItems: 8,
      reviewedItems: 4,
      revokedItems: 1,
      createdAt: '2026-08-15T00:00:00Z',
      items: [
        {
          id: 'REV-ITEM-1',
          campaignId: 'CMP-2026-Q3-SEC',
          employeeId: 'emp-rahul',
          employeeName: 'Rahul Sharma',
          employeeRole: 'Backend Developer',
          department: 'Engineering',
          entitlementName: 'payments-api Repository Write',
          app: 'GitHub',
          sourcePolicyOrRequest: 'Birthright Policy (POL-BR-002)',
          grantedAt: '2026-08-19T10:00:00Z',
          lastUsedAt: '2026-08-20T14:30:00Z',
          riskLevel: 'MEDIUM',
          peerComparison: '94% of Backend Developers in Payments have this access (Normal)',
        },
        {
          id: 'REV-ITEM-2',
          campaignId: 'CMP-2026-Q3-SEC',
          employeeId: 'emp-rahul',
          employeeName: 'Rahul Sharma',
          employeeRole: 'Backend Developer',
          department: 'Engineering',
          entitlementName: 'AWS Development Sandbox',
          app: 'AWS',
          sourcePolicyOrRequest: 'Birthright Policy (POL-BR-002)',
          grantedAt: '2026-08-19T10:00:00Z',
          lastUsedAt: '2026-08-20T13:00:00Z',
          riskLevel: 'LOW',
          peerComparison: '100% of Engineering have this access',
        },
        {
          id: 'REV-ITEM-3',
          campaignId: 'CMP-2026-Q3-SEC',
          employeeId: 'emp-priya',
          employeeName: 'Priya Mehta',
          employeeRole: 'UI/UX Designer',
          department: 'Design',
          entitlementName: 'Figma Enterprise Editor License',
          app: 'Figma',
          sourcePolicyOrRequest: 'Birthright Policy (POL-BR-004)',
          grantedAt: '2026-08-19T09:30:00Z',
          lastUsedAt: '2026-08-20T11:00:00Z',
          riskLevel: 'LOW',
          peerComparison: '100% of Designers have this access',
        },
      ],
    },
  ];

  const sodRules: import('../../types').SoDRule[] = [
    {
      id: 'SOD-001',
      name: 'Developer Code Commit vs. Production Cluster Admin',
      description: 'Prevents the same individual from both committing unreviewed code and administering live production deployments.',
      riskLevel: 'CRITICAL',
      conflictingEntitlements: {
        entitlementA: 'payments-api Repository Write',
        appA: 'GitHub',
        entitlementB: 'AWS Production Administrator',
        appB: 'AWS',
      },
      enforcementAction: 'SECURITY_OVERRIDE_REQUIRED',
      compensatingControlRequired: true,
    },
    {
      id: 'SOD-002',
      name: 'Vendor Invoice Creation vs. Payout Release',
      description: 'Prevents fraudulent payout loops by prohibiting invoice creators from releasing corporate bank funds.',
      riskLevel: 'CRITICAL',
      conflictingEntitlements: {
        entitlementA: 'NetSuite Create Invoice',
        appA: 'NetSuite',
        entitlementB: 'Stripe Payout Release',
        appB: 'Stripe',
      },
      enforcementAction: 'HARD_DENY',
      compensatingControlRequired: false,
    },
  ];

  const sodConflicts: import('../../types').SoDConflict[] = [
    {
      id: 'SOD-CNF-101',
      ruleId: 'SOD-001',
      ruleName: 'Developer Code Commit vs. Production Cluster Admin',
      employeeId: 'emp-rahul',
      employeeName: 'Rahul Sharma',
      department: 'Engineering',
      existingEntitlement: 'payments-api Repository Write (GitHub)',
      conflictingRequestedEntitlement: 'AWS Production Management Console (AWS)',
      riskLevel: 'CRITICAL',
      status: 'BLOCKED_REQUEST',
      detectedAt: '2026-08-20T08:30:00Z',
      compensatingControlNote: 'Requires mandatory 2-person code review and ephemeral 4-hour session limits if security exception is approved.',
    },
  ];

  const elevationSessions: import('../../types').ElevationSession[] = [
    {
      id: 'ELV-881',
      employeeId: 'emp-rahul',
      employeeName: 'Rahul Sharma',
      roleTitle: 'Backend Developer',
      targetSystem: 'AWS Production (us-east-1)',
      privilegedRole: 'CloudOps Break-Glass On-Call',
      durationMinutes: 120,
      startedAt: '2026-08-20T14:00:00Z',
      expiresAt: '2026-08-20T16:00:00Z',
      remainingMinutes: 65,
      reason: 'Investigate incident INC-4401 payment webhook latency spikes',
      isEmergencyBreakGlass: true,
      status: 'ACTIVE',
      approvedBy: 'Auto-Approved under Emergency On-Call Policy',
      auditSessionId: 'AUD-SESSION-9921',
    },
  ];

  const identitySources: import('../../types').IdentitySource[] = [
    {
      id: 'SRC-WORKDAY',
      name: 'Workday HRIS (Authoritative Source of Truth)',
      type: 'HRMS',
      isAuthoritative: true,
      lastSyncAt: '2026-08-20T14:30:00Z',
      accountCount: 1248,
      status: 'HEALTHY',
    },
    {
      id: 'SRC-OKTA',
      name: 'Okta Universal Directory',
      type: 'IDP',
      isAuthoritative: false,
      lastSyncAt: '2026-08-20T14:30:00Z',
      accountCount: 1247,
      status: 'HEALTHY',
    },
    {
      id: 'SRC-ENTRA',
      name: 'Microsoft Entra ID (Azure AD)',
      type: 'DIRECTORY',
      isAuthoritative: false,
      lastSyncAt: '2026-08-20T14:15:00Z',
      accountCount: 1246,
      status: 'DRIFT_DETECTED',
    },
  ];

  const reconciliationMismatches: import('../../types').ReconciliationMismatch[] = [
    {
      id: 'MISMATCH-01',
      employeeId: 'emp-rahul',
      employeeName: 'Rahul Sharma',
      attribute: 'jobTitle',
      authoritativeValue: 'Backend Developer',
      targetSystem: 'Microsoft Entra ID',
      targetSystemValue: 'Associate Engineer (Stale)',
      detectedAt: '2026-08-20T14:15:00Z',
      status: 'UNRESOLVED',
      recommendedAction: 'Sync authoritative Workday title to Entra ID User Object',
    },
  ];

  const scimConnectors: import('../../types').SCIMConnector[] = [
    {
      id: 'SCIM-GW',
      appName: 'Google Workspace',
      endpointUrl: 'https://admin.googleapis.com/scim/v2/Users',
      scimVersion: 'SCIM 2.0',
      authType: 'OAUTH2',
      supportsUsers: true,
      supportsGroups: true,
      lastHealthCheck: '2026-08-20T14:50:00Z',
      syncSuccessRate: 99.8,
      totalSyncedUsers: 1248,
      status: 'ONLINE',
    },
    {
      id: 'SCIM-SLACK',
      appName: 'Slack Enterprise Grid',
      endpointUrl: 'https://api.slack.com/scim/v2/Users',
      scimVersion: 'SCIM 2.0',
      authType: 'BEARER_TOKEN',
      supportsUsers: true,
      supportsGroups: true,
      lastHealthCheck: '2026-08-20T14:50:00Z',
      syncSuccessRate: 100,
      totalSyncedUsers: 1248,
      status: 'ONLINE',
    },
  ];

  const externalIdentities: import('../../types').ExternalIdentity[] = [
    {
      id: 'EXT-001',
      name: 'Alex Rivera',
      email: 'alex.rivera.ext@partner-agency.com',
      organization: 'Apex Software Consultants',
      identityType: 'CONTRACTOR',
      sponsorName: 'Marcus Vance',
      sponsorEmail: 'marcus.vance@onboardos.internal',
      startDate: '2026-07-01',
      expirationDate: '2026-10-01',
      daysRemaining: 42,
      assignedPackages: ['Contractor Restricted 90-Day Baseline'],
      status: 'ACTIVE',
      businessPurpose: 'Contract backend performance optimization for Q3',
    },
  ];

  const complianceEvidence: import('../../types').ComplianceEvidenceItem[] = [
    {
      id: 'EVD-9921',
      timestamp: '2026-08-20T14:00:00Z',
      employeeName: 'Rahul Sharma',
      employeeId: 'emp-rahul',
      action: 'ELEVATE',
      entitlement: 'CloudOps Break-Glass On-Call (AWS)',
      system: 'AWS Production',
      authorizedByPolicy: 'Emergency On-Call JIT Elevation Policy',
      approvedBy: 'System Auto-Rule (On-Call PagerDuty Sync)',
      workflowId: 'WF-JIT-881',
      evidenceChecksum: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    },
    {
      id: 'EVD-9918',
      timestamp: '2026-08-19T10:00:00Z',
      employeeName: 'Rahul Sharma',
      employeeId: 'emp-rahul',
      action: 'GRANT',
      entitlement: 'payments-api Repository Write',
      system: 'GitHub',
      authorizedByPolicy: 'Birthright Policy (POL-BR-002)',
      approvedBy: 'Deterministic Rules Engine v1.0',
      workflowId: 'WF-ONB-emp-rahul-01',
      evidenceChecksum: 'sha256:9c81b2767ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d8841',
    },
  ];

  const staleAccessItems: import('../../types').StaleAccessItem[] = [
    {
      id: 'STALE-001',
      employeeId: 'emp-marcus',
      employeeName: 'Marcus Vance',
      roleTitle: 'Engineering Director',
      department: 'Engineering',
      entitlementName: 'Figma Enterprise Editor License',
      app: 'Figma',
      daysInactive: 104,
      lastActivityAt: '2026-05-08T10:00:00Z',
      monthlyCostUsd: 45,
      riskScore: 35,
      recommendation: 'REVOKE_IMMEDIATE',
      status: 'FLAGGED',
    },
    {
      id: 'STALE-002',
      employeeId: 'emp-aman',
      employeeName: 'Aman Verma',
      roleTitle: 'HR Executive',
      department: 'HR',
      entitlementName: 'AWS Development Sandbox',
      app: 'AWS',
      daysInactive: 180,
      lastActivityAt: '2026-02-21T16:00:00Z',
      monthlyCostUsd: 85,
      riskScore: 75,
      recommendation: 'REVOKE_IMMEDIATE',
      status: 'FLAGGED',
    },
  ];

  const devicePostureSignals: import('../../types').DevicePostureSignal[] = [
    {
      deviceId: 'DEV-MBP-881',
      employeeId: 'emp-rahul',
      employeeName: 'Rahul Sharma',
      deviceType: 'MacBook Pro',
      managementStatus: 'MANAGED',
      complianceStatus: 'COMPLIANT',
      diskEncrypted: true,
      osVersion: 'macOS Sonoma 14.6',
      lastCheckinAt: '2026-08-20T14:45:00Z',
      trustScore: 98,
    },
    {
      deviceId: 'DEV-BYOD-102',
      employeeId: 'emp-priya',
      employeeName: 'Priya Mehta',
      deviceType: 'Personal Laptop (BYOD)',
      managementStatus: 'UNMANAGED',
      complianceStatus: 'NON_COMPLIANT',
      diskEncrypted: false,
      osVersion: 'Windows 11 Home',
      lastCheckinAt: '2026-08-20T09:00:00Z',
      trustScore: 42,
    },
  ];

  const saasLicenses: import('../../types').SaaSLicense[] = [
    {
      id: 'LIC-FIGMA',
      appName: 'Figma Enterprise',
      tier: 'Enterprise Editor',
      totalSeats: 50,
      assignedSeats: 46,
      inactiveSeats30d: 12,
      costPerSeatMonthly: 45,
      potentialMonthlySavings: 540,
      status: 'RECLAIM_RECOMMENDED',
    },
    {
      id: 'LIC-GH',
      appName: 'GitHub Enterprise',
      tier: 'Enterprise Cloud',
      totalSeats: 200,
      assignedSeats: 185,
      inactiveSeats30d: 8,
      costPerSeatMonthly: 21,
      potentialMonthlySavings: 168,
      status: 'OPTIMAL',
    },
  ];

  const agentIdentities: import('../../types').AgentIdentity[] = [
    {
      id: 'AGT-ONB-BOT',
      name: 'OnboardOS Provisioning Orchestrator Bot',
      type: 'AI_AGENT',
      ownerName: 'Security Automation Team',
      ownerEmail: 'secops@onboardos.internal',
      allowedTools: ['Google Workspace API', 'Slack SCIM', 'GitHub API', 'Jira API'],
      maxPrivilegeLevel: 'SCOPED_WRITE',
      environment: 'PRODUCTION',
      status: 'ACTIVE',
      lastRunAt: '2026-08-20T14:50:00Z',
    },
  ];

  const delegatedAdminScopes: import('../../types').DelegatedAdminScope[] = [
    {
      id: 'SCOPE-01',
      adminName: 'Marcus Vance',
      adminEmail: 'marcus.vance@onboardos.internal',
      scopeType: 'APPLICATION_OWNER',
      assignedScope: 'Payments Repository & AWS Sandbox Suite',
      canApprove: true,
      canReview: true,
      canManagePolicies: false,
    },
  ];

  const governanceAnalytics: import('../../types').GovernanceAnalyticsData = {
    day1ReadinessRate: 98.4,
    medianOnboardingDays: 1.2,
    accessRequestAverageHours: 3.4,
    reviewCompletionRate: 96.2,
    standingPrivilegeCount: 4,
    sodConflictsPrevented: 19,
    staleEntitlementsReclaimed: 42,
    monthlyLicenseSavingsUsd: 2840,
  };

  return {
    employees,
    contexts,
    rules,
    plans,
    tasks,
    approvals,
    exceptions,
    riskAssessments,
    auditLogs,
    tickets,
    assets,
    knowledgeDocs,
    notifications,
    transfers,
    offboardingPlans,
    offboardingRisks,
    mentorAssignments,
    firstWeekPlans,
    pulseResponses,
    pulseTrends,
    communityPosts,
    birthrightPolicies,
    accessPackages,
    accessRequests,
    accessGrants,
    certificationCampaigns,
    sodRules,
    sodConflicts,
    elevationSessions,
    identitySources,
    reconciliationMismatches,
    scimConnectors,
    externalIdentities,
    complianceEvidence,
    staleAccessItems,
    devicePostureSignals,
    saasLicenses,
    agentIdentities,
    delegatedAdminScopes,
    governanceAnalytics,
  };
}


