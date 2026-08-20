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

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

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

// ==========================================
// Enterprise Identity & Access Governance Types
// ==========================================

export type PolicyType =
  | 'BIRTHRIGHT'
  | 'APPROVAL_REQUIRED'
  | 'OPTIONAL'
  | 'DENIED'
  | 'TIME_BOUND'
  | 'CONDITIONAL';

export type PolicyConditionField =
  | 'department'
  | 'roleTitle'
  | 'team'
  | 'seniority'
  | 'employmentType'
  | 'location';

export type PolicyOperator = 'EQUALS' | 'CONTAINS' | 'IN' | 'NOT_EQUALS';

export interface PolicyCondition {
  field: PolicyConditionField;
  operator: PolicyOperator;
  value: string;
}

export interface GrantedEntitlement {
  id: string;
  name: string;
  app: string;
  accessType: string;
  riskLevel: RiskLevel;
  isBirthright: boolean;
  requiresApproval: boolean;
  ttlHours?: number;
  description?: string;
}

export interface BirthrightPolicy {
  id: string;
  name: string;
  description: string;
  policyType: PolicyType;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  priority: number;
  conditions: PolicyCondition[];
  grantedEntitlements: GrantedEntitlement[];
  approvalChain?: {
    step: number;
    approverRole: 'MANAGER' | 'SECURITY' | 'RESOURCE_OWNER' | 'ADMIN';
    slaHours: number;
  }[];
  version: number;
  updatedAt: string;
  author: string;
}

export interface PolicyEvaluationResult {
  employeeId?: string;
  matchedPolicies: {
    policyId: string;
    policyName: string;
    policyType: PolicyType;
    matchedConditions: string[];
  }[];
  evaluatedEntitlements: {
    id: string;
    name: string;
    app: string;
    decision: RequirementDecision;
    sourcePolicy: string;
    isBirthright: boolean;
    riskLevel: RiskLevel;
    ttlHours?: number;
    reason: string;
  }[];
}

// ----------------------------------------------------------------------
// TASK-122 & 123: Access Packages & Self-Service Requests (P0-15, P0-16)
// ----------------------------------------------------------------------
export interface PackageEntitlement {
  id: string;
  name: string;
  app: string;
  type: 'APP_ROLE' | 'GROUP' | 'REPO_PERM' | 'CLOUD_ROLE' | 'CHANNEL';
  permission: string;
  riskLevel: RiskLevel;
}

export interface AccessPackage {
  id: string;
  name: string;
  code: string;
  description: string;
  category: 'DEVELOPMENT' | 'FINANCE' | 'SALES' | 'SECURITY' | 'OPERATIONS' | 'INFRASTRUCTURE';
  riskLevel: RiskLevel;
  ownerName: string;
  ownerEmail: string;
  entitlements: PackageEntitlement[];
  approvalStages: {
    stage: number;
    approverRole: 'MANAGER' | 'RESOURCE_OWNER' | 'SECURITY' | 'ADMIN';
    slaHours: number;
    autoApproveCondition?: string;
  }[];
  maxDurationDays: number; // TTL
  reviewFrequencyDays: number;
  availableToScopes: {
    departments?: string[];
    roles?: string[];
    teams?: string[];
  };
  requestCount: number;
  activeGrantCount: number;
}

export type AccessRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'PROVISIONED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface AccessRequest {
  id: string;
  packageId: string;
  packageName: string;
  packageCategory: string;
  riskLevel: RiskLevel;
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  requesterDepartment: string;
  justification: string;
  durationDays: number;
  status: AccessRequestStatus;
  requestedAt: string;
  currentStage: number;
  totalStages: number;
  approvers: {
    stage: number;
    approverName: string;
    approverRole: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    decisionDate?: string;
    comments?: string;
  }[];
  sodConflictsDetected?: string[];
  expiresAt?: string;
}

// ----------------------------------------------------------------------
// TASK-124: Access Expiration & Time-Bound Grants (P0-17)
// ----------------------------------------------------------------------
export interface AccessGrant {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  packageId?: string;
  packageName: string;
  entitlementName: string;
  app: string;
  grantedAt: string;
  expiresAt: string;
  remainingHours: number;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'REVOKED' | 'RENEWED';
  grantedBy: string; // Policy, Request, Admin
  renewalEligible: boolean;
  riskLevel: RiskLevel;
}

// ----------------------------------------------------------------------
// TASK-125: Access Certification Campaigns (P0-18)
// ----------------------------------------------------------------------
export type CampaignStatus = 'ACTIVE' | 'DRAFT' | 'COMPLETED' | 'OVERDUE';

export interface AccessReviewItem {
  id: string;
  campaignId: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  department: string;
  entitlementName: string;
  app: string;
  sourcePolicyOrRequest: string;
  grantedAt: string;
  lastUsedAt?: string;
  riskLevel: RiskLevel;
  peerComparison: string; // e.g. "95% of peers have this access" or "Anomaly / Outlier (only 5% have)"
  decision?: 'CERTIFY' | 'REVOKE' | 'REVOKE_WITH_EXCEPTION';
  decidedBy?: string;
  decidedAt?: string;
  justification?: string;
}

export interface AccessReviewCampaign {
  id: string;
  name: string;
  scope: string; // e.g. "Q3 Quarterly Security & Engineering Certification"
  deadline: string;
  status: CampaignStatus;
  reviewerRole: 'MANAGER' | 'RESOURCE_OWNER' | 'SECURITY';
  totalItems: number;
  reviewedItems: number;
  revokedItems: number;
  createdAt: string;
  items: AccessReviewItem[];
}

// ----------------------------------------------------------------------
// TASK-126: Separation of Duties (SoD) Conflict Engine (P0-19)
// ----------------------------------------------------------------------
export interface SoDRule {
  id: string;
  name: string;
  description: string;
  riskLevel: 'HIGH' | 'CRITICAL';
  conflictingEntitlements: {
    entitlementA: string;
    appA: string;
    entitlementB: string;
    appB: string;
  };
  enforcementAction: 'HARD_DENY' | 'SECURITY_OVERRIDE_REQUIRED';
  compensatingControlRequired: boolean;
}

export interface SoDConflict {
  id: string;
  ruleId: string;
  ruleName: string;
  employeeId: string;
  employeeName: string;
  department: string;
  existingEntitlement: string;
  conflictingRequestedEntitlement: string;
  riskLevel: 'HIGH' | 'CRITICAL';
  status: 'ACTIVE_VIOLATION' | 'BLOCKED_REQUEST' | 'OVERRIDDEN_APPROVED';
  detectedAt: string;
  compensatingControlNote?: string;
  approvedBy?: string;
}

// ----------------------------------------------------------------------
// TASK-141: JIT Privileged Access (P1-20)
// ----------------------------------------------------------------------
export interface ElevationSession {
  id: string;
  employeeId: string;
  employeeName: string;
  roleTitle: string;
  targetSystem: string;
  privilegedRole: string; // e.g. AWS Production Admin, Prod Postgres Superuser
  durationMinutes: number;
  startedAt: string;
  expiresAt: string;
  remainingMinutes: number;
  reason: string;
  isEmergencyBreakGlass: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED_MANUALLY';
  approvedBy: string;
  auditSessionId: string;
}

// ----------------------------------------------------------------------
// TASK-142: Identity Source & Reconciliation (P1-21)
// ----------------------------------------------------------------------
export interface IdentitySource {
  id: string;
  name: string; // Workday, Okta, Microsoft Entra, BambooHR
  type: 'HRMS' | 'IDP' | 'DIRECTORY';
  isAuthoritative: boolean;
  lastSyncAt: string;
  accountCount: number;
  status: 'HEALTHY' | 'SYNC_IN_PROGRESS' | 'DRIFT_DETECTED';
}

export interface ReconciliationMismatch {
  id: string;
  employeeId: string;
  employeeName: string;
  attribute: string;
  authoritativeValue: string; // e.g. HR says "Engineering"
  targetSystem: string;
  targetSystemValue: string; // e.g. Entra says "Sales"
  detectedAt: string;
  status: 'UNRESOLVED' | 'AUTO_REMEDIATED' | 'IGNORED';
  recommendedAction: string;
}

// ----------------------------------------------------------------------
// TASK-143: SCIM Provisioning Connector Status (P1-22)
// ----------------------------------------------------------------------
export interface SCIMConnector {
  id: string;
  appName: string;
  endpointUrl: string;
  scimVersion: 'SCIM 2.0';
  authType: 'BEARER_TOKEN' | 'OAUTH2';
  supportsUsers: boolean;
  supportsGroups: boolean;
  lastHealthCheck: string;
  syncSuccessRate: number;
  totalSyncedUsers: number;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
}

// ----------------------------------------------------------------------
// TASK-144: External Identity & Contractor Governance (P1-23)
// ----------------------------------------------------------------------
export type IdentityType = 'CONTRACTOR' | 'VENDOR' | 'PARTNER' | 'INTERN' | 'GUEST' | 'SERVICE_ACCOUNT';

export interface ExternalIdentity {
  id: string;
  name: string;
  email: string;
  organization: string;
  identityType: IdentityType;
  sponsorName: string;
  sponsorEmail: string;
  startDate: string;
  expirationDate: string;
  daysRemaining: number;
  assignedPackages: string[];
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'REVOKED';
  businessPurpose: string;
}

// ----------------------------------------------------------------------
// TASK-145: Compliance Evidence & Audit Export Center (P1-24)
// ----------------------------------------------------------------------
export interface ComplianceEvidenceItem {
  id: string;
  timestamp: string;
  employeeName: string;
  employeeId: string;
  action: 'GRANT' | 'REVOKE' | 'EXPIRE' | 'CERTIFY' | 'ELEVATE' | 'TRANSFER';
  entitlement: string;
  system: string;
  authorizedByPolicy: string;
  approvedBy: string;
  workflowId: string;
  evidenceChecksum: string;
}

// ----------------------------------------------------------------------
// TASK-146: Usage-Aware Stale Access Detection (P1-25)
// ----------------------------------------------------------------------
export interface StaleAccessItem {
  id: string;
  employeeId: string;
  employeeName: string;
  roleTitle: string;
  department: string;
  entitlementName: string;
  app: string;
  daysInactive: number;
  lastActivityAt: string;
  monthlyCostUsd?: number;
  riskScore: number;
  recommendation: 'REVOKE_IMMEDIATE' | 'SCHEDULE_REVIEW' | 'DOWNGRADE_TIER';
  status: 'FLAGGED' | 'REVOKED' | 'KEPT_WITH_JUSTIFICATION';
}

// ----------------------------------------------------------------------
// TASK-161: Device-Aware Access Signals (P2-26)
// ----------------------------------------------------------------------
export interface DevicePostureSignal {
  deviceId: string;
  employeeId: string;
  employeeName: string;
  deviceType: 'MacBook Pro' | 'ThinkPad X1' | 'Personal Laptop (BYOD)' | 'iPhone 15';
  managementStatus: 'MANAGED' | 'UNMANAGED';
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'UNKNOWN';
  diskEncrypted: boolean;
  osVersion: string;
  lastCheckinAt: string;
  trustScore: number;
}

// ----------------------------------------------------------------------
// TASK-162: SaaS & License Intelligence (P2-27)
// ----------------------------------------------------------------------
export interface SaaSLicense {
  id: string;
  appName: string;
  tier: string;
  totalSeats: number;
  assignedSeats: number;
  inactiveSeats30d: number;
  costPerSeatMonthly: number;
  potentialMonthlySavings: number;
  status: 'OPTIMAL' | 'RECLAIM_RECOMMENDED' | 'OVER_ALLOCATED';
}

// ----------------------------------------------------------------------
// TASK-163: Service Account & AI Agent Identity Governance (P2-28)
// ----------------------------------------------------------------------
export interface AgentIdentity {
  id: string;
  name: string;
  type: 'AI_AGENT' | 'SERVICE_ACCOUNT' | 'CI_CD_BOT';
  ownerName: string;
  ownerEmail: string;
  allowedTools: string[];
  maxPrivilegeLevel: 'READ_ONLY' | 'SCOPED_WRITE' | 'CLUSTER_ADMIN';
  environment: 'PRODUCTION' | 'DEVELOPMENT';
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED';
  expiresAt?: string;
  lastRunAt: string;
}

// ----------------------------------------------------------------------
// TASK-164: Delegated Administration (P2-29)
// ----------------------------------------------------------------------
export interface DelegatedAdminScope {
  id: string;
  adminName: string;
  adminEmail: string;
  scopeType: 'APPLICATION_OWNER' | 'RESOURCE_OWNER' | 'DEPARTMENT_SECURITY_LEAD';
  assignedScope: string; // e.g. "Payments Applications", "Engineering Dept"
  canApprove: boolean;
  canReview: boolean;
  canManagePolicies: boolean;
}

// ----------------------------------------------------------------------
// TASK-165: Identity Governance Analytics (P2-30)
// ----------------------------------------------------------------------
export interface GovernanceAnalyticsData {
  day1ReadinessRate: number;
  medianOnboardingDays: number;
  accessRequestAverageHours: number;
  reviewCompletionRate: number;
  standingPrivilegeCount: number;
  sodConflictsPrevented: number;
  staleEntitlementsReclaimed: number;
  monthlyLicenseSavingsUsd: number;
}


