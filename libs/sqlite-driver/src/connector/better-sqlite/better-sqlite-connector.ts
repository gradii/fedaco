/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Connector, type ConnectorInterface, type DriverConnection } from '@gradii/fedaco';
import { BetterSqliteDriverConnection } from './better-sqlite-driver-connection';

export class BetterSqliteConnector extends Connector implements ConnectorInterface {
  /* Establish a database connection. */
  public async connect(config: any) {
    const options = this.getOptions(config);
    let connection: DriverConnection;
    if (config['database'] === ':memory:') {
      connection = await this.createConnection(':memory:', config, options);
    } else {
      const path = config['database'];
      if (path === false) {
        throw new Error(`InvalidArgumentException Database (${config['database']}) does not exist.`);
      }
      connection = await this.createConnection(`${path}`, config, options);
    }
    return connection;
  }

  async createConnection(database: string, config: any, options: any) {
    const [username, password] = [config['username'] ?? null, config['password'] ?? null];

    try {
      const BetterSqlite3 = await import('better-sqlite3');
      // @ts-expect-error should use default or directly
      return new BetterSqliteDriverConnection(new (BetterSqlite3?.default || BetterSqlite3)(database, options));
    } catch (e) {
      return this.tryAgainIfCausedByLostConnection(e, database, username, password, options);
    }
  }
}
