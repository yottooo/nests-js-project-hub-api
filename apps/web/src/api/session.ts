import type { AuthSession } from './types';

const STORAGE_KEY = 'project-hub.session';
const listeners = new Set<() => void>();

function read(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

let current = read();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function getSession(): AuthSession | null {
  return current;
}

export function setSession(session: AuthSession | null): void {
  current = session;
  if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else localStorage.removeItem(STORAGE_KEY);
  notify();
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Logging in or out in one tab applies to the others.
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return;
  current = read();
  notify();
});
