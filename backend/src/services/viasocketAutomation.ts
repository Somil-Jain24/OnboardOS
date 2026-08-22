import crypto from 'crypto';
import { env } from '../config/env';
import { store } from '../db/store';
import type { Employee, EmployeeContext, Task, Approval } from '../types';

export type ViaSocketEventType =
  | 'employee.created'
  | 'employee.offboarded'
  | 'approval.requested'
  | 'task.failed'
  | 'task.retry_succeeded'
  | 'onboarding.day_one_ready';

export interface BaseAutomationPayload {
  event_id: string;
  event_type: ViaSocketEventType;
  org_id: string;
  timestamp: string;
  idempotency_key: string;
  employee: {
    id: string;
    name: string;
    email: string;
    department: string;
    team: string;
    role: string;
    manager_name: string;
    start_date: string;
  };
  employee_url: string;
}

export interface NewEmployeeAutomationPayload extends BaseAutomationPayload {
  event_type: 'employee.created';
}

export interface ApprovalRequestedAutomationPayload extends BaseAutomationPayload {
  event_type: 'approval.requested';
  approval: {
    id: string;
    task_name: string;
    approver_role: string;
    approver_name?: string;
    reason: string;
    risk_level: string;
    sla_deadline?: string;
    approval_url: string;
  };
}

export interface TaskFailedAutomationPayload extends BaseAutomationPayload {
  event_type: 'task.failed';
  task: {
    id: string;
    name: string;
    adapter_type: string;
    attempt: number;
    failure_code?: string;
    failure_reason?: string;
    blocked_downstream_tasks_count: number;
    incident_url: string;
  };
}

export interface TaskRecoveryAutomationPayload extends BaseAutomationPayload {
  event_type: 'task.retry_succeeded';
  recovered_task: {
    id: string;
    name: string;
    adapter_type: string;
    attempt: number;
    previous_failure_reason?: string;
  };
  unblocked_tasks: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  readiness_summary: {
    day_one_ready: boolean;
    readiness_score: number;
  };
}

export interface DayOneReadyAutomationPayload extends BaseAutomationPayload {
  event_type: 'onboarding.day_one_ready';
  readiness: {
    score: number;
    day_one_ready: boolean;
    completed_tasks_count: number;
    total_tasks_count: number;
    pending_approvals_count: number;
    blocking_failures_count: number;
    confirmed_at: string;
  };
}

export interface OffboardingAutomationPayload extends BaseAutomationPayload {
  event_type: 'employee.offboarded';
  offboarding: {
    exit_date: string;
    reason: string;
    certificate_id: string;
    revoked_systems_count: number;
    revocation_url: string;
  };
}

export type AnyAutomationPayload =
  | NewEmployeeAutomationPayload
  | OffboardingAutomationPayload
  | ApprovalRequestedAutomationPayload
  | TaskFailedAutomationPayload
  | TaskRecoveryAutomationPayload
  | DayOneReadyAutomationPayload;

export interface AutomationDispatchResult {
  success: boolean;
  status: 'dispatched' | 'skipped_duplicate' | 'failed' | 'not_configured';
  statusCode?: number;
  response?: any;
  error?: string;
  eventId: string;
  idempotencyKey: string;
  timestamp: string;
  duplicateSkipped?: boolean;
}

// In-memory ledger of dispatched idempotency keys to prevent duplicate dispatches
const dispatchedIdempotencyKeys = new Set<string>();

/**
 * Returns the configured webhook URL for a specific event type.
 * Webhook URLs are strictly server-side environment variables and are NEVER returned in API responses.
 */
function getWebhookUrlForEvent(eventType: ViaSocketEventType): string | undefined {
  switch (eventType) {
    case 'employee.created':
      return env.VIASOCKET_NEW_EMPLOYEE_WEBHOOK_URL;
    case 'employee.offboarded':
      return env.VIASOCKET_OFFBOARDING_WEBHOOK_URL || env.VIASOCKET_NEW_EMPLOYEE_WEBHOOK_URL;
    case 'approval.requested':
      return env.VIASOCKET_APPROVAL_WEBHOOK_URL;
    case 'task.failed':
      return env.VIASOCKET_TASK_FAILURE_WEBHOOK_URL;
    case 'task.retry_succeeded':
      return env.VIASOCKET_RECOVERY_WEBHOOK_URL;
    case 'onboarding.day_one_ready':
      return env.VIASOCKET_DAY_ONE_READY_WEBHOOK_URL;
    default:
      return undefined;
  }
}

/**
 * Generic server-only ViaSocket event dispatcher with:
 * - Server-side webhook lookup by event type
 * - 10-second timeout with AbortController
 * - Idempotency protection
 * - Non-blocking execution (never fails primary business transactions)
 * - Safe sanitized audit logging
 * - Redacted status return (never returns raw URLs or secrets to client)
 */
export async function dispatchViaSocketEvent<T extends AnyAutomationPayload>(
  eventType: ViaSocketEventType,
  payload: T,
  idempotencyKey: string,
  options?: { forceDispatch?: boolean }
): Promise<AutomationDispatchResult> {
  const now = new Date().toISOString();
  const eventId = payload.event_id || (crypto.randomUUID ? crypto.randomUUID() : `evt-${Date.now()}`);

  // 1. Idempotency Check
  if (dispatchedIdempotencyKeys.has(idempotencyKey) && !options?.forceDispatch) {
    console.info(`ℹ️ [ViaSocket] Skipped duplicate dispatch for idempotency key: ${idempotencyKey}`);
    return {
      success: true,
      status: 'skipped_duplicate',
      statusCode: 200,
      response: { received: true, note: 'Duplicate dispatch skipped by idempotency check' },
      eventId,
      idempotencyKey,
      timestamp: now,
    };
  }

  // 2. Webhook URL Lookup
  const webhookUrl = getWebhookUrlForEvent(eventType);
  if (!webhookUrl || webhookUrl.trim() === '' || webhookUrl.includes('your_')) {
    return {
      success: true,
      status: 'not_configured',
      eventId,
      idempotencyKey,
      timestamp: now,
    };
  }

  console.log(`📡 [ViaSocket] Dispatching '${eventType}' event with idempotency key: ${idempotencyKey}`);

  try {
    // 3. 10-second timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OnboardOS-Backend/1.0.0',
        'X-OnboardOS-Event': eventType,
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    let responseData: any = {};
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { text: responseText };
    }

    if (!response.ok) {
      const errorMsg = `ViaSocket webhook returned HTTP ${response.status}: ${responseText}`;
      console.error(`❌ [ViaSocket] Webhook dispatch failed for ${eventType}:`, errorMsg);

      // Record audit log
      store.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        employeeId: payload.employee.id,
        actorRole: 'ADMIN',
        action: 'VIASOCKET_AUTOMATION_FAILED',
        entityType: 'AutomationEvent',
        entityId: eventId,
        reason: `ViaSocket automation dispatch for ${eventType} failed (HTTP ${response.status}).`,
        result: 'FAILURE',
        createdAt: now,
      });

      return {
        success: false,
        status: 'failed',
        statusCode: response.status,
        response: responseData,
        error: errorMsg,
        eventId,
        idempotencyKey,
        timestamp: now,
      };
    }

    // 4. Success - Record in idempotency ledger & audit logs
    dispatchedIdempotencyKeys.add(idempotencyKey);
    console.log(`✅ [ViaSocket] '${eventType}' dispatched successfully (HTTP ${response.status})`);

    const actionReasonMap: Record<ViaSocketEventType, string> = {
      'employee.created': 'HR & IT Slack alerts sent and Google Sheets employee tracking row appended.',
      'employee.offboarded': 'Employee offboarding notice sent to Slack, accounts revoked and Offboarding Sheet updated.',
      'approval.requested': 'Manager signoff alert sent to Slack and logged in Approvals Sheet.',
      'task.failed': 'High-priority IT incident alert sent to Slack and logged in Incidents Sheet.',
      'task.retry_succeeded': 'Task recovery notification sent to Slack and downstream DAG unblocked.',
      'onboarding.day_one_ready': 'Day-1 Readiness celebration alert sent to Slack and Onboarding Sheet updated.',
    };

    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      employeeId: payload.employee.id,
      actorRole: 'ADMIN',
      action: 'VIASOCKET_AUTOMATION_DISPATCHED',
      entityType: 'AutomationEvent',
      entityId: eventId,
      reason: actionReasonMap[eventType] || `ViaSocket automation dispatched for ${eventType}.`,
      result: 'SUCCESS',
      createdAt: now,
    });

    return {
      success: true,
      status: 'dispatched',
      statusCode: response.status,
      response: responseData,
      eventId,
      idempotencyKey,
      timestamp: now,
    };
  } catch (err: any) {
    const errorMsg = err.name === 'AbortError'
      ? `ViaSocket webhook for '${eventType}' timed out after 10000ms`
      : err.message || `Network error during ViaSocket '${eventType}' dispatch`;

    console.error(`❌ [ViaSocket] Error dispatching '${eventType}':`, errorMsg);

    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      employeeId: payload.employee.id,
      actorRole: 'ADMIN',
      action: 'VIASOCKET_AUTOMATION_ERROR',
      entityType: 'AutomationEvent',
      entityId: eventId,
      reason: errorMsg,
      result: 'ERROR',
      createdAt: now,
    });

    return {
      success: false,
      status: 'failed',
      error: errorMsg,
      eventId,
      idempotencyKey,
      timestamp: now,
    };
  }
}

// ------------------------------------------------------------------------------------------------
// Specialized Dispatch Helpers
// ------------------------------------------------------------------------------------------------

/**
 * 1. employee.created: Dispatched when HR creates an employee profile.
 */
export async function dispatchNewEmployeeAutomation(
  employee: Employee,
  context?: EmployeeContext,
  options?: { forceDispatch?: boolean }
): Promise<AutomationDispatchResult> {
  const idempotencyKey = `employee-created-${employee.id}`;
  const now = new Date().toISOString();
  const eventId = crypto.randomUUID ? crypto.randomUUID() : `evt-${Date.now()}`;

  const payload: any = {
    event_id: eventId,
    event_type: 'employee.created',
    org_id: 'a0000000-0000-0000-0000-000000000001',
    timestamp: now,
    idempotency_key: idempotencyKey,
    // Flat top-level fields for easy Google Sheets & Email column mapping
    name: employee.name,
    email: employee.email,
    role: employee.roleTitle || 'Software Engineer',
    department: employee.departmentName || 'Engineering',
    team: employee.teamName || 'Payments Core',
    manager_name: employee.managerName || 'Marcus Vance',
    manager_email: 'marcus.vance@onboardos.internal',
    status: employee.status || 'ACTIVE',
    action: 'EMPLOYEE_CREATED',
    start_date: employee.startDate ? employee.startDate.split('T')[0] : now.split('T')[0],
    summary: `New employee onboarded: ${employee.name} (${employee.roleTitle || 'Software Engineer'} • ${employee.departmentName || 'Engineering'})`,
    details: `Onboarding access provisioned across Google Workspace, Slack, GitHub, Jira, and AWS.`,
    sheet_name: 'Sheet1',
    employee_url: `${env.APP_BASE_URL}/employees/${employee.id}`,
    employee: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.departmentName || 'Engineering',
      team: employee.teamName || 'Payments Core',
      role: employee.roleTitle || 'Software Engineer',
      manager_name: employee.managerName || 'Marcus Vance',
      start_date: employee.startDate ? employee.startDate.split('T')[0] : now.split('T')[0],
    },
  };

  return dispatchViaSocketEvent('employee.created', payload, idempotencyKey, options);
}

/**
 * 2. approval.requested: Dispatched when an approval is required for access.
 */
export async function dispatchApprovalRequestedAutomation(
  approval: Approval,
  employee: Employee,
  options?: { forceDispatch?: boolean }
): Promise<AutomationDispatchResult> {
  const idempotencyKey = `approval-requested-${approval.id}`;
  const now = new Date().toISOString();
  const eventId = crypto.randomUUID ? crypto.randomUUID() : `evt-appr-${Date.now()}`;

  const payload: ApprovalRequestedAutomationPayload = {
    event_id: eventId,
    event_type: 'approval.requested',
    org_id: 'a0000000-0000-0000-0000-000000000001',
    timestamp: now,
    idempotency_key: idempotencyKey,
    employee: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.departmentName || 'Engineering',
      team: employee.teamName || 'Payments Core',
      role: employee.roleTitle || 'Software Engineer',
      manager_name: employee.managerName || 'Marcus Vance',
      start_date: employee.startDate ? employee.startDate.split('T')[0] : now.split('T')[0],
    },
    employee_url: `${env.APP_BASE_URL}/employees/${employee.id}`,
    approval: {
      id: approval.id,
      task_name: approval.taskName || 'Access Provisioning Gate',
      approver_role: approval.approverRole,
      approver_name: (approval as any).approverUserName || employee.managerName || 'Marcus Vance',
      reason: approval.reason,
      risk_level: (approval as any).riskLevel || 'MEDIUM',
      sla_deadline: approval.slaTargetAt || (approval as any).slaDeadline,
      approval_url: `${env.APP_BASE_URL}/manager/approvals`,
    },
  };

  return dispatchViaSocketEvent('approval.requested', payload, idempotencyKey, options);
}

/**
 * 3. task.failed: Dispatched when a task execution/adapter fails.
 */
export async function dispatchTaskFailedAutomation(
  task: Task,
  employee: Employee,
  blockedDownstreamCount: number,
  options?: { forceDispatch?: boolean }
): Promise<AutomationDispatchResult> {
  const idempotencyKey = `task-failed-${task.id}-attempt-${task.attempt}`;
  const now = new Date().toISOString();
  const eventId = crypto.randomUUID ? crypto.randomUUID() : `evt-fail-${Date.now()}`;

  const payload: TaskFailedAutomationPayload = {
    event_id: eventId,
    event_type: 'task.failed',
    org_id: 'a0000000-0000-0000-0000-000000000001',
    timestamp: now,
    idempotency_key: idempotencyKey,
    employee: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.departmentName || 'Engineering',
      team: employee.teamName || 'Payments Core',
      role: employee.roleTitle || 'Software Engineer',
      manager_name: employee.managerName || 'Marcus Vance',
      start_date: employee.startDate ? employee.startDate.split('T')[0] : now.split('T')[0],
    },
    employee_url: `${env.APP_BASE_URL}/employees/${employee.id}/provisioning`,
    task: {
      id: task.id,
      name: task.name,
      adapter_type: task.adapterType,
      attempt: task.attempt,
      failure_code: task.failureCode || 'ADAPTER_EXECUTION_ERROR',
      failure_reason: task.failureReason || 'Downstream adapter error',
      blocked_downstream_tasks_count: blockedDownstreamCount,
      incident_url: `${env.APP_BASE_URL}/hr/exceptions`,
    },
  };

  return dispatchViaSocketEvent('task.failed', payload, idempotencyKey, options);
}

/**
 * 4. task.retry_succeeded: Dispatched when a previously failed task is retried and succeeds.
 */
export async function dispatchTaskRecoveryAutomation(
  recoveredTask: Task,
  employee: Employee,
  unblockedTasks: Array<{ id: string; name: string; status: string }>,
  options?: { forceDispatch?: boolean }
): Promise<AutomationDispatchResult> {
  const idempotencyKey = `task-recovery-${recoveredTask.id}-attempt-${recoveredTask.attempt}`;
  const now = new Date().toISOString();
  const eventId = crypto.randomUUID ? crypto.randomUUID() : `evt-rec-${Date.now()}`;

  const risk = store.risks.find((r) => r.employeeId === employee.id);

  const payload: TaskRecoveryAutomationPayload = {
    event_id: eventId,
    event_type: 'task.retry_succeeded',
    org_id: 'a0000000-0000-0000-0000-000000000001',
    timestamp: now,
    idempotency_key: idempotencyKey,
    employee: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.departmentName || 'Engineering',
      team: employee.teamName || 'Payments Core',
      role: employee.roleTitle || 'Software Engineer',
      manager_name: employee.managerName || 'Marcus Vance',
      start_date: employee.startDate ? employee.startDate.split('T')[0] : now.split('T')[0],
    },
    employee_url: `${env.APP_BASE_URL}/employees/${employee.id}/provisioning`,
    recovered_task: {
      id: recoveredTask.id,
      name: recoveredTask.name,
      adapter_type: recoveredTask.adapterType,
      attempt: recoveredTask.attempt,
      previous_failure_reason: recoveredTask.failureReason || 'Recovered from previous adapter error',
    },
    unblocked_tasks: unblockedTasks,
    readiness_summary: {
      day_one_ready: risk?.dayOneReady ?? true,
      readiness_score: risk ? (100 - risk.riskScore) : 92,
    },
  };

  return dispatchViaSocketEvent('task.retry_succeeded', payload, idempotencyKey, options);
}

/**
 * 5. onboarding.day_one_ready: Dispatched when an employee achieves 100% readiness with zero blockers.
 */
export async function dispatchDayOneReadyAutomation(
  employee: Employee,
  readinessScore: number,
  completedTasksCount: number,
  options?: { forceDispatch?: boolean }
): Promise<AutomationDispatchResult> {
  const idempotencyKey = `day-one-ready-${employee.id}`;
  const now = new Date().toISOString();
  const eventId = crypto.randomUUID ? crypto.randomUUID() : `evt-ready-${Date.now()}`;

  const totalTasks = store.tasks.filter((t) => t.employeeId === employee.id).length || 6;
  const pendingApprovals = store.approvals.filter((a) => a.employeeId === employee.id && a.status === 'PENDING').length;
  const blockingFailures = store.tasks.filter((t) => t.employeeId === employee.id && t.status === 'FAILED').length;

  const payload: DayOneReadyAutomationPayload = {
    event_id: eventId,
    event_type: 'onboarding.day_one_ready',
    org_id: 'a0000000-0000-0000-0000-000000000001',
    timestamp: now,
    idempotency_key: idempotencyKey,
    employee: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.departmentName || 'Engineering',
      team: employee.teamName || 'Payments Core',
      role: employee.roleTitle || 'Software Engineer',
      manager_name: employee.managerName || 'Marcus Vance',
      start_date: employee.startDate ? employee.startDate.split('T')[0] : now.split('T')[0],
    },
    employee_url: `${env.APP_BASE_URL}/employees/${employee.id}`,
    readiness: {
      score: readinessScore,
      day_one_ready: true,
      completed_tasks_count: completedTasksCount,
      total_tasks_count: totalTasks,
      pending_approvals_count: pendingApprovals,
      blocking_failures_count: blockingFailures,
      confirmed_at: now,
    },
  };

  return dispatchViaSocketEvent('onboarding.day_one_ready', payload, idempotencyKey, options);
}

/**
 * 6. employee.offboarded: Dispatched when an employee is offboarded and access is revoked.
 */
export async function dispatchEmployeeOffboardedAutomation(
  employee: Employee,
  offboardingDetails: { exitDate?: string; reason?: string; certificateId: string; revokedSystemsCount: number },
  options?: { forceDispatch?: boolean }
): Promise<AutomationDispatchResult> {
  const idempotencyKey = `offboarding-${employee.id}-${offboardingDetails.certificateId}`;
  const now = new Date().toISOString();
  const eventId = crypto.randomUUID ? crypto.randomUUID() : `evt-off-${Date.now()}`;

  const payload: any = {
    event_id: eventId,
    event_type: 'employee.offboarded',
    org_id: 'a0000000-0000-0000-0000-000000000001',
    timestamp: now,
    idempotency_key: idempotencyKey,
    // Flat top-level fields for easy Google Sheets & Email column mapping
    name: employee.name,
    email: employee.email,
    role: employee.roleTitle || 'Software Engineer',
    department: employee.departmentName || 'Engineering',
    team: employee.teamName || 'Payments Core',
    manager_name: employee.managerName || 'Marcus Vance',
    manager_email: 'marcus.vance@onboardos.internal',
    status: 'OFFBOARDED',
    action: 'ACCESS_REVOKED',
    exit_date: offboardingDetails.exitDate || now.split('T')[0],
    reason: offboardingDetails.reason || 'Standard Departure',
    certificate_id: offboardingDetails.certificateId,
    revoked_systems_count: offboardingDetails.revokedSystemsCount,
    summary: `Employee offboarded & access revoked: ${employee.name} (${employee.roleTitle || 'Software Engineer'})`,
    details: `Revoked access across Google Workspace, Slack, GitHub, Jira, and AWS Cloud. Certificate ID: ${offboardingDetails.certificateId}`,
    sheet_name: 'Offboarding',
    employee_url: `${env.APP_BASE_URL}/hr/offboarding`,
    employee: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.departmentName || 'Engineering',
      team: employee.teamName || 'Payments Core',
      role: employee.roleTitle || 'Software Engineer',
      manager_name: employee.managerName || 'Marcus Vance',
      start_date: employee.startDate ? employee.startDate.split('T')[0] : now.split('T')[0],
    },
    offboarding: {
      exit_date: offboardingDetails.exitDate || now.split('T')[0],
      reason: offboardingDetails.reason || 'Standard Departure',
      certificate_id: offboardingDetails.certificateId,
      revoked_systems_count: offboardingDetails.revokedSystemsCount,
      revocation_url: `${env.APP_BASE_URL}/hr/offboarding`,
    },
  };

  return dispatchViaSocketEvent('employee.offboarded', payload, idempotencyKey, options);
}

