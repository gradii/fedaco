/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import type { Connection } from './connection';
import { ConnectionFactory } from './connector/connection-factory';
import { DatabaseManager } from './database-manager';
import type { Dispatcher } from './fedaco/mixins/has-events';
import { NullDispatcher } from './fedaco/mixins/has-events';
import { Model } from './fedaco/model';
import type { QueryBuilder } from './query-builder/query-builder';

export type ConnectionConfig = {
  database?    : string;
  name?        : string;
  driver?      : string;
  url?         : string;
  username?    : string;
  password?    : string;
  port?        : string | number;
  [key: string]: string | any;
};

export class DatabaseConfig {
  config: {
    database: {
      fetch?     : number;
      default?   : string;
      connections: {
        [key: string]: ConnectionConfig;
      };
    };
  } = {
    database: {
      fetch      : 0,
      default    : 'default',
      connections: {},
    },
  };

  /* The database manager instance. */
  protected manager: DatabaseManager;

  protected static instance: DatabaseConfig;

  /* Create a new database capsule manager. */
  public constructor(/* container: Container | null = null */) {
    // this.setupContainer(container || new Container());
    this.setupManager();
  }

  /* Build the database manager instance. */
  protected setupManager() {
    const factory = new ConnectionFactory();
    this.manager = new DatabaseManager(factory);
  }

  /* Get a connection instance from the global manager. */
  public static connection(connection: string | null = null): Connection {
    return this.instance.getConnection(connection);
  }

  /**
   * Make this capsule instance available globally.
   */
  public setAsGlobal() {
    (this.constructor as typeof DatabaseConfig).instance = this;
  }

  /* Get a fluent query builder instance. */
  public static table(
    table: Function | QueryBuilder | string,
    as: string | null = null,
    connection: string | null = null,
  ) {
    return (this.instance.constructor as typeof DatabaseConfig).connection(connection).table(table, as);
  }

  /* Get a schema builder instance. */
  public static schema(connection: string | null = null) {
    return (this.instance.constructor as typeof DatabaseConfig).connection(connection).getSchemaBuilder();
  }

  /* Get a registered connection instance. */
  public getConnection(name: string | null = null): Connection {
    return this.manager.connection(name);
  }

  /* Register a connection with the manager. */
  public addConnection(config: any, name = 'default') {
    const connections = this.config.database.connections;

    // @ts-ignore
    connections[name] = config;

    this.config.database.connections = connections;
  }

  /* Bootstrap Eloquent so it is ready for usage. */
  public bootFedaco() {
    Model.setConnectionResolver(this.manager);
    const events: Dispatcher = {
      forget(event: string): void {},
      until() {
        return true;
      },
      dispatch() {},
    };

    const dispatcher = new NullDispatcher(events);

    if (dispatcher) {
      Model.setEventDispatcher(dispatcher);
    }
  }

  // /*Set the fetch mode for the database connections.*/
  // public setFetchMode(fetchMode: number) {
  //   this.config.database.fetch = fetchMode;
  //   return this;
  // }

  /* Get the database manager instance. */
  public getDatabaseManager() {
    return this.manager;
  }

  // /*Get the current event dispatcher instance.*/
  // public getEventDispatcher() {
  //   if (this.container.bound('events')) {
  //     return this.container['events'];
  //   }
  // }

  // /*Set the event dispatcher instance to be used by connections.*/
  // public setEventDispatcher(dispatcher: Dispatcher) {
  //   this.container.instance('events', dispatcher);
  // }

  // /*Dynamically pass methods to the default connection.*/
  // public static __callStatic(method: string, parameters: any[]) {
  //   return Manager.connection().method(());
  // }
}
