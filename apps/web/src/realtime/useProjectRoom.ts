import { useEffect } from 'react';
import { socket } from './socket';

/** Keeps the socket in the project's room while the calling page is mounted. */
export function useProjectRoom(projectId: number): void {
  useEffect(() => {
    const join = () => {
      socket.emit('joinProject', { projectId });
    };

    if (socket.connected) join();
    // Also fires after every reconnect, when the server has forgotten our rooms.
    socket.on('connect', join);

    return () => {
      socket.off('connect', join);
      // The API has no leaveProject handler yet and ignores this, which is why
      // every listener also filters by projectId.
      if (socket.connected) socket.emit('leaveProject', { projectId });
    };
  }, [projectId]);
}
