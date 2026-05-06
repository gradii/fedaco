import { Injectable } from '@nestjs/common';

import type { FedacoCommand, ParsedArgs } from '../command-runner.service';
import { MigratorService } from '../migrator.service';

@Injectable()
export class MigrateRollbackCommand implements FedacoCommand {
  constructor(private readonly migrator: MigratorService) {}

  async run(args: ParsedArgs): Promise<number> {
    await this.migrator.ensureRepositoryExists();
    const path = (args.flags.path as string) ?? this.migrator.getOptions().migrationsPath;
    const stepArg = args.flags.step;
    const batchArg = args.flags.batch;
    await this.migrator.getMigrator().rollback(path, {
      pretend: !!args.flags.pretend,
      step: typeof stepArg === 'string' ? parseInt(stepArg, 10) : 0,
      batch: typeof batchArg === 'string' ? parseInt(batchArg, 10) : 0,
    });
    return 0;
  }
}
