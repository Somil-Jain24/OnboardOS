import { store } from '../db/store';
import type { Employee, EmployeeContext, EmployeeStatus, SeniorityLevel, EmploymentType } from '../types';

export class EmployeeService {
  public async getAll(filter?: { status?: EmployeeStatus; department?: string; search?: string }): Promise<Employee[]> {
    return store.employees.filter((emp) => {
      if (filter?.status && emp.status !== filter.status) return false;
      if (filter?.department && emp.departmentName !== filter.department) return false;
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        const matches =
          emp.name.toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          emp.roleTitle.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }

  public async getById(id: string): Promise<(Employee & {
    context?: EmployeeContext;
    plan?: any;
    tasks?: any[];
    approvals?: any[];
    risk?: any;
    auditLogs?: any[];
  }) | undefined> {
    const emp = store.employees.find((e) => e.id === id);
    if (!emp) return undefined;

    const context = store.contexts.find((c) => c.employeeId === id);
    const plan = store.plans.find((p) => p.employeeId === id && p.status === 'ACTIVE');
    const tasks = store.tasks.filter((t) => t.employeeId === id);
    const approvals = store.approvals.filter((a) => a.employeeId === id);
    const risk = store.risks.find((r) => r.employeeId === id);
    const auditLogs = store.auditLogs.filter((l) => l.employeeId === id);

    return {
      ...emp,
      context,
      plan,
      tasks,
      approvals,
      risk,
      auditLogs,
    };
  }

  public async create(data: {
    name: string;
    email: string;
    roleTitle: string;
    departmentName: string;
    teamName: string;
    seniority: SeniorityLevel;
    location: string;
    employmentType: EmploymentType;
    managerName?: string;
    startDate: string;
  }): Promise<Employee> {
    const id = `emp-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const newEmp: Employee = {
      id,
      name: data.name,
      email: data.email,
      roleId: `role-${data.roleTitle.toLowerCase().replace(/\s+/g, '-')}`,
      roleTitle: data.roleTitle,
      departmentId: `dept-${data.departmentName.toLowerCase().replace(/\s+/g, '-')}`,
      departmentName: data.departmentName,
      teamId: `team-${data.teamName.toLowerCase().replace(/\s+/g, '-')}`,
      teamName: data.teamName,
      seniority: data.seniority,
      location: data.location,
      employmentType: data.employmentType,
      managerName: data.managerName || 'Marcus Vance',
      status: 'INVITED',
      startDate: data.startDate,
      createdAt: now,
      updatedAt: now,
    };

    store.employees.unshift(newEmp);

    // Create immutable EmployeeContext snapshot
    const context: EmployeeContext = {
      id: `ctx-${id}-1`,
      employeeId: id,
      capturedAt: now,
      roleTitle: data.roleTitle,
      department: data.departmentName,
      team: data.teamName,
      seniority: data.seniority,
      location: data.location,
      employmentType: data.employmentType,
      raw: {
        skills: ['TypeScript', 'Cloud Infrastructure'],
        onboardingCohort: 'September 2026',
      },
    };
    store.contexts.unshift(context);

    // Record audit log
    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      employeeId: id,
      actorRole: 'HR',
      action: 'EMPLOYEE_CREATED',
      entityType: 'Employee',
      entityId: id,
      reason: 'New employee created in OnboardOS platform.',
      result: 'SUCCESS',
      createdAt: now,
    });

    return newEmp;
  }

  public async update(id: string, updates: Partial<Employee>): Promise<Employee | undefined> {
    const idx = store.employees.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;

    store.employees[idx] = {
      ...store.employees[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return store.employees[idx];
  }

  public async delete(id: string): Promise<boolean> {
    const idx = store.employees.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    store.employees.splice(idx, 1);
    return true;
  }
}

export const employeeService = new EmployeeService();
