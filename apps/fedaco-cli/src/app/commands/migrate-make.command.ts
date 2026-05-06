import { Inject, Injectable } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';

import { MIGRATOR_OPTIONS } from '../fedaco-cli.constants';
import { MigrationCreator } from '../migrations';
import type { MigratorOptions } from '../migrator.service';

interface MakeOptions {
  path?: string;
  table?: string;
  create?: string | boolean;
}

@Injectable()
@Command({
  name: 'migrate:make',
  arguments: '<name>',
  description: 'Create a new migration file',
})
export class MigrateMakeCommand extends CommandRunner {
  private readonly creator = new MigrationCreator();

  constructor(
    @Inject(MIGRATOR_OPTIONS) private readonly options: MigratorOptions
  ) {
    super();
  }

  async run(inputs: string[], options: MakeOptions = {}): Promise<void> {
    const name = inputs[0];
    if (!name) {
      process.stderr.write('fedaco: migrate:make requires a migration name.\n');
      process.exitCode = 1;
      return;
    }

    const path = options.path ?? this.options.migrationsPath;
    const table = this.resolveTable(options);
    const create = this.resolveCreate(options);

    const file = this.creator.create(name, path, table, create);
    process.stdout.write(`Created migration: ${file}\n`);
  }

  protected resolveTable(options: MakeOptions): string | null {
    if (typeof options.create === 'string' && options.create.length > 0) {
      return options.create;
    }
    return options.table ?? null;
  }

  protected resolveCreate(options: MakeOptions): boolean {
    return options.create !== undefined && options.create !== false;
  }

  @Option({
    flags: '--path <path>',
    description: 'Where to write the migration file',
  })
  parsePath(value: string): string {
    return value;
  }

  @Option({
    flags: '--table <table>',
    description: 'The table to migrate',
  })
  parseTable(value: string): string {
    return value;
  }

  @Option({
    flags: '--create [table]',
    description: 'The table to be created',
  })
  parseCreate(value: string | undefined): string | boolean {
    return value === undefined ? true : value;
  }
}
