import { Injectable } from '@nestjs/common';

import type { FedacoCommand, ParsedArgs } from '../command-runner.service';
import { MigratorService } from '../migrator.service';

@Injectable()
export class MigrateResetCommand implements FedacoCommand {
  constructor(private readonly migrator: MigratorService) {}

  async run(args: ParsedArgs): Promise<number> {
    await this.migrator.ensureRepositoryExists();
    const path = (args.flags.path as string) ?? this.migrator.getOptions().migrationsPath;
    await this.migrator.getMigrator().reset(path, !!args.flags.pretend);
    return 0;
  }
}
