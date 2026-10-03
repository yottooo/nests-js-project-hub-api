import { useState } from 'react';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { Task, TaskStatus, UpdateTaskInput } from '@/api/types';
import { BoardColumn } from './BoardColumn';
import { BOARD_COLUMNS } from './columns';
import { resolveDrop, type DropData, type DropTarget } from './drop';
import { tasksInColumn } from './position';
import { TaskCardView } from './TaskCard';

// Whatever is under the pointer wins, and a card beats the column around it.
// Between columns nothing is under the pointer, so fall back to the nearest.
const collisionDetection: CollisionDetection = (args) => {
  const underPointer = pointerWithin(args);
  return underPointer.length > 0 ? underPointer : closestCorners(args);
};

interface BoardProps {
  tasks: Task[];
  onMove: (id: number, input: UpdateTaskInput) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

export function Board({ tasks, onMove, onTaskClick, onAddTask }: BoardProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const activeTask = tasks.find((task) => task.id === activeId);

  // A drag starts only after the pointer moves a little, so a plain click
  // still opens the task.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    const data = over?.data.current as DropData | undefined;
    if (!over || !data) return;

    const target: DropTarget =
      data.type === 'column'
        ? { type: 'column', status: data.status }
        : { type: 'task', status: data.status, taskId: Number(over.id) };
    const result = resolveDrop(tasks, Number(active.id), target);
    if (result) onMove(Number(active.id), result);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={({ active }) => setActiveId(Number(active.id))}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex flex-1 items-start gap-4 overflow-x-auto p-6">
        {BOARD_COLUMNS.map((column) => (
          <BoardColumn
            key={column.status}
            column={column}
            tasks={tasksInColumn(tasks, column.status)}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
          />
        ))}
      </div>
      {/* No drop animation: it would glide back to where the drag started,
          while the card itself is already in its new place. */}
      <DragOverlay dropAnimation={null}>
        {activeTask && (
          <TaskCardView
            task={activeTask}
            className="cursor-grabbing shadow-lg"
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
