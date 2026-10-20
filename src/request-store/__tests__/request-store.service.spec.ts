import {
  RequestStoreKeyNotFoundError,
  RequestStoreNotInitializedError,
  RequestStoreService,
} from '../../index';

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

function throwRaw(value: string): never {
  // Session must reject throws that are not Error instances.
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw value;
}

describe('RequestStoreService', () => {
  const service = new RequestStoreService();

  const expectInactive = (): void => {
    expect(() => service.setValue('userId', 'user-1')).toThrow(RequestStoreNotInitializedError);
    expect(() => service.getValue('userId')).toThrow(RequestStoreNotInitializedError);
    expect(() => service.getOrThrow('userId')).toThrow(RequestStoreNotInitializedError);
    expect(() => service.has('userId')).toThrow(RequestStoreNotInitializedError);
    expect(() => service.delete('userId')).toThrow(RequestStoreNotInitializedError);
    expect(() => service.clear()).toThrow(RequestStoreNotInitializedError);
  };

  it('rejects store access when no session is active', () => {
    expectInactive();
  });

  it('names the missing-context error', () => {
    try {
      service.getValue('userId');
      throw new Error('expected getValue to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(RequestStoreNotInitializedError);
      expect((error as RequestStoreNotInitializedError).name).toBe(
        'RequestStoreNotInitializedError',
      );
      expect((error as RequestStoreNotInitializedError).message).toContain(
        'RequestStoreModule.forRoot({ http: true })',
      );
    }
  });

  it('keeps a value across await', async () => {
    await service.session({
      execute: async () => {
        service.setValue('userId', 'user-1');
        await delay(5);
        expect(service.getValue('userId')).toBe('user-1');
      },
    });

    expectInactive();
  });

  it('isolates overlapping sessions', async () => {
    let releaseFirst: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });

    const first = service.session({
      execute: async () => {
        service.setValue('id', 'a');
        await gate;
        return service.getValue('id');
      },
    });

    const second = service.session({
      execute: () => {
        service.setValue('id', 'b');
        return service.getValue('id');
      },
    });

    await expect(second).resolves.toBe('b');
    releaseFirst();
    await expect(first).resolves.toBe('a');
  });

  it('shallow-copies a parent store when inherit is true', async () => {
    const shared = { count: 1 };

    await service.session({
      execute: async () => {
        service.setValue('keep', 'yes');
        service.setValue('shared', shared);

        await service.session({
          inherit: true,
          execute: () => {
            expect(service.getValue('keep')).toBe('yes');
            const childShared = service.getValue('shared') as { count: number };
            childShared.count = 2;
            service.setValue('childOnly', 'only');
          },
        });

        expect(service.getValue('childOnly')).toBeUndefined();
        expect(service.getValue('shared')).toEqual({ count: 2 });
        expect(service.getValue('keep')).toBe('yes');
      },
    });
  });

  it('starts empty when inherit is true and there is no parent', async () => {
    await service.session({
      inherit: true,
      execute: () => {
        expect(service.has('keep')).toBe(false);
        service.setValue('keep', 'yes');
        expect(service.getOrThrow('keep')).toBe('yes');
      },
    });
  });

  it('starts empty when inherit copies an empty parent', async () => {
    await service.session({
      execute: async () => {
        await service.session({
          inherit: true,
          execute: () => {
            expect(service.has('keep')).toBe(false);
          },
        });
      },
    });
  });

  it('does not inherit when inherit is false', async () => {
    await service.session({
      execute: async () => {
        service.setValue('keep', 'yes');
        await service.session({
          inherit: false,
          execute: () => {
            expect(service.has('keep')).toBe(false);
          },
        });
        expect(service.getValue('keep')).toBe('yes');
      },
    });
  });

  it('does not inherit when inherit is omitted', async () => {
    await service.session({
      execute: async () => {
        service.setValue('keep', 'yes');
        await service.session({
          execute: () => {
            expect(service.has('keep')).toBe(false);
          },
        });
        expect(service.getValue('keep')).toBe('yes');
      },
    });
  });

  it('leaves no store after a synchronous throw', async () => {
    await expect(
      service.session({
        execute: () => {
          service.setValue('userId', 'user-1');
          throw new Error('boom');
        },
      }),
    ).rejects.toThrow('boom');

    expectInactive();
  });

  it('wraps a non-error throw and leaves no store', async () => {
    await expect(
      service.session({
        execute: () => {
          throwRaw('boom');
        },
      }),
    ).rejects.toThrow('boom');

    expectInactive();
  });

  it('leaves no store after an async rejection', async () => {
    await expect(
      service.session({
        execute: async () => {
          service.setValue('userId', 'user-1');
          await delay(1);
          throw new Error('nope');
        },
      }),
    ).rejects.toThrow('nope');

    expectInactive();
  });

  it('reads, removes, and clears keys inside a session', async () => {
    await service.session({
      execute: () => {
        expect(service.getValue('missing')).toBeUndefined();
        expect(service.has('userId')).toBe(false);
        service.delete('missing');

        service.setValue('userId', 'user-1');
        service.setValue('tenantId', 'tenant-1');
        expect(service.has('userId')).toBe(true);
        expect(service.getOrThrow('userId')).toBe('user-1');

        service.delete('userId');
        expect(service.has('userId')).toBe(false);

        service.clear();
        expect(service.has('tenantId')).toBe(false);
      },
    });
  });

  it('throws when a required key is missing', async () => {
    await service.session({
      execute: () => {
        try {
          service.getOrThrow('userId');
          throw new Error('expected getOrThrow to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(RequestStoreKeyNotFoundError);
          expect((error as RequestStoreKeyNotFoundError).name).toBe('RequestStoreKeyNotFoundError');
          expect((error as RequestStoreKeyNotFoundError).message).toBe(
            'Request store key "userId" was not found.',
          );
        }
      },
    });
  });
});
