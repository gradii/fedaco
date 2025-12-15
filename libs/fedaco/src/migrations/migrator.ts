// import type { Dispatcher } from 'Illuminate/Contracts/Events/Dispatcher';
// import type { MigrationRepositoryInterface } from 'Illuminate/Database/Migrations/MigrationRepositoryInterface';
// import type { Filesystem } from 'Illuminate/Filesystem/Filesystem';
// import type { ConnectionResolverInterface } from 'Illuminate/Database/ConnectionResolverInterface';
// import type { OutputInterface } from 'Symfony/Component/Console/Output/OutputInterface';
// import type { Connection } from 'Illuminate/Database/Connection';
// import type { MigrationEvent } from 'Illuminate/Contracts/Database/Events/MigrationEvent';
// import { BulletList } from 'Illuminate/Console/View/Components/BulletList';
// import { Info } from 'Illuminate/Console/View/Components/Info';
// import { Task } from 'Illuminate/Console/View/Components/Task';
// import { TwoColumnDetail } from 'Illuminate/Console/View/Components/TwoColumnDetail';
// import { MigrationEnded } from 'Illuminate/Database/Events/MigrationEnded';
// import { MigrationsEnded } from 'Illuminate/Database/Events/MigrationsEnded';
// import { MigrationsStarted } from 'Illuminate/Database/Events/MigrationsStarted';
// import { MigrationStarted } from 'Illuminate/Database/Events/MigrationStarted';
// import { NoPendingMigrations } from 'Illuminate/Database/Events/NoPendingMigrations';
// import { Arr } from 'Illuminate/Support/Arr';
// import { Collection } from 'Illuminate/Support/Collection';
// import { Str } from 'Illuminate/Support/Str';
// import { ReflectionClass } from 'ReflectionClass';

import { basename } from 'node:path';
import { type ConnectionResolverInterface } from '../interface/connection-resolver-interface';
import { type MigrationRepositoryInterface } from './migration-repository-interface';
import { isBlank, tap, uniq } from '@gradii/nanofn';
import { wrap } from '../helper/arr';

export class Migrator {
  /* The migration repository implementation. */
  repository: MigrationRepositoryInterface;
  /* The filesystem instance. */
  // files: Filesystem;
  /* The connection resolver instance. */
  resolver: ConnectionResolverInterface;
  /* The name of the default connection. */
  _connection: string;
  /* The paths to all of the migration files. */
  _paths: any[] = [];
  /* The paths that have already been required. */
  requiredPathCache: array<string> = [];
  /* The output interface implementation. */
  output: OutputInterface;

  /* Create a new migrator instance. */
  public constructor(
    repository: MigrationRepositoryInterface,
    resolver: ConnectionResolverInterface /* files: Filesystem, */,
    /* dispatcher: Dispatcher | null = null */
  ) {
    // this.files      = files;
    // this.events     = dispatcher;
    this.resolver = resolver;
    this.repository = repository;
  }

  /* Run the pending migrations at a given path. */
  public async run(paths: any[] | string = [], options: any[] = []) {
    const files = this.getMigrationFiles(paths);
    this.requireFiles((migrations = this.pendingMigrations(files, await this.repository.getRan())));
    this.runPending(migrations, options);
    return migrations;
  }

  /* Get the migration files that have not yet run. */
  protected pendingMigrations(files: any[], ran: any[]) {
    return Collection.make(files)
      .reject((file) => {
        return in_array(this.getMigrationName(file), ran);
      })
      .values()
      .all();
  }

  /* Run an array of migrations. */
  public runPending(migrations: any[], options: any = {}) {
    if (migrations.length === 0) {
      // this.fireMigrationEvent(new NoPendingMigrations('up'));
      this.write(Info, 'Nothing to migrate');
      return;
    }
    let batch = this.repository.getNextBatchNumber();
    const pretend = options['pretend'] ?? false;
    const step = options['step'] ?? false;
    // this.fireMigrationEvent(new MigrationsStarted('up'));
    this.write(Info, 'Running migrations.');
    for (const file of migrations) {
      this.runUp(file, batch, pretend);
      if (step) {
        batch++;
      }
    }
    // this.fireMigrationEvent(new MigrationsEnded('up'))(this.output?.writeln)('');
  }

  /* Run "up" a migration instance. */
  protected runUp(file: string, batch: number, pretend: boolean) {
    const migration = this.resolvePath(file);
    const name = this.getMigrationName(file);
    if (pretend) {
      return this.pretendToRun(migration, 'up');
    }
    this.write(Task, name, () => this.runMigration(migration, 'up'));
    this.repository.log(name, batch);
  }

  /* Rollback the last migration operation. */
  public rollback(paths: any[] | string = [], options: any[] = []) {
    const migrations = this.getMigrationsForRollback(options);
    if (migrations.length === 0) {
      // this.fireMigrationEvent(new NoPendingMigrations('down'));
      this.write('info', 'Nothing to rollback.');
      return [];
    }
    return tap(this.rollbackMigrations(migrations, paths, options), () => {
      (this.output?.writeln)('');
    });
  }

  /* Get the migrations for a rollback operation. */
  protected getMigrationsForRollback(options: any[]) {
    if ((steps = options['step'] ?? 0) > 0) {
      return this.repository.getMigrations(steps);
    }
    if ((batch = options['batch'] ?? 0) > 0) {
      return this.repository.getMigrationsByBatch(batch);
    }
    return this.repository.getLast();
  }

  /* Rollback the given migrations. */
  protected rollbackMigrations(migrations: any[], paths: any[] | string, options: any) {
    const rolledBack = [];
    // this.requireFiles((files = this.getMigrationFiles(paths)));
    // this.fireMigrationEvent(new MigrationsStarted('down'));
    this.write('info', 'Rolling back migrations.');
    for (const migration of migrations) {
      const migration = /* cast type object */ migration;
      if (!(file = Arr.get(files, migration.migration))) {
        this.write(TwoColumnDetail, migration.migration, '<fg=yellow;options=bold>Migration not found</>');
        continue;
      }
      rolledBack.push(file);
      this.runDown(file, migration, options['pretend'] ?? false);
    }
    this.fireMigrationEvent(new MigrationsEnded('down'));
    return rolledBack;
  }

  /* Rolls all of the currently applied migrations back. */
  public async reset(paths: any[] | string = [], pretend = false) {
    const migrations = (await this.repository.getRan()).reverse();
    if (migrations.length === 0) {
      this.write('info', 'Nothing to rollback.');
      return [];
    }
    return tap(this.resetMigrations(migrations, wrap(paths), pretend), () => {
      (this.output?.writeln)('');
    });
  }

  /* Reset the given migrations. */
  protected resetMigrations(migrations: any[], paths: any[], pretend = false) {
    var migrations = collect(migrations)
      .map((m) => {
        return /* cast type object */ {
          migration: m,
        };
      })
      .all();
    return this.rollbackMigrations(migrations, paths, compact('pretend'));
  }

  /* Run "down" a migration instance. */
  protected runDown(file: string, migration: object, pretend: boolean) {
    const instance = this.resolvePath(file);
    const name = this.getMigrationName(file);
    if (pretend) {
      return this.pretendToRun(instance, 'down');
    }
    this.write(Task, name, () => this.runMigration(instance, 'down'));
    this.repository.delete(migration);
  }

  /* Run a migration inside a transaction if the database supports it. */
  protected runMigration(migration: object, method: string) {
    const connection = this.resolveConnection(migration.getConnection());
    const callback = () => {
      if (method_exists(migration, method)) {
        // this.fireMigrationEvent(new MigrationStarted(migration, method));
        this.runMethod(connection, migration, method);
        // this.fireMigrationEvent(new MigrationEnded(migration, method));
      }
    };
    this.getSchemaGrammar(connection).supportsSchemaTransactions() && migration.withinTransaction
      ? connection.transaction(callback)
      : callback();
  }

  /* Pretend to run the migrations. */
  protected pretendToRun(migration: object, method: string) {
    var name = get_class(migration);
    const reflectionClass = new ReflectionClass(migration);
    if (reflectionClass.isAnonymous()) {
      var name = this.getMigrationName(reflectionClass.getFileName());
    }
    this.write(TwoColumnDetail, name);
    this.write(
      BulletList,
      collect(this.getQueries(migration, method)).map((query) => {
        return query['query'];
      }),
    );
  }

  /* Get all of the queries that would be run for a migration. */
  protected getQueries(migration: object, method: string) {
    const db = this.resolveConnection(migration.getConnection());
    return db.pretend(() => {
      if (method_exists(migration, method)) {
        this.runMethod(db, migration, method);
      }
    });
  }

  /* Run a migration method on the given connection. */
  protected runMethod(connection: Connection, migration: object, method: string) {
    const previousConnection = this.resolver.getDefaultConnection();
    try {
      this.resolver.setDefaultConnection(connection.getName());
      migration[method]();
    } finally {
      this.resolver.setDefaultConnection(previousConnection);
    }
  }

  /* Resolve a migration instance from a file. */
  public resolve(file: string) {
    const clazz = this.getMigrationClass(file);
    return new clazz();
  }

  /* Resolve a migration instance from a migration path. */
  protected resolvePath(path: string) {
    const clazz = this.getMigrationClass(this.getMigrationName(path));
    if (class_exists(clazz) && realpath(path) == new ReflectionClass(clazz).getFileName()) {
      return new clazz();
    }
    const migration = (Migrator.requiredPathCache[path] ??= this.files.getRequire(path));
    if (is_object(migration)) {
      return method_exists(migration, '__construct') ? this.files.getRequire(path) : migration.clone();
    }
    return new clazz();
  }

  /* Generate a migration class name based on the migration file name. */
  protected getMigrationClass(migrationName: string) {
    return Str.studly(array_slice(explode('_', migrationName), 4).join('_'));
  }

  /* Get all of the migration files in a given path. */
  public getMigrationFiles(paths: string | any[]) {
    return Collection.make(paths)
      .flatMap((path) => {
        return str_ends_with(path, '.php') ? [path] : this.files.glob(path + '/*_*.php');
      })
      .filter()
      .values()
      .keyBy((file) => {
        return this.getMigrationName(file);
      })
      .sortBy((file, key) => {
        return key;
      })
      .all();
  }

  /* Get the name of the migration. */
  public getMigrationName(path: string) {
    return basename(path).replace(/(\.mjs|\.js)$/g, '');
  }

  /* Register a custom migration path. */
  public path(path: string) {
    this._paths = uniq([...this._paths, ...[path]]);
  }

  /* Get all of the custom migration paths. */
  public paths() {
    return this._paths;
  }

  /* Get the default connection name. */
  public getConnection() {
    return this._connection;
  }

  /* Execute the given callback using the given connection as the default connection. */
  public usingConnection(name: string, callback: callable) {
    const previousConnection = this.resolver.getDefaultConnection();
    this.setConnection(name);
    return tap(callback(), () => {
      this.setConnection(previousConnection);
    });
  }

  /* Set the default connection name. */
  public setConnection(name: string) {
    if (!isBlank(name)) {
      this.resolver.setDefaultConnection(name);
    }
    this.repository.setSource(name);
    this._connection = name;
  }

  /* Resolve the database connection instance. */
  public resolveConnection(connection: string) {
    return this.resolver.connection(connection || this._connection);
  }

  /* Get the schema grammar out of a migration connection. */
  protected getSchemaGrammar(connection: Connection) {
    if (isBlank((grammar = connection.getSchemaGrammar()))) {
      connection.useDefaultSchemaGrammar();
      var grammar = connection.getSchemaGrammar();
    }
    return grammar;
  }

  /* Get the migration repository instance. */
  public getRepository() {
    return this.repository;
  }

  /* Determine if the migration repository exists. */
  public repositoryExists() {
    return this.repository.repositoryExists();
  }

  /* Determine if any migrations have been run. */
  public async hasRunAnyMigrations() {
    return this.repositoryExists() && (await this.repository.getRan()).length > 0;
  }

  /* Delete the migration repository data store. */
  public async deleteRepository() {
    await this.repository.deleteRepository();
  }

  /* Write to the console's output. */
  protected write(component: string, ...arguments) {
    console[component](...arguments);
  }
}
