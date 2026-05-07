import { Command } from 'commander';

import { registerCommands } from './app/commands';
import { loadFedacoConfig } from './app/config/load-config';
import { MigratorService } from './app/migrator';

async function bootstrap() {
  const config = await loadFedacoConfig();

  const migrator = new MigratorService({
    connections: config.connections,
    defaultConnection: config.defaultConnection ?? 'default',
    migrationsPath: config.migrationsPath ?? './database/migrations',
    migrationsTable: config.migrationsTable ?? 'migrations',
  });

  const program = new Command();
  program
    .name('fedaco')
    .description('Fedaco database migration CLI')
    .option('-c, --config <path>', 'Path to fedaco config file');

  registerCommands(program, migrator);

  try {
    await program.parseAsync(process.argv);
  } finally {
    await migrator.shutdown();
  }
}

bootstrap().catch((err) => {
  process.stderr.write(
    err instanceof Error ? `${err.stack ?? err.message}\n` : `${String(err)}\n`
  );
  process.exit(1);
});
