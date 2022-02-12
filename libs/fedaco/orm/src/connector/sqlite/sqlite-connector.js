/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { __awaiter } from 'tslib'
import { Connector } from '../connector'
import { SqliteWrappedConnection } from './sqlite-wrapped-connection'
export class SqliteConnector extends Connector {
  connect(config) {
    return __awaiter(this, void 0, void 0, function* () {
      const options = this.getOptions(config)
      if (config['database'] === ':memory:') {
        return this.createConnection(':memory:', config, options)
      }
      const path = config['database']
      if (path === false) {
        throw new Error(
          `InvalidArgumentException Database (${config['database']}) does not exist.`
        )
      }
      return this.createConnection(`${path}`, config, options)
    })
  }
  createConnection(database, config, options) {
    var _a, _b
    return __awaiter(this, void 0, void 0, function* () {
      const [username, password] = [
        (_a = config['username']) !== null && _a !== void 0 ? _a : null,
        (_b = config['password']) !== null && _b !== void 0 ? _b : null,
      ]
      try {
        const sqlite3 = yield import('sqlite3')
        return new Promise((ok, fail) => {
          const db = new sqlite3.Database(database, (err) => {
            if (err) {
              return fail(err)
            }
            ok(new SqliteWrappedConnection(db))
          })
        })
      } catch (e) {
        return this.tryAgainIfCausedByLostConnection(
          e,
          database,
          username,
          password,
          options
        )
      }
    })
  }
}
