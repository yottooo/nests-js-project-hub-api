import { api } from './client';
import { mockTasksApi } from './mocks/tasks.mock';
import type { CreateTaskInput, Task, UpdateTaskInput } from './types';

export interface TasksApi {
  list(projectId: number): Promise<Task[]>;
  create(projectId: number, input: CreateTaskInput): Promise<Task>;
  update(id: number, input: UpdateTaskInput): Promise<Task>;
  remove(id: number): Promise<Task>;
}

const realTasksApi: TasksApi = {
  list: (projectId) => api<Task[]>(`/projects/${projectId}/tasks`),
  create: (projectId, input) =>
    api<Task>(`/projects/${projectId}/tasks`, { method: 'POST', body: input }),
  update: (id, input) =>
    api<Task>(`/tasks/${id}`, { method: 'PATCH', body: input }),
  remove: (id) => api<Task>(`/tasks/${id}`, { method: 'DELETE' }),
};

export const USE_MOCK_TASKS = import.meta.env.VITE_MOCK_TASKS === 'true';

export const tasksApi: TasksApi = USE_MOCK_TASKS ? mockTasksApi : realTasksApi;
