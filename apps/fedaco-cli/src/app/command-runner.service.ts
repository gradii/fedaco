import { Injectable } from '@nestjs/common';

import { MigrateCommand } from './commands/migrate.command';
import { MigrateFreshCommand } from './commands/migrate-fresh.command';
import { MigrateInstallCommand } from './commands/migrate-install.command';
import { MigrateRefreshCommand } from './commands/migrate-refresh.command';
import { MigrateResetCommand } from './commands/migrate-reset.command';
import { MigrateRollbackCommand } from './commands/migrate-rollback.command';
import { MigrateStatusCommand } from './commands/migrate-status.command';
import { MigratorService } from './migrator.service';

export interface ParsedArgs {
  flags: { [key: string]: string | boolean };
  positional: string[];
}

export interface FedacoCommand {
  run(args: ParsedArgs): Promise<number | void>;
}

@Injectable()
export class CommandRunnerService {
  private readonly commands: Map<string, FedacoCommand>;

  constructor(
    private readonly migrator: MigratorService,
    migrate: MigrateCommand,
    migrateInstall: MigrateInstallCommand,
    migrateRollback: MigrateRollbackCommand,
    migrateReset: MigrateResetCommand,
    migrateRefresh: MigrateRefreshCommand,
    migrateFresh: MigrateFreshCommand,
    migrateStatus: MigrateStatusCommand
  ) {
    this.commands = new Map<string, FedacoCommand>([
      ['migrate', migrate],
      ['migrate:install', migrateInstall],
      ['migrate:rollback', migrateRollback],
      ['migrate:reset', migrateReset],
      ['migrate:refresh', migrateRefresh],
      ['migrate:fresh', migrateFresh],
      ['migrate:status', migrateStatus],
    ]);
  }

  async run(argv: string[]): Promise<number> {
    const [name, ...rest] = argv;
    const cmd = this.commands.get(name);
    if (!cmd) {
      process.stderr.write(`fedaco: unknown command "${name}"\n`);
      return 1;
    }
    await this.migrator.onInit();
    const args = parseArgs(rest);
    const code = await cmd.run(args);
    return typeof code === 'number' ? code : 0;
  }
}

export function parseArgs(argv: string[]): ParsedArgs {
  const flags: ParsedArgs['flags'] = {};
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('-')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else if (a.startsWith('-') && a.length === 2) {
      const key = a.slice(1);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('-')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(a);
    }
  }
  return { flags, positional };
}
