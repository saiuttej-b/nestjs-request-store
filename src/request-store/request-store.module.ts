import { DynamicModule, Inject, MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { installedMiddlewarePath } from './http-wildcard';
import { RequestStoreMiddleware } from './request-store.middleware';
import {
  REQUEST_STORE_OPTIONS,
  type RequestStoreModuleOptions,
  type ResolvedRequestStoreModuleOptions,
} from './request-store.options';
import { RequestStoreService } from './request-store.service';

/**
 * Provides {@link RequestStoreService}.
 * Call `forRoot` to register it. HTTP middleware is off unless `http` is true.
 */
@Module({})
export class RequestStoreModule implements NestModule {
  constructor(
    @Inject(REQUEST_STORE_OPTIONS)
    private readonly options: ResolvedRequestStoreModuleOptions,
  ) {}

  /**
   * Registers request middleware when `http` is enabled.
   */
  configure(consumer: MiddlewareConsumer): void {
    if (!this.options.http) {
      return;
    }

    consumer.apply(RequestStoreMiddleware).forRoutes(installedMiddlewarePath());
  }

  /**
   * Registers the request store.
   * `isGlobal` and `http` both default to `false`.
   */
  static forRoot(options?: RequestStoreModuleOptions): DynamicModule {
    const resolved: ResolvedRequestStoreModuleOptions = {
      isGlobal: options?.isGlobal ?? false,
      http: options?.http ?? false,
    };

    return {
      module: RequestStoreModule,
      global: resolved.isGlobal,
      providers: [
        { provide: REQUEST_STORE_OPTIONS, useValue: resolved },
        RequestStoreService,
        RequestStoreMiddleware,
      ],
      exports: [RequestStoreService],
    };
  }
}
