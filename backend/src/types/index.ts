export type SeniorityLevel = 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';
export type EmploymentType = 'FULL_TIME' | 'CONTRACT' | 'INTERN';
export type EmployeeStatus = 'INVITED' | 'ACTIVE' | 'EXITING' | 'OFFBOARDED';

export type UserRole = 'ADMIN' | 'HR' | 'IT' | 'MANAGER' | 'EMPLOYEE';

export type RuleCategory =
  | 'Identity'
  | 'Communication'
  | 'Development'
  | 'Project'
  | 'Security'
  | 'Cloud'
  | 'Training'
  | 'Assets'
  | 'People'
  | 'HR_EXIT'
  | 'IT_REVOKE'
  | 'MANAGER_HANDOVER'
  | 'FINANCE';

export type RequirementDecision =
  | 'REQUIRED'
  | 'OPTIONAL'
  | 'NOT_APPLICABLE'
  | 'APPROVAL_REQUIRED'
  | 'BLOCKED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type PlanStatus = 'DRAFT' | 'ACTIVE' | 'SUPERSEDED';

export type TaskStatus =
  | 'PENDING'
  | 'READY'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'WAITING_APPROVAL'
  | 'BLOCKED'
  | 'REJECTED'
  | 'HUMAN_INTERVENTION'
  | 'SKIPPED';

export type AdapterType =
  | 'GOOGLE'
  | 'SLACK'
  | 'GITHUB'
  | 'JIRA'
  | 'AWS'
  | 'HRMS'
  | 'VPN'
  | 'ASSET'
  | 'NONE';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUESTED';

export type ExceptionSeverity = 'CRITICAL' | 'ACTION_REQUIRED' | 'WARNING' | 'RESOLVED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleTitle: string;
  departmentId: string;
  departmentName: string;
  teamId: string;
  teamName: string;
  projectId?: string;
  projectName?: string;
  seniority: SeniorityLevel;
  location: string;
  employmentType: EmploymentType;
  managerId?: string;
  managerName?: string;
  status: EmployeeStatus;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeContext {
  id: string;
  employeeId: string;
  capturedAt: string;
  roleTitle: string;
  department: string;
  team: string;
  seniority: SeniorityLevel;
  location: string;
  employmentType: EmploymentType;
  managerId?: string;
  projectId?: string;
  raw: Record<string, any>;
}

export interface RequirementRule {
  id: string;
  version: number;
  effectiveFrom: string;
  supersedesId?: string;
  scope: {
    roleTitle?: string;
    department?: string;
    team?: string;
    seniority?: SeniorityLevel;
    employmentType?: EmploymentType;
  };
  requirementName: string;
  category: RuleCategory;
  decision: RequirementDecision;
  approvalChain?: UserRole[];
  riskLevel: RiskLevel;
  reasonTemplate: string;
  createdBy: string;
  createdAt: string;
}

export interface PlanItem {
  id: string;
  planId: string;
  requirementRuleId?: string;
  name: string;
  category: RuleCategory;
  finalDecision: RequirementDecision;
  reason: string;
  aiRecommendedDecision?: RequirementDecision;
  aiConfidence?: number;
  aiRationale?: string;
  riskLevel: RiskLevel;
  taskId?: string;
}

export interface OnboardingPlan {
  id: string;
  employeeId: string;
  employeeContextId: string;
  ruleSetVersion: number;
  generatedAt: string;
  status: PlanStatus;
  planItems: PlanItem[];
  reasoningSequence?: Array<{
    step: number;
    title: string;
    description: string;
    status: 'completed' | 'running' | 'pending';
    details?: string;
  }>;
}

export interface Task {
  id: string;
  planItemId?: string;
  employeeId: string;
  name: string;
  category: RuleCategory;
  status: TaskStatus;
  adapterType: AdapterType;
  attempt: number;
  idempotencyKey?: string;
  failureReason?: string;
  failureCode?: string;
  dependsOn?: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
}

export interface Approval {
  id: string;
  taskId: string;
  taskName?: string;
  employeeId: string;
  employeeName?: string;
  stage: number;
  approverRole: UserRole;
  approverUserId?: string;
  status: ApprovalStatus;
  requestedAt: string;
  respondedAt?: string;
  slaTargetAt?: string;
  reason: string;
  responseNote?: string;
}

export interface IntegrationAdapterAction {
  id: string;
  taskId: string;
  adapterType: AdapterType;
  operation: string;
  idempotencyKey: string;
  success: boolean;
  externalId?: string;
  errorCode?: string;
  reason?: string;
  requestedAt: string;
  respondedAt?: string;
  payload?: Record<string, any>;
}

export interface ExceptionEvent {
  id: string;
  employeeId: string;
  taskId?: string;
  approvalId?: string;
  severity: ExceptionSeverity;
  title: string;
  description: string;
  impactSummary: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface RiskAssessment {
  id: string;
  employeeId: string;
  computedAt: string;
  riskScore: number;
  riskLevel: RiskLevel;
  factors: Array<{ factor: string; weight: number; detail: string }>;
  dayOneReady: boolean;
  readinessBreakdown: {
    criticalTasksComplete: number;
    totalCriticalTasks: number;
    requiredAccessComplete: number;
    totalRequiredAccess: number;
    requiredTrainingComplete: number;
    totalRequiredTraining: number;
    blockingFailures: number;
    pendingApprovals: number;
  };
}

export interface AuditLog {
  id: string;
  employeeId?: string;
  actorUserId?: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  reason?: string;
  result?: string;
  createdAt: string;
}

export interface AccessPackage {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  riskLevel: RiskLevel;
  ownerName: string;
  ownerEmail: string;
  maxDurationDays: number;
  reviewFrequencyDays: number;
  entitlements: Array<{
    id: string;
    name: string;
    app: string;
    type: string;
    permission: string;
    riskLevel: RiskLevel;
  }>;
  approvalStages: Array<{
    stage: number;
    approverRole: UserRole;
    slaHours: number;
  }>;
  activeGrantCount: number;
  requestCount: number;
}
