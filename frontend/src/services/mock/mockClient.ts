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
  BirthrightPolicy,
  PolicyEvaluationResult,
} from '../../types';
import { getInitialMockData, saveMockData, clearMockData, type MockDataStore } from './mockStore';

class MockOnboardOSClient implements OnboardOSClient {
  private store: MockDataStore;

  constructor() {
    this.store = getInitialMockData();
  }

  private save(): void {
    saveMockData(this.store);
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

    this.save();
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

        this.save();
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
        this.save();
        return target;
      }
    }
    throw new Error(`Task ${taskId} not found`);
  }

  async manualOverrideTask(
    taskId: string,
    reason: string
  ): Promise<{ task: Task; unblockedTasks: Task[] }> {
    await this.delay(150);
    for (const employeeId of Object.keys(this.store.tasks)) {
      const taskList = this.store.tasks[employeeId];
      const target = taskList.find((t) => t.id === taskId);
      if (target) {
        target.status = 'COMPLETED';
        target.completedAt = new Date().toISOString();
        target.failureReason = undefined;
        target.impactSummary = undefined;

        // Unblock downstream tasks
        const unblocked: Task[] = [];
        for (const t of taskList) {
          if (t.status === 'BLOCKED') {
            t.status = 'READY';
            unblocked.push(t);
          }
        }

        // Resolve exception if any
        const ex = this.store.exceptions.find((e) => e.taskId === taskId);
        if (ex) {
          ex.severity = 'RESOLVED';
          ex.resolvedAt = new Date().toISOString();
          ex.resolvedBy = `IT Administrator (Manual Override: ${reason})`;
        }

        // Record Audit Log
        this.store.auditLogs.unshift({
          id: `aud-${Date.now()}`,
          employeeId,
          actorName: 'IT Administrator',
          actorRole: 'IT',
          action: 'TASK_MANUAL_OVERRIDE',
          entityType: 'TASK',
          entityId: taskId,
          reason: reason,
          result: 'COMPLETED',
          createdAt: new Date().toISOString(),
        });

        this.save();
        return { task: target, unblockedTasks: unblocked };
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

    this.save();
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

  async resolveTicket(ticketId: string, resolutionNote: string): Promise<Ticket> {
    await this.delay(100);
    const ticket = this.store.tickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error('Ticket not found');
    ticket.status = 'RESOLVED';
    ticket.description = `${ticket.description} [Resolved: ${resolutionNote}]`;
    return ticket;
  }

  async reassignTicket(ticketId: string, team: string): Promise<Ticket> {
    await this.delay(100);
    const ticket = this.store.tickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error('Ticket not found');
    ticket.team = team;
    return ticket;
  }

  async getAssets(employeeId?: string): Promise<Asset[]> {
    await this.delay();
    if (!employeeId) return [...this.store.assets];
    return this.store.assets.filter((a) => a.employeeId === employeeId);
  }

  async assignAsset(input: {
    employeeId: string;
    employeeName: string;
    type: 'LAPTOP' | 'MONITOR' | 'KEYBOARD' | 'MOUSE' | 'ID_CARD' | 'ACCESS_CARD';
    model: string;
    serialNumber: string;
  }): Promise<Asset> {
    await this.delay(100);
    const newAsset: Asset = {
      id: `ast-${Date.now()}`,
      employeeId: input.employeeId,
      employeeName: input.employeeName,
      type: input.type,
      model: input.model,
      serialNumber: input.serialNumber,
      state: 'ASSIGNED',
      assignedAt: new Date().toISOString(),
    };
    this.store.assets.unshift(newAsset);
    return newAsset;
  }

  async updateAssetState(
    assetId: string,
    state: 'ASSIGNED' | 'RECEIVED' | 'DAMAGED' | 'LOST' | 'RETURNED'
  ): Promise<Asset> {
    await this.delay(100);
    const ast = this.store.assets.find((a) => a.id === assetId);
    if (!ast) throw new Error('Asset not found');
    ast.state = state;
    return ast;
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

  async markNotificationAsRead(id: string): Promise<NotificationItem> {
    await this.delay(50);
    const notif = this.store.notifications.find((n) => n.id === id);
    if (!notif) throw new Error('Notification not found');
    notif.read = true;
    return notif;
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.delay(50);
    this.store.notifications.forEach((n) => {
      n.read = true;
    });
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
    clearMockData();
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

  // --- Enterprise Identity: Birthright Policies ---

  async getBirthrightPolicies(): Promise<BirthrightPolicy[]> {
    await this.delay(60);
    return [...this.store.birthrightPolicies];
  }

  async createBirthrightPolicy(
    policy: Omit<BirthrightPolicy, 'id' | 'version' | 'updatedAt'>
  ): Promise<BirthrightPolicy> {
    await this.delay(100);
    const newPolicy: BirthrightPolicy = {
      ...policy,
      id: `POL-${Date.now().toString(36).toUpperCase()}`,
      version: 1,
      updatedAt: new Date().toISOString(),
    };
    this.store.birthrightPolicies.unshift(newPolicy);
    return newPolicy;
  }

  async updateBirthrightPolicy(
    id: string,
    updates: Partial<BirthrightPolicy>
  ): Promise<BirthrightPolicy> {
    await this.delay(80);
    const idx = this.store.birthrightPolicies.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new Error(`Policy not found: ${id}`);
    }
    const updated = {
      ...this.store.birthrightPolicies[idx],
      ...updates,
      version: this.store.birthrightPolicies[idx].version + 1,
      updatedAt: new Date().toISOString(),
    };
    this.store.birthrightPolicies[idx] = updated;
    return updated;
  }

  async deleteBirthrightPolicy(id: string): Promise<boolean> {
    await this.delay(60);
    const initialLen = this.store.birthrightPolicies.length;
    this.store.birthrightPolicies = this.store.birthrightPolicies.filter((p) => p.id !== id);
    return this.store.birthrightPolicies.length < initialLen;
  }

  async evaluateBirthrightAccess(
    context: Partial<EmployeeContext>
  ): Promise<PolicyEvaluationResult> {
    await this.delay(120);
    const matchedPolicies: PolicyEvaluationResult['matchedPolicies'] = [];
    const evaluatedEntitlements: PolicyEvaluationResult['evaluatedEntitlements'] = [];
    const seenEntitlements = new Set<string>();

    const activePolicies = [...this.store.birthrightPolicies]
      .filter((p) => p.status === 'ACTIVE')
      .sort((a, b) => a.priority - b.priority);

    for (const policy of activePolicies) {
      // Evaluate conditions
      let allMatch = true;
      const matchedConditions: string[] = [];

      for (const cond of policy.conditions) {
        const val = context[cond.field as keyof EmployeeContext];
        const strVal = typeof val === 'string' ? val : '';
        let condMatch = false;

        if (cond.operator === 'EQUALS') {
          condMatch = strVal.toLowerCase() === cond.value.toLowerCase();
        } else if (cond.operator === 'CONTAINS') {
          condMatch = strVal.toLowerCase().includes(cond.value.toLowerCase());
        } else if (cond.operator === 'NOT_EQUALS') {
          condMatch = strVal.toLowerCase() !== cond.value.toLowerCase();
        } else if (cond.operator === 'IN') {
          const arr = cond.value.split(',').map((s) => s.trim().toLowerCase());
          condMatch = arr.includes(strVal.toLowerCase());
        }

        if (condMatch) {
          matchedConditions.push(`${cond.field} ${cond.operator} "${cond.value}"`);
        } else {
          allMatch = false;
          break;
        }
      }

      if (allMatch) {
        matchedPolicies.push({
          policyId: policy.id,
          policyName: policy.name,
          policyType: policy.policyType,
          matchedConditions,
        });

        for (const ent of policy.grantedEntitlements) {
          if (!seenEntitlements.has(ent.name)) {
            seenEntitlements.add(ent.name);
            let decision: RequirementDecision = 'REQUIRED';
            if (policy.policyType === 'APPROVAL_REQUIRED' || ent.requiresApproval) {
              decision = 'APPROVAL_REQUIRED';
            } else if (policy.policyType === 'DENIED') {
              decision = 'NOT_APPLICABLE';
            } else if (policy.policyType === 'OPTIONAL') {
              decision = 'OPTIONAL';
            }

            evaluatedEntitlements.push({
              id: ent.id,
              name: ent.name,
              app: ent.app,
              decision,
              sourcePolicy: policy.name,
              isBirthright: ent.isBirthright,
              riskLevel: ent.riskLevel,
              ttlHours: ent.ttlHours,
              reason: `Granted via ${policy.name} (${policy.policyType}) matching criteria [${matchedConditions.join(', ')}]`,
            });
          }
        }
      }
    }

    return {
      employeeId: context.employeeId,
      matchedPolicies,
      evaluatedEntitlements,
    };
  }

  // --- Enterprise Identity: Access Packages & Requests (P0-15, P0-16) ---

  async getAccessPackages(): Promise<import('../../types').AccessPackage[]> {
    await this.delay();
    return [...this.store.accessPackages];
  }

  async getAccessPackage(id: string): Promise<import('../../types').AccessPackage | null> {
    await this.delay();
    return this.store.accessPackages.find((p) => p.id === id) || null;
  }

  async createAccessPackage(
    pkg: Omit<import('../../types').AccessPackage, 'id' | 'requestCount' | 'activeGrantCount'>
  ): Promise<import('../../types').AccessPackage> {
    await this.delay(100);
    const newPkg: import('../../types').AccessPackage = {
      ...pkg,
      id: `PKG-${Date.now().toString(36).toUpperCase()}`,
      requestCount: 0,
      activeGrantCount: 0,
    };
    this.store.accessPackages.unshift(newPkg);
    return newPkg;
  }

  async getAccessRequests(requesterId?: string): Promise<import('../../types').AccessRequest[]> {
    await this.delay();
    if (requesterId) {
      return this.store.accessRequests.filter((r) => r.requesterId === requesterId);
    }
    return [...this.store.accessRequests];
  }

  async submitAccessRequest(input: {
    packageId: string;
    requesterId: string;
    justification: string;
    durationDays: number;
  }): Promise<import('../../types').AccessRequest> {
    await this.delay(120);
    const pkg = this.store.accessPackages.find((p) => p.id === input.packageId);
    const emp = this.store.employees.find((e) => e.id === input.requesterId);

    const newReq: import('../../types').AccessRequest = {
      id: `REQ-${Date.now().toString(36).toUpperCase()}`,
      packageId: input.packageId,
      packageName: pkg ? pkg.name : 'Custom Package',
      packageCategory: pkg ? pkg.category : 'DEVELOPMENT',
      riskLevel: pkg ? pkg.riskLevel : 'LOW',
      requesterId: input.requesterId,
      requesterName: emp ? emp.name : 'Current User',
      requesterRole: emp ? emp.roleTitle : 'Developer',
      requesterDepartment: emp ? emp.departmentName : 'Engineering',
      justification: input.justification,
      durationDays: input.durationDays,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      currentStage: 1,
      totalStages: pkg?.approvalStages.length || 1,
      approvers: (pkg?.approvalStages || [{ stage: 1, approverRole: 'MANAGER', slaHours: 24 }]).map(
        (s) => ({
          stage: s.stage,
          approverName: s.approverRole === 'MANAGER' ? emp?.managerName || 'Manager' : `${s.approverRole} Lead`,
          approverRole: s.approverRole,
          status: 'PENDING',
        })
      ),
    };

    if (pkg) {
      pkg.requestCount += 1;
    }
    this.store.accessRequests.unshift(newReq);
    return newReq;
  }

  async approveAccessRequest(
    requestId: string,
    approverRole: string,
    comments?: string
  ): Promise<import('../../types').AccessRequest> {
    await this.delay(100);
    const req = this.store.accessRequests.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');

    const appStep = req.approvers.find((a) => a.approverRole === approverRole || a.stage === req.currentStage);
    if (appStep) {
      appStep.status = 'APPROVED';
      appStep.decisionDate = new Date().toISOString();
      appStep.comments = comments;
    }

    if (req.currentStage < req.totalStages) {
      req.currentStage += 1;
    } else {
      req.status = 'APPROVED';
      // Auto-create grant
      this.store.accessGrants.unshift({
        id: `GNT-${Date.now().toString(36).toUpperCase()}`,
        employeeId: req.requesterId,
        employeeName: req.requesterName,
        employeeEmail: `${req.requesterId}@onboardos.internal`,
        packageId: req.packageId,
        packageName: req.packageName,
        entitlementName: `${req.packageName} Access`,
        app: 'Enterprise Suite',
        grantedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + req.durationDays * 86400000).toISOString(),
        remainingHours: req.durationDays * 24,
        status: 'ACTIVE',
        grantedBy: `Self-Service Request (${req.id})`,
        renewalEligible: true,
        riskLevel: req.riskLevel,
      });
    }
    return req;
  }

  async rejectAccessRequest(
    requestId: string,
    approverRole: string,
    comments: string
  ): Promise<import('../../types').AccessRequest> {
    await this.delay(100);
    const req = this.store.accessRequests.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');
    req.status = 'REJECTED';
    const appStep = req.approvers.find((a) => a.stage === req.currentStage);
    if (appStep) {
      appStep.status = 'REJECTED';
      appStep.decisionDate = new Date().toISOString();
      appStep.comments = comments;
    }
    return req;
  }

  // --- Enterprise Identity: Time-Bound Grants (P0-17) ---

  async getAccessGrants(employeeId?: string): Promise<import('../../types').AccessGrant[]> {
    await this.delay();
    if (employeeId) {
      return this.store.accessGrants.filter((g) => g.employeeId === employeeId);
    }
    return [...this.store.accessGrants];
  }

  async renewAccessGrant(grantId: string, additionalDays: number): Promise<import('../../types').AccessGrant> {
    await this.delay(80);
    const grant = this.store.accessGrants.find((g) => g.id === grantId);
    if (!grant) throw new Error('Grant not found');
    const newExpires = new Date(new Date(grant.expiresAt).getTime() + additionalDays * 86400000);
    grant.expiresAt = newExpires.toISOString();
    grant.remainingHours += additionalDays * 24;
    grant.status = 'RENEWED';
    return grant;
  }

  async revokeAccessGrant(grantId: string, _reason: string): Promise<import('../../types').AccessGrant> {
    await this.delay(80);
    const grant = this.store.accessGrants.find((g) => g.id === grantId);
    if (!grant) throw new Error('Grant not found');
    grant.status = 'REVOKED';
    grant.remainingHours = 0;
    return grant;
  }

  // --- Enterprise Identity: Certification Campaigns (P0-18) ---

  async getCertificationCampaigns(): Promise<import('../../types').AccessReviewCampaign[]> {
    await this.delay();
    return [...this.store.certificationCampaigns];
  }

  async getCertificationCampaign(id: string): Promise<import('../../types').AccessReviewCampaign | null> {
    await this.delay();
    return this.store.certificationCampaigns.find((c) => c.id === id) || null;
  }

  async decideReviewItem(
    campaignId: string,
    itemId: string,
    decision: 'CERTIFY' | 'REVOKE' | 'REVOKE_WITH_EXCEPTION',
    justification?: string
  ): Promise<import('../../types').AccessReviewItem> {
    await this.delay(80);
    const camp = this.store.certificationCampaigns.find((c) => c.id === campaignId);
    if (!camp) throw new Error('Campaign not found');
    const item = camp.items.find((i) => i.id === itemId);
    if (!item) throw new Error('Item not found');

    item.decision = decision;
    item.decidedBy = 'Security Reviewer';
    item.decidedAt = new Date().toISOString();
    item.justification = justification;

    camp.reviewedItems = camp.items.filter((i) => i.decision !== undefined).length;
    camp.revokedItems = camp.items.filter((i) => i.decision?.startsWith('REVOKE')).length;
    return item;
  }

  // --- Enterprise Identity: Separation of Duties (P0-19) ---

  async getSoDRules(): Promise<import('../../types').SoDRule[]> {
    await this.delay();
    return [...this.store.sodRules];
  }

  async getSoDConflicts(): Promise<import('../../types').SoDConflict[]> {
    await this.delay();
    return [...this.store.sodConflicts];
  }

  async resolveSoDConflict(
    conflictId: string,
    action: 'OVERRIDE' | 'REVOKE',
    note?: string
  ): Promise<import('../../types').SoDConflict> {
    await this.delay(100);
    const conflict = this.store.sodConflicts.find((c) => c.id === conflictId);
    if (!conflict) throw new Error('Conflict not found');
    conflict.status = action === 'OVERRIDE' ? 'OVERRIDDEN_APPROVED' : 'BLOCKED_REQUEST';
    conflict.compensatingControlNote = note;
    conflict.approvedBy = 'CISO Lead';
    return conflict;
  }

  // --- Enterprise Identity: JIT Elevation (P1-20) ---

  async getElevationSessions(): Promise<import('../../types').ElevationSession[]> {
    await this.delay();
    return [...this.store.elevationSessions];
  }

  async requestJITElevation(input: {
    employeeId: string;
    targetSystem: string;
    privilegedRole: string;
    durationMinutes: number;
    reason: string;
    isEmergency?: boolean;
  }): Promise<import('../../types').ElevationSession> {
    await this.delay(120);
    const emp = this.store.employees.find((e) => e.id === input.employeeId);
    const newSession: import('../../types').ElevationSession = {
      id: `ELV-${Date.now().toString(36).toUpperCase()}`,
      employeeId: input.employeeId,
      employeeName: emp ? emp.name : 'Operator',
      roleTitle: emp ? emp.roleTitle : 'Developer',
      targetSystem: input.targetSystem,
      privilegedRole: input.privilegedRole,
      durationMinutes: input.durationMinutes,
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + input.durationMinutes * 60000).toISOString(),
      remainingMinutes: input.durationMinutes,
      reason: input.reason,
      isEmergencyBreakGlass: !!input.isEmergency,
      status: 'ACTIVE',
      approvedBy: input.isEmergency ? 'Emergency Break-Glass Auto-Grant' : 'Manager Approved',
      auditSessionId: `AUD-${Date.now().toString(36).toUpperCase()}`,
    };
    this.store.elevationSessions.unshift(newSession);
    return newSession;
  }

  async revokeElevationSession(sessionId: string): Promise<import('../../types').ElevationSession> {
    await this.delay(80);
    const session = this.store.elevationSessions.find((s) => s.id === sessionId);
    if (!session) throw new Error('Session not found');
    session.status = 'REVOKED_MANUALLY';
    session.remainingMinutes = 0;
    return session;
  }

  // --- Enterprise Identity: Identity Source & Reconciliation (P1-21) ---

  async getIdentitySources(): Promise<import('../../types').IdentitySource[]> {
    await this.delay();
    return [...this.store.identitySources];
  }

  async getReconciliationMismatches(): Promise<import('../../types').ReconciliationMismatch[]> {
    await this.delay();
    return [...this.store.reconciliationMismatches];
  }

  async runIdentityReconciliation(): Promise<{
    mismatches: import('../../types').ReconciliationMismatch[];
    scannedAccounts: number;
  }> {
    await this.delay(200);
    return {
      mismatches: [...this.store.reconciliationMismatches],
      scannedAccounts: 1248,
    };
  }

  async resolveReconciliationMismatch(
    mismatchId: string,
    action: 'AUTO_REMEDIATE' | 'IGNORE'
  ): Promise<import('../../types').ReconciliationMismatch> {
    await this.delay(100);
    const item = this.store.reconciliationMismatches.find((m) => m.id === mismatchId);
    if (!item) throw new Error('Mismatch not found');
    item.status = action === 'AUTO_REMEDIATE' ? 'AUTO_REMEDIATED' : 'IGNORED';
    return item;
  }

  // --- Enterprise Identity: SCIM Connectors (P1-22) ---

  async getSCIMConnectors(): Promise<import('../../types').SCIMConnector[]> {
    await this.delay();
    return [...this.store.scimConnectors];
  }

  async testSCIMConnector(id: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
    await this.delay(150);
    const conn = this.store.scimConnectors.find((c) => c.id === id);
    return {
      success: true,
      latencyMs: 48,
      message: `${conn?.appName || 'SCIM 2.0'} schema & user sync endpoint healthy.`,
    };
  }

  // --- Enterprise Identity: External Identity Governance (P1-23) ---

  async getExternalIdentities(): Promise<import('../../types').ExternalIdentity[]> {
    await this.delay();
    return [...this.store.externalIdentities];
  }

  async createExternalIdentity(
    input: Omit<import('../../types').ExternalIdentity, 'id' | 'daysRemaining' | 'status'>
  ): Promise<import('../../types').ExternalIdentity> {
    await this.delay(100);
    const newExt: import('../../types').ExternalIdentity = {
      ...input,
      id: `EXT-${Date.now().toString(36).toUpperCase()}`,
      daysRemaining: Math.max(
        0,
        Math.ceil((new Date(input.expirationDate).getTime() - Date.now()) / 86400000)
      ),
      status: 'ACTIVE',
    };
    this.store.externalIdentities.unshift(newExt);
    return newExt;
  }

  async revokeExternalIdentity(id: string, _reason: string): Promise<import('../../types').ExternalIdentity> {
    await this.delay(80);
    const ext = this.store.externalIdentities.find((e) => e.id === id);
    if (!ext) throw new Error('External identity not found');
    ext.status = 'REVOKED';
    ext.daysRemaining = 0;
    return ext;
  }

  // --- Enterprise Identity: Compliance Evidence Center (P1-24) ---

  async getComplianceEvidence(): Promise<import('../../types').ComplianceEvidenceItem[]> {
    await this.delay();
    return [...this.store.complianceEvidence];
  }

  async exportComplianceAuditReport(_filters?: any): Promise<{
    downloadUrl: string;
    rowCount: number;
    checksum: string;
  }> {
    await this.delay(150);
    return {
      downloadUrl: '#',
      rowCount: this.store.complianceEvidence.length,
      checksum: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    };
  }

  // --- Enterprise Identity: Stale Access Detection (P1-25) ---

  async getStaleAccessItems(): Promise<import('../../types').StaleAccessItem[]> {
    await this.delay();
    return [...this.store.staleAccessItems];
  }

  async reclaimStaleAccess(
    id: string,
    action: 'REVOKE_IMMEDIATE' | 'KEPT_WITH_JUSTIFICATION',
    _note?: string
  ): Promise<import('../../types').StaleAccessItem> {
    await this.delay(80);
    const item = this.store.staleAccessItems.find((s) => s.id === id);
    if (!item) throw new Error('Item not found');
    item.status = action === 'REVOKE_IMMEDIATE' ? 'REVOKED' : 'KEPT_WITH_JUSTIFICATION';
    return item;
  }

  // --- Enterprise Extensions (P2-26..30) ---

  async getDevicePostureSignals(): Promise<import('../../types').DevicePostureSignal[]> {
    await this.delay();
    return [...this.store.devicePostureSignals];
  }

  async getSaaSLicenses(): Promise<import('../../types').SaaSLicense[]> {
    await this.delay();
    return [...this.store.saasLicenses];
  }

  async getAgentIdentities(): Promise<import('../../types').AgentIdentity[]> {
    await this.delay();
    return [...this.store.agentIdentities];
  }

  async createAgentIdentity(
    agent: Omit<import('../../types').AgentIdentity, 'id' | 'lastRunAt'>
  ): Promise<import('../../types').AgentIdentity> {
    await this.delay(100);
    const newAgent: import('../../types').AgentIdentity = {
      ...agent,
      id: `AGT-${Date.now().toString(36).toUpperCase()}`,
      lastRunAt: new Date().toISOString(),
    };
    this.store.agentIdentities.unshift(newAgent);
    return newAgent;
  }

  async toggleAgentStatus(id: string, status: 'ACTIVE' | 'PAUSED'): Promise<import('../../types').AgentIdentity> {
    await this.delay(80);
    const agent = this.store.agentIdentities.find((a) => a.id === id);
    if (!agent) throw new Error('Agent not found');
    agent.status = status;
    return agent;
  }

  async getDelegatedAdminScopes(): Promise<import('../../types').DelegatedAdminScope[]> {
    await this.delay();
    return [...this.store.delegatedAdminScopes];
  }

  async getGovernanceAnalytics(): Promise<import('../../types').GovernanceAnalyticsData> {
    await this.delay();
    return { ...this.store.governanceAnalytics };
  }
}

export const mockClient = new MockOnboardOSClient();


