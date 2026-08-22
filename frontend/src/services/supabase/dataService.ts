import { supabase } from './client';
import type { Employee, User, RequirementRule, Task } from '../../types';

/**
 * Direct Supabase Data Access Service for Frontend
 * Provides direct, authenticated queries with RLS governance
 */
export const supabaseData = {
  // 1. Organizations
  async getOrganizations() {
    const { data, error } = await supabase.from('organizations').select('*');
    if (error) throw error;
    return data;
  },

  // 2. Departments
  async getDepartments() {
    const { data, error } = await supabase.from('departments').select('*').order('name');
    if (error) throw error;
    return data;
  },

  // 3. Teams
  async getTeams() {
    const { data, error } = await supabase.from('teams').select('*, departments(name)').order('name');
    if (error) throw error;
    return data;
  },

  // 4. Projects
  async getProjects() {
    const { data, error } = await supabase.from('projects').select('*').order('name');
    if (error) throw error;
    return data;
  },

  // 5. Roles
  async getRoles() {
    const { data, error } = await supabase.from('roles').select('*, departments(name)').order('title');
    if (error) throw error;
    return data;
  },

  // 6. Employees
  async getEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      roleId: row.role_id,
      roleTitle: row.role_title,
      departmentId: row.department_id,
      departmentName: row.department_name,
      teamId: row.team_id,
      teamName: row.team_name,
      projectId: row.project_id,
      projectName: row.project_name,
      seniority: row.seniority,
      location: row.location,
      employmentType: row.employment_type,
      managerId: row.manager_id,
      managerName: row.manager_name,
      status: row.status,
      startDate: row.start_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      roleId: data.role_id,
      roleTitle: data.role_title,
      departmentId: data.department_id,
      departmentName: data.department_name,
      teamId: data.team_id,
      teamName: data.team_name,
      projectId: data.project_id,
      projectName: data.project_name,
      seniority: data.seniority,
      location: data.location,
      employmentType: data.employment_type,
      managerId: data.manager_id,
      managerName: data.manager_name,
      status: data.status,
      startDate: data.start_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  // 7. Users
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return (data || []).map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      employeeId: u.employee_id,
      avatarUrl: u.avatar_url,
      createdAt: u.created_at,
    }));
  },

  // 8. Requirement Rules
  async getRequirementRules(): Promise<RequirementRule[]> {
    const { data, error } = await supabase.from('requirement_rules').select('*').order('created_at');
    if (error) throw error;
    return (data || []).map((r: any) => ({
      id: r.id,
      version: r.version,
      effectiveFrom: r.effective_from,
      scope: r.scope,
      requirementName: r.requirement_name,
      category: r.category,
      decision: r.decision,
      approvalChain: r.approval_chain,
      riskLevel: r.risk_level,
      reasonTemplate: r.reason_template,
      createdBy: r.created_by,
      createdAt: r.created_at,
    }));
  },

  // 9. SOD Rules
  async getSodRules() {
    const { data, error } = await supabase.from('sod_rules').select('*').order('code');
    if (error) throw error;
    return data;
  },

  // 10. Tasks
  async getTasksByEmployeeId(employeeId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at');
    if (error) throw error;
    return (data || []).map((t: any) => ({
      id: t.id,
      planItemId: t.plan_item_id,
      employeeId: t.employee_id,
      name: t.name,
      category: t.category,
      system: t.system,
      status: t.status,
      adapterType: t.adapter_type,
      attempt: t.attempt,
      idempotencyKey: t.idempotency_key,
      failureCode: t.failure_code,
      failureReason: t.failure_reason,
      claimStatus: t.claim_status,
      claimUrl: t.claim_url,
      createdAt: t.created_at,
      startedAt: t.started_at,
      completedAt: t.completed_at,
    }));
  },

  // 11. Access Packages
  async getAccessPackages() {
    const { data, error } = await supabase.from('access_packages').select('*');
    if (error) throw error;
    return data;
  },

  // 12. Audit Logs
  async getAuditLogs(limit: number = 50) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },
};
