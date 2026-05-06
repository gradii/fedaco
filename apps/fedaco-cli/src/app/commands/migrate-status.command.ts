import { Command, CommandRunner, Option } from 'nest-commander';

import { MigratorService } from '../migrator.service';

interface StatusOptions {
  path?: string;
}

@Command({
  name: 'migrate:status',
  description: 'Show the status of each migration',
})
export class MigrateStatusCommand extends CommandRunner {
  constructor(private readonly migrator: MigratorService) {
    super();
  }

  async run(_inputs: string[], options: StatusOptions = {}): Promise<void> {
    await this.migrator.onInit();
    const repo = this.migrator.getRepository();
    if (!(await repo.repositoryExists())) {
      process.stdout.write(
        'Migration table does not exist. Run "fedaco migrate:install" first.\n'
      );
      return;
    }

    const m = this.migrator.getMigrator();
    const path = options.path ?? this.migrator.getOptions().migrationsPath;
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
  }

  @Option({ flags: '--path <path>', description: 'Path to migration files' })
  parsePath(value: string): string {
    return value;
  }
}
