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
  bulkCreateEmployees(employees: CreateEmployeeInput[]): Promise<{ count: number; data: Employee[] }>;
  offboardEmployee(employeeId: string, details?: { exitDate?: string; reason?: string; notes?: string }): Promise<any>;
  bulkOffboardEmployees(records: Array<{ employeeId?: string; email?: string; reason?: string; exitDate?: string }>): Promise<any>;
  getEmployeeContext(employeeId: string): Promise<EmployeeContext | null>;

  // Policies & Rules
  getRules(): Promise<RequirementRule[]>;
  getRulesByScope(department: string, role: string): Promise<RequirementRule[]>;

  // Plans & AI Reasoning
  generatePlan(employeeId: string): Promise<OnboardingPlan>;
  getPlan(employeeId: string): Promise<OnboardingPlan | null>;
  updatePlanItemDecision(itemId: string, decision: RequirementDecision, reason: string): Promise<PlanItem>;
  askCopilot(employeeId: string, question: string): Promise<any>;

  // Tasks & Execution DAG
  getTasks(employeeId: string): Promise<Task[]>;
  claimTask(taskId: string): Promise<{ task: Task; credentials: any }>;
  retryTask(taskId: string): Promise<{ task: Task; unblockedTasks: Task[] }>;
  skipTask(taskId: string, reason: string): Promise<Task>;
  manualOverrideTask(taskId: string, reason: string): Promise<{ task: Task; unblockedTasks: Task[] }>;

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
  resolveTicket(ticketId: string, resolutionNote: string): Promise<Ticket>;
  reassignTicket(ticketId: string, team: string): Promise<Ticket>;
  getAssets(employeeId?: string): Promise<Asset[]>;
  assignAsset(input: { employeeId: string; employeeName: string; type: 'LAPTOP' | 'MONITOR' | 'KEYBOARD' | 'MOUSE' | 'ID_CARD' | 'ACCESS_CARD'; model: string; serialNumber: string }): Promise<Asset>;
  updateAssetState(assetId: string, state: 'ASSIGNED' | 'RECEIVED' | 'DAMAGED' | 'LOST' | 'RETURNED'): Promise<Asset>;
  getKnowledgeDocs(): Promise<KnowledgeDocument[]>;
  searchKnowledge(query: string): Promise<KnowledgeAnswer>;
  getNotifications(userId: string): Promise<NotificationItem[]>;
  markNotificationAsRead(id: string): Promise<NotificationItem>;
  markAllNotificationsAsRead(): Promise<void>;

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

  // Demo & Integration Settings Control
  getIntegrationSettings(): Promise<any>;
  updateIntegrationSettings(settings: any): Promise<any>;
  resetDemoState(): Promise<void>;
  injectJiraFailure(employeeId?: string): Promise<void>;

  // Enterprise Identity: Birthright Policies
  getBirthrightPolicies(): Promise<import('../types').BirthrightPolicy[]>;
  createBirthrightPolicy(policy: Omit<import('../types').BirthrightPolicy, 'id' | 'version' | 'updatedAt'>): Promise<import('../types').BirthrightPolicy>;
  updateBirthrightPolicy(id: string, updates: Partial<import('../types').BirthrightPolicy>): Promise<import('../types').BirthrightPolicy>;
  deleteBirthrightPolicy(id: string): Promise<boolean>;
  evaluateBirthrightAccess(context: Partial<import('../types').EmployeeContext>): Promise<import('../types').PolicyEvaluationResult>;

  // Enterprise Identity: Access Packages & Requests (P0-15, P0-16)
  getAccessPackages(): Promise<import('../types').AccessPackage[]>;
  getAccessPackage(id: string): Promise<import('../types').AccessPackage | null>;
  createAccessPackage(pkg: Omit<import('../types').AccessPackage, 'id' | 'requestCount' | 'activeGrantCount'>): Promise<import('../types').AccessPackage>;
  getAccessRequests(requesterId?: string): Promise<import('../types').AccessRequest[]>;
  submitAccessRequest(input: { packageId: string; requesterId: string; justification: string; durationDays: number }): Promise<import('../types').AccessRequest>;
  approveAccessRequest(requestId: string, approverRole: string, comments?: string): Promise<import('../types').AccessRequest>;
  rejectAccessRequest(requestId: string, approverRole: string, comments: string): Promise<import('../types').AccessRequest>;

  // Enterprise Identity: Time-Bound Grants (P0-17)
  getAccessGrants(employeeId?: string): Promise<import('../types').AccessGrant[]>;
  renewAccessGrant(grantId: string, additionalDays: number): Promise<import('../types').AccessGrant>;
  revokeAccessGrant(grantId: string, reason: string): Promise<import('../types').AccessGrant>;

  // Enterprise Identity: Certification Campaigns (P0-18)
  getCertificationCampaigns(): Promise<import('../types').AccessReviewCampaign[]>;
  getCertificationCampaign(id: string): Promise<import('../types').AccessReviewCampaign | null>;
  decideReviewItem(campaignId: string, itemId: string, decision: 'CERTIFY' | 'REVOKE' | 'REVOKE_WITH_EXCEPTION', justification?: string): Promise<import('../types').AccessReviewItem>;

  // Enterprise Identity: Separation of Duties (P0-19)
  getSoDRules(): Promise<import('../types').SoDRule[]>;
  getSoDConflicts(): Promise<import('../types').SoDConflict[]>;
  resolveSoDConflict(conflictId: string, action: 'OVERRIDE' | 'REVOKE', note?: string): Promise<import('../types').SoDConflict>;

  // Enterprise Identity: JIT Elevation (P1-20)
  getElevationSessions(): Promise<import('../types').ElevationSession[]>;
  requestJITElevation(input: { employeeId: string; targetSystem: string; privilegedRole: string; durationMinutes: number; reason: string; isEmergency?: boolean }): Promise<import('../types').ElevationSession>;
  revokeElevationSession(sessionId: string): Promise<import('../types').ElevationSession>;

  // Enterprise Identity: Identity Source & Reconciliation (P1-21)
  getIdentitySources(): Promise<import('../types').IdentitySource[]>;
  getReconciliationMismatches(): Promise<import('../types').ReconciliationMismatch[]>;
  runIdentityReconciliation(): Promise<{ mismatches: import('../types').ReconciliationMismatch[]; scannedAccounts: number }>;
  resolveReconciliationMismatch(mismatchId: string, action: 'AUTO_REMEDIATE' | 'IGNORE'): Promise<import('../types').ReconciliationMismatch>;

  // Enterprise Identity: SCIM Connectors (P1-22)
  getSCIMConnectors(): Promise<import('../types').SCIMConnector[]>;
  testSCIMConnector(id: string): Promise<{ success: boolean; latencyMs: number; message: string }>;

  // Enterprise Identity: External Identity Governance (P1-23)
  getExternalIdentities(): Promise<import('../types').ExternalIdentity[]>;
  createExternalIdentity(input: Omit<import('../types').ExternalIdentity, 'id' | 'daysRemaining' | 'status'>): Promise<import('../types').ExternalIdentity>;
  revokeExternalIdentity(id: string, reason: string): Promise<import('../types').ExternalIdentity>;

  // Enterprise Identity: Compliance Evidence Center (P1-24)
  getComplianceEvidence(): Promise<import('../types').ComplianceEvidenceItem[]>;
  exportComplianceAuditReport(filters?: any): Promise<{ downloadUrl: string; rowCount: number; checksum: string }>;

  // Enterprise Identity: Stale Access Detection (P1-25)
  getStaleAccessItems(): Promise<import('../types').StaleAccessItem[]>;
  reclaimStaleAccess(id: string, action: 'REVOKE_IMMEDIATE' | 'KEPT_WITH_JUSTIFICATION', note?: string): Promise<import('../types').StaleAccessItem>;

  // Enterprise Extensions: Device Trust Signals (P2-26)
  getDevicePostureSignals(): Promise<import('../types').DevicePostureSignal[]>;

  // Enterprise Extensions: SaaS & License Intelligence (P2-27)
  getSaaSLicenses(): Promise<import('../types').SaaSLicense[]>;

  // Enterprise Extensions: AI Agent Governance (P2-28)
  getAgentIdentities(): Promise<import('../types').AgentIdentity[]>;
  createAgentIdentity(agent: Omit<import('../types').AgentIdentity, 'id' | 'lastRunAt'>): Promise<import('../types').AgentIdentity>;
  toggleAgentStatus(id: string, status: 'ACTIVE' | 'PAUSED'): Promise<import('../types').AgentIdentity>;

  // Enterprise Extensions: Delegated Admin (P2-29)
  getDelegatedAdminScopes(): Promise<import('../types').DelegatedAdminScope[]>;

  // Enterprise Extensions: Governance Analytics (P2-30)
  getGovernanceAnalytics(): Promise<import('../types').GovernanceAnalyticsData>;

  // ViaSocket Automation Test Controls
  testViaSocketNewEmployee(employeeId?: string): Promise<any>;
  testViaSocketEvent(eventType: string, employeeId?: string): Promise<any>;
}


