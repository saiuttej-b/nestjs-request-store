import { DynamicModule, Module } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { RequestStoreService } from './request-store.service';

/**
 * AsyncLocalStorage instance to store request scoped data
 */
const store = new AsyncLocalStorage();

/**
 * Get the store data
 *
 * @throws {BadRequestException} If the store is not initialized
 * @returns {Map<string, unknown>} The store data
 */
function getStore(): Map<string, unknown> {
  const data = store.getStore();
  if (!data) {
    throw new Error('Request store is not initialized');
  }
  return data as Map<string, unknown>;
}

/**
 * Sets a value in the store.
 *
 * @param {string} key - The key to set.
 * @param {unknown} value - The value to set.
 * @returns {void}
 */
function set(key: string, value: unknown): void {
  getStore().set(key, value);
}

/**
 * Gets a value from the store.
 *
 * @template T
 * @param {string} key - The key to get.
 * @returns {T | undefined} The value or undefined if not found.
 */
function get<T>(key: string): T | undefined {
  const data = store.getStore() as Map<string, unknown>;
  if (!data) return;
  return data.get(key) as T;
}

/**
 * Request store module
 * It provides a request scoped store to store data that can be accessed in the same request.
 * It also provides a service to interact with the store.
 * It also provides a middleware to initialize the store
 */
@Module({})
export class RequestStoreModule {
  static forRoot(props: { isGlobal?: boolean }): DynamicModule {
    return {
      module: RequestStoreModule,
      providers: [
        {
          provide: RequestStoreService,
          useFactory: () => new RequestStoreService({ getStore, set, get, storage: store }),
        },
      ],
      exports: [RequestStoreService],
      global: props.isGlobal ?? false,
    };
  }
}
