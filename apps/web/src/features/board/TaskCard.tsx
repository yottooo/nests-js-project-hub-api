import type { ComponentProps } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/api/types';
import { cn } from '@/lib/utils';
import type { DropData } from './drop';

/** The card's looks only. Also what follows the pointer during a drag. */
export function TaskCardView({
  task,
  className,
  ...props
}: { task: Task } & ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-lg bg-card p-3 text-sm shadow-xs ring-1 ring-foreground/10',
        className,
      )}
      {...props}
    >
      <p className="font-medium wrap-break-word">{task.title}</p>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {task.description}
        </p>
      )}
      {task.assignee && (
        <p className="mt-2 text-xs text-muted-foreground">@{task.assignee}</p>
      )}
    </div>
  );
}

/** A card in a column: draggable, and opens the task on click. */
export function TaskCard({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
    active,
  } = useSortable({
    id: task.id,
    data: { type: 'task', status: task.status } satisfies DropData,
  });

  // Cards of the same column shift to preview a reorder. A card arriving from
  // another column gets no such preview, so mark where it would land.
  const draggedFrom = (active?.data.current as DropData | undefined)?.status;
  const showInsertLine =
    isOver && active?.id !== task.id && draggedFrom !== task.status;

  return (
    <TaskCardView
      ref={setNodeRef}
      task={task}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        'relative cursor-grab outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        isDragging && 'opacity-40',
        showInsertLine &&
          'before:absolute before:inset-x-0 before:-top-1.5 before:h-0.5 before:rounded-full before:bg-primary',
      )}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onClick();
      }}
      {...attributes}
      {...listeners}
    />
  );
}
