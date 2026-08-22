import { useState, useEffect, useCallback, useRef } from 'react';
import { client } from '../services';
import { subscribeToDomainEvents, type DomainEvent } from '../utils/domainEventBus';
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
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAll = useCallback(async (isSilent = false) => {
    if (!employeeId) return;
    try {
      if (!isSilent) setLoading(true);
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
      if (!isSilent) setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Subscribe to live domain event bus for cross-tab / cross-role reactive updates
  useEffect(() => {
    const unsubscribe = subscribeToDomainEvents((event: DomainEvent) => {
      const isRelevant =
        !event.employeeId ||
        event.employeeId === employeeId ||
        event.type === 'task.retry_succeeded' ||
        event.type === 'task.failed' ||
        event.type === 'task.completed' ||
        event.type === 'approval.approved' ||
        event.type === 'approval.rejected' ||
        event.type === 'readiness.updated' ||
        event.type === 'onboarding.day_one_ready';

      if (isRelevant) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          fetchAll(true);
        }, 150);
      }
    });

    return () => {
      unsubscribe();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [employeeId, fetchAll]);

  const retryTask = async (taskId: string) => {
    const res = await client.retryTask(taskId);
    await fetchAll(true);
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
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEmployees = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const data = await client.getEmployees();
      setEmployees(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Subscribe to employee creation and readiness events
  useEffect(() => {
    const unsubscribe = subscribeToDomainEvents((event: DomainEvent) => {
      if (
        event.type === 'employee.created' ||
        event.type === 'readiness.updated' ||
        event.type === 'onboarding.day_one_ready'
      ) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          fetchEmployees(true);
        }, 150);
      }
    });

    return () => {
      unsubscribe();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [fetchEmployees]);

  return { employees, loading, error, refetch: fetchEmployees };
}

export function useApprovals(role?: 'MANAGER' | 'SECURITY' | 'ADMIN') {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchApprovals = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const data = await client.getApprovals(role);
      setApprovals(data);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  // Subscribe to approval request and resolution events
  useEffect(() => {
    const unsubscribe = subscribeToDomainEvents((event: DomainEvent) => {
      if (
        event.type === 'approval.requested' ||
        event.type === 'approval.approved' ||
        event.type === 'approval.rejected' ||
        event.type === 'task.failed' ||
        event.type === 'task.retry_succeeded'
      ) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          fetchApprovals(true);
        }, 150);
      }
    });

    return () => {
      unsubscribe();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [fetchApprovals]);

  const respond = async (approvalId: string, status: 'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUESTED', note?: string) => {
    const res = await client.respondApproval(approvalId, status, note);
    await fetchApprovals(true);
    return res;
  };

  return { approvals, loading, refetch: fetchApprovals, respond };
}

export function useExceptions() {
  const [exceptions, setExceptions] = useState<ExceptionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchExceptions = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const data = await client.getExceptions();
      setExceptions(data);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExceptions();
  }, [fetchExceptions]);

  // Subscribe to exception and task failure/recovery events
  useEffect(() => {
    const unsubscribe = subscribeToDomainEvents((event: DomainEvent) => {
      if (
        event.type === 'task.failed' ||
        event.type === 'task.retry_succeeded' ||
        event.type === 'exception.created' ||
        event.type === 'exception.resolved'
      ) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          fetchExceptions(true);
        }, 150);
      }
    });

    return () => {
      unsubscribe();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [fetchExceptions]);

  const resolve = async (id: string, note?: string) => {
    const res = await client.resolveException(id, note);
    await fetchExceptions(true);
    return res;
  };

  return { exceptions, loading, refetch: fetchExceptions, resolve };
}
