import type { DynamicModule} from '@nestjs/common';
import { Module } from '@nestjs/common';

import { MigrateCommand } from './commands/migrate.command';
import { MigrateFreshCommand } from './commands/migrate-fresh.command';
import { MigrateInstallCommand } from './commands/migrate-install.command';
import { MigrateMakeCommand } from './commands/migrate-make.command';
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
        MigrateCommand,
        MigrateInstallCommand,
        MigrateMakeCommand,
        MigrateRollbackCommand,
        MigrateResetCommand,
        MigrateRefreshCommand,
        MigrateFreshCommand,
        MigrateStatusCommand,
      ],
    };
  }
}
