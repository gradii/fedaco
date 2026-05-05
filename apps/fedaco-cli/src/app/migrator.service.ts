import { existsSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, extname, isAbsolute, resolve } from 'node:path';

import { Inject, Injectable } from '@nestjs/common';

import { MIGRATOR_OPTIONS } from './fedaco-cli.constants';

const dynamicRequire = createRequire(process.cwd() + '/');

export interface MigratorOptions {
  connections: Record<string, any>;
  defaultConnection: string;
  migrationsPath: string;
  migrationsTable: string;
}

export interface MigrationModule {
  up: () => Promise<void> | void;
  down: () => Promise<void> | void;
  default?: any;
}

@Injectable()
export class MigratorService {
  private fedaco: any;
  private databaseConfig: any;
  private resolver: any;
  private repository: any;
  private MigrationCtor: any;

  constructor(
    @Inject(MIGRATOR_OPTIONS) private readonly options: MigratorOptions
  ) {}

  async onInit(): Promise<void> {
    this.fedaco = loadUserFedaco();
    const { DatabaseConfig, DatabaseMigrationRepository, Migration } = this.fedaco;

    this.databaseConfig = new DatabaseConfig();
    for (const [name, cfg] of Object.entries(this.options.connections)) {
      this.databaseConfig.addConnection(cfg, name);
    }
    this.databaseConfig.bootFedaco();
    this.databaseConfig.setAsGlobal();

    this.resolver = this.databaseConfig.getDatabaseManager();
    this.MigrationCtor = Migration;
    this.repository = new DatabaseMigrationRepository(
      this.resolver,
      this.options.migrationsTable
    );
    this.repository.setSource(this.options.defaultConnection);
  }

  async shutdown(): Promise<void> {
    if (!this.databaseConfig) return;
    const connections = this.resolver.getConnections?.() ?? {};
    for (const key of Object.keys(connections)) {
      const c = connections[key];
      if (c && typeof c.disconnect === 'function') {
        try {
          await c.disconnect();
        } catch {
          // best effort
        }
      }
    }
  }

  getRepository(): any {
    return this.repository;
  }

  async ensureRepositoryExists(): Promise<void> {
    if (!(await this.repository.repositoryExists())) {
      await this.repository.createRepository();
    }
  }

  async deleteRepository(): Promise<void> {
    if (await this.repository.repositoryExists()) {
      await this.repository.deleteRepository();
    }
  }

  getConnection() {
    return this.resolver.connection(this.options.defaultConnection);
  }

  resolveMigrationsPath(override?: string): string {
    const p = override ?? this.options.migrationsPath;
    return isAbsolute(p) ? p : resolve(process.cwd(), p);
  }

  listMigrationFiles(path: string): string[] {
    if (!existsSync(path) || !statSync(path).isDirectory()) {
      return [];
    }
    return readdirSync(path)
      .filter((f) => /\.(js|cjs|mjs|ts)$/.test(f))
      .filter((f) => !f.endsWith('.d.ts'))
      .map((f) => resolve(path, f))
      .sort();
  }

  getMigrationName(file: string): string {
    return basename(file, extname(file));
  }

  loadMigration(file: string): any {
    const mod: MigrationModule = dynamicRequire(file);
    const ctor = (mod as any).default ?? mod;
    if (typeof ctor === 'function') {
      return new (ctor as any)();
    }
    const instance = Object.create(this.MigrationCtor.prototype);
    return Object.assign(instance, mod);
  }

  async runUp(file: string, batch: number, pretend: boolean): Promise<void> {
    const name = this.getMigrationName(file);
    const migration = this.loadMigration(file);

    if (pretend) {
      process.stdout.write(`[pretend] ${name}: would run up()\n`);
      return;
    }

    process.stdout.write(`Migrating: ${name}\n`);
    await (migration as any).up?.();
    await this.repository.log(name, batch);
    process.stdout.write(`Migrated:  ${name}\n`);
  }

  async runDown(file: string, record: any, pretend: boolean): Promise<void> {
    const name = this.getMigrationName(file);
    const migration = this.loadMigration(file);

    if (pretend) {
      process.stdout.write(`[pretend] ${name}: would run down()\n`);
      return;
    }

    process.stdout.write(`Rolling back: ${name}\n`);
    await (migration as any).down?.();
    await this.repository.delete(record);
    process.stdout.write(`Rolled back:  ${name}\n`);
  }
}

function loadUserFedaco(): any {
  try {
    return dynamicRequire('@gradii/fedaco');
  } catch (err) {
    throw new Error(
      `fedaco: could not resolve "@gradii/fedaco" from ${process.cwd()}.\n` +
        `Install it in your project: pnpm add @gradii/fedaco`
    );
  }
}
