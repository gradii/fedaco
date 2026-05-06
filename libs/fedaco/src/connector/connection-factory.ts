/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { has } from '@gradii/nanofn';
import type { Connection } from '../connection';
import { resolveDatabaseDriver } from '../interface/database-driver';
import type { DriverConnectionResolver } from './driver-connection';

export class ConnectionFactory {
  /* Establish a PDO connection based on the configuration. */
  public make(config: any, name: string | null = null): Connection {
    config = this.parseConfig(config, name);
    if (config['read'] !== undefined) {
      return this.createReadWriteConnection(config);
    }
    return this.createSingleConnection(config);
  }

  /* Parse and prepare the database configuration. */
  protected parseConfig(config: any, name: string) {
    if (!has(config, 'prefix')) {
      config.prefix = '';
    }
    if (!has(config, 'name')) {
      config.name = name;
    }
    return config;
  }

  /* Create a single database connection instance. */
  protected createSingleConnection(config: any): Connection {
    const pdo = this.createPdoResolver(config);
    const connection = this.createConnection(config['driver'], pdo, config['database'], config['prefix'], config);

    // Initialize pool if configured
    if (config.pool) {
      this._initializePool(connection, config);
    }

    return connection;
  }

  /* Initialize connection pool for the connection. */
  private _initializePool(connection: Connection, config: any): void {
    const driver = resolveDatabaseDriver(config['factory'], config);

    if (typeof driver.createPoolManager !== 'function') {
      // Driver doesn't support pooling — silently no-op so that pool config
      // on a non-pooling driver doesn't break startup. Isolated transactions
      // will fall back to opening a one-shot PDO via createConnector.
      return;
    }

    // Build the pool's create-connection resolver. Each pool acquire calls
    // it to produce a fresh, independent DriverConnection — same shape as
    // the lazy resolver wired up in createPdoResolver, but evaluated per
    // acquire rather than once.
    const pdoResolver: DriverConnectionResolver = async () => {
      const d = resolveDatabaseDriver(config['factory'], config);
      return d.createConnector(config);
    };

    const poolManager = driver.createPoolManager(pdoResolver, config.pool);
    connection.setPoolManager(poolManager);
  }

  /* Create a read / write database connection instance. */
  protected createReadWriteConnection(config: any[]): Connection {
    const connection = this.createSingleConnection(this.getWriteConfig(config));
    return connection.setReadPdo(this.createReadPdo(config));
  }

  /* Create a new PDO resolver for reading. */
  protected createReadPdo(config: any[]) {
    return this.createPdoResolver(this.getReadConfig(config));
  }

  /* Get the read configuration for a read / write connection. */
  protected getReadConfig(config: any[]) {
    return this.mergeReadWriteConfig(config, this.getReadWriteConfig(config, 'read'));
  }

  /* Get the write configuration for a read / write connection. */
  protected getWriteConfig(config: any[]) {
    return this.mergeReadWriteConfig(config, this.getReadWriteConfig(config, 'write'));
  }

  /* Get a read / write level configuration. */
  protected getReadWriteConfig(config: any, type: string) {
    return config[type][0] !== undefined ? config[type][Math.floor(Math.random() * config[type].length)] : config[type];
  }

  /* Merge a configuration for a read / write connection. */
  protected mergeReadWriteConfig(config: any[], merge: any[]) {
    config = { ...config, ...merge };
    // @ts-ignore
    delete config.read;
    // @ts-ignore
    delete config.write;
    return config;
  }

  /**
   * Create a lazy DriverConnection resolver. Cluster vs single-host
   * fallback is the driver's responsibility — the factory simply asks the
   * driver to open a connection on demand.
   */
  protected createPdoResolver(config: any): DriverConnectionResolver {
    return async () => {
      const driver = resolveDatabaseDriver(config['factory'], config);
      return await driver.createConnector(config);
    };
  }

  /* Create a new connection instance. */
  protected createConnection(driver: string, connection: DriverConnectionResolver, database: string, prefix = '', config: any = {}): Connection {
    if (!config['factory']) {
      throw new Error(
        `InvalidArgumentException No driver factory provided for driver [${driver}]. ` +
        `Pass a "factory" produced by a driver lib (e.g. sqliteDriver() from @gradii/fedaco-sqlite-driver) on the connection config.`,
      );
    }
    const resolvedDriver = resolveDatabaseDriver(config['factory'], config);
    return resolvedDriver.createConnection(connection, database, prefix, config);
  }
}
