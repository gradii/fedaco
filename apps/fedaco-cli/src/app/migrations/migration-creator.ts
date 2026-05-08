import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';

import { isBlank } from '@gradii/nanofn';

export type PostCreateHook = (table: string | null, path: string) => void;

const BUILTIN_STUBS: Record<string, string> = {
  'migration.stub': `\
/**
 * Migration: {{ name }}
 */
export const up = async (schema) => {
  // schema.create('table_name', (table) => {
  //   table.increments('id');
  //   table.timestamps();
  // });
};

export const down = async (schema) => {
  // schema.drop('table_name');
};
`,
  'migration.create.stub': `\
/**
 * Migration: {{ name }} — create {{ table }}
 */
export const up = async (schema) => {
  await schema.create('{{ table }}', (table) => {
    table.increments('id');
    table.timestamps();
  });
};

export const down = async (schema) => {
  await schema.drop('{{ table }}');
};
`,
  'migration.update.stub': `\
/**
 * Migration: {{ name }} — update {{ table }}
 */
export const up = async (schema) => {
  await schema.table('{{ table }}', (table) => {
    // table.string('column_name');
  });
};

export const down = async (schema) => {
  await schema.table('{{ table }}', (table) => {
    // table.dropColumn('column_name');
  });
};
`,
};

export class MigrationCreator {
  /* The custom app stubs directory. */
  customStubPath: string | null;
  /* The registered post create hooks. */
  postCreate: PostCreateHook[] = [];

  /* Create a new migration creator instance. */
  public constructor(customStubPath: string | null = null) {
    this.customStubPath = customStubPath;
  }

  /* Create a new migration at the given path. */
  public create(
    name: string,
    path: string,
    table: string | null = null,
    create = false
  ): string {
    this.ensureMigrationDoesntAlreadyExist(name, path);

    const stub = this.getStub(table, create);
    const fullPath = this.getPath(name, path);
    const directory = dirname(fullPath);
    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
    }
    writeFileSync(fullPath, this.populateStub(stub, name, table));
    this.firePostCreateHooks(table, fullPath);
    return fullPath;
  }

  /* Ensure that a migration with the given name doesn't already exist. */
  protected ensureMigrationDoesntAlreadyExist(
    name: string,
    migrationPath: string | null = null
  ): void {
    if (isBlank(migrationPath)) return;
    const dir = isAbsolute(migrationPath as string)
      ? (migrationPath as string)
      : resolve(process.cwd(), migrationPath as string);
    if (!existsSync(dir)) return;
    const files = readdirSync(dir);
    for (const file of files) {
      if (
        (file.endsWith('.mjs') || file.endsWith('.js') || file.endsWith('.ts')) &&
        file.includes(`_${name}.`)
      ) {
        throw new Error(`A migration named "${name}" already exists.`);
      }
    }
  }

  /* Get the migration stub file. */
  protected getStub(table: string | null, create: boolean): string {
    let stubName: string;
    if (isBlank(table)) {
      stubName = 'migration.stub';
    } else if (create) {
      stubName = 'migration.create.stub';
    } else {
      stubName = 'migration.update.stub';
    }
    if (this.customStubPath) {
      const customPath = resolve(this.customStubPath, stubName);
      if (existsSync(customPath)) {
        return readFileSync(customPath, 'utf-8');
      }
    }
    const builtin = BUILTIN_STUBS[stubName];
    if (!builtin) {
      throw new Error(`Unknown migration stub: ${stubName}`);
    }
    return builtin;
  }

  /* Populate the place-holders in the migration stub. */
  protected populateStub(stub: string, name: string, table: string | null): string {
    let out = stub.replace(/\{\{\s*name\s*\}\}/g, name);
    if (!isBlank(table)) {
      out = out
        .replace(/DummyTable/g, table as string)
        .replace(/\{\{\s*table\s*\}\}/g, table as string);
    }
    return out;
  }

  /* Get the full path to the migration. */
  protected getPath(name: string, path: string): string {
    const dir = isAbsolute(path) ? path : resolve(process.cwd(), path);
    return resolve(dir, `${this.getDatePrefix()}_${name}.mjs`);
  }

  /* Fire the registered post create hooks. */
  protected firePostCreateHooks(table: string | null, path: string): void {
    for (const callback of this.postCreate) {
      callback(table, path);
    }
  }

  /* Register a post migration create hook. */
  public afterCreate(callback: PostCreateHook): void {
    this.postCreate.push(callback);
  }

  /* Get the date prefix for the migration. */
  protected getDatePrefix(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      `${d.getFullYear()}_${pad(d.getMonth() + 1)}_${pad(d.getDate())}_` +
      `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
    );
  }

  /* Get the path to the stubs. */
  public stubPath(): string | null {
    return this.customStubPath;
  }
}
