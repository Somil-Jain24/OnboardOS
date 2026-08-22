import { Router, Request, Response } from 'express';
import { activationService } from '../services/activationService';

const router = Router();

// In-memory rate limiting map: IP -> { count: number, resetAt: number }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function applyRateLimit(req: Request, res: Response, maxRequests: number, windowMs: number): boolean {
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'anonymous';
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    res.status(429).json({
      error: 'Too many requests. Please wait a few minutes before trying again.',
      retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000),
    });
    return false;
  }

  record.count += 1;
  return true;
}

/**
 * GET /api/auth/activate/:token/validate
 * Public endpoint to validate an activation link before displaying the set-password form.
 * Enforces strict cache-control and referrer policies.
 */
router.get('/activate/:token/validate', (req: Request, res: Response) => {
  // Set anti-caching & referrer protection headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Referrer-Policy', 'no-referrer');

  // Rate limit: Max 25 validation requests per 5 minutes per IP
  if (!applyRateLimit(req, res, 25, 5 * 60 * 1000)) {
    return;
  }

  const { token } = req.params;
  const result = activationService.validateToken(token);

  if (!result.valid) {
    res.status(400).json({
      valid: false,
      error: result.error || 'Activation link is invalid or has expired.',
    });
    return;
  }

  res.json({
    valid: true,
    employee: result.employee,
    expiresAt: result.invitation?.expiresAt,
  });
});

/**
 * POST /api/auth/activate/:token
 * Public endpoint to submit employee's chosen password and atomically activate the account.
 */
router.post('/activate/:token', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Referrer-Policy', 'no-referrer');

  // Strict rate limit: Max 6 activation submissions per 5 minutes per IP
  if (!applyRateLimit(req, res, 6, 5 * 60 * 1000)) {
    return;
  }

  const { token } = req.params;
  const { password } = req.body;

  if (!password || typeof password !== 'string' || password.length < 8) {
    res.status(400).json({
      error: 'Password must be at least 8 characters in length and include uppercase, lowercase, and numbers.',
    });
    return;
  }

  const activationResult = await activationService.activateAccount(token, password);

  if (!activationResult.success) {
    res.status(400).json({
      error: activationResult.error || 'Failed to activate account.',
    });
    return;
  }

  res.json({
    success: true,
    message: 'Account activated successfully! You are now logged in.',
    user: activationResult.user,
    token: activationResult.token,
  });
});

export default router;
