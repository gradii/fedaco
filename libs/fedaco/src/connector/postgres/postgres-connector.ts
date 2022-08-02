/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Connector } from '../connector';
import type { ConnectorInterface } from '../connector-interface';
import { MysqlWrappedConnection } from '../mysql/mysql-wrapped-connection';
import { PostgresWrappedConnection } from './postgres-wrapped-connection';

export class PostgresConnector extends Connector implements ConnectorInterface {
  /*The default PDO connection options.*/
  protected options: any = {};

  /*Establish a database connection.*/
  public async connect(config: any) {
    const connection = this.createConnection(this.getDsn(config), config, this.getOptions(config));
    await this.configureEncoding(connection, config);
    await this.configureTimezone(connection, config);
    await this.configureSearchPath(connection, config);
    await this.configureApplicationName(connection, config);
    await this.configureSynchronousCommit(connection, config);
    return connection;
  }

  async createConnection(database: string, config: any,
                         options: any): Promise<PostgresWrappedConnection> {
    const [username, password] = [config['username'] ?? null, config['password'] ?? null];
    // try {
    const {Client}             = await import('pg');
    const client = new Client({
      host    : config['host'],
      port    : config['port'],
      user    : username,
      password: password,
      database: config['database'],
    });
    await client.connect();
    return new PostgresWrappedConnection(client);
  }

  /*Set the connection character set and collation.*/
  protected async configureEncoding(connection: any, config: any) {
    if (!(config['charset'] !== undefined)) {
      return;
    }
    await (await connection.prepare(`set names '${config['charset']}'`)).execute();
  }

  /*Set the timezone on the connection.*/
  protected async configureTimezone(connection: any, config: any) {
    if (config['timezone'] !== undefined) {
      const timezone = config['timezone'];
      await (await connection.prepare(`set time zone '${timezone}'`)).execute();
    }
  }

  /*Set the "search_path" on the database connection.*/
  protected async configureSearchPath(connection: any, config: any) {
    if (config['search_path'] !== undefined) {
      const searchPath = this.quoteSearchPath(this.parseSearchPath(config['search_path']));
      await (await connection.prepare(`set search_path to ${searchPath}`)).execute();
    }
  }

  /*Parse the "search_path" configuration value into an array.*/
  protected parseSearchPath(searchPath: string | any) {
    // if (isString(searchPath)) {
    //   preg_match_all(/[a-zA-z0-9$]{1,}/i, searchPath, matches);
    //   const searchPath = matches[0];
    // }
    // array_walk(searchPath, schema => {
    //   const schema = trim(schema, `'"`);
    // });
    return searchPath;
  }

  /*Format the search path for the DSN.*/
  protected quoteSearchPath(searchPath: any[]) {
    return searchPath.length === 1 ?
      `"${searchPath[0]}"` : `"${searchPath.join(', ')}"`;
  }

  /*Set the application name on the connection.*/
  protected async configureApplicationName(connection: any, config: any) {
    if (config['application_name'] !== undefined) {
      const applicationName = config['application_name'];
      await (await connection.prepare(`set application_name to '${applicationName}'`)).execute();
    }
  }

  /*Create a DSN string from a configuration.*/
  protected getDsn(config: any) {
    // eslint-disable-next-line prefer-const
    let {host, database, port} = config;

    host    = host !== undefined ? `host=${host};` : '';
    let dsn = `pgsql:${host}dbname=${database}`;
    if (config['port'] !== undefined) {
      dsn += `;port=${port}`;
    }
    return this.addSslOptions(dsn, config);
  }

  /*Add the SSL options to the DSN.*/
  protected addSslOptions(dsn: string, config: any) {
    for (const option of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) {
      if (config[option]) {
        dsn += `;${option}=${config[option]}`;
      }
    }

    return dsn;
  }


  /*Configure the synchronous_commit setting.*/
  protected async configureSynchronousCommit(connection: any, config: any) {
    if (!(config['synchronous_commit'] !== undefined)) {
      return;
    }
    await (await connection.prepare(
      `set synchronous_commit to '${config['synchronous_commit']}'`)).execute();
  }
}
