import { Injectable } from '@nestjs/common';

import type { FedacoCommand, ParsedArgs } from '../command-runner.service';
import { MigratorService } from '../migrator.service';

@Injectable()
export class MigrateStatusCommand implements FedacoCommand {
  constructor(private readonly migrator: MigratorService) {}

  async run(args: ParsedArgs): Promise<number> {
    const repo = this.migrator.getRepository();
    if (!(await repo.repositoryExists())) {
      process.stdout.write(
        'Migration table does not exist. Run "fedaco migrate:install" first.\n'
      );
      return 0;
    }

    const path = this.migrator.resolveMigrationsPath(args.flags.path as string);
    const files = this.migrator.listMigrationFiles(path);
    const ran = new Set<string>(await repo.getRan());

    process.stdout.write('Status   | Migration\n');
    process.stdout.write('---------|----------\n');
    for (const f of files) {
      const name = this.migrator.getMigrationName(f);
      const status = ran.has(name) ? 'Ran      ' : 'Pending  ';
      process.stdout.write(`${status}| ${name}\n`);
    }

    for (const name of ran) {
      if (!files.some((f) => this.migrator.getMigrationName(f) === name)) {
        process.stdout.write(`Missing  | ${name} (no file)\n`);
      }
    }
    return 0;
  }
}
