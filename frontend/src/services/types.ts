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
  UserRole,
} from '../types';

export interface CreateEmployeeInput {
  name: string;
  email: string;
  roleTitle: string;
  department: string;
  team: string;
  seniority: 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';
  location: string;
  employmentType: 'FULL_TIME' | 'CONTRACT' | 'INTERN';
  managerName?: string;
  startDate?: string;
}

export interface OnboardOSClient {
  // Employees
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | null>;
  createEmployee(input: CreateEmployeeInput): Promise<Employee>;
  getEmployeeContext(employeeId: string): Promise<EmployeeContext | null>;

  // Policies & Rules
  getRules(): Promise<RequirementRule[]>;
  getRulesByScope(department: string, role: string): Promise<RequirementRule[]>;

  // Plans & AI Reasoning
  generatePlan(employeeId: string): Promise<OnboardingPlan>;
  getPlan(employeeId: string): Promise<OnboardingPlan | null>;
  updatePlanItemDecision(itemId: string, decision: RequirementDecision, reason: string): Promise<PlanItem>;

  // Tasks & Execution DAG
  getTasks(employeeId: string): Promise<Task[]>;
  retryTask(taskId: string): Promise<{ task: Task; unblockedTasks: Task[] }>;
  skipTask(taskId: string, reason: string): Promise<Task>;

  // Approvals
  getApprovals(role?: 'MANAGER' | 'SECURITY' | 'ADMIN'): Promise<Approval[]>;
  respondApproval(
    approvalId: string,
    status: ApprovalStatus,
    note?: string
  ): Promise<{ approval: Approval; unblockedTask?: Task }>;

  // Risk & Readiness
  getRiskAssessment(employeeId: string): Promise<RiskAssessment>;

  // What-If Simulation
  simulateWhatIf(employeeId: string, input: WhatIfSimulationInput): Promise<WhatIfSimulationDiff>;

  // Exceptions & Failures
  getExceptions(): Promise<ExceptionEvent[]>;
  resolveException(exceptionId: string, note?: string): Promise<ExceptionEvent>;

  // Audit Logs
  getAuditLogs(employeeId?: string): Promise<AuditLog[]>;

  // P1 Intelligence
  getTickets(employeeId?: string): Promise<Ticket[]>;
  createTicket(input: { employeeId: string; subject: string; category: string; description: string }): Promise<Ticket>;
  getAssets(employeeId?: string): Promise<Asset[]>;
  getKnowledgeDocs(): Promise<KnowledgeDocument[]>;
  searchKnowledge(query: string): Promise<KnowledgeAnswer>;
  getNotifications(userId: string): Promise<NotificationItem[]>;

  // P2 Lifecycle & Platform Extensions
  getTransferRequests(): Promise<TransferRequest[]>;
  createTransferRequest(employeeId: string, targetContext: Partial<EmployeeContext>): Promise<TransferRequest>;
  applyTransfer(requestId: string): Promise<TransferRequest>;
  getOffboardingPlan(employeeId: string): Promise<OffboardingPlan | null>;
  createOffboardingPlan(employeeId: string): Promise<OffboardingPlan>;
  getOffboardingRisks(): Promise<OffboardingRiskFlag[]>;
  resolveOffboardingRisk(flagId: string): Promise<OffboardingRiskFlag>;
  getMentorAssignment(employeeId: string): Promise<MentorAssignment | null>;
  getFirstWeekPlan(employeeId: string): Promise<FirstWeekPlanItem[]>;
  submitPulse(employeeId: string, value: 'GREAT' | 'GOOD' | 'OKAY' | 'STRUGGLING', note?: string): Promise<PulseResponse>;
  getPulseTrends(): Promise<PulseTrendData[]>;
  getCommunityPosts(): Promise<CommunityPost[]>;
  createCommunityPost(post: { title: string; body: string; type: 'ANNOUNCEMENT' | 'EVENT' | 'UPDATE' | 'POLL' | 'KNOWLEDGE' }): Promise<CommunityPost>;

  // Demo Control
  resetDemoState(): Promise<void>;
  injectJiraFailure(employeeId?: string): Promise<void>;
}
