import { Injectable } from '@nestjs/common';

import type { FedacoCommand, ParsedArgs } from '../command-runner.service';
import { MigratorService } from '../migrator.service';
import { MigrateCommand } from './migrate.command';
import { MigrateResetCommand } from './migrate-reset.command';

@Injectable()
export class MigrateRefreshCommand implements FedacoCommand {
  constructor(
    private readonly migrator: MigratorService,
    private readonly reset: MigrateResetCommand,
    private readonly migrate: MigrateCommand
  ) {}

  async run(args: ParsedArgs): Promise<number> {
    const resetCode = await this.reset.run(args);
    if (resetCode !== 0) return resetCode;
    return this.migrate.run(args);
  }
}
