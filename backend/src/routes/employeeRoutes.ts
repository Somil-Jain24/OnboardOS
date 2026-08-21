import { Router, Request, Response } from 'express';
import { employeeService } from '../services/employeeService';
import { planService } from '../services/planService';
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

router.post('/', requireAuth, requireRole(['HR', 'ADMIN']), async (req: Request, res: Response) => {
  const {
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
  } = req.body;

  if (!name || !email || !roleTitle || !departmentName) {
    res.status(400).json({ error: 'Missing required employee fields' });
    return;
  }

  const created = await employeeService.create({
    name,
    email,
    roleTitle,
    departmentName,
    teamName: teamName || 'General Team',
    seniority: seniority || 'JUNIOR',
    location: location || 'Bengaluru, India',
    employmentType: employmentType || 'FULL_TIME',
    managerName,
    startDate: startDate || new Date().toISOString(),
  });

  // Automatically generate onboarding plan for new hire
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

router.delete('/:id', requireAuth, requireRole(['HR', 'ADMIN']), async (req: Request, res: Response) => {
  const success = await employeeService.delete(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }
  res.json({ success: true, message: 'Employee deleted' });
});

export default router;
