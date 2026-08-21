import { Router, Request, Response } from 'express';
import { employeeService } from '../services/employeeService';
import { planService } from '../services/planService';
import { store } from '../db/store';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  const { status, department, search } = req.query;
  const employees = await employeeService.getAll({
    status: status as any,
    department: department as any,
    search: search as any,
  });
  res.json({ success: true, data: employees });
});

router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const employee = await employeeService.getById(req.params.id);
  if (!employee) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }
  res.json({ success: true, data: employee });
});

router.get('/:id/context', requireAuth, async (req: Request, res: Response) => {
  const employee = await employeeService.getById(req.params.id);
  if (!employee || !employee.context) {
    const ctx = store.contexts.find((c) => c.employeeId === req.params.id);
    if (!ctx) {
      res.json({ success: true, data: null });
      return;
    }
    res.json({ success: true, data: ctx });
    return;
  }
  res.json({ success: true, data: employee.context });
});

router.get('/:id/plan', requireAuth, async (req: Request, res: Response) => {
  let plan = store.plans.find((p) => p.employeeId === req.params.id);
  if (!plan) {
    plan = planService.generatePlan(req.params.id);
  }
  res.json({ success: true, data: plan });
});

router.post('/:id/plan/generate', requireAuth, async (req: Request, res: Response) => {
  const plan = planService.generatePlan(req.params.id);
  res.status(201).json({ success: true, data: plan });
});

router.get('/:id/tasks', requireAuth, async (req: Request, res: Response) => {
  const tasks = store.tasks.filter((t) => t.employeeId === req.params.id);
  res.json({ success: true, data: tasks });
});

router.get('/:id/risk', requireAuth, async (req: Request, res: Response) => {
  const risk = store.risks.find((r) => r.employeeId === req.params.id);
  if (!risk) {
    res.json({
      success: true,
      data: {
        id: `risk-${req.params.id}`,
        employeeId: req.params.id,
        computedAt: new Date().toISOString(),
        riskScore: 20,
        riskLevel: 'LOW',
        dayOneReady: true,
        readinessScore: 90,
        factors: [],
        readinessBreakdown: {
          criticalTasksTotal: 5,
          criticalTasksComplete: 4,
          requiredAccessTotal: 5,
          requiredAccessComplete: 4,
          requiredTrainingTotal: 1,
          requiredTrainingComplete: 1,
          blockingFailures: 0,
          pendingApprovals: 0,
        },
      },
    });
    return;
  }
  res.json({ success: true, data: risk });
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  const name = req.body.name;
  const email = req.body.email;
  const roleTitle = req.body.roleTitle || req.body.role || 'Software Engineer';
  const departmentName = req.body.departmentName || req.body.department || 'Engineering';
  const teamName = req.body.teamName || req.body.team || 'Payments Core';
  const seniority = req.body.seniority || 'JUNIOR';
  const location = req.body.location || 'Bengaluru, India';
  const employmentType = req.body.employmentType || 'FULL_TIME';
  const managerName = req.body.managerName || 'Marcus Vance';
  const startDate = req.body.startDate || new Date().toISOString().split('T')[0];

  if (!name || !email) {
    res.status(400).json({ error: 'Missing required fields: name and email are mandatory' });
    return;
  }

  const created = await employeeService.create({
    name,
    email,
    roleTitle,
    departmentName,
    teamName,
    seniority,
    location,
    employmentType,
    managerName,
    startDate,
  });

  // Automatically generate onboarding plan and tasks for new hire
  const plan = planService.generatePlan(created.id);

  res.status(201).json({
    success: true,
    data: created,
    plan,
  });
});

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const updated = await employeeService.update(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }
  res.json({ success: true, data: updated });
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const success = await employeeService.delete(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }
  res.json({ success: true, message: 'Employee deleted' });
});

export default router;
