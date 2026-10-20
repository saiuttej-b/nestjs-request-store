<h3 align="center">NestJS Request Store</h3>

<div align="center">
  <a href="https://www.npmjs.com/package/@saiuttej/nestjs-request-store">
    <img src="https://img.shields.io/npm/v/@saiuttej/nestjs-request-store" alt="npm version">
  </a>
  <a href="https://github.com/saiuttej-b/nestjs-request-store/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/@saiuttej/nestjs-request-store" alt="license">
  </a>
  <a href="https://github.com/saiuttej-b/nestjs-request-store/actions/workflows/ci.yml">
    <img src="https://github.com/saiuttej-b/nestjs-request-store/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <a href="https://nestjs.com" target="_blank">
    <img src="https://img.shields.io/badge/built%20with-NestJs-red.svg" alt="Built with NestJS">
  </a>
</div>

Store data for the current unit of work with `AsyncLocalStorage`. `session()` is the API for jobs, queues, cron, and scripts. HTTP apps can opt in to middleware that opens a store for each request.

Requires Node.js 20 or newer and NestJS 10, 11, or 12.

## Installation

Install via NPM:

```bash
npm install @saiuttej/nestjs-request-store
```

Install via Yarn:

```bash
yarn add @saiuttej/nestjs-request-store
```

Install via PNPM:

```bash
pnpm add @saiuttej/nestjs-request-store
```

## Sessions

Use `session()` anywhere HTTP is not the unit of work.

```ts
import { Injectable, Module } from '@nestjs/common';
import { RequestStoreModule, RequestStoreService } from '@saiuttej/nestjs-request-store';

@Module({
  imports: [RequestStoreModule.forRoot({ isGlobal: true })],
})
export class AppModule {}

@Injectable()
export class JobRunner {
  constructor(private readonly requestStore: RequestStoreService) {}

  async run(): Promise<void> {
    await this.requestStore.session({
      execute: async () => {
        this.requestStore.setValue('jobId', 'job-1');
        await this.work();
      },
    });
  }

  private async work(): Promise<void> {
    const jobId = this.requestStore.getValue('jobId');
    console.log(jobId);
  }
}
```

`forRoot()` takes no arguments. `isGlobal` and `http` both default to `false`.

A nested session can shallow-copy the parent map:

```ts
await this.requestStore.session({
  inherit: true,
  execute: async () => {
    const jobId = this.requestStore.getValue('jobId');
    await this.step(jobId);
  },
});
```

## HTTP

Set `http: true` to open a fresh store for every incoming request. Leave it off for workers and scripts.

```ts
import { Injectable, Module } from '@nestjs/common';
import type { CanActivate } from '@nestjs/common';
import { RequestStoreModule, RequestStoreService } from '@saiuttej/nestjs-request-store';

type AppStore = {
  userId: string;
};

@Module({
  imports: [RequestStoreModule.forRoot({ isGlobal: true, http: true })],
})
export class AppModule {}

@Injectable()
export class ActorGuard implements CanActivate {
  constructor(private readonly requestStore: RequestStoreService<AppStore>) {}

  canActivate(): boolean {
    this.requestStore.setValue('userId', 'user-1');
    return true;
  }
}
```

Middleware runs before guards, so a guard can write a value and a service later in the same request can read it.

## Typed keys

Annotate the service at the injection site. Nest cannot carry a `forRoot` generic into the injected class.

```ts
constructor(private readonly requestStore: RequestStoreService<{ userId: string }>) {}
```

`setValue` and `getValue` then follow that shape. Without a type argument, any string key is accepted.

## API

| Method | Behavior |
| --- | --- |
| `session({ execute, inherit })` | Runs `execute` inside a store. `inherit: true` shallow-copies the parent map. |
| `setValue(key, value)` | Stores a value in the active session. |
| `getValue(key)` | Returns the value, or `undefined` when the key is absent. |
| `getOrThrow(key)` | Returns the value, or throws `RequestStoreKeyNotFoundError`. |
| `has(key)` | Reports whether the key is present. |
| `delete(key)` | Removes one key. |
| `clear()` | Removes every key in the active session. |

`getValue`, `setValue`, `getOrThrow`, `has`, `delete`, and `clear` throw `RequestStoreNotInitializedError` when no session is active.

## Rules

- Nothing is stored until `session()` starts, or until a request enters the middleware enabled with `http: true`.
- `inherit` copies the map. Nested objects and arrays are still the same references as the parent.
- With `http: true`, the store exists from middleware onward, which is early enough for guards to use it. Code that runs before middleware cannot see it.

## Author

**B Sai Uttej**

## License

Licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
