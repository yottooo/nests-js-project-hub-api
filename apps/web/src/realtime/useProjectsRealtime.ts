import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Project } from '@/api/types';
import { projectKeys } from '@/features/projects/keys';
import { socket } from './socket';

/**
 * Keeps the cached project list in step with changes made elsewhere.
 * Dormant until the API broadcasts these events (the planned FeedGateway).
 */
export function useProjectsRealtime(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const upsert = (project: Project) => {
      queryClient.setQueryData<Project[]>(projectKeys.all, (projects) => {
        if (!projects) return projects;
        return projects.some((p) => p.id === project.id)
          ? projects.map((p) => (p.id === project.id ? project : p))
          : [project, ...projects];
      });
      queryClient.setQueryData(projectKeys.detail(project.id), project);
    };
    const remove = ({ id }: { id: number }) => {
      queryClient.setQueryData<Project[]>(projectKeys.all, (projects) =>
        projects?.filter((p) => p.id !== id),
      );
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
    };

    socket.on('projectCreated', upsert);
    socket.on('projectUpdated', upsert);
    socket.on('projectRemoved', remove);
    return () => {
      socket.off('projectCreated', upsert);
      socket.off('projectUpdated', upsert);
      socket.off('projectRemoved', remove);
    };
  }, [queryClient]);
}
