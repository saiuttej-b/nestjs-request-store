import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

/**
 * Route path that matches every HTTP request for the given Nest major version.
 * Nest 10 accepts `*`. Nest 11 and later require a named wildcard.
 */
export function middlewarePathForNestVersion(version: string): string {
  const major = Number(version.split('.')[0]);
  return major >= 11 ? '{*splat}' : '*';
}

/**
 * Route path for the installed `@nestjs/common` version.
 */
export function installedMiddlewarePath(): string {
  const require = createRequire(__filename);
  const entry = require.resolve('@nestjs/common');
  const pkg = JSON.parse(readFileSync(join(dirname(entry), 'package.json'), 'utf8')) as {
    version: string;
  };
  return middlewarePathForNestVersion(pkg.version);
}
