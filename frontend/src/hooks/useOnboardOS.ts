import { useState, useEffect, useCallback } from 'react';
import { client } from '../services';
import type {
  Employee,
  OnboardingPlan,
  Task,
  Approval,
  RiskAssessment,
  ExceptionEvent,
  AuditLog,
} from '../types';

export function useEmployee(employeeId?: string) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [plan, setPlan] = useState<OnboardingPlan | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const [empData, planData, taskData, riskData] = await Promise.all([
        client.getEmployee(employeeId),
        client.getPlan(employeeId),
        client.getTasks(employeeId),
        client.getRiskAssessment(employeeId),
      ]);
      setEmployee(empData);
      setPlan(planData);
      setTasks(taskData);
      setRisk(riskData);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load employee details');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const retryTask = async (taskId: string) => {
    const res = await client.retryTask(taskId);
    await fetchAll();
    return res;
  };

  return {
    employee,
    plan,
    tasks,
    risk,
    loading,
    error,
    refetch: fetchAll,
    retryTask,
  };
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await client.getEmployees();
      setEmployees(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return { employees, loading, error, refetch: fetchEmployees };
}

export function useApprovals(role?: 'MANAGER' | 'SECURITY' | 'ADMIN') {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await client.getApprovals(role);
      setApprovals(data);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const respond = async (approvalId: string, status: 'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUESTED', note?: string) => {
    const res = await client.respondApproval(approvalId, status, note);
    await fetchApprovals();
    return res;
  };

  return { approvals, loading, refetch: fetchApprovals, respond };
}

export function useExceptions() {
  const [exceptions, setExceptions] = useState<ExceptionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExceptions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await client.getExceptions();
      setExceptions(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExceptions();
  }, [fetchExceptions]);

  const resolve = async (id: string, note?: string) => {
    const res = await client.resolveException(id, note);
    await fetchExceptions();
    return res;
  };

  return { exceptions, loading, refetch: fetchExceptions, resolve };
}
