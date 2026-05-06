/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Connector, type ConnectorInterface, type DriverConnection } from '@gradii/fedaco';
import { SqliteDriverConnection } from './sqlite-driver-connection';

export class SqliteConnector extends Connector implements ConnectorInterface {
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
      const sqlite3 = await import('sqlite3');
      return new Promise((ok, fail) => {
        // @ts-expect-error should use default or directly
        const db = new (sqlite3.Database || sqlite3.default.Database)(database, (err) => {
          if (err) {
            return fail(err);
          }
          ok(new SqliteDriverConnection(db));
        });
      });
    } catch (e) {
      return this.tryAgainIfCausedByLostConnection(e, database, username, password, options);
    }
  }
}
