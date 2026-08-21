import type { Task, TaskDependency } from '../../types';

export class DAGEngine {
  /**
   * Validates if the given task dependencies form a valid DAG (no cycles).
   * Uses Tarjan / DFS topological search.
   */
  public static validateNoCycles(tasks: Task[], dependencies: TaskDependency[]): boolean {
    const adjList = new Map<string, string[]>();
    for (const t of tasks) {
      adjList.set(t.id, []);
    }

    for (const dep of dependencies) {
      const list = adjList.get(dep.taskId) || [];
      list.push(dep.dependsOnTaskId);
      adjList.set(dep.taskId, list);
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycle = (node: string): boolean => {
      visited.add(node);
      recStack.add(node);

      const neighbors = adjList.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true; // Cycle detected
        }
      }

      recStack.delete(node);
      return false;
    };

    for (const task of tasks) {
      if (!visited.has(task.id)) {
        if (hasCycle(task.id)) return false;
      }
    }

    return true;
  }

  /**
   * Computes which tasks are directly blocked by a failed or pending task.
   */
  public static getDownstreamTasks(targetTaskId: string, dependencies: TaskDependency[]): string[] {
    const directDownstream = dependencies
      .filter((d) => d.dependsOnTaskId === targetTaskId)
      .map((d) => d.taskId);

    const allDownstream = new Set<string>(directDownstream);
    for (const nextId of directDownstream) {
      const recursive = this.getDownstreamTasks(nextId, dependencies);
      recursive.forEach((r) => allDownstream.add(r));
    }

    return Array.from(allDownstream);
  }

  /**
   * Checks if all upstream dependencies of a task are completed.
   */
  public static arePrerequisitesCompleted(
    taskId: string,
    tasks: Task[],
    dependencies: TaskDependency[]
  ): boolean {
    const upstreamTaskIds = dependencies
      .filter((d) => d.taskId === taskId)
      .map((d) => d.dependsOnTaskId);

    if (upstreamTaskIds.length === 0) return true;

    return upstreamTaskIds.every((upId) => {
      const upTask = tasks.find((t) => t.id === upId);
      return upTask && (upTask.status === 'COMPLETED' || upTask.status === 'SKIPPED');
    });
  }
}
