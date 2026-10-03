import type { Task, TaskEvent } from '@/api/types';

/**
 * Applies one task event to a task list. Applying the same event twice gives
 * the same list, which matters because the tab that made a change also
 * receives its own event back.
 */
export function reduceTasks(tasks: Task[], event: TaskEvent): Task[] {
  if (event.type === 'taskDeleted') {
    return tasks.filter((task) => task.id !== event.id);
  }

  const incoming = event.task;
  const existing = tasks.find((task) => task.id === incoming.id);
  if (!existing) return [...tasks, incoming];
  // Events can arrive out of order; an older one must not undo newer data.
  if (incoming.updatedAt < existing.updatedAt) return tasks;
  return tasks.map((task) => (task.id === incoming.id ? incoming : task));
}
