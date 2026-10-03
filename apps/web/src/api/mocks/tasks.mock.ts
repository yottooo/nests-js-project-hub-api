import { ApiError } from '../client';
import type { TasksApi } from '../tasks';
import type { Task, TaskEvent } from '../types';
import { mockDelay } from './delay';

const STORAGE_KEY = 'project-hub.mock.tasks';
const POSITION_STEP = 1000;

/**
 * Stands in for the socket: carries task events to every open tab of this
 * browser, the way the API will broadcast them to the project's room.
 */
export const MOCK_TASK_CHANNEL = 'project-hub.mock.task-events';

let channel: BroadcastChannel | undefined;

function publish(event: TaskEvent): void {
  channel ??= new BroadcastChannel(MOCK_TASK_CHANNEL);
  channel.postMessage(event);
}

// Read on every call: another tab may have written since the last one.
function load(): Task[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Task[];
  } catch {
    return [];
  }
}

function save(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function findOrThrow(tasks: Task[], id: number): Task {
  const task = tasks.find((t) => t.id === id);
  if (!task) throw new ApiError(404, `Task with ID ${id} not found`);
  return task;
}

export const mockTasksApi: TasksApi = {
  async list(projectId) {
    await mockDelay();
    return load().filter((task) => task.projectId === projectId);
  },

  async create(projectId, input) {
    await mockDelay();
    const tasks = load();
    const status = input.status ?? 'todo';
    const now = new Date().toISOString();
    const lastPosition = Math.max(
      0,
      ...tasks
        .filter((t) => t.projectId === projectId && t.status === status)
        .map((t) => t.position),
    );
    const task: Task = {
      id: Math.max(0, ...tasks.map((t) => t.id)) + 1,
      projectId,
      title: input.title,
      description: input.description ?? null,
      status,
      position: lastPosition + POSITION_STEP,
      assignee: input.assignee ?? null,
      createdAt: now,
      updatedAt: now,
    };
    save([...tasks, task]);
    publish({ type: 'taskCreated', task });
    return task;
  },

  async update(id, input) {
    await mockDelay();
    const tasks = load();
    const task: Task = {
      ...findOrThrow(tasks, id),
      ...input,
      updatedAt: new Date().toISOString(),
    };
    save(tasks.map((t) => (t.id === id ? task : t)));
    publish({ type: 'taskUpdated', task });
    return task;
  },

  async remove(id) {
    await mockDelay();
    const tasks = load();
    const task = findOrThrow(tasks, id);
    save(tasks.filter((t) => t.id !== id));
    publish({ type: 'taskDeleted', id, projectId: task.projectId });
    return task;
  },
};
