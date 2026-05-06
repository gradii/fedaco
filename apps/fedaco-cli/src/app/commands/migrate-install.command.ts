import { Command, CommandRunner } from 'nest-commander';

import type { MigratorService } from '../migrator.service';
import { Inject } from '@nestjs/common';

@Command({
  name: 'migrate:install',
  description: 'Create the migration repository table',
})
export class MigrateInstallCommand extends CommandRunner {
  constructor(@Inject() private readonly migrator: MigratorService) {
    super();
  }

  async run(): Promise<void> {
    await this.migrator.onInit();
    const repo = this.migrator.getRepository();
    if (await repo.repositoryExists()) {
      process.stdout.write('Migration table already exists.\n');
      return;
    }
    await repo.createRepository();
    process.stdout.write('Migration table created successfully.\n');
  }
}
