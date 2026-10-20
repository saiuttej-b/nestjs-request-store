import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { installedMiddlewarePath, middlewarePathForNestVersion } from '../http-wildcard';

describe('middleware path', () => {
  it('uses a star for Nest 10 and a named wildcard from Nest 11', () => {
    expect(middlewarePathForNestVersion('10.4.1')).toBe('*');
    expect(middlewarePathForNestVersion('11.0.0')).toBe('{*splat}');
    expect(middlewarePathForNestVersion('12.1.3')).toBe('{*splat}');
  });

  it('reads the installed Nest version', () => {
    const require = createRequire(__filename);
    const entry = require.resolve('@nestjs/common');
    const pkg = JSON.parse(readFileSync(join(dirname(entry), 'package.json'), 'utf8')) as {
      version: string;
    };

    expect(installedMiddlewarePath()).toBe(middlewarePathForNestVersion(pkg.version));
  });
});
