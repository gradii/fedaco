import { Inject, Injectable } from '@nestjs/common';
import { DatabaseConfig } from '@gradii/fedaco';

import { MIGRATOR_OPTIONS } from './fedaco-cli.constants';
import { jitiRequire } from './jiti-loader';
import { DatabaseMigrationRepository, Migrator } from './migrations';

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
  private initialized = false;

  constructor(
    @Inject(MIGRATOR_OPTIONS) private readonly options: MigratorOptions
  ) {}

  async onInit(): Promise<void> {
    if (this.initialized) return;
    this.fedaco = { DatabaseConfig, DatabaseMigrationRepository, Migrator };

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
    this.initialized = true;
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

function loadMigrationFile(file: string): any {
  return jitiRequire(file);
}
