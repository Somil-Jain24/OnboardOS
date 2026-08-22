import { Router, Request, Response } from 'express';
import { authService } from '../services/authService';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// POST /api/auth/login - Email + Password Authentication
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const result = await authService.loginWithCredentials(email, password);

  if (!result.success || !result.user || !result.token) {
    res.status(401).json({ error: result.error || 'Invalid email or password.' });
    return;
  }

  res.json({
    success: true,
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      employeeId: result.user.employeeId,
      department: result.user.department,
      activatedAt: result.user.activatedAt,
    },
    token: result.token,
  });
});

// GET /api/auth/me - Current User Profile
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    user: req.user,
  });
});

export default router;
