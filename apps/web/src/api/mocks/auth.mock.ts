import type { AuthApi } from '../auth';
import { ApiError } from '../client';
import { mockDelay } from './delay';

// The same email always gets the same id, like a real user row would.
function idFromEmail(email: string): number {
  let hash = 0;
  for (const char of email) {
    hash = (hash * 31 + char.charCodeAt(0)) % 1_000_000;
  }
  return hash + 1;
}

/** Accepts any non-empty email and password. */
export const mockAuthApi: AuthApi = {
  async login({ email, password }) {
    await mockDelay();
    const normalized = email.trim().toLowerCase();
    if (!normalized || !password) {
      throw new ApiError(401, 'Invalid email or password');
    }
    return {
      accessToken: 'mock-token',
      user: {
        id: idFromEmail(normalized),
        email: normalized,
        name: normalized.split('@')[0],
      },
    };
  },
};
