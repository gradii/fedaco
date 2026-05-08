import type { Command } from 'commander';

import { MigrationCreator } from '../migrations';
import type { MigratorService } from '../migrator';

interface RunOptions {
  path?: string;
  pretend?: boolean;
  step?: string;
  batch?: string;
  connection?: string;
}

interface MakeOptions {
  path?: string;
  table?: string;
  create?: string | boolean;
  connection?: string;
}

function toInt(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? undefined : n;
}

export function registerCommands(
  program: Command,
  migrator: MigratorService
): void {
  program
    .command('migrate')
    .description('Run the pending migrations')
    .option('--path <path>', 'Path to migration files')
    .option('--pretend', 'Show queries without running')
    .option('--step [step]', 'Step count or flag')
    .option('--connection <name>', 'The database connection to use')
    .action(async (options: RunOptions) => {
      await migrator.onInit();
      if (options.connection) migrator.setConnection(options.connection);
      await migrator.ensureRepositoryExists();
      const path = options.path ?? migrator.getOptions().migrationsPath;
      await migrator.getMigrator().run(path, {
        pretend: !!options.pretend,
        step: toInt(options.step) ?? false,
      });
    });

  program
    .command('migrate:install')
    .description('Create the migration repository table')
    .option('--connection <name>', 'The database connection to use')
    .action(async (options: RunOptions) => {
      await migrator.onInit();
      if (options.connection) migrator.setConnection(options.connection);
      const repo = migrator.getRepository();
      if (await repo.repositoryExists()) {
        process.stdout.write('Migration table already exists.\n');
        return;
      }
      await repo.createRepository();
      process.stdout.write('Migration table created successfully.\n');
    });

  program
    .command('migrate:make <name>')
    .description('Create a new migration file')
    .option('--path <path>', 'Where to write the migration file')
    .option('--table <table>', 'The table to migrate')
    .option('--create [table]', 'The table to be created')
    .action(async (name: string, options: MakeOptions) => {
      const opts = migrator.getOptions();
      const path = options.path ?? opts.migrationsPath;
      const table =
        typeof options.create === 'string' && options.create.length > 0
          ? options.create
          : options.table ?? null;
      const create = options.create !== undefined && options.create !== false;

      const creator = new MigrationCreator();
      const file = creator.create(name, path, table, create);
      process.stdout.write(`Created migration: ${file}\n`);
    });

  program
    .command('migrate:rollback')
    .description('Rollback the last database migration')
    .option('--path <path>', 'Path to migration files')
    .option('--pretend', 'Show queries without running')
    .option('--step <step>', 'Number of migrations to rollback')
    .option('--batch <batch>', 'Rollback a specific batch')
    .option('--connection <name>', 'The database connection to use')
    .action(async (options: RunOptions) => {
      await migrator.onInit();
      if (options.connection) migrator.setConnection(options.connection);
      await migrator.ensureRepositoryExists();
      const path = options.path ?? migrator.getOptions().migrationsPath;
      await migrator.getMigrator().rollback(path, {
        pretend: !!options.pretend,
        step: toInt(options.step) ?? 0,
        batch: toInt(options.batch) ?? 0,
      });
    });

  program
    .command('migrate:reset')
    .description('Rollback all database migrations')
    .option('--path <path>', 'Path to migration files')
    .option('--pretend', 'Show queries without running')
    .option('--connection <name>', 'The database connection to use')
    .action(async (options: RunOptions) => {
      await migrator.onInit();
      if (options.connection) migrator.setConnection(options.connection);
      await migrator.ensureRepositoryExists();
      const path = options.path ?? migrator.getOptions().migrationsPath;
      await migrator.getMigrator().reset(path, !!options.pretend);
    });

  program
    .command('migrate:refresh')
    .description('Reset and re-run all migrations')
    .option('--path <path>', 'Path to migration files')
    .option('--pretend', 'Show queries without running')
    .option('--step [step]', 'Step count or flag')
    .option('--connection <name>', 'The database connection to use')
    .action(async (options: RunOptions) => {
      await migrator.onInit();
      if (options.connection) migrator.setConnection(options.connection);
      await migrator.ensureRepositoryExists();
      const path = options.path ?? migrator.getOptions().migrationsPath;
      await migrator.getMigrator().reset(path, !!options.pretend);
      await migrator.getMigrator().run(path, {
        pretend: !!options.pretend,
        step: toInt(options.step) ?? false,
      });
    });

  program
    .command('migrate:fresh')
    .description('Drop all tables and re-run all migrations')
    .option('--path <path>', 'Path to migration files')
    .option('--pretend', 'Show queries without running')
    .option('--step [step]', 'Step count or flag')
    .option('--connection <name>', 'The database connection to use')
    .action(async (options: RunOptions) => {
      await migrator.onInit();
      if (options.connection) migrator.setConnection(options.connection);
      const connection = migrator.getConnection();
      const schema = connection.getSchemaBuilder();

      if (typeof schema.dropAllTables === 'function') {
        await schema.dropAllTables();
        process.stdout.write('Dropped all tables.\n');
      } else {
        await migrator.deleteRepository();
        process.stdout.write(
          'Schema builder does not support dropAllTables; only migration table dropped.\n'
        );
      }

      await migrator.ensureRepositoryExists();
      const path = options.path ?? migrator.getOptions().migrationsPath;
      await migrator.getMigrator().run(path, {
        pretend: !!options.pretend,
        step: toInt(options.step) ?? false,
      });
    });

  program
    .command('migrate:status')
    .description('Show the status of each migration')
    .option('--path <path>', 'Path to migration files')
    .option('--connection <name>', 'The database connection to use')
    .action(async (options: RunOptions) => {
      await migrator.onInit();
      if (options.connection) migrator.setConnection(options.connection);
      const repo = migrator.getRepository();
      if (!(await repo.repositoryExists())) {
        process.stdout.write(
          'Migration table does not exist. Run "fedaco migrate:install" first.\n'
        );
        return;
      }

      const m = migrator.getMigrator();
      const path = options.path ?? migrator.getOptions().migrationsPath;
      const files: string[] = m.getMigrationFiles(path);
      const ran = new Set<string>(await repo.getRan());

      process.stdout.write('Status   | Migration\n');
      process.stdout.write('---------|----------\n');
      for (const f of files) {
        const name = m.getMigrationName(f);
        const status = ran.has(name) ? 'Ran      ' : 'Pending  ';
        process.stdout.write(`${status}| ${name}\n`);
      }
      for (const name of ran) {
        if (!files.some((f: string) => m.getMigrationName(f) === name)) {
          process.stdout.write(`Missing  | ${name} (no file)\n`);
        }
      }
    });
}
