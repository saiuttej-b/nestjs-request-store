import { Injectable } from '@nestjs/common';
import { RequestStoreKeyNotFoundError } from './request-store.errors';
import { getActiveStore, requestContext } from './request-store.storage';

type StoreKey<T> = Extract<keyof T, string>;

/**
 * Reads and writes values for the active session.
 *
 * Type the injected service to check keys:
 * `RequestStoreService<{ userId: string }>`.
 * The default accepts any string key.
 */
@Injectable()
export class RequestStoreService<T extends Record<string, any> = Record<string, any>> {
  /**
   * Stores `value` under `key` in the active session.
   *
   * @throws {RequestStoreNotInitializedError} When no session is active.
   */
  setValue<K extends StoreKey<T>>(key: K, value: T[K]): void {
    getActiveStore().set(key, value);
  }

  /**
   * Returns the value stored under `key`, or `undefined` when the key is absent.
   *
   * @throws {RequestStoreNotInitializedError} When no session is active.
   */
  getValue<K extends StoreKey<T>>(key: K): T[K] | undefined {
    return getActiveStore().get(key) as T[K] | undefined;
  }

  /**
   * Returns the value stored under `key`.
   *
   * @throws {RequestStoreNotInitializedError} When no session is active.
   * @throws {RequestStoreKeyNotFoundError} When the key is absent.
   */
  getOrThrow<K extends StoreKey<T>>(key: K): T[K] {
    const store = getActiveStore();
    if (!store.has(key)) {
      throw new RequestStoreKeyNotFoundError(key);
    }
    return store.get(key) as T[K];
  }

  /**
   * Reports whether `key` is present in the active session.
   *
   * @throws {RequestStoreNotInitializedError} When no session is active.
   */
  has(key: StoreKey<T>): boolean {
    return getActiveStore().has(key);
  }

  /**
   * Removes `key` from the active session.
   *
   * @throws {RequestStoreNotInitializedError} When no session is active.
   */
  delete(key: StoreKey<T>): void {
    getActiveStore().delete(key);
  }

  /**
   * Removes every key from the active session.
   *
   * @throws {RequestStoreNotInitializedError} When no session is active.
   */
  clear(): void {
    getActiveStore().clear();
  }

  /**
   * Runs `execute` inside a new store.
   * `storage.run` is entered synchronously so callers, including HTTP middleware,
   * stay inside the context.
   *
   * `inherit` shallow-copies the parent map. Object values are still shared.
   * A missing or `false` `inherit` starts an empty map.
   */
  session<R>(props: { execute: () => R | Promise<R>; inherit?: boolean }): Promise<R> {
    const previousStore = requestContext.getStore();
    const state = new Map<string, unknown>();
    if (props.inherit && previousStore) {
      for (const [key, value] of previousStore.entries()) {
        state.set(key, value);
      }
    }

    try {
      return Promise.resolve(requestContext.run(state, () => props.execute()));
    } catch (error: unknown) {
      const reason = error instanceof Error ? error : new Error(String(error));
      return Promise.reject(reason);
    }
  }
}
