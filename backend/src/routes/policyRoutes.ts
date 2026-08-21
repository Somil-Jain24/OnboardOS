import { Router, Request, Response } from 'express';
import { policyService } from '../services/policyService';
import { birthrightService } from '../services/birthrightService';
import { sodService } from '../services/sodService';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/rules', requireAuth, (_req: Request, res: Response) => {
  const rules = policyService.getAllRules();
  res.json({ success: true, data: rules });
});

router.post('/rules', requireAuth, requireRole(['ADMIN']), (req: Request, res: Response) => {
  const created = policyService.createRule(req.body);
  res.status(201).json({ success: true, data: created });
});

router.put('/rules/:id', requireAuth, requireRole(['ADMIN']), (req: Request, res: Response) => {
  const updated = policyService.updateRule(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Rule not found' });
    return;
  }
  res.json({ success: true, data: updated });
});

router.delete('/rules/:id', requireAuth, requireRole(['ADMIN']), (req: Request, res: Response) => {
  const success = policyService.deleteRule(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Rule not found' });
    return;
  }
  res.json({ success: true, message: 'Rule deleted' });
});

router.post('/evaluate-birthright', requireAuth, (req: Request, res: Response) => {
  const context = req.body;
  const evaluation = birthrightService.evaluate(context);
  res.json({ success: true, data: evaluation });
});

router.post('/check-sod', requireAuth, (req: Request, res: Response) => {
  const { entitlements = [] } = req.body;
  const result = sodService.checkConflicts(entitlements);
  res.json({ success: true, data: result });
});

export default router;
