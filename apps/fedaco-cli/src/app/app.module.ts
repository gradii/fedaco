import { DynamicModule, Module } from '@nestjs/common';

import { CommandRunnerService } from './command-runner.service';
import { MigrateCommand } from './commands/migrate.command';
import { MigrateFreshCommand } from './commands/migrate-fresh.command';
import { MigrateInstallCommand } from './commands/migrate-install.command';
import { MigrateRefreshCommand } from './commands/migrate-refresh.command';
import { MigrateResetCommand } from './commands/migrate-reset.command';
import { MigrateRollbackCommand } from './commands/migrate-rollback.command';
import { MigrateStatusCommand } from './commands/migrate-status.command';
import { MIGRATOR_OPTIONS } from './fedaco-cli.constants';
import { MigratorService } from './migrator.service';

export interface FedacoCliOptions {
  connections: Record<string, any>;
  defaultConnection?: string;
  migrationsPath?: string;
  migrationsTable?: string;
}

@Module({})
export class AppModule {
  static forRoot(options: FedacoCliOptions): DynamicModule {
    return {
      module: AppModule,
      providers: [
        {
          provide: MIGRATOR_OPTIONS,
          useValue: {
            connections: options.connections,
            defaultConnection: options.defaultConnection ?? 'default',
            migrationsPath: options.migrationsPath ?? './database/migrations',
            migrationsTable: options.migrationsTable ?? 'migrations',
          },
        },
        MigratorService,
        CommandRunnerService,
        MigrateCommand,
        MigrateInstallCommand,
        MigrateRollbackCommand,
        MigrateResetCommand,
        MigrateRefreshCommand,
        MigrateFreshCommand,
        MigrateStatusCommand,
      ],
    };
  }
}
