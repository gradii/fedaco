import { Command, CommandRunner, Option } from 'nest-commander';

import type { MigratorService } from '../migrator.service';
import { Inject } from '@nestjs/common';

interface RollbackOptions {
  path?: string;
  pretend?: boolean;
  step?: number;
  batch?: number;
}

@Command({
  name: 'migrate:rollback',
  description: 'Rollback the last database migration',
})
export class MigrateRollbackCommand extends CommandRunner {
  constructor(@Inject() private readonly migrator: MigratorService) {
    super();
  }

  async run(_inputs: string[], options: RollbackOptions = {}): Promise<void> {
    await this.migrator.onInit();
    await this.migrator.ensureRepositoryExists();
    const path = options.path ?? this.migrator.getOptions().migrationsPath;
    await this.migrator.getMigrator().rollback(path, {
      pretend: !!options.pretend,
      step: options.step ?? 0,
      batch: options.batch ?? 0,
    });
  }

  @Option({ flags: '--path <path>', description: 'Path to migration files' })
  parsePath(value: string): string {
    return value;
  }

  @Option({ flags: '--pretend', description: 'Show queries without running' })
  parsePretend(): boolean {
    return true;
  }

  @Option({ flags: '--step <step>', description: 'Number of migrations to rollback' })
  parseStep(value: string): number {
    return parseInt(value, 10);
  }

  @Option({ flags: '--batch <batch>', description: 'Rollback a specific batch' })
  parseBatch(value: string): number {
    return parseInt(value, 10);
  }
}
