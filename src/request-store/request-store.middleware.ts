import { Injectable, type NestMiddleware } from '@nestjs/common';
import { RequestStoreService } from './request-store.service';

/**
 * Opens a store for one HTTP request.
 * Registered only when `forRoot({ http: true })` is used.
 */
@Injectable()
export class RequestStoreMiddleware implements NestMiddleware {
  use(_req: unknown, _res: unknown, next: () => void): void {
    void new RequestStoreService().session({ execute: () => next() });
  }
}
