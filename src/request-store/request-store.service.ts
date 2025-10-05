import { Inject, Injectable } from '@nestjs/common';
import { REQUEST_STORE_OPTIONS } from './request-store.constants';
import type { RequestStoreOptions } from './types';

/**
 * Request store service
 * It provides methods to set and get request scoped data
 * It provided custom methods to set and get the application specific data
 */
@Injectable()
export class RequestStoreService {
  /**
   * Constructor
   *
   * @param {RequestStoreOptions} options - Request store options
   */
  constructor(@Inject(REQUEST_STORE_OPTIONS) private readonly options: RequestStoreOptions) {}

  setValue<T>(key: string, value: T): void {
    this.options.set(key, value);
  }

  getValue<T>(key: string): T | undefined {
    return this.options.get<T>(key);
  }

  async session<T>(props: { execute: () => T | Promise<T>; inherit?: boolean }): Promise<T> {
    const previousStore = this.options.storage.getStore() as Map<string, unknown>;

    const state = new Map<string, unknown>();
    if (props.inherit && previousStore) {
      for (const [key, value] of previousStore.entries()) {
        state.set(key, value);
      }
    }

    return this.options.storage.run(state, () => {
      return props.execute();
    });
  }
}
