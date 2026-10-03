import type { TaskStatus } from '@/api/types';

export interface BoardColumnDef {
  status: TaskStatus;
  title: string;
}

/**
 * The board's columns, left to right. A new status needs an entry here and in
 * the TaskStatus type.
 */
export const BOARD_COLUMNS: BoardColumnDef[] = [
  { status: 'todo', title: 'To do' },
  { status: 'in_progress', title: 'In progress' },
  { status: 'done', title: 'Done' },
];
