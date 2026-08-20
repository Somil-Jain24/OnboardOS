import type { OnboardOSClient, CreateEmployeeInput } from '../types';
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
  KnowledgeAnswer,
  NotificationItem,
  WhatIfSimulationInput,
  WhatIfSimulationDiff,
  TransferRequest,
  OffboardingPlan,
  OffboardingRiskFlag,
  MentorAssignment,
  FirstWeekPlanItem,
  PulseResponse,
  PulseTrendData,
  CommunityPost,
  RequirementDecision,
  ApprovalStatus,
} from '../../types';
import { getInitialMockData, type MockDataStore } from './mockStore';

class MockOnboardOSClient implements OnboardOSClient {
  private store: MockDataStore;

  constructor() {
    this.store = getInitialMockData();
  }

  private async delay(ms = 80): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // --- Employees ---

  async getEmployees(): Promise<Employee[]> {
    await this.delay();
    return [...this.store.employees];
  }

  async getEmployee(id: string): Promise<Employee | null> {
    await this.delay();
    return this.store.employees.find((e) => e.id === id) || null;
  }

  async createEmployee(input: CreateEmployeeInput): Promise<Employee> {
    await this.delay(120);
    const id = `emp-${Date.now().toString(36)}`;
    const newEmp: Employee = {
      id,
      name: input.name,
      email: input.email,
      roleId: `role-${input.roleTitle.toLowerCase().replace(/\s+/g, '-')}`,
      roleTitle: input.roleTitle,
      departmentId: `dept-${input.department.toLowerCase().replace(/\s+/g, '-')}`,
      departmentName: input.department,
      teamId: `team-${input.team.toLowerCase().replace(/\s+/g, '-')}`,
      teamName: input.team,
      seniority: input.seniority,
      location: input.location,
      employmentType: input.employmentType,
      managerName: input.managerName || 'Marcus Vance',
      status: 'ACTIVE',
      startDate: input.startDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.store.employees.push(newEmp);

    // Save context snapshot
    this.store.contexts[id] = {
      id: `ctx-${id}`,
      employeeId: id,
      capturedAt: new Date().toISOString(),
      roleTitle: input.roleTitle,
      department: input.department,
      team: input.team,
      seniority: input.seniority,
      location: input.location,
      employmentType: input.employmentType,
      managerName: input.managerName || 'Marcus Vance',
      raw: { input },
    };

    // Auto-generate plan
    await this.generatePlan(id);

    return newEmp;
  }

  async getEmployeeContext(employeeId: string): Promise<EmployeeContext | null> {
    await this.delay();
    return this.store.contexts[employeeId] || null;
  }

  // --- Policies & Rules ---

  async getRules(): Promise<RequirementRule[]> {
    await this.delay();
    return [...this.store.rules];
  }

  async getRulesByScope(department: string, role: string): Promise<RequirementRule[]> {
    await this.delay();
    return this.store.rules.filter(
      (r) =>
        (!r.scope.department || r.scope.department === department) &&
        (!r.scope.role || r.scope.role === role)
    );
  }

  // --- Plans & AI Reasoning ---

  async generatePlan(employeeId: string): Promise<OnboardingPlan> {
    await this.delay(200);
    const emp = await this.getEmployee(employeeId);
    if (!emp) throw new Error(`Employee ${employeeId} not found`);

    const planId = `plan-${employeeId}`;
    const items: PlanItem[] = [
      {
        id: `pi-${employeeId}-1`,
        planId,
        name: 'Google Workspace Account',
        category: 'Identity',
        finalDecision: 'REQUIRED',
        reason: 'Universal identity and mailbox requirement for all corporate staff.',
        aiRecommendedDecision: 'REQUIRED',
        aiConfidence: 0.99,
        aiRationale: 'Standard corporate communication and SSO identity bootstrap.',
        riskLevel: 'LOW',
      },
      {
        id: `pi-${employeeId}-2`,
        planId,
        name: `${emp.departmentName} Slack Channels`,
        category: 'Communication',
        finalDecision: 'REQUIRED',
        reason: `Department and team chat channels for ${emp.teamName}.`,
        aiRecommendedDecision: 'REQUIRED',
        aiConfidence: 0.98,
        aiRationale: 'Team synchronization and incident updates.',
        riskLevel: 'LOW',
      },
    ];

    if (emp.departmentName === 'Engineering') {
      items.push({
        id: `pi-${employeeId}-3`,
        planId,
        name: 'GitHub Organization & Repo Access',
        category: 'Development',
        finalDecision: 'REQUIRED',
        reason: 'Source code management and code review rights.',
        aiRecommendedDecision: 'REQUIRED',
        aiConfidence: 0.97,
        aiRationale: 'Engineering backend software engineer daily workflow.',
        riskLevel: 'LOW',
      });
      items.push({
        id: `pi-${employeeId}-4`,
        planId,
        name: 'Jira Software Project Backlog',
        category: 'Project',
        finalDecision: 'REQUIRED',
        reason: 'Agile sprint tracking and task ownership.',
        aiRecommendedDecision: 'REQUIRED',
        aiConfidence: 0.95,
        aiRationale: 'Sprint backlog assignment.',
        riskLevel: 'LOW',
      });
      items.push({
        id: `pi-${employeeId}-5`,
        planId,
        name: 'AWS Production Cloud Access',
        category: 'Cloud',
        finalDecision: emp.seniority === 'JUNIOR' ? 'APPROVAL_REQUIRED' : 'REQUIRED',
        reason:
          emp.seniority === 'JUNIOR'
            ? 'Junior engineers require explicit manager authorization prior to cloud production deployment rights.'
            : 'Pre-approved production cloud access for senior engineers.',
        aiRecommendedDecision: 'REQUIRED',
        aiConfidence: 0.91,
        aiRationale: 'AI suggested REQUIRED; Rules Engine applied least-privilege policy override.',
        riskLevel: 'HIGH',
        approvalChain: emp.seniority === 'JUNIOR' ? ['MANAGER'] : undefined,
      });
    }

    const plan: OnboardingPlan = {
      id: planId,
      employeeId,
      employeeContextId: this.store.contexts[employeeId]?.id || 'ctx-default',
      ruleSetVersion: 1,
      generatedAt: new Date().toISOString(),
      status: 'ACTIVE',
      items,
    };

    this.store.plans[employeeId] = plan;

    // Create tasks
    const generatedTasks: Task[] = items.map((item, idx) => ({
      id: `task-${employeeId}-${idx + 1}`,
      planItemId: item.id,
      employeeId,
      name: item.name,
      category: item.category,
      status: item.finalDecision === 'APPROVAL_REQUIRED' ? 'WAITING_APPROVAL' : 'READY',
      adapterType:
        item.name.includes('Google') ? 'GOOGLE'
        : item.name.includes('Slack') ? 'SLACK'
        : item.name.includes('GitHub') ? 'GITHUB'
        : item.name.includes('Jira') ? 'JIRA'
        : item.name.includes('AWS') ? 'AWS' : 'NONE',
      attempt: 0,
      createdAt: new Date().toISOString(),
    }));

    this.store.tasks[employeeId] = generatedTasks;

    return plan;
  }

  async getPlan(employeeId: string): Promise<OnboardingPlan | null> {
    await this.delay();
    return this.store.plans[employeeId] || null;
  }

  async updatePlanItemDecision(
    itemId: string,
    decision: RequirementDecision,
    reason: string
  ): Promise<PlanItem> {
    await this.delay();
    for (const plan of Object.values(this.store.plans)) {
      const item = plan.items.find((i) => i.id === itemId);
      if (item) {
        item.finalDecision = decision;
        item.reason = reason;
        return item;
      }
    }
    throw new Error(`PlanItem ${itemId} not found`);
  }

  // --- Tasks & Execution DAG ---

  async getTasks(employeeId: string): Promise<Task[]> {
    await this.delay();
    return this.store.tasks[employeeId] || [];
  }

  async retryTask(taskId: string): Promise<{ task: Task; unblockedTasks: Task[] }> {
    await this.delay(300);
    for (const employeeId of Object.keys(this.store.tasks)) {
      const taskList = this.store.tasks[employeeId];
      const target = taskList.find((t) => t.id === taskId);
      if (target) {
        target.status = 'COMPLETED';
        target.attempt += 1;
        target.completedAt = new Date().toISOString();
        target.failureReason = undefined;

        // Unblock downstream tasks
        const unblocked: Task[] = [];
        for (const t of taskList) {
          if (t.dependsOnTaskIds?.includes(taskId) && t.status === 'BLOCKED') {
            t.status = 'COMPLETED';
            t.completedAt = new Date().toISOString();
            unblocked.push(t);
          }
        }

        // Recompute readiness
        if (this.store.riskAssessments[employeeId]) {
          const risk = this.store.riskAssessments[employeeId];
          risk.readinessScore = 90;
          risk.riskScore = 20;
          risk.riskLevel = 'LOW';
          risk.dayOneReady = true;
          risk.readinessBreakdown.blockingFailures = 0;
          risk.readinessBreakdown.requiredAccessComplete = risk.readinessBreakdown.requiredAccessTotal;
        }

        // Resolve exception if linked
        const ex = this.store.exceptions.find((e) => e.taskId === taskId);
        if (ex) {
          ex.severity = 'RESOLVED';
          ex.resolvedAt = new Date().toISOString();
          ex.resolvedBy = 'System (Idempotent Retry)';
        }

        return { task: target, unblockedTasks: unblocked };
      }
    }
    throw new Error(`Task ${taskId} not found`);
  }

  async skipTask(taskId: string, reason: string): Promise<Task> {
    await this.delay();
    for (const employeeId of Object.keys(this.store.tasks)) {
      const taskList = this.store.tasks[employeeId];
      const target = taskList.find((t) => t.id === taskId);
      if (target) {
        target.status = 'SKIPPED';
        target.failureReason = `Skipped with reason: ${reason}`;
        return target;
      }
    }
    throw new Error(`Task ${taskId} not found`);
  }

  // --- Approvals ---

  async getApprovals(role?: 'MANAGER' | 'SECURITY' | 'ADMIN'): Promise<Approval[]> {
    await this.delay();
    if (!role) return [...this.store.approvals];
    return this.store.approvals.filter((a) => a.approverRole === role);
  }

  async respondApproval(
    approvalId: string,
    status: ApprovalStatus,
    note?: string
  ): Promise<{ approval: Approval; unblockedTask?: Task }> {
    await this.delay(200);
    const appr = this.store.approvals.find((a) => a.id === approvalId);
    if (!appr) throw new Error(`Approval ${approvalId} not found`);

    appr.status = status;
    appr.respondedAt = new Date().toISOString();
    appr.responseNote = note;

    let unblockedTask: Task | undefined;
    if (status === 'APPROVED') {
      const tasks = this.store.tasks[appr.employeeId] || [];
      const task = tasks.find((t) => t.id === appr.taskId);
      if (task) {
        task.status = 'COMPLETED';
        task.completedAt = new Date().toISOString();
        unblockedTask = task;
      }
    }

    return { approval: appr, unblockedTask };
  }

  // --- Risk & Readiness ---

  async getRiskAssessment(employeeId: string): Promise<RiskAssessment> {
    await this.delay();
    if (this.store.riskAssessments[employeeId]) {
      return this.store.riskAssessments[employeeId];
    }
    return {
      id: `risk-${employeeId}`,
      employeeId,
      computedAt: new Date().toISOString(),
      riskScore: 10,
      riskLevel: 'LOW',
      dayOneReady: true,
      readinessScore: 100,
      factors: [],
      readinessBreakdown: {
        criticalTasksTotal: 3,
        criticalTasksComplete: 3,
        requiredAccessTotal: 3,
        requiredAccessComplete: 3,
        requiredTrainingTotal: 1,
        requiredTrainingComplete: 1,
        blockingFailures: 0,
        pendingApprovals: 0,
      },
    };
  }

  // --- What-If Simulation ---

  async simulateWhatIf(
    _employeeId: string,
    input: WhatIfSimulationInput
  ): Promise<WhatIfSimulationDiff> {
    await this.delay(150);
    return {
      accessAdded: [
        {
          name: 'AWS Production Cloud Access (Senior Deploy Rights)',
          category: 'Cloud',
          reason: 'Senior software engineers are pre-authorized for staging and production deploy pipelines.',
          riskLevel: 'MEDIUM',
        },
        {
          name: 'Datadog APM & Production Metrics',
          category: 'Cloud',
          reason: 'Required for production on-call observability and incident response.',
          riskLevel: 'LOW',
        },
      ],
      accessRemoved: [],
      accessUnchanged: [
        { name: 'Google Workspace Account', category: 'Identity' },
        { name: 'GitHub Organization & Repo Access', category: 'Development' },
        { name: 'Slack Team Channels', category: 'Communication' },
        { name: 'Jira Software Project Backlog', category: 'Project' },
      ],
      approvalsRequiredDelta: ['AWS Production Access downgraded from APPROVAL_REQUIRED to REQUIRED'],
      riskScoreDelta: -25,
      newRiskScore: 20,
      newRiskLevel: 'LOW',
      readinessDelta: 25,
      newReadinessScore: 90,
    };
  }

  // --- Exceptions & Failures ---

  async getExceptions(): Promise<ExceptionEvent[]> {
    await this.delay();
    return [...this.store.exceptions];
  }

  async resolveException(exceptionId: string, note?: string): Promise<ExceptionEvent> {
    await this.delay();
    const ex = this.store.exceptions.find((e) => e.id === exceptionId);
    if (!ex) throw new Error(`Exception ${exceptionId} not found`);
    ex.severity = 'RESOLVED';
    ex.resolvedAt = new Date().toISOString();
    ex.resolvedBy = note || 'IT Administrator';
    return ex;
  }

  // --- Audit Logs ---

  async getAuditLogs(employeeId?: string): Promise<AuditLog[]> {
    await this.delay();
    if (!employeeId) return [...this.store.auditLogs];
    return this.store.auditLogs.filter((a) => a.employeeId === employeeId);
  }

  // --- P1 Intelligence ---

  async getTickets(employeeId?: string): Promise<Ticket[]> {
    await this.delay();
    if (!employeeId) return [...this.store.tickets];
    return this.store.tickets.filter((t) => t.employeeId === employeeId);
  }

  async createTicket(input: {
    employeeId: string;
    subject: string;
    category: string;
    description: string;
  }): Promise<Ticket> {
    await this.delay(100);
    const emp = await this.getEmployee(input.employeeId);
    const ticket: Ticket = {
      id: `TICK-${Date.now().toString(36).toUpperCase()}`,
      employeeId: input.employeeId,
      employeeName: emp?.name || 'Rahul Sharma',
      category: input.category,
      priority: input.category === 'PROVISIONING' ? 'HIGH' : 'MEDIUM',
      team: 'IT Operations',
      slaHours: 24,
      status: 'OPEN',
      description: `${input.subject}: ${input.description}`,
      aiClassification: {
        suggestedCategory: input.category,
        suggestedPriority: input.category === 'PROVISIONING' ? 'HIGH' : 'MEDIUM',
        confidence: 0.96,
        recommendedActions: ['Auto-routed to IT Ops queue', 'SLA timer started'],
      },
      createdAt: new Date().toISOString(),
    };
    this.store.tickets.unshift(ticket);
    return ticket;
  }

  async getAssets(employeeId?: string): Promise<Asset[]> {
    await this.delay();
    if (!employeeId) return [...this.store.assets];
    return this.store.assets.filter((a) => a.employeeId === employeeId);
  }

  async getKnowledgeDocs(): Promise<KnowledgeDocument[]> {
    await this.delay();
    return [...this.store.knowledgeDocs];
  }

  async searchKnowledge(query: string): Promise<KnowledgeAnswer> {
    await this.delay(200);
    return {
      query,
      answer: `According to corporate policy and architecture standards: ${query} is governed by versioned least-privilege security controls. Engineering accounts require manager approval for production access and automated Jira backlog provisioning.`,
      citations: [
        {
          docId: 'doc-1',
          docTitle: 'Engineering Security & Cloud Deployment Policy',
          snippet: 'Junior engineers require Engineering Manager authorization before cloud IAM grants are activated.',
        },
        {
          docId: 'doc-2',
          docTitle: 'Payments Core Service Architecture & SLA Guide',
          snippet: 'Developers require GitHub repository access and Jira Payments backlog assignment.',
        },
      ],
    };
  }

  async getNotifications(userId: string): Promise<NotificationItem[]> {
    await this.delay();
    return this.store.notifications.filter((n) => !userId || n.userId === userId);
  }

  // --- P2 Lifecycle & Platform Extensions ---

  async getTransferRequests(): Promise<TransferRequest[]> {
    await this.delay();
    return [...this.store.transfers];
  }

  async createTransferRequest(
    employeeId: string,
    targetContext: Partial<EmployeeContext>
  ): Promise<TransferRequest> {
    await this.delay();
    const currentContext = this.store.contexts[employeeId];
    const transfer: TransferRequest = {
      id: `tr-${Date.now().toString(36)}`,
      employeeId,
      fromContext: currentContext,
      toContext: targetContext,
      diffAccessAdded: [
        { name: 'Snyk Vulnerability Scanner Access', category: 'Security', reason: 'Security engineering tool suite.' },
      ],
      diffAccessRemoved: [
        { name: 'Payments Core GitHub Write Access', category: 'Development', reason: 'Role changed out of Payments team.' },
      ],
      diffApprovals: ['Security Lead authorization required for Snyk admin grant'],
      status: 'DRAFT',
      createdBy: 'Sarah Chen',
      createdAt: new Date().toISOString(),
    };
    this.store.transfers.push(transfer);
    return transfer;
  }

  async applyTransfer(requestId: string): Promise<TransferRequest> {
    await this.delay(200);
    const tr = this.store.transfers.find((t) => t.id === requestId);
    if (!tr) throw new Error(`Transfer ${requestId} not found`);
    tr.status = 'APPLIED';
    tr.appliedAt = new Date().toISOString();
    return tr;
  }

  async getOffboardingPlan(employeeId: string): Promise<OffboardingPlan | null> {
    await this.delay();
    return this.store.offboardingPlans[employeeId] || null;
  }

  async createOffboardingPlan(employeeId: string): Promise<OffboardingPlan> {
    await this.delay(200);
    const plan: OffboardingPlan = {
      id: `offboard-${employeeId}`,
      employeeId,
      initiatedAt: new Date().toISOString(),
      exitDate: '2026-09-30',
      status: 'ACTIVE',
      tasks: [
        {
          id: `task-off-1`,
          employeeId,
          name: 'Revoke AWS Production Cloud Credentials',
          category: 'Cloud',
          status: 'COMPLETED',
          adapterType: 'AWS',
          attempt: 1,
          createdAt: new Date().toISOString(),
        },
        {
          id: `task-off-2`,
          employeeId,
          name: 'Revoke GitHub Enterprise & Repo Access',
          category: 'Development',
          status: 'RUNNING',
          adapterType: 'GITHUB',
          attempt: 1,
          createdAt: new Date().toISOString(),
        },
        {
          id: `task-off-3`,
          employeeId,
          name: 'Disable Google Workspace Mailbox & SSO Session',
          category: 'Identity',
          status: 'PENDING',
          adapterType: 'GOOGLE',
          attempt: 0,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };
    this.store.offboardingPlans[employeeId] = plan;
    return plan;
  }

  async getOffboardingRisks(): Promise<OffboardingRiskFlag[]> {
    await this.delay();
    return [...this.store.offboardingRisks];
  }

  async resolveOffboardingRisk(flagId: string): Promise<OffboardingRiskFlag> {
    await this.delay();
    const flag = this.store.offboardingRisks.find((f) => f.id === flagId);
    if (!flag) throw new Error(`Risk flag ${flagId} not found`);
    flag.resolvedAt = new Date().toISOString();
    return flag;
  }

  async getMentorAssignment(employeeId: string): Promise<MentorAssignment | null> {
    await this.delay();
    return this.store.mentorAssignments[employeeId] || null;
  }

  async getFirstWeekPlan(employeeId: string): Promise<FirstWeekPlanItem[]> {
    await this.delay();
    return this.store.firstWeekPlans[employeeId] || [];
  }

  async submitPulse(
    employeeId: string,
    value: 'GREAT' | 'GOOD' | 'OKAY' | 'STRUGGLING',
    note?: string
  ): Promise<PulseResponse> {
    await this.delay();
    const resp: PulseResponse = {
      id: `pulse-${Date.now().toString(36)}`,
      employeeId,
      submittedAt: new Date().toISOString(),
      value,
      note,
    };
    this.store.pulseResponses.push(resp);
    return resp;
  }

  async getPulseTrends(): Promise<PulseTrendData[]> {
    await this.delay();
    return [...this.store.pulseTrends];
  }

  async getCommunityPosts(): Promise<CommunityPost[]> {
    await this.delay();
    return [...this.store.communityPosts];
  }

  async createCommunityPost(post: {
    title: string;
    body: string;
    type: 'ANNOUNCEMENT' | 'EVENT' | 'UPDATE' | 'POLL' | 'KNOWLEDGE';
  }): Promise<CommunityPost> {
    await this.delay();
    const newPost: CommunityPost = {
      id: `post-${Date.now().toString(36)}`,
      authorName: 'Rahul Sharma',
      authorRole: 'Backend Developer',
      type: post.type,
      title: post.title,
      body: post.body,
      createdAt: new Date().toISOString(),
      likesCount: 1,
      commentsCount: 0,
    };
    this.store.communityPosts.unshift(newPost);
    return newPost;
  }

  // --- Demo Control ---

  async resetDemoState(): Promise<void> {
    await this.delay(100);
    this.store = getInitialMockData();
  }

  async injectJiraFailure(employeeId = 'emp-rahul'): Promise<void> {
    await this.delay(100);
    const tasks = this.store.tasks[employeeId];
    if (tasks) {
      const jira = tasks.find((t) => t.adapterType === 'JIRA');
      if (jira) {
        jira.status = 'FAILED';
        jira.failureReason = 'Simulated Rate Limit 503 Injected via Demo Panel.';
      }
      const board = tasks.find((t) => t.name.includes('Board'));
      if (board) {
        board.status = 'BLOCKED';
      }
    }
  }
}

export const mockClient = new MockOnboardOSClient();
