export const taskKeys = {
  list: (projectId: number) => ['tasks', projectId] as const,
  /** Shared by every task mutation of a project, so they can be counted together. */
  mutation: (projectId: number) => ['tasks', projectId, 'mutation'] as const,
};
