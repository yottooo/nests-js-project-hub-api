import { useEffect, type ReactNode } from 'react';
import { socket } from './socket';

/** Keeps the app-wide socket open for as long as a signed-in page is mounted. */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  return children;
}
