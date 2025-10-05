import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Request store options
 */
export type RequestStoreOptions = {
  storage: AsyncLocalStorage<unknown>;
  getStore: () => Map<string, unknown>;
  set: (key: string, value: unknown) => void;
  get: <T>(key: string) => T | undefined;
};
