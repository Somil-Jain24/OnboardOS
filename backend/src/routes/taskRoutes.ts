import { Router, Request, Response } from 'express';
import { store } from '../db/store';
import { workflowEngine } from '../services/orchestrator/workflowEngine';
import { googleAdapter, slackAdapter, githubAdapter, jiraAdapter, awsAdapter } from '../services/integrations';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/', requireAuth, (req: Request, res: Response) => {
  const { employeeId } = req.query;
  const tasks = employeeId
    ? store.tasks.filter((t) => t.employeeId === employeeId)
    : store.tasks;
  res.json({ success: true, data: tasks });
});

router.get('/:id', requireAuth, (req: Request, res: Response) => {
  const task = store.tasks.find((t) => t.id === req.params.id);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json({ success: true, data: task });
});

router.post('/:id/update-status', requireAuth, (req: Request, res: Response) => {
  const { status, failureReason } = req.body;
  if (!status) {
    res.status(400).json({ error: 'status is required' });
    return;
  }
  try {
    const updated = workflowEngine.updateTaskStatus(req.params.id, status, failureReason);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/retry', requireAuth, (req: Request, res: Response) => {
  try {
    const updated = workflowEngine.retryTask(req.params.id);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/execute', requireAuth, async (req: Request, res: Response) => {
  const task = store.tasks.find((t) => t.id === req.params.id);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const employee = store.employees.find((e) => e.id === task.employeeId);
  const idempotencyKey = `idemp-${task.adapterType.toLowerCase()}-${task.id}-${Date.now()}`;

  let adapter;
  switch (task.adapterType) {
    case 'GOOGLE':
      adapter = googleAdapter;
      break;
    case 'SLACK':
      adapter = slackAdapter;
      break;
    case 'GITHUB':
      adapter = githubAdapter;
      break;
    case 'JIRA':
      adapter = jiraAdapter;
      break;
    case 'AWS':
      adapter = awsAdapter;
      break;
  }

  if (!adapter) {
    task.status = 'COMPLETED';
    res.json({ success: true, data: task, message: 'Executed non-adapter task' });
    return;
  }

  task.status = 'RUNNING';
  const result = await adapter.execute(task.id, { email: employee?.email, name: employee?.name }, idempotencyKey);

  if (result.success) {
    task.status = 'COMPLETED';
    task.completedAt = new Date().toISOString();
    workflowEngine.evaluateDownstreamUnblocking(task.id);
  } else {
    task.status = 'FAILED';
    task.failureCode = result.errorCode;
    task.failureReason = result.reason;
    workflowEngine.propagateBlocking(task.id);
  }

  res.json({
    success: result.success,
    data: task,
    adapterResult: result,
  });
});

export default router;
