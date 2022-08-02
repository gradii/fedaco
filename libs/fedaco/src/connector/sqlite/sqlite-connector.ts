/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Connector } from '../connector';
import type { ConnectorInterface } from '../connector-interface';
import { SqliteWrappedConnection } from './sqlite-wrapped-connection';


export class SqliteConnector extends Connector implements ConnectorInterface {
  /*Establish a database connection.*/
  public async connect(config: any) {
    const options = this.getOptions(config);
    if (config['database'] === ':memory:') {
      return this.createConnection(':memory:', config, options);
    }
    const path = config['database'];
    if (path === false) {
      throw new Error(`InvalidArgumentException Database (${config['database']}) does not exist.`);
    }
    return this.createConnection(`${path}`, config, options);
  }

  async createConnection(database: string, config: any, options: any) {
    const [username, password] = [config['username'] ?? null, config['password'] ?? null];
    try {
      const sqlite3 = await import('sqlite3');
      return new Promise((ok, fail) => {
        // @ts-ignore
       const db = new (sqlite3.Database || sqlite3?.default.Database)(database, (err) => {
          if (err) {
            return fail(err);
          }
          ok(new SqliteWrappedConnection(db));
        });
      });

    } catch (e) {
      return this.tryAgainIfCausedByLostConnection(e, database, username, password, options);
    }
  }
}
