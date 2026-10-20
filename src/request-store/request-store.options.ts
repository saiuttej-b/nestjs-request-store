/**
 * Symbol for the resolved module options.
 */
export const REQUEST_STORE_OPTIONS = Symbol.for('REQUEST_STORE_OPTIONS');

/**
 * Options for {@link RequestStoreModule.forRoot}.
 */
export type RequestStoreModuleOptions = {
  /** Register the module as global. Defaults to false. */
  isGlobal?: boolean;
  /** Open a store for each HTTP request. Defaults to false. */
  http?: boolean;
};

/**
 * Module options after defaults are applied.
 */
export type ResolvedRequestStoreModuleOptions = {
  isGlobal: boolean;
  http: boolean;
};
