import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';

export interface AuthContextType {
  currentUser: User;
  currentRole: UserRole;
  activeEmployeeId: string;
  setActiveEmployeeId: (id: string) => void;
  isEmployeeDetailOpen: boolean;
  setIsEmployeeDetailOpen: (open: boolean) => void;
  switchRole: (role: UserRole) => void;
  setCurrentUser: (user: User) => void;
  availableUsers: User[];
}

export const SEEDED_USERS: User[] = [
  {
    id: 'user-hr-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@onboardos.internal',
    role: 'HR',
    avatarUrl: '',
  },
  {
    id: 'user-manager-1',
    name: 'Marcus Vance',
    email: 'marcus.vance@onboardos.internal',
    role: 'MANAGER',
    avatarUrl: '',
  },
  {
    id: 'user-emp-1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@onboardos.internal',
    role: 'EMPLOYEE',
    employeeId: 'emp-rahul',
    avatarUrl: '',
  },
  {
    id: 'user-it-1',
    name: 'David Kim',
    email: 'david.kim@onboardos.internal',
    role: 'IT',
    avatarUrl: '',
  },
  {
    id: 'user-admin-1',
    name: 'Elena Rostova',
    email: 'elena.rostova@onboardos.internal',
    role: 'ADMIN',
    avatarUrl: '',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('HR');
  const [currentUser, setCurrentUser] = useState<User>(SEEDED_USERS[0]);
  const [activeEmployeeId, setActiveEmployeeIdState] = useState<string>('emp-rahul');
  const [isEmployeeDetailOpen, setIsEmployeeDetailOpen] = useState<boolean>(false);

  const setActiveEmployeeId = (id: string) => {
    setActiveEmployeeIdState(id);
    localStorage.setItem('onboardos_active_employee_id', id);
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    const targetUser = SEEDED_USERS.find((u) => u.role === role) || SEEDED_USERS[0];
    setCurrentUser(targetUser);
    localStorage.setItem('onboardos_active_role', role);
    if (role === 'EMPLOYEE') {
      setIsEmployeeDetailOpen(false); // Default to full-screen grid when switching to employee
    }
  };

  useEffect(() => {
    const savedRole = localStorage.getItem('onboardos_active_role') as UserRole | null;
    if (savedRole && ['ADMIN', 'HR', 'IT', 'MANAGER', 'EMPLOYEE'].includes(savedRole)) {
      switchRole(savedRole);
    }
    const savedEmpId = localStorage.getItem('onboardos_active_employee_id');
    if (savedEmpId) {
      setActiveEmployeeIdState(savedEmpId);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        activeEmployeeId,
        setActiveEmployeeId,
        isEmployeeDetailOpen,
        setIsEmployeeDetailOpen,
        switchRole,
        setCurrentUser,
        availableUsers: SEEDED_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
