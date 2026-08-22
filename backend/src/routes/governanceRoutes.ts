import { Router, Request, Response } from 'express';
import { store } from '../db/store';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import {
  dispatchApprovalRequestedAutomation,
  dispatchDayOneReadyAutomation,
} from '../services/viasocketAutomation';

const router = Router();

// --- Rules alias ---
router.get('/rules', requireAuth, (_req: Request, res: Response) => {
  res.json({ success: true, data: store.rules });
});

// --- Approvals ---
router.get('/approvals', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role === 'EMPLOYEE') {
    const apprs = store.approvals.filter((a) => a.employeeId === user.employeeId);
    res.json({ success: true, data: apprs });
    return;
  }
  res.json({ success: true, data: store.approvals });
});

// POST /api/governance/approvals - Create or register pending approval + dispatch ViaSocket alert
router.post('/approvals', requireAuth, async (req: Request, res: Response) => {
  const { employeeId, taskId, taskName, approverRole, approverUserName, reason, riskLevel, slaDeadline } = req.body;
  const newApproval = {
    id: `appr-${Date.now().toString(36)}`,
    employeeId: employeeId || 'emp-rahul',
    employeeName: store.employees.find((e) => e.id === employeeId)?.name || 'Rahul Sharma',
    taskId: taskId || 'task-aws',
    taskName: taskName || 'AWS Production Access',
    approverRole: approverRole || 'MANAGER',
    approverUserName: approverUserName || 'Marcus Vance',
    stage: 1,
    reason: reason || 'Production access requires manager authorization.',
    riskLevel: riskLevel || 'HIGH',
    status: 'PENDING' as const,
    requestedAt: new Date().toISOString(),
    slaDeadline: slaDeadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  store.approvals.unshift(newApproval);

  // Trigger ViaSocket approval.requested event non-blockingly
  const employee = store.employees.find((e) => e.id === newApproval.employeeId) || {
    id: newApproval.employeeId,
    name: newApproval.employeeName,
    email: 'rahul.sharma@onboardos.internal',
    roleTitle: 'Software Engineer',
    departmentName: 'Engineering',
    teamName: 'Payments Core',
    managerName: 'Marcus Vance',
    status: 'INVITED' as const,
    startDate: '2026-09-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  let automationStatus: any = { status: 'triggered' };
  try {
    automationStatus = await dispatchApprovalRequestedAutomation(newApproval, employee as any);
  } catch (err: any) {
    console.warn('[governanceRoutes] approval.requested ViaSocket warning:', err.message);
  }

  res.status(201).json({
    success: true,
    data: newApproval,
    automation: automationStatus,
  });
});

router.post('/approvals/:id/respond', requireAuth, requireRole(['MANAGER', 'ADMIN']), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const appr = store.approvals.find((a) => a.id === id);
  if (!appr) {
    res.status(404).json({ error: 'Approval not found' });
    return;
  }
  appr.status = status;
  appr.respondedAt = new Date().toISOString();
  appr.responseNote = note;

  let unblockedTask;
  if (status === 'APPROVED') {
    const task = store.tasks.find((t) => t.id === appr.taskId);
    if (task) {
      task.status = 'COMPLETED';
      task.completedAt = new Date().toISOString();
      unblockedTask = task;
    }

    // Check if approving this resolves all tasks for the employee, triggering Day-1 Readiness
    const empTasks = store.tasks.filter((t) => t.employeeId === appr.employeeId);
    const pendingApprs = store.approvals.filter((a) => a.employeeId === appr.employeeId && a.status === 'PENDING');
    const failedTasks = empTasks.filter((t) => t.status === 'FAILED');
    const allDone = empTasks.length > 0 && empTasks.every((t) => t.status === 'COMPLETED' || t.status === 'SKIPPED');

    if (allDone && pendingApprs.length === 0 && failedTasks.length === 0) {
      const employee = store.employees.find((e) => e.id === appr.employeeId);
      if (employee) {
        dispatchDayOneReadyAutomation(employee, 100, empTasks.length).catch((e) =>
          console.warn('[governanceRoutes] Day-1 ready automation warning:', e.message)
        );
      }
    }
  }

  res.json({
    success: true,
    data: { approval: appr, unblockedTask },
  });
});

// --- Exceptions ---
router.get('/exceptions', (_req: Request, res: Response) => {
  res.json({ success: true, data: store.exceptions });
});

router.post('/exceptions/:id/resolve', (req: Request, res: Response) => {
  const { id } = req.params;
  const { note } = req.body;
  const ex = store.exceptions.find((e) => e.id === id);
  if (!ex) {
    res.status(404).json({ error: 'Exception not found' });
    return;
  }
  ex.severity = 'RESOLVED';
  ex.resolvedAt = new Date().toISOString();
  ex.resolvedBy = note || 'IT Administrator';
  res.json({ success: true, data: ex });
});

// --- Audit Logs ---
router.get('/audit', (req: Request, res: Response) => {
  const { employeeId } = req.query;
  const logs = employeeId ? store.auditLogs.filter((l) => l.employeeId === employeeId) : store.auditLogs;
  res.json({ success: true, data: logs });
});

// --- Helpdesk Tickets ---
router.get('/tickets', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  let targetEmpId = req.query.employeeId as string | undefined;

  if (user?.role === 'EMPLOYEE') {
    targetEmpId = user.employeeId;
  }

  const tickets = targetEmpId ? store.tickets.filter((t) => t.employeeId === targetEmpId) : store.tickets;
  res.json({ success: true, data: tickets });
});

router.post('/tickets', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { subject, category, description } = req.body;
  let employeeId = req.body.employeeId;

  if (user?.role === 'EMPLOYEE') {
    employeeId = user.employeeId;
  }

  const emp = store.employees.find((e) => e.id === employeeId);
  const ticket = {
    id: `TICK-${Date.now().toString(36).toUpperCase()}`,
    employeeId: employeeId || 'emp-rahul',
    employeeName: emp?.name || user?.name || 'Employee',
    category: category || 'General',
    priority: 'HIGH' as const,
    team: 'IT Operations',
    slaHours: 24,
    status: 'OPEN' as const,
    description: `${subject || 'Ticket'}: ${description || ''}`,
    aiClassification: {
      suggestedCategory: category || 'Access & Provisioning',
      suggestedPriority: 'HIGH' as const,
      confidence: 0.96,
      recommendedActions: ['Auto-routed to IT Ops queue', 'SLA timer started'],
    },
    createdAt: new Date().toISOString(),
  };
  store.tickets.unshift(ticket);
  res.status(201).json({ success: true, data: ticket });
});

// --- Assets ---
router.get('/assets', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  let targetEmpId = req.query.employeeId as string | undefined;

  if (user?.role === 'EMPLOYEE') {
    targetEmpId = user.employeeId;
  }

  const assets = targetEmpId ? store.assets.filter((a) => a.employeeId === targetEmpId) : store.assets;
  res.json({ success: true, data: assets });
});

router.post('/assets', requireAuth, requireRole(['IT', 'ADMIN']), (req: Request, res: Response) => {
  const newAsset = {
    id: `AST-${Date.now()}`,
    ...req.body,
    state: 'ASSIGNED',
    assignedAt: new Date().toISOString(),
  };
  store.assets.unshift(newAsset);
  res.status(201).json({ success: true, data: newAsset });
});

// --- Notifications ---
router.get('/notifications', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const notifs = user ? store.notifications.filter((n) => !n.userId || n.userId === user.id) : store.notifications;
  res.json({ success: true, data: notifs });
});

// --- Packages & Requests (Self-Service) ---
router.get('/packages', requireAuth, (_req: Request, res: Response) => {
  res.json({ success: true, data: store.accessPackages || [] });
});

router.get('/requests', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role === 'EMPLOYEE') {
    const ownRequests = (store.accessRequests || []).filter((r) => r.requesterId === user.employeeId);
    res.json({ success: true, data: ownRequests });
    return;
  }
  res.json({ success: true, data: store.accessRequests || [] });
});

router.post('/requests', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  let requesterId = req.body.requesterId;

  if (user?.role === 'EMPLOYEE') {
    requesterId = user.employeeId;
  }

  const emp = store.employees.find((e) => e.id === requesterId);
  const pkg = (store.accessPackages || []).find((p) => p.id === req.body.packageId);

  const newRequest = {
    id: `REQ-${Date.now().toString(36).toUpperCase()}`,
    packageId: req.body.packageId,
    packageName: pkg?.name || req.body.packageName || 'Access Package',
    requesterId: requesterId || 'emp-rahul',
    requesterName: emp?.name || user?.name || 'Employee',
    requesterRole: emp?.roleTitle || user?.role || 'Software Engineer',
    requesterDepartment: emp?.departmentName || 'Engineering',
    justification: req.body.justification || 'Required for sprint project deliverables.',
    durationDays: req.body.durationDays || 30,
    currentStage: 1,
    totalStages: 2,
    status: 'PENDING' as const,
    requestedAt: new Date().toISOString(),
    approvers: [
      {
        stage: 1,
        approverRole: 'MANAGER',
        approverName: emp?.managerName || 'Marcus Vance',
        status: 'PENDING' as const,
      },
      {
        stage: 2,
        approverRole: 'SECURITY',
        approverName: 'David Kim (IT Sec)',
        status: 'PENDING' as const,
      },
    ],
  };

  store.accessRequests = store.accessRequests || [];
  store.accessRequests.unshift(newRequest as any);
  res.status(201).json({ success: true, data: newRequest });
});

router.post('/requests/:id/approve', requireAuth, requireRole(['MANAGER', 'ADMIN', 'IT']), (req: Request, res: Response) => {
  const request = (store.accessRequests || []).find((r) => r.id === req.params.id);
  if (!request) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }
  request.status = 'APPROVED';
  res.json({ success: true, data: request });
});

router.post('/requests/:id/reject', requireAuth, requireRole(['MANAGER', 'ADMIN', 'IT']), (req: Request, res: Response) => {
  const request = (store.accessRequests || []).find((r) => r.id === req.params.id);
  if (!request) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }
  request.status = 'REJECTED';
  res.json({ success: true, data: request });
});

router.get('/grants', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role === 'EMPLOYEE') {
    const ownGrants = (store.accessGrants || []).filter((g) => g.employeeId === user.employeeId);
    res.json({ success: true, data: ownGrants });
    return;
  }
  res.json({ success: true, data: store.accessGrants || [] });
});

router.get('/certifications', requireAuth, requireRole(['ADMIN', 'HR', 'MANAGER']), (_req: Request, res: Response) => {
  res.json({ success: true, data: store.certificationCampaigns || [] });
});

// --- SoD ---
router.get('/sod/rules', requireAuth, (_req: Request, res: Response) => {
  res.json({ success: true, data: store.sodRules || [] });
});

router.get('/sod/conflicts', requireAuth, (_req: Request, res: Response) => {
  res.json({ success: true, data: store.sodConflicts || [] });
});

// --- Demo controls ---
router.post('/demo/reset', requireAuth, requireRole(['ADMIN']), (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Demo state reset' });
});

router.post('/demo/inject-failure', requireAuth, requireRole(['ADMIN']), (_req: Request, res: Response) => {
  const task = store.tasks.find((t) => t.adapterType === 'JIRA');
  if (task) {
    task.status = 'FAILED';
    task.failureReason = 'Simulated Jira 503 Rate Limit Injected';
  }
  res.json({ success: true, message: 'Failure injected' });
});

export default router;
