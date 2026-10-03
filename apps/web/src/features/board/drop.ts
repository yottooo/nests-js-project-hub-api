import type { Task, TaskStatus } from '@/api/types';
import { positionBetween, tasksInColumn } from './position';

/** What a card or a column tells dnd-kit about itself. */
export interface DropData {
  type: 'task' | 'column';
  status: TaskStatus;
}

export type DropTarget =
  | { type: 'column'; status: TaskStatus }
  | { type: 'task'; status: TaskStatus; taskId: number };

export function columnDropId(status: TaskStatus): string {
  return `column:${status}`;
}

/**
 * Where a dropped card ends up, or null when the drop changes nothing.
 * Dropped on a column it goes to the end; dropped on a card it takes that
 * card's slot.
 */
export function resolveDrop(
  tasks: Task[],
  activeId: number,
  target: DropTarget,
): { status: TaskStatus; position: number } | null {
  const active = tasks.find((task) => task.id === activeId);
  if (!active) return null;

  const column = tasksInColumn(tasks, target.status);
  const others = column.filter((task) => task.id !== activeId);
  const sameColumn = active.status === target.status;

  // Index in `others` at which the card is inserted.
  let index = others.length;
  if (target.type === 'task') {
    if (target.taskId === activeId) return null;
    // Within a column this matches the reordering the sortable list previews;
    // from another column the card lands just above the hovered one.
    const list = sameColumn ? column : others;
    index = list.findIndex((task) => task.id === target.taskId);
    if (index === -1) return null;
  }

  const before: Task | undefined = others[index - 1];
  const after: Task | undefined = others[index];

  if (sameColumn) {
    const current = column.findIndex((task) => task.id === activeId);
    const prev: Task | undefined = column[current - 1];
    const next: Task | undefined = column[current + 1];
    if (prev?.id === before?.id && next?.id === after?.id) return null;
  }

  return {
    status: target.status,
    position: positionBetween(before?.position, after?.position),
  };
}
