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
}

export function getInitialMockData(): MockDataStore {
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
      createdAt: '2026-08-19T09:10:15Z',
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
      createdAt: '2026-08-19T09:10:15Z',
      refType: 'Approval',
      refId: 'appr-rahul-aws',
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
  };
}
