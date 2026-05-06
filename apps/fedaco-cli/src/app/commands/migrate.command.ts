import { Command, CommandRunner, Option } from 'nest-commander';

import type { MigratorService } from '../migrator.service';
import { Inject } from '@nestjs/common';

interface MigrateOptions {
  path?: string;
  pretend?: boolean;
  step?: number;
}

@Command({
  name: 'migrate',
  description: 'Run the pending migrations',
})
export class MigrateCommand extends CommandRunner {
  constructor(@Inject() private readonly migrator: MigratorService) {
    super();
  }

  async run(_inputs: string[], options: MigrateOptions = {}): Promise<void> {
    await this.migrator.onInit();
    await this.migrator.ensureRepositoryExists();
    const path = options.path ?? this.migrator.getOptions().migrationsPath;
    await this.migrator.getMigrator().run(path, {
      pretend: !!options.pretend,
      step: options.step ?? false,
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

  @Option({ flags: '--step [step]', description: 'Step count or flag' })
  parseStep(value: string): number {
    return parseInt(value, 10);
  }
}
