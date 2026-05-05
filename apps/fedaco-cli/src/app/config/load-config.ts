import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { isAbsolute, resolve } from 'node:path';

import type { FedacoCliOptions } from '../app.module';

const DEFAULT_CONFIG_FILES = [
  'fedaco.config.js',
  'fedaco.config.cjs',
  'fedaco.config.json',
];

const dynamicRequire = createRequire(process.cwd() + '/');

export function loadFedacoConfig(): FedacoCliOptions {
  const argv = process.argv.slice(2);
  const idx = argv.findIndex((a) => a === '--config' || a === '-c');
  const explicit = idx >= 0 ? argv[idx + 1] : undefined;

  const cwd = process.cwd();
  const file = resolveConfigFile(cwd, explicit);

  if (!file) {
    throw new Error(
      `fedaco: no config file found. Looked for: ${DEFAULT_CONFIG_FILES.join(', ')}`
    );
  }

  const loaded = dynamicRequire(file);
  const config = loaded && loaded.default ? loaded.default : loaded;

  if (!config || !config.connections) {
    throw new Error(
      `fedaco: config "${file}" must export { connections: { ... } }`
    );
  }

  return config as FedacoCliOptions;
}

function resolveConfigFile(cwd: string, explicit?: string): string | null {
  if (explicit) {
    const p = isAbsolute(explicit) ? explicit : resolve(cwd, explicit);
    return existsSync(p) ? p : null;
  }
  for (const name of DEFAULT_CONFIG_FILES) {
    const p = resolve(cwd, name);
    if (existsSync(p)) return p;
  }
  return null;
}
