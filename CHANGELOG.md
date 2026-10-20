# Changelog

## 1.0.0

### Added

- Optional HTTP middleware via `RequestStoreModule.forRoot({ http: true })`. It stays off unless you enable it, so jobs, queues, and scripts keep using `session()`.
- `has`, `delete`, `clear`, and `getOrThrow` on `RequestStoreService`.
- `RequestStoreNotInitializedError` and `RequestStoreKeyNotFoundError`.
- A type argument on `RequestStoreService<T>` so injection sites can check keys.

### Changed

- `forRoot()` can be called with no arguments. `http` and `isGlobal` both default to `false`.
- `getValue`, `setValue`, `getOrThrow`, `has`, `delete`, and `clear` throw `RequestStoreNotInitializedError` when no session is active. Previously `getValue` returned `undefined` in that case.
- `getValue` no longer accepts a value type argument such as `getValue<User>(key)`. Type the service as `RequestStoreService<AppStore>` and the key's type supplies the return type.
