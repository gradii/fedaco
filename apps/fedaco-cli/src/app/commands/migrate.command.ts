import { Injectable } from '@nestjs/common';

import type { FedacoCommand, ParsedArgs } from '../command-runner.service';
import { MigratorService } from '../migrator.service';

@Injectable()
export class MigrateCommand implements FedacoCommand {
  constructor(private readonly migrator: MigratorService) {}

  async run(args: ParsedArgs): Promise<number> {
    await this.migrator.ensureRepositoryExists();

    const path = (args.flags.path as string) ?? this.migrator.getOptions().migrationsPath;
    const stepFlag = args.flags.step;
    await this.migrator.getMigrator().run(path, {
      pretend: !!args.flags.pretend,
      step: typeof stepFlag === 'string' ? parseInt(stepFlag, 10) : !!stepFlag,
    });
    return 0;
  }
}
