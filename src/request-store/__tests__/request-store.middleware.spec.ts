import { RequestStoreNotInitializedError, RequestStoreService } from '../../index';
import { RequestStoreMiddleware } from '../request-store.middleware';

describe('RequestStoreMiddleware', () => {
  it('opens a store for the rest of the request callback', () => {
    const service = new RequestStoreService();
    const middleware = new RequestStoreMiddleware();
    let seen: string | undefined;

    middleware.use({}, {}, () => {
      service.setValue('userId', 'user-1');
      seen = service.getValue('userId');
    });

    expect(seen).toBe('user-1');
    expect(() => service.getValue('userId')).toThrow(RequestStoreNotInitializedError);
  });
});
