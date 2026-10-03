import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/api/tasks';
import type { CreateTaskInput, Task, UpdateTaskInput } from '@/api/types';
import { applyTaskEvent } from '@/realtime/applyTaskEvent';
import { taskKeys } from './keys';

export function useTasks(projectId: number) {
  return useQuery({
    queryKey: taskKeys.list(projectId),
    queryFn: () => tasksApi.list(projectId),
  });
}

/**
 * Reloads the list once the last in-flight task mutation has finished, so the
 * cache ends on what the server has, whatever happened in between.
 */
function useRefetchWhenIdle(projectId: number) {
  const queryClient = useQueryClient();
  return () => {
    // The mutation calling this from onSettled still counts as in flight.
    const mutating = queryClient.isMutating({
      mutationKey: taskKeys.mutation(projectId),
    });
    if (mutating === 1) {
      void queryClient.invalidateQueries({
        queryKey: taskKeys.list(projectId),
      });
    }
  };
}

export function useCreateTask(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: taskKeys.mutation(projectId),
    mutationFn: (input: CreateTaskInput) => tasksApi.create(projectId, input),
    onSuccess: (task) => {
      applyTaskEvent(queryClient, { type: 'taskCreated', task });
    },
    onSettled: useRefetchWhenIdle(projectId),
  });
}

export function useDeleteTask(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: taskKeys.mutation(projectId),
    mutationFn: (id: number) => tasksApi.remove(id),
    onSuccess: (task) => {
      applyTaskEvent(queryClient, {
        type: 'taskDeleted',
        id: task.id,
        projectId,
      });
    },
    onSettled: useRefetchWhenIdle(projectId),
  });
}

export function useUpdateTask(projectId: number) {
  const queryClient = useQueryClient();
  const queryKey = taskKeys.list(projectId);

  const mutation = useMutation({
    mutationKey: taskKeys.mutation(projectId),
    mutationFn: ({ id, input }: { id: number; input: UpdateTaskInput }) =>
      tasksApi.update(id, input),
    // Responses are not written to the cache: with several updates in flight,
    // an earlier response would briefly undo a later optimistic one. The
    // refetch settles the list, and is also what rolls back after an error.
    onSettled: useRefetchWhenIdle(projectId),
  });

  const update = (
    id: number,
    input: UpdateTaskInput,
    options?: { onSuccess?: () => void },
  ) => {
    // Optimistic write. Done here rather than in onMutate, which runs a tick
    // later: a dropped card has to be in its new place before the next paint.
    void queryClient.cancelQueries({ queryKey });
    queryClient.setQueryData<Task[]>(queryKey, (tasks) =>
      tasks?.map((task) => (task.id === id ? { ...task, ...input } : task)),
    );
    mutation.mutate({ id, input }, options);
  };

  return { update, error: mutation.error, isPending: mutation.isPending };
}
