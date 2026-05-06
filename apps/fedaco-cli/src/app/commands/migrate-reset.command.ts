import { Command, CommandRunner, Option } from 'nest-commander';

import { MigratorService } from '../migrator.service';

interface ResetOptions {
  path?: string;
  pretend?: boolean;
}

@Command({
  name: 'migrate:reset',
  description: 'Rollback all database migrations',
})
export class MigrateResetCommand extends CommandRunner {
  constructor(private readonly migrator: MigratorService) {
    super();
  }

  async run(_inputs: string[], options: ResetOptions = {}): Promise<void> {
    await this.migrator.onInit();
    await this.migrator.ensureRepositoryExists();
    const path = options.path ?? this.migrator.getOptions().migrationsPath;
    await this.migrator.getMigrator().reset(path, !!options.pretend);
  }

  @Option({ flags: '--path <path>', description: 'Path to migration files' })
  parsePath(value: string): string {
    return value;
  }

  @Option({ flags: '--pretend', description: 'Show queries without running' })
  parsePretend(): boolean {
    return true;
  }
}
