import { Injectable } from '@nestjs/common';

import type { FedacoCommand, ParsedArgs } from '../command-runner.service';
import { MigratorService } from '../migrator.service';
import { MigrateCommand } from './migrate.command';

@Injectable()
export class MigrateFreshCommand implements FedacoCommand {
  constructor(
    private readonly migrator: MigratorService,
    private readonly migrate: MigrateCommand
  ) {}

  async run(args: ParsedArgs): Promise<number> {
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

    return this.migrate.run(args);
  }
}
