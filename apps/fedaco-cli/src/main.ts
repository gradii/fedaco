import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { CommandRunnerService } from './app/command-runner.service';
import { loadFedacoConfig } from './app/config/load-config';

async function bootstrap() {
  const argv = process.argv.slice(2);

  if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') {
    printUsage();
    process.exit(0);
  }

  const config = loadFedacoConfig();

  const app = await NestFactory.createApplicationContext(
    AppModule.forRoot(config),
    { logger: ['error', 'warn', 'log'] }
  );

  try {
    const runner = app.get(CommandRunnerService);
    const exitCode = await runner.run(argv);
    await app.close();
    process.exit(exitCode);
  } catch (err) {
    Logger.error(err instanceof Error ? err.stack ?? err.message : String(err));
    await app.close();
    process.exit(1);
  }
}

function printUsage() {
  process.stdout.write(`fedaco — database migration CLI

Usage:
  fedaco <command> [options]

Commands:
  migrate                   Run the pending migrations
  migrate:install           Create the migration repository table
  migrate:rollback          Rollback the last database migration
  migrate:reset             Rollback all database migrations
  migrate:refresh           Reset and re-run all migrations
  migrate:fresh             Drop all tables and re-run all migrations
  migrate:status            Show the status of each migration

Options:
  --path <dir>              Path to migration files (default ./database/migrations)
  --database <name>         Connection name (default 'default')
  --pretend                 Show queries without running
  --step <n>                Step count for rollback / batch separation
  --config <file>           Path to fedaco config file (default fedaco.config.js)
`);
}

bootstrap();
