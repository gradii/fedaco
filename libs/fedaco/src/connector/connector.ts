/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { DriverConnection } from './driver-connection';

// import { PDOConnection } from "Doctrine/DBAL/Driver/PDOConnection";
// import { Exception } from "Exception";
// import { DetectsLostConnections } from "Illuminate/Database/DetectsLostConnections";
// import { driver connection } from "driver connection";
// import { Throwable } from "Throwable";
export class Connector {
  /* The default driver connection options. */
  protected options: any = {};

  /* Create a new driver connection. */
  public async createConnection(dsn: string, config: any, options: any): Promise<DriverConnection> {
    const [username, password] = [config['username'] ?? null, config['password'] ?? null];
    try {
      return this.createDriverConnectionConnection(dsn, username, password, options);
    } catch (e) {
      return this.tryAgainIfCausedByLostConnection(e, dsn, username, password, options);
    }
  }

  /* Create a new driver connection instance. */
  protected createDriverConnectionConnection(dsn: string, username: string, password: string, options: any[]): Promise<any> {
    // if (class_exists(PDOConnection) && !this.isPersistentConnection(options)) {
    //   return new PDOConnection(dsn, username, password, options);
    // }
    // return new driver connection(dsn, username, password, options);
    throw new Error('not implemented');
  }

  /* Determine if the connection is persistent. */
  protected isPersistentConnection(options: any[]) {
    // return options[driver connection.ATTR_PERSISTENT] !== undefined && options[driver connection.ATTR_PERSISTENT];
  }

  /* Handle an exception that occurred during connect execution. */
  protected async tryAgainIfCausedByLostConnection(
    e: any,
    dsn: string,
    username: string,
    password: string,
    options: any[],
  ): Promise<any> {
    // if (this.causedByLostConnection(e)) {
    //   return this.createDriverConnectionConnection(dsn, username, password, options);
    // }
    // throw e;
    throw new Error('not implemented');
  }

  /* Get the driver connection options based on the configuration. */
  public getOptions(config: any) {
    const options = config['options'] ?? {};
    return { ...this.options, ...options };
  }

  /* Get the default driver connection options. */
  public getDefaultOptions() {
    return this.options;
  }

  /* Set the default driver connection options. */
  public setDefaultOptions(options: any[]) {
    this.options = options;
  }
}
