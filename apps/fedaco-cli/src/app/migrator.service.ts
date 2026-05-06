import { createRequire } from 'node:module';

import { Inject, Injectable } from '@nestjs/common';
import * as fedaco from '@gradii/fedaco';

import { MIGRATOR_OPTIONS } from './fedaco-cli.constants';

const dynamicRequire = createRequire(process.cwd() + '/');

export interface MigratorOptions {
  connections: Record<string, any>;
  defaultConnection: string;
  migrationsPath: string;
  migrationsTable: string;
}

@Injectable()
export class MigratorService {
  private fedaco: any;
  private databaseConfig: any;
  private resolver: any;
  private repository: any;
  private migrator: any;

  constructor(
    @Inject(MIGRATOR_OPTIONS) private readonly options: MigratorOptions
  ) {}

  async onInit(): Promise<void> {
    this.fedaco = loadUserFedaco();
    const { DatabaseConfig, DatabaseMigrationRepository, Migrator } = this.fedaco;

    this.databaseConfig = new DatabaseConfig();
    for (const [name, cfg] of Object.entries(this.options.connections)) {
      this.databaseConfig.addConnection(cfg, name);
    }
    this.databaseConfig.bootFedaco();
    this.databaseConfig.setAsGlobal();

    this.resolver = this.databaseConfig.getDatabaseManager();
    this.repository = new DatabaseMigrationRepository(
      this.resolver,
      this.options.migrationsTable
    );
    this.repository.setSource(this.options.defaultConnection);

    this.migrator = new Migrator(this.repository, this.resolver);
    this.migrator.setConnection(this.options.defaultConnection);
    this.migrator.path(this.options.migrationsPath);
    this.migrator.setLoader((file: string) => loadMigrationFile(file));
  }

  async shutdown(): Promise<void> {
    if (!this.databaseConfig) return;
    const connections = this.resolver?.getConnections?.() ?? {};
    for (const key of Object.keys(connections)) {
      const c = connections[key];
      if (c && typeof c.disconnect === 'function') {
        try {
          await c.disconnect();
        } catch {
          // best effort
        }
      }
    }
  }

  getMigrator(): any {
    return this.migrator;
  }

  getRepository(): any {
    return this.repository;
  }

  getOptions(): MigratorOptions {
    return this.options;
  }

  async ensureRepositoryExists(): Promise<void> {
    if (!(await this.repository.repositoryExists())) {
      await this.repository.createRepository();
    }
  }

  async deleteRepository(): Promise<void> {
    if (await this.repository.repositoryExists()) {
      await this.repository.deleteRepository();
    }
  }

  getConnection() {
    return this.resolver.connection(this.options.defaultConnection);
  }
}

function loadUserFedaco(): any {
  return fedaco;
}

let cachedJiti: ((file: string) => any) | null | undefined;

function loadMigrationFile(file: string): any {
  if (cachedJiti === undefined) {
    try {
      const createJiti = dynamicRequire('jiti');
      const factory =
        typeof createJiti === 'function'
          ? createJiti
          : createJiti?.default ?? createJiti?.createJiti;
      const jiti = factory(process.cwd(), {
        interopDefault: true,
        cache: false,
        requireCache: false,
      });
      cachedJiti = (f: string) => jiti(f);
    } catch {
      cachedJiti = null;
    }
  }
  if (!cachedJiti) {
    throw new Error(
      `fedaco: "jiti" is required to load migrations. Install it in your project: pnpm add jiti`
    );
  }
  return cachedJiti(file);
}
