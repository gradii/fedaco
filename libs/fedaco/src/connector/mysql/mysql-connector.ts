/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Connector } from '../connector';
import type { ConnectorInterface } from '../connector-interface';
import { MysqlWrappedConnection } from './mysql-wrapped-connection';

export class MysqlConnector extends Connector implements ConnectorInterface {
  /*Establish a database connection.*/
  public async connect(config: any): Promise<MysqlWrappedConnection> {
    const dsn        = this.getDsn(config);
    const options    = this.getOptions(config);
    const connection = await this.createConnection(dsn, config, options);
    if (config['database'].length) {
      await connection.exec(`use \`${config['database']}\`;`);
    }
    await this.configureIsolationLevel(connection, config);
    await this.configureEncoding(connection, config);
    await this.configureTimezone(connection, config);
    await this.setModes(connection, config);
    return connection;
  }

  async createConnection(database: string, config: any,
                         options: any): Promise<MysqlWrappedConnection> {
    const [username, password] = [config['username'] ?? null, config['password'] ?? null];
    // try {
    const mysql2               = await import('mysql2');
    return Promise.resolve(
      new MysqlWrappedConnection(mysql2.createConnection({
        host    : config['host'],
        port    : config['port'],
        user    : username,
        password: password,
        database: config['database'],
      }))
    );

    // } catch (e) {
    //   throw e;
    // return this.tryAgainIfCausedByLostConnection(e, database, username, password, options);
    // }
  }

  /*Set the connection transaction isolation level.*/
  protected async configureIsolationLevel(connection: any, config: any) {
    if (!(config['isolation_level'] !== undefined)) {
      return;
    }
    const stmt = await connection.prepare(
      `SET SESSION TRANSACTION ISOLATION LEVEL ${config['isolation_level']}`);
    await stmt.execute();
  }

  /*Set the connection character set and collation.*/
  protected async configureEncoding(connection: any, config: any) {
    if (!(config['charset'] !== undefined)) {
      return connection;
    }
    const stmt = await connection.prepare(
      `set names '${config['charset']}'${this.getCollation(config)}`);
    await stmt.execute();
  }

  /*Get the collation for the configuration.*/
  protected getCollation(config: any) {
    return config['collation'] !== undefined ? ` collate '${config['collation']}'` : '';
  }

  /*Set the timezone on the connection.*/
  protected async configureTimezone(connection: MysqlWrappedConnection, config: any) {
    if (config['timezone'] !== undefined) {
      const stmt = await connection.prepare(`set time_zone="${config['timezone']}"`);
      await stmt.execute();
    }
  }

  /*Create a DSN string from a configuration.

  Chooses socket or host/port based on the 'unix_socket' config value.*/
  protected getDsn(config: any[]) {
    return this.hasSocket(config) ? this.getSocketDsn(config) : this.getHostDsn(config);
  }

  /*Determine if the given configuration array has a UNIX socket value.*/
  protected hasSocket(config: any) {
    return config['unix_socket'] !== undefined && config['unix_socket'].length;
  }

  /*Get the DSN string for a socket configuration.*/
  protected getSocketDsn(config: any) {
    return `mysql:unix_socket=${config['unix_socket']};dbname=${config['database']}`;
  }

  /*Get the DSN string for a host / port configuration.*/
  protected getHostDsn(config: any) {
    return config.port !== undefined
      ? `mysql:host=${config.host};port=${config.port};dbname=${config.database}`
      : `mysql:host=${config.host};dbname=${config.database}"`;
  }

  /*Set the modes for the connection.*/
  protected async setModes(connection: any, config: any) {
    if (config['modes'] !== undefined) {
      await this.setCustomModes(connection, config);
    } else if (config['strict'] !== undefined) {
      if (config['strict']) {
        await (await connection.prepare(this.strictMode(connection, config))).execute();
      } else {
        await (await connection.prepare(`set session sql_mode='NO_ENGINE_SUBSTITUTION'`)).execute();
      }
    }
  }

  /*Set the custom modes on the connection.*/
  protected async setCustomModes(connection: any, config: any) {
    const modes = config['modes'].join(',');
    await (await connection.prepare(`set session sql_mode='${modes}'`)).execute();
  }

  /*Get the query to enable strict mode.*/
  protected strictMode(connection: any, config: any) {
    const version = config['version'] || connection.getAttribute('ATTR_SERVER_VERSION');
    // todo fixme
    if (version >= '8.0.11') {
      return `set session sql_mode='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'`;
    }
    return `set session sql_mode='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION'`;
  }
}
