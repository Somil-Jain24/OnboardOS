import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import type { User, UserRole } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = authService.verifyToken(token);

  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired authentication token. Please log in again.' });
    return;
  }

  let user = authService.getUserById(payload.sub);
  if (!user && payload.email) {
    user = authService.getUserByEmail(payload.email);
  }

  if (!user) {
    res.status(401).json({ error: 'User associated with token not found. Please log in again.' });
    return;
  }

  req.user = user;
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'ADMIN') {
      res.status(403).json({
        error: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
}
