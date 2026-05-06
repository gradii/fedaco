/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { has } from '@gradii/nanofn';
import type { Connection } from '../connection';
import { wrap } from '../helper/arr';
import { resolveDatabaseDriver } from '../interface/database-driver';
import type { ConnectorInterface } from './connector-interface';

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
    return this.createConnection(config['driver'], pdo, config['database'], config['prefix'], config);
  }

  /* Create a read / write database connection instance. */
  protected createReadWriteConnection(config: any[]): Connection {
    const connection = this.createSingleConnection(this.getWriteConfig(config));
    return connection.setReadPdo(this.createReadPdo(config));
  }

  /* Create a new PDO instance for reading. */
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

  /* Create a new Closure that resolves to a PDO instance. */
  protected createPdoResolver(config: any) {
    return 'host' in config ? this.createPdoResolverWithHosts(config) : this.createPdoResolverWithoutHosts(config);
  }

  /* Create a new Closure that resolves to a PDO instance with a specific host or an array of hosts. */
  protected createPdoResolverWithHosts(config: any) {
    return async () => {
      const hosts = this.parseHosts(config).sort(() => 0.5 - Math.random());
      for (const [key, host] of Object.entries(hosts)) {
        config['host'] = host;
        try {
          const connector = await this.createConnector(config);
          return connector.connect(config);
        } catch (e) {
          continue;
        }
      }
      throw new Error('connect fail');
    };
  }

  /* Parse the hosts configuration item into an array. */
  protected parseHosts(config: any) {
    const hosts = wrap(config['host']);
    if (!hosts.length) {
      throw new Error('InvalidArgumentException Database hosts array is empty.');
    }
    return hosts;
  }

  /* Create a new Closure that resolves to a PDO instance where there is no configured host. */
  protected createPdoResolverWithoutHosts(config: any[]) {
    return async () => {
      const connector = await this.createConnector(config);
      return connector.connect(config);
    };
  }

  /**
   * Create a connector instance from the per-config driver factory.
   *
   * Async because `DatabaseDriver.createConnector()` may itself return a
   * Promise. This method is only invoked from the lazy pdo resolver, which
   * is already async, so going async here doesn't bubble out to user code.
   */
  public async createConnector(config: any): Promise<ConnectorInterface> {
    if (config['driver'] === undefined) {
      throw new Error('InvalidArgumentException A driver must be specified.');
    }
    if (!config['factory']) {
      throw new Error(
        `InvalidArgumentException No driver factory provided for driver [${config['driver']}]. ` +
        `Pass a "factory" produced by a driver lib (e.g. sqliteDriver() from @gradii/fedaco-sqlite-driver) on the connection config.`,
      );
    }
    const driver = resolveDatabaseDriver(config['factory'], config);
    return await driver.createConnector();
  }

  /* Create a new connection instance. */
  protected createConnection(driver: string, connection: Function, database: string, prefix = '', config: any = {}): Connection {
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
