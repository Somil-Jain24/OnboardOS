import { store } from '../../db/store';
import { TaskStateMachine } from './stateMachine';
import { DAGEngine } from './dagEngine';
import type { Task, TaskStatus } from '../../types';

export class WorkflowEngine {
  /**
   * Updates task status and auto-propagates blocking / unblocking to downstream tasks.
   */
  public updateTaskStatus(taskId: string, newStatus: TaskStatus, failureReason?: string): Task {
    const task = store.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error(`Task with id ${taskId} not found`);

    TaskStateMachine.validateTransition(task.status, newStatus);

    task.status = newStatus;
    if (failureReason) task.failureReason = failureReason;

    if (newStatus === 'RUNNING' && !task.startedAt) {
      task.startedAt = new Date().toISOString();
    }
    if (newStatus === 'COMPLETED' || newStatus === 'SKIPPED') {
      task.completedAt = new Date().toISOString();
      // On completion, check if downstream tasks can be unblocked
      this.evaluateDownstreamUnblocking(taskId);
    }
    if (newStatus === 'FAILED') {
      // On failure, block all downstream dependents
      this.propagateBlocking(taskId);
    }

    return task;
  }

  /**
   * Marks all downstream dependent tasks as BLOCKED.
   */
  public propagateBlocking(failedTaskId: string): void {
    const downstreamIds = DAGEngine.getDownstreamTasks(failedTaskId, store.dependencies);
    for (const dId of downstreamIds) {
      const dTask = store.tasks.find((t) => t.id === dId);
      if (dTask && dTask.status !== 'COMPLETED' && dTask.status !== 'SKIPPED') {
        dTask.status = 'BLOCKED';
      }
    }
  }

  /**
   * Re-evaluates downstream tasks when a prerequisite completes or resolves.
   */
  public evaluateDownstreamUnblocking(completedTaskId: string): void {
    const downstreamDependencies = store.dependencies.filter((d) => d.dependsOnTaskId === completedTaskId);

    for (const dep of downstreamDependencies) {
      const dTask = store.tasks.find((t) => t.id === dep.taskId);
      if (dTask && dTask.status === 'BLOCKED') {
        const allPrereqsDone = DAGEngine.arePrerequisitesCompleted(dTask.id, store.tasks, store.dependencies);
        if (allPrereqsDone) {
          dTask.status = 'READY';
        }
      }
    }
  }

  /**
   * Retries a failed or blocked task with idempotent increment.
   */
  public retryTask(taskId: string): Task {
    const task = store.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    task.attempt += 1;
    task.failureReason = undefined;
    task.failureCode = undefined;
    task.status = 'READY';

    // Check if downstream tasks can recover
    this.evaluateDownstreamUnblocking(taskId);

    return task;
  }
}

export const workflowEngine = new WorkflowEngine();
