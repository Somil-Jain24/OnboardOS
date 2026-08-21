import { Router, Request, Response } from 'express';
import { planService } from '../services/planService';
import { whyService } from '../services/whyService';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/generate', requireAuth, (req: Request, res: Response) => {
  const { employeeId } = req.body;
  if (!employeeId) {
    res.status(400).json({ error: 'employeeId is required' });
    return;
  }
  const plan = planService.generatePlan(employeeId);
  res.status(201).json({ success: true, data: plan });
});

router.get('/:id', requireAuth, (req: Request, res: Response) => {
  const plan = planService.getPlanById(req.params.id);
  if (!plan) {
    res.status(404).json({ error: 'Plan not found' });
    return;
  }
  res.json({ success: true, data: plan });
});

router.get('/employee/:employeeId', requireAuth, (req: Request, res: Response) => {
  const plan = planService.getActivePlanForEmployee(req.params.employeeId);
  if (!plan) {
    res.status(404).json({ error: 'No active plan found for this employee' });
    return;
  }
  res.json({ success: true, data: plan });
});

router.get('/why/:taskId', requireAuth, (req: Request, res: Response) => {
  const explanation = whyService.explainTask(req.params.taskId);
  if (!explanation) {
    res.status(404).json({ error: 'Explanation not found for task' });
    return;
  }
  res.json({ success: true, data: explanation });
});

export default router;
