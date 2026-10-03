import type { Task, TaskStatus } from '@/api/types';

const POSITION_STEP = 1000;

/**
 * A position that sorts between two neighbours. Either may be missing at the
 * ends of a column. Only the moved task changes, so one PATCH is enough.
 */
export function positionBetween(
  before: number | undefined,
  after: number | undefined,
): number {
  if (before === undefined) {
    return after === undefined ? POSITION_STEP : after - POSITION_STEP;
  }
  if (after === undefined) return before + POSITION_STEP;
  return (before + after) / 2;
}

/** One column's tasks in display order. */
export function tasksInColumn(tasks: Task[], status: TaskStatus): Task[] {
  return tasks
    .filter((task) => task.status === status)
    .sort((a, b) => a.position - b.position || a.id - b.id);
}
