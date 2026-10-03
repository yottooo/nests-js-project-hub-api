import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './useAuth';

/** Route guard: renders the nested routes only for a signed-in user. */
export function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Remember where the user was heading, so login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
