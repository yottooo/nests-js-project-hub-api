import { io, type Socket } from 'socket.io-client';
import { getSession } from '@/api/session';
import type { ChatMessage, Project, Task } from '@/api/types';

interface ServerToClientEvents {
  joinedProject: (payload: { projectId: number }) => void;
  error: (payload: { message: string }) => void;
  newMessage: (message: ChatMessage) => void;
  // Not emitted by the API yet; see the contract in apps/web/README.md.
  taskCreated: (task: Task) => void;
  taskUpdated: (task: Task) => void;
  taskDeleted: (payload: { id: number; projectId: number }) => void;
  projectCreated: (project: Project) => void;
  projectUpdated: (project: Project) => void;
  projectRemoved: (payload: { id: number }) => void;
}

interface ClientToServerEvents {
  joinProject: (payload: { projectId: number }) => void;
  leaveProject: (payload: { projectId: number }) => void;
  sendMessage: (payload: { projectId: number; text: string }) => void;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * The one socket of the app, shared by chat and live board updates.
 * No URL: it connects to the page's origin, and Vite proxies /socket.io to
 * the API in dev. RealtimeProvider opens and closes it.
 */
export const socket: AppSocket = io({
  autoConnect: false,
  // Ignored by the API today; ready for when the gateway checks tokens.
  auth: (cb) => cb({ token: getSession()?.accessToken }),
});

/** Every id this tab has had. The id changes on each reconnect. */
export const ownSocketIds = new Set<string>();

socket.on('connect', () => {
  if (socket.id) ownSocketIds.add(socket.id);
});
