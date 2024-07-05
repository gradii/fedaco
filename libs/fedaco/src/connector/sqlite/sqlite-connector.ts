/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Connector } from '../connector';
import type { ConnectorInterface } from '../connector-interface';
import { WrappedConnection } from '../wrapped-connection';
import { BetterSqliteWrappedConnection } from './better-sqlite/better-sqlite-wrapped-connection';
import { SqliteWrappedConnection } from './sqlite-wrapped-connection';


export class SqliteConnector extends Connector implements ConnectorInterface {
  /*Establish a database connection.*/
  public async connect(config: any) {
    const options = this.getOptions(config);
    let connection: WrappedConnection;
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
      // @ts-ignore
      return new BetterSqliteWrappedConnection(new (BetterSqlite3?.default || BetterSqlite3)(database, options));
    } catch (e) {
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
}
