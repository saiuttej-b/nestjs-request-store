/**
 * Thrown when a store method runs without an active session or HTTP request.
 */
export class RequestStoreNotInitializedError extends Error {
  constructor() {
    super(
      'Request store is not initialized. Open a session with RequestStoreService.session() or enable HTTP middleware with RequestStoreModule.forRoot({ http: true }).',
    );
    this.name = 'RequestStoreNotInitializedError';
  }
}

/**
 * Thrown when a required key is missing from the active store.
 */
export class RequestStoreKeyNotFoundError extends Error {
  constructor(key: string) {
    super(`Request store key "${key}" was not found.`);
    this.name = 'RequestStoreKeyNotFoundError';
  }
}
