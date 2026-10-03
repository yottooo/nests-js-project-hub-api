import { MOCK_TASK_CHANNEL } from '@/api/mocks/tasks.mock';
import { USE_MOCK_TASKS } from '@/api/tasks';
import type { Task, TaskEvent } from '@/api/types';
import { socket } from './socket';

type Handler = (event: TaskEvent) => void;

function subscribeSocket(handler: Handler): () => void {
  const onCreated = (task: Task) => handler({ type: 'taskCreated', task });
  const onUpdated = (task: Task) => handler({ type: 'taskUpdated', task });
  const onDeleted = (payload: { id: number; projectId: number }) =>
    handler({ type: 'taskDeleted', ...payload });

  socket.on('taskCreated', onCreated);
  socket.on('taskUpdated', onUpdated);
  socket.on('taskDeleted', onDeleted);
  return () => {
    socket.off('taskCreated', onCreated);
    socket.off('taskUpdated', onUpdated);
    socket.off('taskDeleted', onDeleted);
  };
}

function subscribeMock(handler: Handler): () => void {
  const channel = new BroadcastChannel(MOCK_TASK_CHANNEL);
  channel.onmessage = (message: MessageEvent<TaskEvent>) => {
    handler(message.data);
  };
  return () => {
    channel.close();
  };
}

/**
 * Task changes made by anyone, from whichever source matches the tasks API in
 * use: the socket for the real API, a BroadcastChannel for the mock.
 */
export function subscribeTaskEvents(handler: Handler): () => void {
  return USE_MOCK_TASKS ? subscribeMock(handler) : subscribeSocket(handler);
}
