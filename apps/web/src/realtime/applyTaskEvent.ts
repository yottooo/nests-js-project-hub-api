import type { QueryClient } from '@tanstack/react-query';
import type { Task, TaskEvent } from '@/api/types';
import { taskKeys } from '@/features/board/keys';
import { reduceTasks } from './reduceTasks';

export function projectIdOf(event: TaskEvent): number {
  return event.type === 'taskDeleted' ? event.projectId : event.task.projectId;
}

/** Writes a task event into the cached task list the board renders from. */
export function applyTaskEvent(
  queryClient: QueryClient,
  event: TaskEvent,
): void {
  queryClient.setQueryData<Task[]>(
    taskKeys.list(projectIdOf(event)),
    (tasks) => (tasks ? reduceTasks(tasks, event) : tasks),
  );
}
