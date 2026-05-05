import { Injectable } from '@nestjs/common';

import type { FedacoCommand, ParsedArgs } from '../command-runner.service';
import { MigratorService } from '../migrator.service';

@Injectable()
export class MigrateCommand implements FedacoCommand {
  constructor(private readonly migrator: MigratorService) {}

  async run(args: ParsedArgs): Promise<number> {
    await this.migrator.ensureRepositoryExists();

    const path = this.migrator.resolveMigrationsPath(args.flags.path as string);
    const files = this.migrator.listMigrationFiles(path);
    const ran = await this.migrator.getRepository().getRan();
    const pending = files.filter(
      (f) => !ran.includes(this.migrator.getMigrationName(f))
    );

    if (pending.length === 0) {
      process.stdout.write('Nothing to migrate.\n');
      return 0;
    }

    const pretend = !!args.flags.pretend;
    const step = !!args.flags.step;
    let batch = await this.migrator.getRepository().getNextBatchNumber();

    for (const file of pending) {
      await this.migrator.runUp(file, batch, pretend);
      if (step) batch++;
    }
    return 0;
  }
}
