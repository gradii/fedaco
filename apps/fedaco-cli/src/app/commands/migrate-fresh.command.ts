import { Command, CommandRunner, Option } from 'nest-commander';

import type { MigratorService } from '../migrator.service';

interface FreshOptions {
  path?: string;
  pretend?: boolean;
  step?: number;
}

@Command({
  name: 'migrate:fresh',
  description: 'Drop all tables and re-run all migrations',
})
export class MigrateFreshCommand extends CommandRunner {
  constructor(private readonly migrator: MigratorService) {
    super();
  }

  async run(_inputs: string[], options: FreshOptions = {}): Promise<void> {
    await this.migrator.onInit();
    const connection = this.migrator.getConnection();
    const schema = connection.getSchemaBuilder();

    if (typeof schema.dropAllTables === 'function') {
      await schema.dropAllTables();
      process.stdout.write('Dropped all tables.\n');
    } else {
      await this.migrator.deleteRepository();
      process.stdout.write(
        'Schema builder does not support dropAllTables; only migration table dropped.\n'
      );
    }

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
