import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

export const roleHome: Record<UserRole, string> = {
  HR: '/hr',
  MANAGER: '/manager',
  EMPLOYEE: '/me',
  IT: '/it',
  ADMIN: '/admin',
};

export function getRoleHomeRoute(role?: UserRole | string | null): string {
  if (!role) return '/login';
  const upper = String(role).toUpperCase();
  if (upper === 'HR') return '/hr';
  if (upper === 'MANAGER') return '/manager';
  if (upper === 'EMPLOYEE') return '/me';
  if (upper === 'IT') return '/it';
  if (upper === 'ADMIN') return '/admin';
  return '/login';
}

/** Prevents a valid user from rendering a portal outside their assigned role. */
export function RoleRoute({ allowed, children }: { allowed: UserRole[]; children: ReactNode }) {
  const { currentRole, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowed.includes(currentRole)) {
    return <Navigate to={getRoleHomeRoute(currentRole)} replace />;
  }

  return <>{children}</>;
}

export function RoleHomeRedirect() {
  const { currentRole, isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? getRoleHomeRoute(currentRole) : '/login'} replace />;
}
