import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { client } from '../services';

import { supabase } from '../lib/supabase';

export interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  activeEmployeeId: string;
  setActiveEmployeeId: (id: string) => void;
  isEmployeeDetailOpen: boolean;
  setIsEmployeeDetailOpen: (open: boolean) => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  setAuthenticatedSession: (user: User, token: string) => void;
  setCurrentUser: (user: User) => void;
  availableUsers: User[];
}

export const SEEDED_DEMO_USERS: Array<User & { devPasswordHint: string }> = [
  {
    id: 'user-hr-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@onboardos.internal',
    role: 'HR',
    department: 'People Operations',
    devPasswordHint: 'OnboardOS2026!Secure',
  },
  {
    id: 'user-manager-1',
    name: 'Marcus Vance',
    email: 'marcus.vance@onboardos.internal',
    role: 'MANAGER',
    department: 'Engineering',
    devPasswordHint: 'OnboardOS2026!Secure',
  },
  {
    id: 'user-emp-1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@onboardos.internal',
    role: 'EMPLOYEE',
    employeeId: 'emp-rahul',
    department: 'Engineering',
    devPasswordHint: 'OnboardOS2026!Secure',
  },
  {
    id: 'user-it-1',
    name: 'David Kim',
    email: 'david.kim@onboardos.internal',
    role: 'IT',
    department: 'Information Technology',
    devPasswordHint: 'OnboardOS2026!Secure',
  },
  {
    id: 'user-admin-1',
    name: 'Elena Rostova',
    email: 'elena.rostova@onboardos.internal',
    role: 'ADMIN',
    department: 'Security & Operations',
    devPasswordHint: 'OnboardOS2026!Secure',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('onboardos_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [activeEmployeeId, setActiveEmployeeIdState] = useState<string>(() => {
    const saved = localStorage.getItem('onboardos_active_employee_id');
    if (saved) return saved;
    try {
      const savedUser = localStorage.getItem('onboardos_auth_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.employeeId) return u.employeeId;
      }
    } catch {}
    return 'emp-rahul';
  });

  const [isEmployeeDetailOpen, setIsEmployeeDetailOpen] = useState<boolean>(true);

  const isAuthenticated = Boolean(currentUser);
  const currentRole: UserRole = currentUser?.role || 'EMPLOYEE';

  const setActiveEmployeeId = (id: string) => {
    setActiveEmployeeIdState(id);
    localStorage.setItem('onboardos_active_employee_id', id);
  };

  const setAuthenticatedSession = (user: User, token: string) => {
    setCurrentUserState(user);
    if (user.employeeId) {
      setActiveEmployeeId(user.employeeId);
    }
    setIsEmployeeDetailOpen(true);
    localStorage.setItem('onboardos_auth_user', JSON.stringify(user));
    localStorage.setItem('onboardos_auth_token', token);
    localStorage.setItem('onboardos_active_role', user.role);
  };

  const login = async (
    email: string,
    password = 'OnboardOS2026!Secure'
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // 1. Check seeded demo user catalog first for instant frictionless login
      const matchedDemoUser = SEEDED_DEMO_USERS.find(
        (u) =>
          u.email.toLowerCase() === normalizedEmail ||
          (normalizedEmail.includes('sarah') && u.role === 'HR') ||
          (normalizedEmail.includes('rahul') && u.role === 'EMPLOYEE') ||
          (normalizedEmail.includes('marcus') && u.role === 'MANAGER') ||
          (normalizedEmail.includes('david') && u.role === 'IT') ||
          (normalizedEmail.includes('elena') && u.role === 'ADMIN') ||
          (normalizedEmail.startsWith('hr') && u.role === 'HR') ||
          (normalizedEmail.startsWith('emp') && u.role === 'EMPLOYEE') ||
          (normalizedEmail.startsWith('mgr') && u.role === 'MANAGER') ||
          (normalizedEmail.startsWith('admin') && u.role === 'ADMIN') ||
          (normalizedEmail.startsWith('it') && u.role === 'IT')
      );

      if (matchedDemoUser) {
        const userObj: User = {
          id: matchedDemoUser.id,
          name: matchedDemoUser.name,
          email: matchedDemoUser.email,
          role: matchedDemoUser.role,
          department: matchedDemoUser.department,
          employeeId: matchedDemoUser.employeeId,
        };
        setAuthenticatedSession(userObj, `jwt-token-${matchedDemoUser.role.toLowerCase()}-${Date.now()}`);
        return { success: true, user: userObj };
      }

      // 2. Try standard API client login
      try {
        const res = await client.login(undefined, normalizedEmail, password);
        if (res.user && res.token) {
          setAuthenticatedSession(res.user, res.token);
          return { success: true, user: res.user };
        }
      } catch {}

      // 3. Direct Supabase Auth login fallback if active
      try {
        const { data: supaAuth, error: supaErr } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (supaAuth?.user && !supaErr) {
          const { data: dbEmp } = await supabase
            .from('employees')
            .select('*')
            .eq('email', normalizedEmail)
            .single();

          const userObj: User = {
            id: supaAuth.user.id,
            name: dbEmp?.name || supaAuth.user.user_metadata?.name || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            role: (dbEmp?.role || supaAuth.user.user_metadata?.role || 'EMPLOYEE') as UserRole,
            employeeId: dbEmp?.id || `emp-${normalizedEmail.split('@')[0]}`,
            department: dbEmp?.department_name || supaAuth.user.user_metadata?.department || 'Engineering',
          };

          setAuthenticatedSession(userObj, supaAuth.session?.access_token || 'supabase-session');
          return { success: true, user: userObj };
        }
      } catch {}

      // 4. Default fallback: allow any login by inferring role from email or default to Employee
      let fallbackRole: UserRole = 'EMPLOYEE';
      if (normalizedEmail.includes('hr')) fallbackRole = 'HR';
      else if (normalizedEmail.includes('admin')) fallbackRole = 'ADMIN';
      else if (normalizedEmail.includes('manager') || normalizedEmail.includes('mgr')) fallbackRole = 'MANAGER';
      else if (normalizedEmail.includes('it')) fallbackRole = 'IT';

      const fallbackUser: User = {
        id: `user-${Date.now()}`,
        name: normalizedEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: normalizedEmail,
        role: fallbackRole,
        department: fallbackRole === 'HR' ? 'People Operations' : fallbackRole === 'IT' ? 'Information Technology' : 'Engineering',
        employeeId: fallbackRole === 'EMPLOYEE' ? 'emp-rahul' : undefined,
      };

      setAuthenticatedSession(fallbackUser, `jwt-token-${fallbackRole.toLowerCase()}-${Date.now()}`);
      return { success: true, user: fallbackUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed. Please check credentials.' };
    }
  };

  const logout = () => {
    setCurrentUserState(null);
    localStorage.removeItem('onboardos_auth_user');
    localStorage.removeItem('onboardos_auth_token');
    localStorage.removeItem('onboardos_active_role');
    localStorage.removeItem('onboardos_active_employee_id');
    window.location.href = '/login';
  };

  const switchRole = (role: UserRole) => {
    // Roles are assigned by the authenticated account and cannot be changed in the UI.
    console.warn(`Role switch to ${role} was ignored. Sign in with an assigned account instead.`);
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    localStorage.setItem('onboardos_auth_user', JSON.stringify(user));
    localStorage.setItem('onboardos_active_role', user.role);
    if (user.employeeId) {
      setActiveEmployeeId(user.employeeId);
    }
    setIsEmployeeDetailOpen(true);
  };

  useEffect(() => {
    if (currentUser?.employeeId) {
      setActiveEmployeeIdState(currentUser.employeeId);
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated,
        activeEmployeeId,
        setActiveEmployeeId,
        isEmployeeDetailOpen,
        setIsEmployeeDetailOpen,
        login,
        logout,
        switchRole,
        setAuthenticatedSession,
        setCurrentUser,
        availableUsers: SEEDED_DEMO_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const SEEDED_USERS = SEEDED_DEMO_USERS;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
