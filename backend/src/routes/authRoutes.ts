import { Router, Request, Response } from 'express';
import { authService } from '../services/authService';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import type { UserRole } from '../types';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { role = 'HR', email } = req.body;

  let authResult;
  if (email) {
    const user = authService.getUserByEmail(email);
    if (user) {
      const token = authService.generateToken(user);
      authResult = { user, token };
    }
  }

  if (!authResult) {
    authResult = authService.loginAsRole((role.toUpperCase() as UserRole) || 'HR');
  }

  res.json({
    success: true,
    user: authResult.user,
    token: authResult.token,
  });
});

router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    user: req.user,
  });
});

router.post('/switch-role', (req: Request, res: Response) => {
  const { role } = req.body;
  if (!role) {
    res.status(400).json({ error: 'Role is required' });
    return;
  }

  const authResult = authService.loginAsRole(role as UserRole);
  res.json({
    success: true,
    user: authResult.user,
    token: authResult.token,
  });
});

export default router;
