import { existsSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, isAbsolute, resolve } from 'node:path';

import { isBlank, uniq } from '@gradii/nanofn';

import type { Connection, ConnectionResolverInterface } from '@gradii/fedaco';

import { jitiRequire } from '../jiti-loader';
import { Migration } from './migration';
import type { MigrationRepositoryInterface } from './migration-repository-interface';

export type MigrationOptions = {
  pretend?: boolean;
  step?: boolean | number;
  batch?: number;
};

export type MigrationLogger = (message: string) => void;

export type MigrationLoader = (file: string) => any;

const MIGRATION_FILE_EXTENSIONS = ['.js', '.cjs', '.mjs', '.ts', '.mts', '.cts'];

const defaultLoader: MigrationLoader = (file) => jitiRequire(file);

export class Migrator {
  protected static requiredPathCache = new Map<string, any>();

  repository: MigrationRepositoryInterface;
  resolver: ConnectionResolverInterface;
  _connection = '';
  _paths: string[] = [];

  protected logger: MigrationLogger = (msg) => process.stdout.write(msg + '\n');
  protected loader: MigrationLoader = defaultLoader;

  public constructor(
    repository: MigrationRepositoryInterface,
    resolver: ConnectionResolverInterface
  ) {
    this.resolver = resolver;
    this.repository = repository;
  }

  public setLogger(logger: MigrationLogger | null): this {
    this.logger = logger ?? (() => undefined);
    return this;
  }

  public setLoader(loader: MigrationLoader): this {
    this.loader = loader ?? defaultLoader;
    Migrator.requiredPathCache.clear();
    return this;
  }

  public async run(
    paths: string | string[] = [],
    options: MigrationOptions = {}
  ): Promise<string[]> {
    const files = this.getMigrationFiles(paths);
    const ran = await this.repository.getRan();
    const pending = this.pendingMigrations(files, ran);
    await this.runPending(pending, options);
    return pending;
  }

  protected pendingMigrations(files: string[], ran: string[]): string[] {
    const ranSet = new Set(ran);
    return files.filter((file) => !ranSet.has(this.getMigrationName(file)));
  }

  public async runPending(
    migrations: string[],
    options: MigrationOptions = {}
  ): Promise<void> {
    if (migrations.length === 0) {
      this.write('Nothing to migrate.');
      return;
    }
    let batch = await this.repository.getNextBatchNumber();
    const pretend = options.pretend ?? false;
    const step = options.step ?? false;

    this.write('Running migrations.');
    for (const file of migrations) {
      await this.runUp(file, batch, pretend);
      if (step) batch++;
    }
  }

  protected async runUp(
    file: string,
    batch: number,
    pretend: boolean
  ): Promise<void> {
    const migration = this.resolvePath(file);
    const name = this.getMigrationName(file);
    if (pretend) {
      await this.pretendToRun(migration, 'up');
      return;
    }
    this.write(`Migrating: ${name}`);
    await this.runMigration(migration, 'up');
    await this.repository.log(name, batch);
    this.write(`Migrated:  ${name}`);
  }

  public async rollback(
    paths: string | string[] = [],
    options: MigrationOptions = {}
  ): Promise<string[]> {
    const records = await this.getMigrationsForRollback(options);
    if (records.length === 0) {
      this.write('Nothing to rollback.');
      return [];
    }
    return this.rollbackMigrations(records, paths, options);
  }

  protected async getMigrationsForRollback(
    options: MigrationOptions
  ): Promise<any[]> {
    const stepOpt = options.step;
    const steps = typeof stepOpt === 'number' ? stepOpt : 0;
    if (steps > 0) return this.repository.getMigrations(steps);
    if ((options.batch ?? 0) > 0)
      return this.repository.getMigrationsByBatch(options.batch as number);
    return this.repository.getLast();
  }

  protected async rollbackMigrations(
    records: any[],
    paths: string | string[],
    options: MigrationOptions
  ): Promise<string[]> {
    const rolledBack: string[] = [];
    const filesByName = new Map<string, string>();
    for (const f of this.getMigrationFiles(paths)) {
      filesByName.set(this.getMigrationName(f), f);
    }

    this.write('Rolling back migrations.');
    for (const record of records) {
      const file = filesByName.get(record.migration);
      if (!file) {
        this.write(`Migration not found: ${record.migration}`);
        continue;
      }
      rolledBack.push(file);
      await this.runDown(file, record, options.pretend ?? false);
    }
    return rolledBack;
  }

  public async reset(
    paths: string | string[] = [],
    pretend = false
  ): Promise<string[]> {
    const ran = (await this.repository.getRan()).slice().reverse();
    if (ran.length === 0) {
      this.write('Nothing to rollback.');
      return [];
    }
    return this.resetMigrations(ran, this.wrapPaths(paths), pretend);
  }

  protected async resetMigrations(
    names: string[],
    paths: string[],
    pretend = false
  ): Promise<string[]> {
    const records = names.map((name) => ({ migration: name }));
    return this.rollbackMigrations(records, paths, { pretend });
  }

  protected async runDown(
    file: string,
    record: any,
    pretend: boolean
  ): Promise<void> {
    const instance = this.resolvePath(file);
    const name = this.getMigrationName(file);
    if (pretend) {
      await this.pretendToRun(instance, 'down');
      return;
    }
    this.write(`Rolling back: ${name}`);
    await this.runMigration(instance, 'down');
    await this.repository.delete(record);
    this.write(`Rolled back:  ${name}`);
  }

  protected async runMigration(
    migration: Migration | any,
    method: 'up' | 'down'
  ): Promise<void> {
    const connection = this.resolveConnection(migration.getConnection?.() ?? '');
    const callback = async () => {
      const fn = (migration as any)[method];
      if (typeof fn !== 'function') return;
      await this.runMethod(connection, migration, method);
    };

    const grammar = this.getSchemaGrammar(connection);
    const supportsTx =
      typeof grammar?.supportsSchemaTransactions === 'function' &&
      grammar.supportsSchemaTransactions();
    const withinTx = (migration as any)._withinTransaction !== false;

    if (supportsTx && withinTx && typeof connection.transaction === 'function') {
      await connection.transaction(callback);
    } else {
      await callback();
    }
  }

  protected async pretendToRun(
    migration: Migration | any,
    method: 'up' | 'down'
  ): Promise<void> {
    const name = (migration as any)?.constructor?.name ?? '(anonymous)';
    this.write(`[pretend] ${name}`);
    const queries = await this.getQueries(migration, method);
    for (const q of queries) this.write(`  ${q.query ?? q}`);
  }

  protected async getQueries(
    migration: Migration | any,
    method: 'up' | 'down'
  ): Promise<any[]> {
    const connection = this.resolveConnection(migration.getConnection?.() ?? '');
    if (typeof connection.pretend !== 'function') return [];
    return connection.pretend(async () => {
      const fn = (migration as any)[method];
      if (typeof fn !== 'function') return;
      await this.runMethod(connection, migration, method);
    });
  }

  protected async runMethod(
    connection: Connection,
    migration: Migration | any,
    method: 'up' | 'down'
  ): Promise<void> {
    const previous = this.resolver.getDefaultConnection();
    try {
      this.resolver.setDefaultConnection(connection.getName());
      await (migration as any)[method]();
    } finally {
      this.resolver.setDefaultConnection(previous);
    }
  }

  public resolve(file: string): Migration {
    return this.resolvePath(file);
  }

  protected resolvePath(path: string): Migration {
    let mod = Migrator.requiredPathCache.get(path);
    if (mod === undefined) {
      mod = this.loader(path);
      Migrator.requiredPathCache.set(path, mod);
    }
    const ctor = (mod && mod.default) || mod;
    if (typeof ctor === 'function') return new ctor();
    const instance = Object.create(Migration.prototype) as Migration;
    return Object.assign(instance, mod);
  }

  public getMigrationFiles(paths: string | string[]): string[] {
    const list = this.wrapPaths(paths);
    const collected: string[] = [];
    for (const p of list) collected.push(...this.collectFromOne(p));
    const seen = new Set<string>();
    const deduped = collected.filter((f) =>
      seen.has(f) ? false : (seen.add(f), true)
    );
    return deduped.sort((a, b) =>
      this.getMigrationName(a).localeCompare(this.getMigrationName(b))
    );
  }

  protected collectFromOne(path: string): string[] {
    if (!path) return [];
    const abs = isAbsolute(path) ? path : resolve(process.cwd(), path);
    if (!existsSync(abs)) return [];
    const stat = statSync(abs);
    if (stat.isFile()) {
      return MIGRATION_FILE_EXTENSIONS.includes(extname(abs)) ? [abs] : [];
    }
    if (!stat.isDirectory()) return [];
    return readdirSync(abs)
      .filter(
        (f) =>
          MIGRATION_FILE_EXTENSIONS.includes(extname(f)) && !f.endsWith('.d.ts')
      )
      .map((f) => resolve(abs, f));
  }

  public getMigrationName(path: string): string {
    return basename(path, extname(path));
  }

  public path(path: string): void {
    this._paths = uniq([...this._paths, path]);
  }

  public paths(): string[] {
    return this._paths;
  }

  public getConnection(): string {
    return this._connection;
  }

  public async usingConnection<T>(
    name: string,
    callback: () => Promise<T> | T
  ): Promise<T> {
    const previous = this.resolver.getDefaultConnection();
    this.setConnection(name);
    try {
      return await callback();
    } finally {
      this.setConnection(previous);
    }
  }

  public setConnection(name: string): void {
    if (!isBlank(name)) this.resolver.setDefaultConnection(name);
    this.repository.setSource(name);
    this._connection = name;
  }

  public resolveConnection(connection?: string | null): Connection {
    return this.resolver.connection(
      connection || this._connection || undefined
    ) as Connection;
  }

  protected getSchemaGrammar(connection: Connection): any {
    let grammar = connection.getSchemaGrammar();
    if (
      isBlank(grammar) &&
      typeof (connection as any).useDefaultSchemaGrammar === 'function'
    ) {
      (connection as any).useDefaultSchemaGrammar();
      grammar = connection.getSchemaGrammar();
    }
    return grammar;
  }

  public getRepository(): MigrationRepositoryInterface {
    return this.repository;
  }

  public async repositoryExists(): Promise<boolean> {
    return this.repository.repositoryExists();
  }

  public async hasRunAnyMigrations(): Promise<boolean> {
    if (!(await this.repositoryExists())) return false;
    return (await this.repository.getRan()).length > 0;
  }

  public async deleteRepository(): Promise<void> {
    await this.repository.deleteRepository();
  }

  protected wrapPaths(paths: string | string[]): string[] {
    if (Array.isArray(paths)) return paths.length > 0 ? paths : [...this._paths];
    if (paths === undefined || paths === null || paths === '')
      return [...this._paths];
    return [paths];
  }

  protected write(message: string): void {
    this.logger(message);
  }
}
