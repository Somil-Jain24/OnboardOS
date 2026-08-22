import { Router, Request, Response } from 'express';
import { store } from '../db/store';
import {
  dispatchNewEmployeeAutomation,
  dispatchApprovalRequestedAutomation,
  dispatchTaskFailedAutomation,
  dispatchTaskRecoveryAutomation,
  dispatchDayOneReadyAutomation,
  ViaSocketEventType,
} from '../services/viasocketAutomation';
import { env } from '../config/env';

const router = Router();

/**
 * Helper to get or create fallback demo employee for testing
 */
function getDemoEmployee(employeeId = 'emp-rahul') {
  let emp = store.employees.find((e) => e.id === employeeId);
  if (!emp) {
    emp = {
      id: employeeId,
      name: 'Rahul Sharma',
      email: 'rahul.sharma@onboardos.internal',
      roleId: 'role-dev-backend',
      roleTitle: 'Junior Backend Developer',
      departmentId: 'dept-eng',
      departmentName: 'Engineering',
      teamId: 'team-payments',
      teamName: 'Payments Core',
      seniority: 'JUNIOR',
      location: 'Bengaluru, India',
      employmentType: 'FULL_TIME',
      managerName: 'Marcus Vance',
      status: 'INVITED',
      startDate: '2026-09-01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  return emp;
}

/**
 * POST /api/demo/automation/new-employee-test
 * Safe test endpoint for employee.created event.
 */
router.post('/new-employee-test', async (req: Request, res: Response) => {
  try {
    const employeeId = req.body.employeeId || 'emp-rahul';
    const forceDispatch = req.body.forceDispatch ?? true;
    const targetEmployee = getDemoEmployee(employeeId);
    const context = store.contexts.find((c) => c.employeeId === targetEmployee.id);

    const result = await dispatchNewEmployeeAutomation(targetEmployee, context, { forceDispatch });

    res.json({
      success: result.success,
      message: result.success
        ? 'Live ViaSocket employee.created automation dispatched successfully!'
        : 'ViaSocket webhook dispatch finished with errors or warning.',
      webhookStatus: 'CONFIGURED_SERVER_SIDE',
      targetEmployee: {
        id: targetEmployee.id,
        name: targetEmployee.name,
        email: targetEmployee.email,
        role: targetEmployee.roleTitle,
        department: targetEmployee.departmentName,
      },
      dispatchResult: result,
      auditLogs: store.auditLogs.slice(0, 3),
    });
  } catch (err: any) {
    console.error('❌ [Demo Automation Test Error]:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error during demo automation test',
    });
  }
});

/**
 * POST /api/demo/automation/trigger-event
 * Generic test endpoint to test any of the 5 ViaSocket event types with demo data.
 */
router.post('/trigger-event', async (req: Request, res: Response) => {
  try {
    const eventType: ViaSocketEventType = req.body.eventType || 'employee.created';
    const employeeId = req.body.employeeId || 'emp-rahul';
    const forceDispatch = req.body.forceDispatch ?? true;
    const employee = getDemoEmployee(employeeId);

    let result;

    switch (eventType) {
      case 'employee.created': {
        const context = store.contexts.find((c) => c.employeeId === employee.id);
        result = await dispatchNewEmployeeAutomation(employee, context, { forceDispatch });
        break;
      }
      case 'approval.requested': {
        const demoApproval: any = store.approvals.find((a) => a.employeeId === employee.id) || {
          id: `appr-${Date.now().toString(36)}`,
          employeeId: employee.id,
          employeeName: employee.name,
          taskId: 'task-aws',
          taskName: 'AWS Production IAM Privileges',
          stage: 1,
          approverRole: 'MANAGER',
          approverUserName: employee.managerName || 'Marcus Vance',
          reason: 'Junior engineer requires manager authorization before production cloud access is granted.',
          riskLevel: 'HIGH',
          status: 'PENDING' as const,
          requestedAt: new Date().toISOString(),
          slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
        result = await dispatchApprovalRequestedAutomation(demoApproval, employee, { forceDispatch });
        break;
      }
      case 'task.failed': {
        const demoTask: any = store.tasks.find((t) => t.status === 'FAILED' && t.employeeId === employee.id) || {
          id: 'task-rahul-jira',
          employeeId: employee.id,
          name: 'Jira Software Provisioning',
          category: 'Development',
          adapterType: 'JIRA' as const,
          status: 'FAILED' as const,
          attempt: 2,
          failureCode: 'HTTP_503_SERVICE_UNAVAILABLE',
          failureReason: 'Rate limit exceeded on Jira Cloud API. Retries throttled.',
          createdAt: new Date().toISOString(),
        };
        result = await dispatchTaskFailedAutomation(demoTask, employee, 2, { forceDispatch });
        break;
      }
      case 'task.retry_succeeded': {
        const demoTask: any = {
          id: 'task-rahul-jira',
          employeeId: employee.id,
          name: 'Jira Software Provisioning',
          category: 'Development',
          adapterType: 'JIRA' as const,
          status: 'COMPLETED' as const,
          attempt: 3,
          failureReason: 'Previously failed with HTTP 503 Rate Limit',
          createdAt: new Date().toISOString(),
        };
        const unblocked = [
          { id: 'task-rahul-aws', name: 'AWS Production IAM Privileges', status: 'READY' },
        ];
        result = await dispatchTaskRecoveryAutomation(demoTask, employee, unblocked, { forceDispatch });
        break;
      }
      case 'onboarding.day_one_ready': {
        result = await dispatchDayOneReadyAutomation(employee, 100, 6, { forceDispatch });
        break;
      }
      default:
        res.status(400).json({ error: `Unknown event type: ${eventType}` });
        return;
    }

    res.json({
      success: result.success,
      eventType,
      status: result.status,
      message: `ViaSocket automation for '${eventType}' executed.`,
      webhookStatus: 'CONFIGURED_SERVER_SIDE',
      dispatchResult: result,
      recentAuditLogs: store.auditLogs.slice(0, 2),
    });
  } catch (err: any) {
    console.error('❌ [Trigger Event Error]:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error during event trigger test',
    });
  }
});

/**
 * GET /api/demo/automation/status
 * Returns current ViaSocket automation configuration & recent audit trail with strict URL redaction.
 */
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    provider: 'ViaSocket',
    webhookStatus: 'CONFIGURED_SERVER_SIDE',
    appBaseUrl: env.APP_BASE_URL,
    events: {
      'employee.created': { configured: Boolean(env.VIASOCKET_NEW_EMPLOYEE_WEBHOOK_URL) },
      'employee.offboarded': { configured: Boolean(env.VIASOCKET_OFFBOARDING_WEBHOOK_URL || env.VIASOCKET_NEW_EMPLOYEE_WEBHOOK_URL) },
      'approval.requested': { configured: Boolean(env.VIASOCKET_APPROVAL_WEBHOOK_URL) },
      'task.failed': { configured: Boolean(env.VIASOCKET_TASK_FAILURE_WEBHOOK_URL) },
      'task.retry_succeeded': { configured: Boolean(env.VIASOCKET_RECOVERY_WEBHOOK_URL) },
      'onboarding.day_one_ready': { configured: Boolean(env.VIASOCKET_DAY_ONE_READY_WEBHOOK_URL) },
    },
    recentAuditLogs: store.auditLogs.filter((l) => l.action.startsWith('VIASOCKET_')).slice(0, 10),
  });
});

export default router;
