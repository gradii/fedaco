import { Injectable } from '@nestjs/common';

import type { FedacoCommand, ParsedArgs } from '../command-runner.service';
import { MigratorService } from '../migrator.service';

@Injectable()
export class MigrateResetCommand implements FedacoCommand {
  constructor(private readonly migrator: MigratorService) {}

  async run(args: ParsedArgs): Promise<number> {
    await this.migrator.ensureRepositoryExists();
    const repo = this.migrator.getRepository();
    const ran = (await repo.getRan()).slice().reverse();

    if (ran.length === 0) {
      process.stdout.write('Nothing to rollback.\n');
      return 0;
    }

    const path = this.migrator.resolveMigrationsPath(args.flags.path as string);
    const filesByName = new Map<string, string>();
    for (const f of this.migrator.listMigrationFiles(path)) {
      filesByName.set(this.migrator.getMigrationName(f), f);
    }

    const pretend = !!args.flags.pretend;
    for (const name of ran) {
      const file = filesByName.get(name);
      if (!file) {
        process.stdout.write(
          `Migration not found on disk: ${name} (skipping)\n`
        );
        continue;
      }
      await this.migrator.runDown(file, { migration: name }, pretend);
    }
    return 0;
  }
}
