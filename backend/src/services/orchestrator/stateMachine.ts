import type { TaskStatus } from '../../types';

export const VALID_TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  PENDING: ['READY', 'BLOCKED', 'SKIPPED'],
  READY: ['RUNNING', 'WAITING_APPROVAL', 'BLOCKED', 'SKIPPED'],
  RUNNING: ['COMPLETED', 'FAILED', 'WAITING_APPROVAL'],
  WAITING_APPROVAL: ['READY', 'RUNNING', 'REJECTED', 'BLOCKED'],
  FAILED: ['RUNNING', 'HUMAN_INTERVENTION', 'SKIPPED'],
  BLOCKED: ['READY', 'PENDING', 'SKIPPED'],
  REJECTED: ['HUMAN_INTERVENTION', 'SKIPPED'],
  HUMAN_INTERVENTION: ['READY', 'RUNNING', 'COMPLETED', 'SKIPPED'],
  COMPLETED: [],
  SKIPPED: [],
};

export class TaskStateMachine {
  public static canTransition(current: TaskStatus, target: TaskStatus): boolean {
    if (current === target) return true;
    const allowed = VALID_TASK_TRANSITIONS[current] || [];
    return allowed.includes(target);
  }

  public static validateTransition(current: TaskStatus, target: TaskStatus): void {
    if (!this.canTransition(current, target)) {
      throw new Error(`Illegal task state transition: Cannot transition from ${current} to ${target}`);
    }
  }
}
