import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <Link to="/projects" className="text-sm underline underline-offset-4">
        Back to projects
      </Link>
    </div>
  );
}
