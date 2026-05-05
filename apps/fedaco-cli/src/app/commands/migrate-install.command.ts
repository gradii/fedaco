import { Injectable } from '@nestjs/common';

import type { FedacoCommand } from '../command-runner.service';
import { MigratorService } from '../migrator.service';

@Injectable()
export class MigrateInstallCommand implements FedacoCommand {
  constructor(private readonly migrator: MigratorService) {}

  async run(): Promise<number> {
    const repo = this.migrator.getRepository();
    if (await repo.repositoryExists()) {
      process.stdout.write('Migration table already exists.\n');
      return 0;
    }
    await repo.createRepository();
    process.stdout.write('Migration table created successfully.\n');
    return 0;
  }
}
