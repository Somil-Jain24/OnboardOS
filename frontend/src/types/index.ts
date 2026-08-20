// OnboardOS Core Type System (P0, P1, P2)

export type UserRole = 'ADMIN' | 'HR' | 'IT' | 'MANAGER' | 'EMPLOYEE';

export type SeniorityLevel = 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';

export type EmploymentType = 'FULL_TIME' | 'CONTRACT' | 'INTERN';

export type EmployeeStatus = 'INVITED' | 'ACTIVE' | 'EXITING' | 'OFFBOARDED';

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

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

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

export type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'MORE_INFO_REQUESTED';

export type ExceptionSeverity =
  | 'CRITICAL'
  | 'ACTION_REQUIRED'
  | 'WARNING'
  | 'RESOLVED';

export type NotificationPriority =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

export type AssetType =
  | 'LAPTOP'
  | 'MONITOR'
  | 'KEYBOARD'
  | 'MOUSE'
  | 'ID_CARD'
  | 'ACCESS_CARD';

export type AssetState =
  | 'ASSIGNED'
  | 'RECEIVED'
  | 'DAMAGED'
  | 'LOST'
  | 'RETURNED';

export type TransferStatus = 'DRAFT' | 'APPLIED';

export type OffboardingStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETE';

export type PulseValue = 'GREAT' | 'GOOD' | 'OKAY' | 'STRUGGLING';

export type CommunityPostType =
  | 'ANNOUNCEMENT'
  | 'EVENT'
  | 'UPDATE'
  | 'POLL'
  | 'KNOWLEDGE';

// --- Domain Models ---

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  employeeId?: string;
  avatarUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  orgId: string;
  name: string;
}

export interface Team {
  id: string;
  departmentId: string;
  name: string;
}

export interface Project {
  id: string;
  teamId: string;
  name: string;
  code: string;
}

export interface RoleModel {
  id: string;
  title: string;
  departmentId: string;
  level: SeniorityLevel;
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
  avatarUrl?: string;
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
  managerName?: string;
  projectId?: string;
  projectName?: string;
  raw: Record<string, unknown>;
}

export interface RequirementRule {
  id: string;
  version: number;
  effectiveFrom: string;
  supersedesId?: string;
  scope: {
    role?: string;
    department?: string;
    team?: string;
    seniority?: string;
    employmentType?: string;
  };
  requirementName: string;
  category: RuleCategory;
  decision: RequirementDecision;
  approvalChain?: ('MANAGER' | 'SECURITY' | 'ADMIN')[];
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
  approvalChain?: string[];
  taskId?: string;
}

export interface OnboardingPlan {
  id: string;
  employeeId: string;
  employeeContextId: string;
  ruleSetVersion: number;
  generatedAt: string;
  status: 'DRAFT' | 'ACTIVE' | 'SUPERSEDED';
  items: PlanItem[];
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
  impactSummary?: string;
  affectedDownstreamIds?: string[];
  dependsOnTaskIds?: string[];
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
  taskName: string;
  employeeId: string;
  employeeName: string;
  stage: number;
  approverRole: 'MANAGER' | 'SECURITY' | 'ADMIN';
  approverUserId?: string;
  approverUserName?: string;
  status: ApprovalStatus;
  riskLevel: RiskLevel;
  requestedAt: string;
  respondedAt?: string;
  slaTargetAt: string;
  reason: string;
  responseNote?: string;
}

export interface ExceptionEvent {
  id: string;
  employeeId: string;
  employeeName: string;
  taskId?: string;
  taskName?: string;
  approvalId?: string;
  severity: ExceptionSeverity;
  title: string;
  description: string;
  impactSummary: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ReadinessBreakdown {
  criticalTasksTotal: number;
  criticalTasksComplete: number;
  requiredAccessTotal: number;
  requiredAccessComplete: number;
  requiredTrainingTotal: number;
  requiredTrainingComplete: number;
  blockingFailures: number;
  pendingApprovals: number;
}

export interface RiskFactor {
  factor: string;
  weight: number;
  detail: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RiskAssessment {
  id: string;
  employeeId: string;
  computedAt: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  dayOneReady: boolean;
  readinessScore: number; // 0 - 100
  readinessBreakdown: ReadinessBreakdown;
}

export interface AuditLog {
  id: string;
  employeeId?: string;
  employeeName?: string;
  actorUserId?: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  reason?: string;
  result?: string;
  createdAt: string;
}

// --- P1 Intelligence Types ---

export interface Ticket {
  id: string;
  employeeId: string;
  employeeName: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  team: string;
  slaHours: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  description: string;
  aiClassification?: {
    suggestedCategory: string;
    suggestedPriority: string;
    confidence: number;
    recommendedActions: string[];
  };
  createdAt: string;
  resolvedAt?: string;
}

export interface Asset {
  id: string;
  employeeId: string;
  employeeName: string;
  type: AssetType;
  serialNumber: string;
  model: string;
  state: AssetState;
  assignedAt: string;
  returnedAt?: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  source: string;
  content: string;
  updatedAt: string;
}

export interface KnowledgeAnswer {
  query: string;
  answer: string;
  citations: {
    docId: string;
    docTitle: string;
    snippet: string;
  }[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  priority: NotificationPriority;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  refType?: string;
  refId?: string;
}

// --- P2 Lifecycle & Extension Types ---

export interface WhatIfSimulationInput {
  roleId?: string;
  roleTitle?: string;
  departmentId?: string;
  department?: string;
  teamId?: string;
  team?: string;
  seniority: SeniorityLevel;
  location?: string;
  employmentType?: string;
}

export interface WhatIfSimulationDiff {
  accessAdded: { name: string; category: RuleCategory; reason: string; riskLevel: RiskLevel }[];
  accessRemoved: { name: string; category: RuleCategory; reason: string }[];
  accessUnchanged: { name: string; category: RuleCategory }[];
  approvalsRequiredDelta: string[];
  riskScoreDelta: number;
  newRiskScore: number;
  newRiskLevel: RiskLevel;
  readinessDelta: number;
  newReadinessScore: number;
}

export interface TransferRequest {
  id: string;
  employeeId: string;
  fromContext: EmployeeContext;
  toContext: Partial<EmployeeContext>;
  diffAccessAdded: { name: string; category: RuleCategory; reason: string }[];
  diffAccessRemoved: { name: string; category: RuleCategory; reason: string }[];
  diffApprovals: string[];
  status: TransferStatus;
  appliedAt?: string;
  createdBy: string;
  createdAt: string;
}

export interface OffboardingPlan {
  id: string;
  employeeId: string;
  initiatedAt: string;
  exitDate: string;
  status: OffboardingStatus;
  tasks: Task[];
  createdAt: string;
}

export interface OffboardingRiskFlag {
  id: string;
  employeeId: string;
  employeeName: string;
  system: string;
  detectedAt: string;
  resolvedAt?: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING';
}

export interface MentorAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  mentorName: string;
  mentorRole: string;
  mentorEmail: string;
  mentorSlack: string;
  buddyName: string;
  buddyRole: string;
  buddyEmail: string;
  buddySlack: string;
  assignedAt: string;
  scheduledSyncs: { date: string; time: string; topic: string; status: 'SCHEDULED' | 'COMPLETED' }[];
}

export interface FirstWeekPlanItem {
  id: string;
  employeeId: string;
  day: number; // 1-5
  time: string;
  title: string;
  description: string;
  category: 'SETUP' | 'MEETING' | 'TRAINING' | 'CHECKIN';
  completed: boolean;
}

export interface PulseResponse {
  id: string;
  employeeId: string;
  submittedAt: string;
  value: PulseValue;
  note?: string;
}

export interface PulseTrendData {
  week: string;
  greatPercent: number;
  goodPercent: number;
  okayPercent: number;
  strugglingPercent: number;
  totalResponses: number;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  type: CommunityPostType;
  title: string;
  body: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}
