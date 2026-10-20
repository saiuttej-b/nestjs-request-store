import { AsyncLocalStorage } from 'node:async_hooks';
import { RequestStoreNotInitializedError } from './request-store.errors';

/**
 * Process-wide context for the request store.
 * Each session or HTTP request gets its own map.
 */
export const requestContext = new AsyncLocalStorage<Map<string, unknown>>();

/**
 * Returns the map for the current session.
 *
 * @throws {RequestStoreNotInitializedError} When no session is active.
 */
export function getActiveStore(): Map<string, unknown> {
  const store = requestContext.getStore();
  if (!store) {
    throw new RequestStoreNotInitializedError();
  }
  return store;
}
