import type {
  Employee,
  EmployeeContext,
  RequirementRule,
  OnboardingPlan,
  PlanItem,
  Task,
  TaskDependency,
  Approval,
  ExceptionEvent,
  RiskAssessment,
  AuditLog,
  User,
  IntegrationAdapterAction,
  AccessPackage,
} from '../types';

export class DataStore {
  public users: User[] = [];
  public employees: Employee[] = [];
  public contexts: EmployeeContext[] = [];
  public rules: RequirementRule[] = [];
  public plans: OnboardingPlan[] = [];
  public tasks: Task[] = [];
  public dependencies: TaskDependency[] = [];
  public approvals: Approval[] = [];
  public exceptions: ExceptionEvent[] = [];
  public risks: RiskAssessment[] = [];
  public auditLogs: AuditLog[] = [];
  public adapterActions: IntegrationAdapterAction[] = [];
  public accessPackages: AccessPackage[] = [];
  public tickets: any[] = [];
  public assets: any[] = [];
  public notifications: any[] = [];
  public accessRequests: any[] = [];
  public accessGrants: any[] = [];
  public certificationCampaigns: any[] = [];
  public sodRules: any[] = [];
  public sodConflicts: any[] = [];

  constructor() {
    this.seed();
  }

  public seed(): void {
    // 1. Seed Users (5 Personas)
    this.users = [
      {
        id: 'usr-sarah',
        name: 'Sarah Chen',
        email: 'sarah.chen@onboardos.internal',
        role: 'HR',
        createdAt: '2026-01-10T08:00:00Z',
      },
      {
        id: 'usr-marcus',
        name: 'Marcus Vance',
        email: 'marcus.vance@onboardos.internal',
        role: 'MANAGER',
        createdAt: '2026-01-10T08:00:00Z',
      },
      {
        id: 'usr-rahul',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@onboardos.internal',
        role: 'EMPLOYEE',
        employeeId: 'emp-rahul',
        createdAt: '2026-08-20T08:00:00Z',
      },
      {
        id: 'usr-david',
        name: 'David Kim',
        email: 'david.kim@onboardos.internal',
        role: 'IT',
        createdAt: '2026-01-10T08:00:00Z',
      },
      {
        id: 'usr-elena',
        name: 'Elena Rostova',
        email: 'elena.rostova@onboardos.internal',
        role: 'ADMIN',
        createdAt: '2026-01-10T08:00:00Z',
      },
    ];

    // 2. Canonical Seed Employees (Rahul, Priya, Aman)
    this.employees = [
      {
        id: 'emp-rahul',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@onboardos.internal',
        roleId: 'role-backend-dev',
        roleTitle: 'Junior Backend Developer',
        departmentId: 'dept-eng',
        departmentName: 'Engineering',
        teamId: 'team-payments',
        teamName: 'Payments Core',
        projectId: 'proj-gateway-v2',
        projectName: 'Payment Gateway Migration',
        seniority: 'JUNIOR',
        location: 'Bengaluru, India',
        employmentType: 'FULL_TIME',
        managerId: 'emp-marcus',
        managerName: 'Marcus Vance',
        status: 'INVITED',
        startDate: '2026-09-01T09:00:00Z',
        createdAt: '2026-08-20T10:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z',
      },
      {
        id: 'emp-priya',
        name: 'Priya Mehta',
        email: 'priya.mehta@onboardos.internal',
        roleId: 'role-uiux-designer',
        roleTitle: 'UI/UX Designer',
        departmentId: 'dept-design',
        departmentName: 'Design & Product',
        teamId: 'team-design-systems',
        teamName: 'Design Systems',
        projectId: 'proj-brand-alchemy',
        projectName: 'Brand Alchemy 2.0',
        seniority: 'JUNIOR',
        location: 'Bengaluru, India',
        employmentType: 'FULL_TIME',
        managerId: 'emp-marcus',
        managerName: 'Marcus Vance',
        status: 'INVITED',
        startDate: '2026-09-01T09:00:00Z',
        createdAt: '2026-08-20T10:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z',
      },
      {
        id: 'emp-aman',
        name: 'Aman Verma',
        email: 'aman.verma@onboardos.internal',
        roleId: 'role-hr-exec',
        roleTitle: 'People Operations Specialist',
        departmentId: 'dept-people',
        departmentName: 'Human Resources',
        teamId: 'team-talent',
        teamName: 'Talent & Culture',
        projectId: 'proj-onboarding-2026',
        projectName: 'Global Onboarding Experience',
        seniority: 'MID',
        location: 'Remote, India',
        employmentType: 'FULL_TIME',
        managerId: 'emp-sarah',
        managerName: 'Sarah Chen',
        status: 'ACTIVE',
        startDate: '2026-08-15T09:00:00Z',
        createdAt: '2026-08-10T10:00:00Z',
        updatedAt: '2026-08-15T10:00:00Z',
      },
    ];

    // 3. Employee Contexts
    this.contexts = [
      {
        id: 'ctx-rahul-1',
        employeeId: 'emp-rahul',
        capturedAt: '2026-08-20T10:00:00Z',
        roleTitle: 'Junior Backend Developer',
        department: 'Engineering',
        team: 'Payments Core',
        seniority: 'JUNIOR',
        location: 'Bengaluru, India',
        employmentType: 'FULL_TIME',
        managerId: 'emp-marcus',
        projectId: 'proj-gateway-v2',
        raw: {
          programmingLanguages: ['TypeScript', 'Go', 'Node.js'],
          requiredRepos: ['onboardos/payment-gateway', 'onboardos/auth-service'],
          databaseAccess: ['Payments Read Replica'],
          cloudScope: 'AWS Staging Developer Role',
        },
      },
      {
        id: 'ctx-priya-1',
        employeeId: 'emp-priya',
        capturedAt: '2026-08-20T10:00:00Z',
        roleTitle: 'UI/UX Designer',
        department: 'Design & Product',
        team: 'Design Systems',
        seniority: 'JUNIOR',
        location: 'Bengaluru, India',
        employmentType: 'FULL_TIME',
        managerId: 'emp-marcus',
        projectId: 'proj-brand-alchemy',
        raw: {
          designTools: ['Figma Organization', 'Miro Enterprise', 'Adobe CC'],
          designLibrary: 'Brand Alchemy Enterprise DS',
        },
      },
    ];

    // 4. Requirement Rules (Version 1.0.0)
    this.rules = [
      {
        id: 'rule-google-all',
        version: 1,
        effectiveFrom: '2026-01-01T00:00:00Z',
        scope: {},
        requirementName: 'Google Workspace Account & Identity',
        category: 'Identity',
        decision: 'REQUIRED',
        riskLevel: 'LOW',
        reasonTemplate: 'Universal identity foundation required for email, Single Sign-On (SSO), and Google Calendar.',
        createdBy: 'System Architect',
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'rule-slack-all',
        version: 1,
        effectiveFrom: '2026-01-01T00:00:00Z',
        scope: {},
        requirementName: 'Slack Enterprise Grid Account',
        category: 'Communication',
        decision: 'REQUIRED',
        riskLevel: 'LOW',
        reasonTemplate: 'Primary real-time communication platform with automated team & announcement channel enrollment.',
        createdBy: 'System Architect',
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'rule-github-eng',
        version: 1,
        effectiveFrom: '2026-01-01T00:00:00Z',
        scope: { department: 'Engineering' },
        requirementName: 'GitHub Organization Contributor Access',
        category: 'Development',
        decision: 'REQUIRED',
        riskLevel: 'LOW',
        reasonTemplate: 'Required for all Engineering personnel to commit code, review Pull Requests, and access CI/CD pipelines.',
        createdBy: 'SecOps Team',
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'rule-jira-eng',
        version: 1,
        effectiveFrom: '2026-01-01T00:00:00Z',
        scope: { department: 'Engineering' },
        requirementName: 'Jira Software Project Board Access',
        category: 'Project',
        decision: 'REQUIRED',
        riskLevel: 'LOW',
        reasonTemplate: 'Sprint tracking and ticket assignment for assigned engineering project.',
        createdBy: 'Engineering Operations',
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'rule-aws-staging',
        version: 1,
        effectiveFrom: '2026-01-01T00:00:00Z',
        scope: { roleTitle: 'Junior Backend Developer' },
        requirementName: 'AWS Staging Read/Write Developer Role',
        category: 'Cloud',
        decision: 'APPROVAL_REQUIRED',
        approvalChain: ['MANAGER'],
        riskLevel: 'MEDIUM',
        reasonTemplate: 'Grants cloud infrastructure deployment permissions in Staging. Requires explicit Engineering Manager approval.',
        createdBy: 'Cloud Governance',
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'rule-figma-design',
        version: 1,
        effectiveFrom: '2026-01-01T00:00:00Z',
        scope: { department: 'Design & Product' },
        requirementName: 'Figma Organization Full Seat',
        category: 'Development',
        decision: 'REQUIRED',
        riskLevel: 'LOW',
        reasonTemplate: 'Core collaborative design platform seat for UI/UX designers.',
        createdBy: 'Product Design Lead',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ];

    // 5. Initial Plan for Rahul
    this.plans = [
      {
        id: 'plan-rahul-1',
        employeeId: 'emp-rahul',
        employeeContextId: 'ctx-rahul-1',
        ruleSetVersion: 1,
        generatedAt: '2026-08-20T10:05:00Z',
        status: 'ACTIVE',
        planItems: [
          {
            id: 'pi-1',
            planId: 'plan-rahul-1',
            requirementRuleId: 'rule-google-all',
            name: 'Google Workspace Account (rahul.sharma@onboardos.internal)',
            category: 'Identity',
            finalDecision: 'REQUIRED',
            reason: 'Mandatory primary identity provider for email and SSO.',
            aiConfidence: 0.99,
            riskLevel: 'LOW',
            taskId: 'task-1',
          },
          {
            id: 'pi-2',
            planId: 'plan-rahul-1',
            requirementRuleId: 'rule-slack-all',
            name: 'Slack Enterprise Grid (#eng-payments, #announcements)',
            category: 'Communication',
            finalDecision: 'REQUIRED',
            reason: 'Mandatory communication tool with team channel auto-enrollment.',
            aiConfidence: 0.98,
            riskLevel: 'LOW',
            taskId: 'task-2',
          },
          {
            id: 'pi-3',
            planId: 'plan-rahul-1',
            requirementRuleId: 'rule-github-eng',
            name: 'GitHub Organization Contributor Access (repo: payment-gateway)',
            category: 'Development',
            finalDecision: 'REQUIRED',
            reason: 'Standard repository access required for Junior Backend Developer.',
            aiConfidence: 0.97,
            riskLevel: 'LOW',
            taskId: 'task-3',
          },
          {
            id: 'pi-4',
            planId: 'plan-rahul-1',
            requirementRuleId: 'rule-jira-eng',
            name: 'Jira Software (Project: PAY-GATEWAY)',
            category: 'Project',
            finalDecision: 'REQUIRED',
            reason: 'Sprint ticketing for sprint planning and backlog tasks.',
            aiConfidence: 0.96,
            riskLevel: 'LOW',
            taskId: 'task-4',
          },
          {
            id: 'pi-5',
            planId: 'plan-rahul-1',
            requirementRuleId: 'rule-aws-staging',
            name: 'AWS Staging IAM Role (PaymentsDevRole)',
            category: 'Cloud',
            finalDecision: 'APPROVAL_REQUIRED',
            reason: 'Elevated cloud deployment permissions require Engineering Director review.',
            aiConfidence: 0.94,
            riskLevel: 'MEDIUM',
            taskId: 'task-5',
          },
        ],
        reasoningSequence: [
          {
            step: 1,
            title: 'Context Extraction & Attribute Normalization',
            description: 'Analyzed role "Junior Backend Developer", department "Engineering", team "Payments Core".',
            status: 'completed',
            details: 'Verified employment type FULL_TIME and location Bengaluru, India.',
          },
          {
            step: 2,
            title: 'Deterministic Policy Matching',
            description: 'Evaluated active policy catalog v1.0.0 against employee context vector.',
            status: 'completed',
            details: 'Matched 4 mandatory baseline rules and 1 approval-gated rule.',
          },
          {
            step: 3,
            title: 'DAG Dependency Graph Construction',
            description: 'Structured execution DAG: Google Workspace (Root) -> Slack, GitHub -> Jira -> AWS Approval.',
            status: 'completed',
            details: 'Validated DAG contains 0 cyclic dependencies (Topological Sort Pass).',
          },
        ],
      },
    ];

    // 6. Tasks & Dependencies for Rahul
    this.tasks = [
      {
        id: 'task-1',
        planItemId: 'pi-1',
        employeeId: 'emp-rahul',
        name: 'Provision Google Workspace Account',
        category: 'Identity',
        status: 'COMPLETED',
        adapterType: 'GOOGLE',
        attempt: 1,
        idempotencyKey: 'idemp-google-rahul-1',
        createdAt: '2026-08-20T10:10:00Z',
        startedAt: '2026-08-20T10:10:05Z',
        completedAt: '2026-08-20T10:10:12Z',
      },
      {
        id: 'task-2',
        planItemId: 'pi-2',
        employeeId: 'emp-rahul',
        name: 'Provision Slack Account & Channels',
        category: 'Communication',
        status: 'COMPLETED',
        adapterType: 'SLACK',
        attempt: 1,
        idempotencyKey: 'idemp-slack-rahul-1',
        dependsOn: ['task-1'],
        createdAt: '2026-08-20T10:10:00Z',
        startedAt: '2026-08-20T10:10:13Z',
        completedAt: '2026-08-20T10:10:18Z',
      },
      {
        id: 'task-3',
        planItemId: 'pi-3',
        employeeId: 'emp-rahul',
        name: 'Grant GitHub Repository Contributor',
        category: 'Development',
        status: 'COMPLETED',
        adapterType: 'GITHUB',
        attempt: 1,
        idempotencyKey: 'idemp-github-rahul-1',
        dependsOn: ['task-1'],
        createdAt: '2026-08-20T10:10:00Z',
        startedAt: '2026-08-20T10:10:19Z',
        completedAt: '2026-08-20T10:10:25Z',
      },
      {
        id: 'task-4',
        planItemId: 'pi-4',
        employeeId: 'emp-rahul',
        name: 'Assign Jira Project Permissions',
        category: 'Project',
        status: 'FAILED',
        adapterType: 'JIRA',
        attempt: 1,
        idempotencyKey: 'idemp-jira-rahul-1',
        failureCode: 'HTTP_503_RATE_LIMIT',
        failureReason: 'Jira API rate limit exceeded (HTTP 503 Service Unavailable). Downstream AWS provisioning paused.',
        dependsOn: ['task-1'],
        createdAt: '2026-08-20T10:10:00Z',
        startedAt: '2026-08-20T10:10:26Z',
      },
      {
        id: 'task-5',
        planItemId: 'pi-5',
        employeeId: 'emp-rahul',
        name: 'Configure AWS Staging IAM Role',
        category: 'Cloud',
        status: 'BLOCKED',
        adapterType: 'AWS',
        attempt: 0,
        idempotencyKey: 'idemp-aws-rahul-1',
        dependsOn: ['task-4'],
        createdAt: '2026-08-20T10:10:00Z',
      },
    ];

    this.dependencies = [
      { id: 'dep-1', taskId: 'task-2', dependsOnTaskId: 'task-1' },
      { id: 'dep-2', taskId: 'task-3', dependsOnTaskId: 'task-1' },
      { id: 'dep-3', taskId: 'task-4', dependsOnTaskId: 'task-1' },
      { id: 'dep-4', taskId: 'task-5', dependsOnTaskId: 'task-4' },
    ];

    // 7. Approvals
    this.approvals = [
      {
        id: 'apr-aws-rahul',
        taskId: 'task-5',
        taskName: 'Configure AWS Staging IAM Role',
        employeeId: 'emp-rahul',
        employeeName: 'Rahul Sharma',
        stage: 1,
        approverRole: 'MANAGER',
        status: 'PENDING',
        requestedAt: '2026-08-20T10:10:30Z',
        slaTargetAt: '2026-08-21T18:00:00Z',
        reason: 'Developer requires Staging environment deployment permissions for sprint deliverables.',
      },
    ];

    // 8. Exception Events (Jira Failure for Rahul)
    this.exceptions = [
      {
        id: 'exc-jira-rahul',
        employeeId: 'emp-rahul',
        taskId: 'task-4',
        severity: 'ACTION_REQUIRED',
        title: 'Jira API Rate Limit Exceeded (HTTP 503)',
        description: 'Jira Software project assignment failed due to rate limits during morning cohort provisioning.',
        impactSummary: 'Blocks AWS IAM Role configuration (task-5) for Rahul Sharma.',
        createdAt: '2026-08-20T10:10:27Z',
      },
    ];

    // 9. Risk Assessments
    this.risks = [
      {
        id: 'risk-rahul-1',
        employeeId: 'emp-rahul',
        computedAt: '2026-08-20T10:10:30Z',
        riskScore: 35,
        riskLevel: 'MEDIUM',
        factors: [
          {
            factor: 'Jira Provisioning Failure',
            weight: 25,
            detail: 'Task failed with HTTP 503. Blocks downstream AWS task.',
          },
          {
            factor: 'Pending Manager Approval',
            weight: 10,
            detail: 'AWS Staging IAM Role requires Marcus Vance sign-off.',
          },
        ],
        dayOneReady: false,
        readinessBreakdown: {
          criticalTasksComplete: 3,
          totalCriticalTasks: 5,
          requiredAccessComplete: 3,
          totalRequiredAccess: 4,
          requiredTrainingComplete: 1,
          totalRequiredTraining: 2,
          blockingFailures: 1,
          pendingApprovals: 1,
        },
      },
    ];

    // 10. Audit Logs
    this.auditLogs = [
      {
        id: 'aud-1',
        employeeId: 'emp-rahul',
        actorUserId: 'usr-sarah',
        actorRole: 'HR',
        action: 'EMPLOYEE_INVITED',
        entityType: 'Employee',
        entityId: 'emp-rahul',
        reason: 'New hire onboarding initiated for Payments Core.',
        result: 'SUCCESS',
        createdAt: '2026-08-20T10:00:00Z',
      },
      {
        id: 'aud-2',
        employeeId: 'emp-rahul',
        actorUserId: 'usr-sarah',
        actorRole: 'HR',
        action: 'PLAN_GENERATED',
        entityType: 'OnboardingPlan',
        entityId: 'plan-rahul-1',
        reason: 'Automated AI rules engine plan generation with policy version 1.0.0.',
        result: 'SUCCESS',
        createdAt: '2026-08-20T10:05:00Z',
      },
      {
        id: 'aud-3',
        employeeId: 'emp-rahul',
        actorRole: 'IT',
        action: 'PROVISIONING_FAILED',
        entityType: 'Task',
        entityId: 'task-4',
        reason: 'Jira Software HTTP 503 Rate Limit Error.',
        result: 'FAILED',
        createdAt: '2026-08-20T10:10:27Z',
      },
    ];

    // 11. Access Packages
    this.accessPackages = [
      {
        id: 'pkg-core-dev',
        code: 'PKG-DEV-01',
        name: 'Core Backend Development Bundle',
        description: 'Standard development environment for backend engineers including GitHub, Slack, and Jira.',
        category: 'DEVELOPMENT',
        riskLevel: 'LOW',
        ownerName: 'Engineering Director',
        ownerEmail: 'eng-lead@onboardos.internal',
        maxDurationDays: 180,
        reviewFrequencyDays: 90,
        entitlements: [
          {
            id: 'ent-1',
            name: 'GitHub Repository Contributor',
            app: 'GitHub',
            type: 'REPO_PERM',
            permission: 'Write',
            riskLevel: 'LOW',
          },
          {
            id: 'ent-2',
            name: 'Slack #eng-all Channels',
            app: 'Slack',
            type: 'CHANNEL_PERM',
            permission: 'Member',
            riskLevel: 'LOW',
          },
        ],
        approvalStages: [{ stage: 1, approverRole: 'MANAGER', slaHours: 24 }],
        activeGrantCount: 42,
        requestCount: 58,
      },
    ];
  }
}

export const store = new DataStore();
