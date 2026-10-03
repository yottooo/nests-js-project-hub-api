/** Fake network latency, so loading and optimistic states are visible. */
export function mockDelay(ms = 150): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
