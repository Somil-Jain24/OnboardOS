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

class ApiOnboardOSClient implements OnboardOSClient {
  private baseUrl: string;

  constructor() {
    const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    this.baseUrl = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/+$/, '')}/api`;
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
      throw new Error(err.error || err.message || `API error ${res.status}`);
    }
    const json = await res.json();
    return (json && typeof json === 'object' && 'data' in json) ? json.data : json;
  }

  async getEmployees(): Promise<Employee[]> {
    return this.request<Employee[]>('/employees');
  }

  async getEmployee(id: string): Promise<Employee | null> {
    return this.request<Employee>(`/employees/${id}`);
  }

  async createEmployee(input: CreateEmployeeInput): Promise<Employee & { automation?: any }> {
    const res = await fetch(`${this.baseUrl}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.error || err.message || `API error ${res.status}`);
    }
    const json = await res.json();
    const employeeData = json.data || json;
    if (json.automation) {
      employeeData.automation = json.automation;
    }
    return employeeData;
  }

  async bulkCreateEmployees(employees: CreateEmployeeInput[]): Promise<{ count: number; data: Employee[] }> {
    return this.request<{ count: number; data: Employee[] }>('/employees/bulk', {
      method: 'POST',
      body: JSON.stringify({ employees }),
    });
  }

  async offboardEmployee(employeeId: string, details?: { exitDate?: string; reason?: string; notes?: string }): Promise<any> {
    return this.request<any>(`/employees/${employeeId}/offboard`, {
      method: 'POST',
      body: JSON.stringify(details || {}),
    });
  }

  async bulkOffboardEmployees(records: Array<{ employeeId?: string; email?: string; reason?: string; exitDate?: string }>): Promise<any> {
    return this.request<any>('/employees/bulk-offboard', {
      method: 'POST',
      body: JSON.stringify({ records }),
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

  async askCopilot(employeeId: string, question: string): Promise<any> {
    return this.request<any>(`/employees/${employeeId}/copilot`, {
      method: 'POST',
      body: JSON.stringify({ question }),
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

  async claimTask(taskId: string): Promise<{ task: Task; credentials: any }> {
    const res = await this.request<{ task: Task; credentials: any }>(`/tasks/${taskId}/claim`, {
      method: 'POST',
    });
    return res;
  }

  async skipTask(taskId: string, reason: string): Promise<Task> {
    return this.request<Task>(`/tasks/${taskId}/skip`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async manualOverrideTask(
    taskId: string,
    reason: string
  ): Promise<{ task: Task; unblockedTasks: Task[] }> {
    return this.request<{ task: Task; unblockedTasks: Task[] }>(`/tasks/${taskId}/override`, {
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

  async resolveTicket(ticketId: string, resolutionNote: string): Promise<Ticket> {
    return this.request<Ticket>(`/tickets/${ticketId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolutionNote }),
    });
  }

  async reassignTicket(ticketId: string, team: string): Promise<Ticket> {
    return this.request<Ticket>(`/tickets/${ticketId}/reassign`, {
      method: 'PATCH',
      body: JSON.stringify({ team }),
    });
  }

  async getAssets(employeeId?: string): Promise<Asset[]> {
    return this.request<Asset[]>(employeeId ? `/assets?employeeId=${employeeId}` : '/assets');
  }

  async assignAsset(input: {
    employeeId: string;
    employeeName: string;
    type: 'LAPTOP' | 'MONITOR' | 'KEYBOARD' | 'MOUSE' | 'ID_CARD' | 'ACCESS_CARD';
    model: string;
    serialNumber: string;
  }): Promise<Asset> {
    return this.request<Asset>('/assets', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateAssetState(
    assetId: string,
    state: 'ASSIGNED' | 'RECEIVED' | 'DAMAGED' | 'LOST' | 'RETURNED'
  ): Promise<Asset> {
    return this.request<Asset>(`/assets/${assetId}/state`, {
      method: 'PATCH',
      body: JSON.stringify({ state }),
    });
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

  async markNotificationAsRead(id: string): Promise<NotificationItem> {
    return this.request<NotificationItem>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    return this.request<void>('/notifications/read-all', { method: 'POST' });
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

  async getIntegrationSettings(): Promise<any> {
    const res = await this.request<{ success: boolean; data: any }>('/settings/integrations');
    return res.data || res;
  }

  async updateIntegrationSettings(settings: any): Promise<any> {
    const res = await this.request<{ success: boolean; data: any }>('/settings/integrations', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
    return res.data || res;
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

  // --- Enterprise Identity: Birthright Policies ---

  async getBirthrightPolicies(): Promise<BirthrightPolicy[]> {
    return this.request<BirthrightPolicy[]>('/policies/birthright');
  }

  async createBirthrightPolicy(
    policy: Omit<BirthrightPolicy, 'id' | 'version' | 'updatedAt'>
  ): Promise<BirthrightPolicy> {
    return this.request<BirthrightPolicy>('/policies/birthright', {
      method: 'POST',
      body: JSON.stringify(policy),
    });
  }

  async updateBirthrightPolicy(
    id: string,
    updates: Partial<BirthrightPolicy>
  ): Promise<BirthrightPolicy> {
    return this.request<BirthrightPolicy>(`/policies/birthright/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteBirthrightPolicy(id: string): Promise<boolean> {
    await this.request<void>(`/policies/birthright/${id}`, {
      method: 'DELETE',
    });
    return true;
  }

  async evaluateBirthrightAccess(
    context: Partial<EmployeeContext>
  ): Promise<PolicyEvaluationResult> {
    return this.request<PolicyEvaluationResult>('/policies/birthright/evaluate', {
      method: 'POST',
      body: JSON.stringify(context),
    });
  }

  // --- Enterprise Identity Methods ---
  async getAccessPackages(): Promise<import('../../types').AccessPackage[]> {
    return this.request<import('../../types').AccessPackage[]>('/packages');
  }
  async getAccessPackage(id: string): Promise<import('../../types').AccessPackage | null> {
    return this.request<import('../../types').AccessPackage>(`/packages/${id}`);
  }
  async createAccessPackage(pkg: Omit<import('../../types').AccessPackage, 'id' | 'requestCount' | 'activeGrantCount'>): Promise<import('../../types').AccessPackage> {
    return this.request<import('../../types').AccessPackage>('/packages', { method: 'POST', body: JSON.stringify(pkg) });
  }
  async getAccessRequests(requesterId?: string): Promise<import('../../types').AccessRequest[]> {
    return this.request<import('../../types').AccessRequest[]>(`/requests${requesterId ? `?requesterId=${requesterId}` : ''}`);
  }
  async submitAccessRequest(input: { packageId: string; requesterId: string; justification: string; durationDays: number }): Promise<import('../../types').AccessRequest> {
    return this.request<import('../../types').AccessRequest>('/requests', { method: 'POST', body: JSON.stringify(input) });
  }
  async approveAccessRequest(requestId: string, approverRole: string, comments?: string): Promise<import('../../types').AccessRequest> {
    return this.request<import('../../types').AccessRequest>(`/requests/${requestId}/approve`, { method: 'POST', body: JSON.stringify({ approverRole, comments }) });
  }
  async rejectAccessRequest(requestId: string, approverRole: string, comments: string): Promise<import('../../types').AccessRequest> {
    return this.request<import('../../types').AccessRequest>(`/requests/${requestId}/reject`, { method: 'POST', body: JSON.stringify({ approverRole, comments }) });
  }
  async getAccessGrants(employeeId?: string): Promise<import('../../types').AccessGrant[]> {
    return this.request<import('../../types').AccessGrant[]>(`/grants${employeeId ? `?employeeId=${employeeId}` : ''}`);
  }
  async renewAccessGrant(grantId: string, additionalDays: number): Promise<import('../../types').AccessGrant> {
    return this.request<import('../../types').AccessGrant>(`/grants/${grantId}/renew`, { method: 'POST', body: JSON.stringify({ additionalDays }) });
  }
  async revokeAccessGrant(grantId: string, reason: string): Promise<import('../../types').AccessGrant> {
    return this.request<import('../../types').AccessGrant>(`/grants/${grantId}/revoke`, { method: 'POST', body: JSON.stringify({ reason }) });
  }
  async getCertificationCampaigns(): Promise<import('../../types').AccessReviewCampaign[]> {
    return this.request<import('../../types').AccessReviewCampaign[]>('/certifications');
  }
  async getCertificationCampaign(id: string): Promise<import('../../types').AccessReviewCampaign | null> {
    return this.request<import('../../types').AccessReviewCampaign>(`/certifications/${id}`);
  }
  async decideReviewItem(campaignId: string, itemId: string, decision: 'CERTIFY' | 'REVOKE' | 'REVOKE_WITH_EXCEPTION', justification?: string): Promise<import('../../types').AccessReviewItem> {
    return this.request<import('../../types').AccessReviewItem>(`/certifications/${campaignId}/items/${itemId}/decision`, { method: 'POST', body: JSON.stringify({ decision, justification }) });
  }
  async getSoDRules(): Promise<import('../../types').SoDRule[]> {
    return this.request<import('../../types').SoDRule[]>('/sod/rules');
  }
  async getSoDConflicts(): Promise<import('../../types').SoDConflict[]> {
    return this.request<import('../../types').SoDConflict[]>('/sod/conflicts');
  }
  async resolveSoDConflict(conflictId: string, action: 'OVERRIDE' | 'REVOKE', note?: string): Promise<import('../../types').SoDConflict> {
    return this.request<import('../../types').SoDConflict>(`/sod/conflicts/${conflictId}/resolve`, { method: 'POST', body: JSON.stringify({ action, note }) });
  }
  async getElevationSessions(): Promise<import('../../types').ElevationSession[]> {
    return this.request<import('../../types').ElevationSession[]>('/privileged/sessions');
  }
  async requestJITElevation(input: { employeeId: string; targetSystem: string; privilegedRole: string; durationMinutes: number; reason: string; isEmergency?: boolean }): Promise<import('../../types').ElevationSession> {
    return this.request<import('../../types').ElevationSession>('/privileged/elevate', { method: 'POST', body: JSON.stringify(input) });
  }
  async revokeElevationSession(sessionId: string): Promise<import('../../types').ElevationSession> {
    return this.request<import('../../types').ElevationSession>(`/privileged/sessions/${sessionId}/revoke`, { method: 'POST' });
  }
  async getIdentitySources(): Promise<import('../../types').IdentitySource[]> {
    return this.request<import('../../types').IdentitySource[]>('/identity/sources');
  }
  async getReconciliationMismatches(): Promise<import('../../types').ReconciliationMismatch[]> {
    return this.request<import('../../types').ReconciliationMismatch[]>('/identity/mismatches');
  }
  async runIdentityReconciliation(): Promise<{ mismatches: import('../../types').ReconciliationMismatch[]; scannedAccounts: number }> {
    return this.request<{ mismatches: import('../../types').ReconciliationMismatch[]; scannedAccounts: number }>('/identity/reconcile', { method: 'POST' });
  }
  async resolveReconciliationMismatch(mismatchId: string, action: 'AUTO_REMEDIATE' | 'IGNORE'): Promise<import('../../types').ReconciliationMismatch> {
    return this.request<import('../../types').ReconciliationMismatch>(`/identity/mismatches/${mismatchId}/resolve`, { method: 'POST', body: JSON.stringify({ action }) });
  }
  async getSCIMConnectors(): Promise<import('../../types').SCIMConnector[]> {
    return this.request<import('../../types').SCIMConnector[]>('/scim/connectors');
  }
  async testSCIMConnector(id: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
    return this.request<{ success: boolean; latencyMs: number; message: string }>(`/scim/connectors/${id}/test`, { method: 'POST' });
  }
  async getExternalIdentities(): Promise<import('../../types').ExternalIdentity[]> {
    return this.request<import('../../types').ExternalIdentity[]>('/external-identities');
  }
  async createExternalIdentity(input: Omit<import('../../types').ExternalIdentity, 'id' | 'daysRemaining' | 'status'>): Promise<import('../../types').ExternalIdentity> {
    return this.request<import('../../types').ExternalIdentity>('/external-identities', { method: 'POST', body: JSON.stringify(input) });
  }
  async revokeExternalIdentity(id: string, reason: string): Promise<import('../../types').ExternalIdentity> {
    return this.request<import('../../types').ExternalIdentity>(`/external-identities/${id}/revoke`, { method: 'POST', body: JSON.stringify({ reason }) });
  }
  async getComplianceEvidence(): Promise<import('../../types').ComplianceEvidenceItem[]> {
    return this.request<import('../../types').ComplianceEvidenceItem[]>('/compliance/evidence');
  }
  async exportComplianceAuditReport(filters?: any): Promise<{ downloadUrl: string; rowCount: number; checksum: string }> {
    return this.request<{ downloadUrl: string; rowCount: number; checksum: string }>('/compliance/export', { method: 'POST', body: JSON.stringify(filters) });
  }
  async getStaleAccessItems(): Promise<import('../../types').StaleAccessItem[]> {
    return this.request<import('../../types').StaleAccessItem[]>('/governance/stale-access');
  }
  async reclaimStaleAccess(id: string, action: 'REVOKE_IMMEDIATE' | 'KEPT_WITH_JUSTIFICATION', note?: string): Promise<import('../../types').StaleAccessItem> {
    return this.request<import('../../types').StaleAccessItem>(`/governance/stale-access/${id}/reclaim`, { method: 'POST', body: JSON.stringify({ action, note }) });
  }
  async getDevicePostureSignals(): Promise<import('../../types').DevicePostureSignal[]> {
    return this.request<import('../../types').DevicePostureSignal[]>('/devices/posture');
  }
  async getSaaSLicenses(): Promise<import('../../types').SaaSLicense[]> {
    return this.request<import('../../types').SaaSLicense[]>('/licenses');
  }
  async getAgentIdentities(): Promise<import('../../types').AgentIdentity[]> {
    return this.request<import('../../types').AgentIdentity[]>('/agents');
  }
  async createAgentIdentity(agent: Omit<import('../../types').AgentIdentity, 'id' | 'lastRunAt'>): Promise<import('../../types').AgentIdentity> {
    return this.request<import('../../types').AgentIdentity>('/agents', { method: 'POST', body: JSON.stringify(agent) });
  }
  async toggleAgentStatus(id: string, status: 'ACTIVE' | 'PAUSED'): Promise<import('../../types').AgentIdentity> {
    return this.request<import('../../types').AgentIdentity>(`/agents/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) });
  }
  async getDelegatedAdminScopes(): Promise<import('../../types').DelegatedAdminScope[]> {
    return this.request<import('../../types').DelegatedAdminScope[]>('/admin/scopes');
  }
  async getGovernanceAnalytics(): Promise<import('../../types').GovernanceAnalyticsData> {
    return this.request<import('../../types').GovernanceAnalyticsData>('/governance/analytics');
  }

  async testViaSocketNewEmployee(employeeId?: string): Promise<any> {
    return this.request<any>('/demo/automation/new-employee-test', {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    });
  }

  async testViaSocketEvent(eventType: string, employeeId?: string): Promise<any> {
    return this.request<any>('/demo/automation/trigger-event', {
      method: 'POST',
      body: JSON.stringify({ eventType, employeeId }),
    });
  }
}

export const apiClient = new ApiOnboardOSClient();


