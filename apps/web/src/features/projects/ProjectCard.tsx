import { Link } from 'react-router';
import type { Project, ProjectStatus } from '@/api/types';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const STATUS_VARIANT: Record<
  ProjectStatus,
  'default' | 'secondary' | 'outline'
> = {
  active: 'default',
  inactive: 'secondary',
  completed: 'outline',
};

export function ProjectCard({ project }: { project: Project }) {
  const members = project.team.length;

  return (
    <Link
      to={`/projects/${project.id}`}
      className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          <CardAction>
            <Badge variant={STATUS_VARIANT[project.status]}>
              {project.status}
            </Badge>
          </CardAction>
          <CardDescription className="line-clamp-2">
            {project.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          Owner: {project.owner} · {members}{' '}
          {members === 1 ? 'member' : 'members'}
        </CardContent>
      </Card>
    </Link>
  );
}
