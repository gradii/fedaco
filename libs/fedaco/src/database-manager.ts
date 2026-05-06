/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isAnyEmpty } from '@gradii/nanofn';
import type { Connection } from './connection';
import type { ConnectionFactory } from './connector/connection-factory';
import type { ConnectionConfig } from './database-config';
import { DatabaseConfig } from './database-config';
import { ConfigurationUrlParser } from './helper/configuration-url-parser';
import type { ConnectionResolverInterface } from './interface/connection-resolver-interface';

export class DatabaseManager implements ConnectionResolverInterface {
  // /*The application instance.*/
  // protected app: Application;
  /* The database connection factory instance. */
  protected factory: ConnectionFactory;
  /* The active connection instances. */
  protected connections: any = {};
  // /*The custom connection resolvers.*/
  // protected extensions: any[] = [];
  /* The callback to be executed to reconnect to a database. */
  protected reconnector: Function;

  // /*Create a new database manager instance.*/
  public constructor(factory: ConnectionFactory) {
    this.factory = factory;
    this.reconnector = (connection: Connection) => {
      this.reconnect(connection.getNameWithReadWriteType());
    };
  }

  /* Get a database connection instance. */
  public connection(name = 'default'): Connection {
    const [database, type] = this.parseConnectionName(name);
    name = name || database;
    if (!(this.connections[name] !== undefined)) {
      this.connections[name] = this.configure(this.makeConnection(database), type);
    }
    return this.connections[name];
  }

  /* Parse the connection into an array of the name and read / write type. */
  protected parseConnectionName(name: string) {
    name = name || this.getDefaultConnection();
    return /(::read|::write)$/.exec(name) ? name.split('::') : [name, null];
  }

  /* Make the database connection instance. */
  protected makeConnection(name: string) {
    const config = this.configuration(name);
    // if (this.extensions[name] !== undefined) {
    //     return call_user_func(this.extensions[name], config, name);
    // }
    // if (this.extensions[driver = config["driver"]] !== undefined) {
    //     return call_user_func(this.extensions[driver], config, name);
    // }
    return this.factory.make(config, name);
  }

  /* Get the configuration for a connection. */
  protected configuration(name: string): ConnectionConfig {
    name = name || this.getDefaultConnection();
    // @ts-ignore
    const config = DatabaseConfig.instance.config;

    // @ts-ignore
    const connectionConfig: ConnectionConfig = config['database']['connections'][name];

    if (isAnyEmpty(connectionConfig)) {
      throw new Error(`InvalidArgumentException Database connection [${name}] not configured.`);
    }
    return new ConfigurationUrlParser().parseConfiguration(connectionConfig);
  }

  /* Prepare the database connection instance. */
  protected configure(connection: Connection, type: string) {
    // var connection = this.setDriverConnectionForType(connection, type).setReadWriteType(type);
    // if (this.app.bound("events")) {
    //     connection.setEventDispatcher(this.app["events"]);
    // }
    // if (this.app.bound("db.transactions")) {
    //     connection.setTransactionManager(this.app["db.transactions"]);
    // }
    // connection.setReconnector(this.reconnector);
    return connection;
  }

  /* Prepare the read / write mode for database connection instance. */
  protected setDriverConnectionForType(connection: Connection, type: string | null = null) {
    // if (type === "read") {
    //     connection.setDriverConnection(connection.getReadDriverConnection());
    // }
    // else if (type === "write") {
    //     connection.setReadDriverConnection(connection.getDriverConnection());
    // }
    // return connection;
  }

  /* Disconnect from the given database and remove from local cache. */
  public async purge(name: string | null = null): Promise<void> {
    name = name || this.getDefaultConnection();
    await this.disconnect(name);
    delete this.connections[name];
  }

  /* Disconnect from the given database, or all of them when no name is
     given. Awaits the underlying disconnect so pool managers fully close
     before the caller continues. */
  public async disconnect(name: string | null = null): Promise<void> {
    if (name === null) {
      const targets = Object.values(this.connections) as Connection[];
      await Promise.all(targets.map((c) => c.disconnect()));
      return;
    }
    const conn = this.connections[name] as Connection | undefined;
    if (conn) {
      await conn.disconnect();
    }
  }

  /* Reconnect to the given database. */
  public reconnect(name: string | null = null) {
    // this.disconnect(name = name || this.getDefaultConnection());
    // if (!(this.connections[name] !== undefined)) {
    //     return this.connection(name);
    // }
    // return this.refreshDriverConnectionConnections(name);
  }

  /* Set the default database connection for the callback execution. */
  public usingConnection(name: string, callback: Function) {
    // var previousName = this.getDefaultConnection();
    // this.setDefaultConnection(name);
    // return tap(callback(), () => {
    //     this.setDefaultConnection(previousName);
    // });
  }

  /* Refresh the driver connection connections on a given connection. */
  protected refreshDriverConnectionConnections(name: string) {
    // const [database, type] = this.parseConnectionName(name);
    // var fresh = this.configure(this.makeConnection(database), type);
    // return this.connections[name].setDriverConnection(fresh.getRawDriverConnection()).setReadDriverConnection(fresh.getRawReadDriverConnection());
  }

  /* Get the default connection name. */
  public getDefaultConnection() {
    return 'default';
    // return this.app["config"]["database.default"];
  }

  /* Set the default connection name. */
  public setDefaultConnection(name: string) {
    // this.app["config"]["database.default"] = name;
  }

  /* Get all of the support drivers. */
  public supportedDrivers() {
    // return ["mysql", "pgsql", "sqlite", "sqlsrv"];
  }

  /* Get all of the drivers that are actually available. */
  public availableDrivers() {
    // return array_intersect(this.supportedDrivers(), str_replace("dblib", "sqlsrv", driver connection.getAvailableDrivers()));
  }

  /* Register an extension connection resolver. */
  public extend(name: string, resolver: Function) {
    // this.extensions[name] = resolver;
  }

  /* Return all of the created connections. */
  public getConnections() {
    return this.connections;
  }

  /* Set the database reconnector callback. */
  public setReconnector(reconnector: Function) {
    this.reconnector = reconnector;
  }
}
