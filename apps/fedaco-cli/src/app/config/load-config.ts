import { createInterface } from 'node:readline';
import { existsSync, writeFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';

import { jitiRequire } from '../jiti-loader';

export interface FedacoCliOptions {
  connections: Record<string, any>;
  defaultConnection?: string;
  migrationsPath?: string;
  migrationsTable?: string;
}

const DEFAULT_CONFIG_FILES = [
  'fedaco.config.js',
  'fedaco.config.mjs',
  'fedaco.config.mts',
  'fedaco.config.cjs',
];

const CONFIG_TEMPLATES: Record<string, string> = {
  'fedaco.config.js': `const { betterSqliteDriver } = require('@gradii/fedaco-sqlite-driver');
// const { mysqlDriver } = require('@gradii/fedaco-mysql-driver');
// const { mariadbDriver } = require('@gradii/fedaco-mysql-driver');
// const { postgresDriver } = require('@gradii/fedaco-postgres-driver');

module.exports = {
  defaultConnection: 'default',
  migrationsPath: './database/migrations',
  migrationsTable: 'migrations',
  connections: {
    default: {
      driver: 'sqlite',
      factory: betterSqliteDriver(),
      database: './database/database.sqlite',
    },
    // mysql: {
    //   driver: 'mysql',
    //   factory: mysqlDriver(),
    //   host: '127.0.0.1',
    //   port: 3306,
    //   database: 'my_database',
    //   username: 'root',
    //   password: '',
    // },
    // postgres: {
    //   driver: 'pgsql',
    //   factory: postgresDriver(),
    //   host: '127.0.0.1',
    //   port: 5432,
    //   database: 'my_database',
    //   username: 'postgres',
    //   password: '',
    // },
    // mariadb: {
    //   driver: 'mariadb',
    //   factory: mariadbDriver(),
    //   host: '127.0.0.1',
    //   port: 3306,
    //   database: 'my_database',
    //   username: 'root',
    //   password: '',
    // },
  },
};
`,
  'fedaco.config.mjs': `import { betterSqliteDriver } from '@gradii/fedaco-sqlite-driver';
// import { mysqlDriver } from '@gradii/fedaco-mysql-driver';
// import { mariadbDriver } from '@gradii/fedaco-mysql-driver';
// import { postgresDriver } from '@gradii/fedaco-postgres-driver';

export default {
  defaultConnection: 'default',
  migrationsPath: './database/migrations',
  migrationsTable: 'migrations',
  connections: {
    default: {
      driver: 'sqlite',
      factory: betterSqliteDriver(),
      database: './database/database.sqlite',
    },
    // mysql: {
    //   driver: 'mysql',
    //   factory: mysqlDriver(),
    //   host: '127.0.0.1',
    //   port: 3306,
    //   database: 'my_database',
    //   username: 'root',
    //   password: '',
    // },
    // postgres: {
    //   driver: 'pgsql',
    //   factory: postgresDriver(),
    //   host: '127.0.0.1',
    //   port: 5432,
    //   database: 'my_database',
    //   username: 'postgres',
    //   password: '',
    // },
    // mariadb: {
    //   driver: 'mariadb',
    //   factory: mariadbDriver(),
    //   host: '127.0.0.1',
    //   port: 3306,
    //   database: 'my_database',
    //   username: 'root',
    //   password: '',
    // },
  },
};
`,
  'fedaco.config.mts': `import { betterSqliteDriver } from '@gradii/fedaco-sqlite-driver';
// import { mysqlDriver } from '@gradii/fedaco-mysql-driver';
// import { mariadbDriver } from '@gradii/fedaco-mysql-driver';
// import { postgresDriver } from '@gradii/fedaco-postgres-driver';

export default {
  defaultConnection: 'default',
  migrationsPath: './database/migrations',
  migrationsTable: 'migrations',
  connections: {
    default: {
      driver: 'sqlite',
      factory: betterSqliteDriver(),
      database: './database/database.sqlite',
    },
    // mysql: {
    //   driver: 'mysql',
    //   factory: mysqlDriver(),
    //   host: '127.0.0.1',
    //   port: 3306,
    //   database: 'my_database',
    //   username: 'root',
    //   password: '',
    // },
    // postgres: {
    //   driver: 'pgsql',
    //   factory: postgresDriver(),
    //   host: '127.0.0.1',
    //   port: 5432,
    //   database: 'my_database',
    //   username: 'postgres',
    //   password: '',
    // },
    // mariadb: {
    //   driver: 'mariadb',
    //   factory: mariadbDriver(),
    //   host: '127.0.0.1',
    //   port: 3306,
    //   database: 'my_database',
    //   username: 'root',
    //   password: '',
    // },
  },
};
`,
};

const FORMAT_CHOICES = Object.keys(CONFIG_TEMPLATES);

export async function loadFedacoConfig(): Promise<FedacoCliOptions> {
  const argv = process.argv.slice(2);
  const idx = argv.findIndex((a) => a === '--config' || a === '-c');
  const explicit = idx >= 0 ? argv[idx + 1] : undefined;

  const cwd = process.cwd();
  let file = resolveConfigFile(cwd, explicit);

  if (!file) {
    file = await promptCreateConfig(cwd);
  }

  const loaded = jitiRequire(file);
  const config = loaded && loaded.default ? loaded.default : loaded;

  if (!config || !config.connections) {
    throw new Error(
      `fedaco: config "${file}" must export { connections: { ... } }`
    );
  }

  return config as FedacoCliOptions;
}

async function promptCreateConfig(cwd: string): Promise<string> {
  process.stdout.write(
    '\nNo fedaco config file found in the current directory.\n\n'
  );

  const choice = await promptChoice(
    'Which format would you like to use?',
    FORMAT_CHOICES,
  );

  const filename = FORMAT_CHOICES[choice];
  const fullPath = resolve(cwd, filename);
  writeFileSync(fullPath, CONFIG_TEMPLATES[filename]);
  process.stdout.write(`\nCreated ${filename}\n`);
  process.stdout.write(
    'Please edit it with your database connection details, then re-run the command.\n\n'
  );
  process.exit(0);
}

function promptChoice(question: string, choices: string[]): Promise<number> {
  return new Promise((res) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    process.stdout.write(`${question}\n`);
    for (let i = 0; i < choices.length; i++) {
      process.stdout.write(`  ${i + 1}) ${choices[i]}\n`);
    }
    rl.question('> ', (answer) => {
      rl.close();
      const idx = parseInt(answer.trim(), 10) - 1;
      if (idx >= 0 && idx < choices.length) {
        res(idx);
      } else {
        process.stderr.write('Invalid choice.\n');
        process.exit(1);
      }
    });
  });
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
