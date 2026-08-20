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

class ApiOnboardOSClient implements OnboardOSClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `API error ${res.status}`);
    }
    return res.json();
  }

  async getEmployees(): Promise<Employee[]> {
    return this.request<Employee[]>('/employees');
  }

  async getEmployee(id: string): Promise<Employee | null> {
    return this.request<Employee>(`/employees/${id}`);
  }

  async createEmployee(input: CreateEmployeeInput): Promise<Employee> {
    return this.request<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getEmployeeContext(employeeId: string): Promise<EmployeeContext | null> {
    return this.request<EmployeeContext>(`/employees/${employeeId}/context`);
  }

  async getRules(): Promise<RequirementRule[]> {
    return this.request<RequirementRule[]>('/rules');
  }

  async getRulesByScope(department: string, role: string): Promise<RequirementRule[]> {
    return this.request<RequirementRule[]>(`/rules?department=${department}&role=${role}`);
  }

  async generatePlan(employeeId: string): Promise<OnboardingPlan> {
    return this.request<OnboardingPlan>(`/employees/${employeeId}/plan/generate`, {
      method: 'POST',
    });
  }

  async getPlan(employeeId: string): Promise<OnboardingPlan | null> {
    return this.request<OnboardingPlan>(`/employees/${employeeId}/plan`);
  }

  async updatePlanItemDecision(
    itemId: string,
    decision: RequirementDecision,
    reason: string
  ): Promise<PlanItem> {
    return this.request<PlanItem>(`/plans/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ decision, reason }),
    });
  }

  async getTasks(employeeId: string): Promise<Task[]> {
    return this.request<Task[]>(`/employees/${employeeId}/tasks`);
  }

  async retryTask(taskId: string): Promise<{ task: Task; unblockedTasks: Task[] }> {
    return this.request<{ task: Task; unblockedTasks: Task[] }>(`/tasks/${taskId}/retry`, {
      method: 'POST',
    });
  }

  async skipTask(taskId: string, reason: string): Promise<Task> {
    return this.request<Task>(`/tasks/${taskId}/skip`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getApprovals(role?: 'MANAGER' | 'SECURITY' | 'ADMIN'): Promise<Approval[]> {
    return this.request<Approval[]>(role ? `/approvals?role=${role}` : '/approvals');
  }

  async respondApproval(
    approvalId: string,
    status: ApprovalStatus,
    note?: string
  ): Promise<{ approval: Approval; unblockedTask?: Task }> {
    return this.request<{ approval: Approval; unblockedTask?: Task }>(
      `/approvals/${approvalId}/respond`,
      {
        method: 'POST',
        body: JSON.stringify({ status, note }),
      }
    );
  }

  async getRiskAssessment(employeeId: string): Promise<RiskAssessment> {
    return this.request<RiskAssessment>(`/employees/${employeeId}/risk`);
  }

  async simulateWhatIf(
    employeeId: string,
    input: WhatIfSimulationInput
  ): Promise<WhatIfSimulationDiff> {
    return this.request<WhatIfSimulationDiff>(`/employees/${employeeId}/what-if`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getExceptions(): Promise<ExceptionEvent[]> {
    return this.request<ExceptionEvent[]>('/exceptions');
  }

  async resolveException(exceptionId: string, note?: string): Promise<ExceptionEvent> {
    return this.request<ExceptionEvent>(`/exceptions/${exceptionId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  async getAuditLogs(employeeId?: string): Promise<AuditLog[]> {
    return this.request<AuditLog[]>(employeeId ? `/audit?employeeId=${employeeId}` : '/audit');
  }

  async getTickets(employeeId?: string): Promise<Ticket[]> {
    return this.request<Ticket[]>(employeeId ? `/tickets?employeeId=${employeeId}` : '/tickets');
  }

  async createTicket(input: {
    employeeId: string;
    subject: string;
    category: string;
    description: string;
  }): Promise<Ticket> {
    return this.request<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getAssets(employeeId?: string): Promise<Asset[]> {
    return this.request<Asset[]>(employeeId ? `/assets?employeeId=${employeeId}` : '/assets');
  }

  async getKnowledgeDocs(): Promise<KnowledgeDocument[]> {
    return this.request<KnowledgeDocument[]>('/knowledge/docs');
  }

  async searchKnowledge(query: string): Promise<KnowledgeAnswer> {
    return this.request<KnowledgeAnswer>('/knowledge/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async getNotifications(userId: string): Promise<NotificationItem[]> {
    return this.request<NotificationItem[]>(`/notifications?userId=${userId}`);
  }

  async getTransferRequests(): Promise<TransferRequest[]> {
    return this.request<TransferRequest[]>('/transfers');
  }

  async createTransferRequest(
    employeeId: string,
    targetContext: Partial<EmployeeContext>
  ): Promise<TransferRequest> {
    return this.request<TransferRequest>('/transfers', {
      method: 'POST',
      body: JSON.stringify({ employeeId, targetContext }),
    });
  }

  async applyTransfer(requestId: string): Promise<TransferRequest> {
    return this.request<TransferRequest>(`/transfers/${requestId}/apply`, {
      method: 'POST',
    });
  }

  async getOffboardingPlan(employeeId: string): Promise<OffboardingPlan | null> {
    return this.request<OffboardingPlan>(`/offboarding/${employeeId}`);
  }

  async createOffboardingPlan(employeeId: string): Promise<OffboardingPlan> {
    return this.request<OffboardingPlan>(`/offboarding/${employeeId}`, {
      method: 'POST',
    });
  }

  async getOffboardingRisks(): Promise<OffboardingRiskFlag[]> {
    return this.request<OffboardingRiskFlag[]>('/offboarding/risks');
  }

  async resolveOffboardingRisk(flagId: string): Promise<OffboardingRiskFlag> {
    return this.request<OffboardingRiskFlag>(`/offboarding/risks/${flagId}/resolve`, {
      method: 'POST',
    });
  }

  async getMentorAssignment(employeeId: string): Promise<MentorAssignment | null> {
    return this.request<MentorAssignment>(`/mentors/${employeeId}`);
  }

  async getFirstWeekPlan(employeeId: string): Promise<FirstWeekPlanItem[]> {
    return this.request<FirstWeekPlanItem[]>(`/first-week/${employeeId}`);
  }

  async submitPulse(
    employeeId: string,
    value: 'GREAT' | 'GOOD' | 'OKAY' | 'STRUGGLING',
    note?: string
  ): Promise<PulseResponse> {
    return this.request<PulseResponse>('/pulse', {
      method: 'POST',
      body: JSON.stringify({ employeeId, value, note }),
    });
  }

  async getPulseTrends(): Promise<PulseTrendData[]> {
    return this.request<PulseTrendData[]>('/pulse/trends');
  }

  async getCommunityPosts(): Promise<CommunityPost[]> {
    return this.request<CommunityPost[]>('/community/posts');
  }

  async createCommunityPost(post: {
    title: string;
    body: string;
    type: 'ANNOUNCEMENT' | 'EVENT' | 'UPDATE' | 'POLL' | 'KNOWLEDGE';
  }): Promise<CommunityPost> {
    return this.request<CommunityPost>('/community/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  }

  async resetDemoState(): Promise<void> {
    return this.request<void>('/demo/reset', { method: 'POST' });
  }

  async injectJiraFailure(employeeId?: string): Promise<void> {
    return this.request<void>('/demo/inject-failure', {
      method: 'POST',
      body: JSON.stringify({ employeeId, adapter: 'JIRA' }),
    });
  }
}

export const apiClient = new ApiOnboardOSClient();
