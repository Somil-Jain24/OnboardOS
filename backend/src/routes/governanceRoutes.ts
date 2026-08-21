import { Router, Request, Response } from 'express';
import { store } from '../db/store';
import { supabase } from '../config/supabase';

const router = Router();

// --- Rules alias ---
router.get('/rules', (_req: Request, res: Response) => {
  res.json({ success: true, data: store.rules });
});

// --- Approvals ---
router.get('/approvals', (_req: Request, res: Response) => {
  res.json({ success: true, data: store.approvals });
});

router.post('/approvals/:id/respond', (req: Request, res: Response) => {
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
  }

  res.json({ success: true, data: { approval: appr, unblockedTask } });
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

// --- Tickets ---
router.get('/tickets', (req: Request, res: Response) => {
  const { employeeId } = req.query;
  const tickets = employeeId ? store.tickets.filter((t) => t.employeeId === employeeId) : store.tickets;
  res.json({ success: true, data: tickets });
});

router.post('/tickets', (req: Request, res: Response) => {
  const { employeeId, subject, category, description } = req.body;
  const ticket = {
    id: `TICK-${Date.now().toString(36).toUpperCase()}`,
    employeeId: employeeId || 'emp-rahul',
    employeeName: 'Rahul Sharma',
    category: category || 'General',
    priority: 'HIGH' as const,
    team: 'IT Operations',
    slaHours: 24,
    status: 'OPEN' as const,
    description: `${subject}: ${description}`,
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
router.get('/assets', (req: Request, res: Response) => {
  const { employeeId } = req.query;
  const assets = employeeId ? store.assets.filter((a) => a.employeeId === employeeId) : store.assets;
  res.json({ success: true, data: assets });
});

router.post('/assets', (req: Request, res: Response) => {
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
router.get('/notifications', (req: Request, res: Response) => {
  const { userId } = req.query;
  const notifs = userId ? store.notifications.filter((n) => n.userId === userId) : store.notifications;
  res.json({ success: true, data: notifs });
});

// --- Packages & Requests (Self-Service) ---
router.get('/packages', (_req: Request, res: Response) => {
  res.json({ success: true, data: store.accessPackages || [] });
});

router.get('/requests', (_req: Request, res: Response) => {
  res.json({ success: true, data: store.accessRequests || [] });
});

router.get('/grants', (_req: Request, res: Response) => {
  res.json({ success: true, data: store.accessGrants || [] });
});

router.get('/certifications', (_req: Request, res: Response) => {
  res.json({ success: true, data: store.certificationCampaigns || [] });
});

// --- SoD ---
router.get('/sod/rules', (_req: Request, res: Response) => {
  res.json({ success: true, data: store.sodRules || [] });
});

router.get('/sod/conflicts', (_req: Request, res: Response) => {
  res.json({ success: true, data: store.sodConflicts || [] });
});

// --- Demo controls ---
router.post('/demo/reset', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Demo state reset' });
});

router.post('/demo/inject-failure', (_req: Request, res: Response) => {
  const task = store.tasks.find((t) => t.adapterType === 'JIRA');
  if (task) {
    task.status = 'FAILED';
    task.failureReason = 'Simulated Jira 503 Rate Limit Injected';
  }
  res.json({ success: true, message: 'Failure injected' });
});

export default router;
