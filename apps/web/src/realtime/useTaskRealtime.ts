import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { taskKeys } from '@/features/board/keys';
import { applyTaskEvent, projectIdOf } from './applyTaskEvent';
import { socket } from './socket';
import { subscribeTaskEvents } from './taskEvents';

/** Keeps a project's cached task list in step with changes made elsewhere. */
export function useTaskRealtime(projectId: number): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribeTaskEvents((event) => {
      if (projectIdOf(event) !== projectId) return;
      // While a change of our own is in flight the cache holds its optimistic
      // result. Skip, and let the refetch that follows it bring the list
      // up to date (see useUpdateTask).
      const mutating = queryClient.isMutating({
        mutationKey: taskKeys.mutation(projectId),
      });
      if (mutating > 0) return;
      applyTaskEvent(queryClient, event);
    });

    // Events sent while we were offline are gone, so reload after a reconnect.
    const refetch = () => {
      void queryClient.invalidateQueries({
        queryKey: taskKeys.list(projectId),
      });
    };
    socket.io.on('reconnect', refetch);

    return () => {
      unsubscribe();
      socket.io.off('reconnect', refetch);
    };
  }, [projectId, queryClient]);
}
