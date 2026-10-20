import { type DynamicModule } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { RequestStoreModule, RequestStoreService } from '../../index';
import {
  REQUEST_STORE_OPTIONS,
  type ResolvedRequestStoreModuleOptions,
} from '../request-store.options';

function resolvedOptions(dynamicModule: DynamicModule): ResolvedRequestStoreModuleOptions {
  const optionsProvider = dynamicModule.providers?.find(
    (provider) =>
      typeof provider === 'object' &&
      provider !== null &&
      'provide' in provider &&
      provider.provide === REQUEST_STORE_OPTIONS,
  );

  if (!optionsProvider || !('useValue' in optionsProvider)) {
    throw new Error('expected resolved options provider');
  }

  return optionsProvider.useValue;
}

describe('RequestStoreModule', () => {
  it('defaults both flags to false', () => {
    expect(RequestStoreModule.forRoot().global).toBe(false);
    expect(resolvedOptions(RequestStoreModule.forRoot())).toEqual({
      isGlobal: false,
      http: false,
    });
    expect(resolvedOptions(RequestStoreModule.forRoot({}))).toEqual({
      isGlobal: false,
      http: false,
    });
    expect(resolvedOptions(RequestStoreModule.forRoot({ isGlobal: false, http: false }))).toEqual({
      isGlobal: false,
      http: false,
    });
  });

  it('accepts a global module and HTTP middleware', () => {
    expect(resolvedOptions(RequestStoreModule.forRoot({ isGlobal: true }))).toEqual({
      isGlobal: true,
      http: false,
    });
    expect(resolvedOptions(RequestStoreModule.forRoot({ http: true }))).toEqual({
      isGlobal: false,
      http: true,
    });

    const dynamicModule = RequestStoreModule.forRoot({ isGlobal: true, http: true });
    expect(dynamicModule.global).toBe(true);
    expect(dynamicModule.exports).toEqual([RequestStoreService]);
    expect(resolvedOptions(dynamicModule)).toEqual({ isGlobal: true, http: true });
  });

  it('resolves the service from a testing module', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RequestStoreModule.forRoot({ isGlobal: true })],
    }).compile();

    expect(moduleRef.get(RequestStoreService)).toBeInstanceOf(RequestStoreService);
    await moduleRef.close();
  });
});
