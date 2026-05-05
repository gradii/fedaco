import { Injectable } from '@nestjs/common';

import type { FedacoCommand, ParsedArgs } from '../command-runner.service';
import { MigratorService } from '../migrator.service';

@Injectable()
export class MigrateRollbackCommand implements FedacoCommand {
  constructor(private readonly migrator: MigratorService) {}

  async run(args: ParsedArgs): Promise<number> {
    await this.migrator.ensureRepositoryExists();
    const repo = this.migrator.getRepository();

    const stepsArg = args.flags.step;
    const batchArg = args.flags.batch;
    const pretend = !!args.flags.pretend;

    let records: any[];
    if (typeof stepsArg === 'string' && parseInt(stepsArg, 10) > 0) {
      records = await repo.getMigrations(parseInt(stepsArg, 10));
    } else if (typeof batchArg === 'string' && parseInt(batchArg, 10) > 0) {
      records = await repo.getMigrationsByBatch(parseInt(batchArg, 10));
    } else {
      records = await repo.getLast();
    }

    if (!records || records.length === 0) {
      process.stdout.write('Nothing to rollback.\n');
      return 0;
    }

    const path = this.migrator.resolveMigrationsPath(args.flags.path as string);
    const filesByName = new Map<string, string>();
    for (const f of this.migrator.listMigrationFiles(path)) {
      filesByName.set(this.migrator.getMigrationName(f), f);
    }

    for (const record of records) {
      const file = filesByName.get(record.migration);
      if (!file) {
        process.stdout.write(
          `Migration not found on disk: ${record.migration} (skipping)\n`
        );
        continue;
      }
      await this.migrator.runDown(file, record, pretend);
    }
    return 0;
  }
}
