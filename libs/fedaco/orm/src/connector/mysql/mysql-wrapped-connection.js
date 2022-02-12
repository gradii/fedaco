/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { __awaiter } from 'tslib'
import { MysqlWrappedStmt } from './mysql-wrapped-stmt'
export class MysqlWrappedConnection {
  constructor(driver) {
    this.driver = driver
    driver.on('error', (e) => {
      this.lastError = e.message
    })
  }
  prepare(sql) {
    return __awaiter(this, void 0, void 0, function* () {
      return Promise.resolve(new MysqlWrappedStmt(this.driver, sql))
    })
  }
  exec(sql) {
    return __awaiter(this, void 0, void 0, function* () {
      return new Promise((ok, fail) => {
        this.driver.query(sql, (err, result, fields) => {
          if (err) {
            return fail(err)
          }
          ok(result)
        })
      })
    })
  }
  execute(sql, bindings) {
    return __awaiter(this, void 0, void 0, function* () {
      return new Promise((ok, fail) => {
        this.driver.execute(sql, bindings, (err, result, fields) => {
          if (err) {
            return fail(err)
          }
          ok(result)
        })
      })
    })
  }

  lastInsertId() {
    return __awaiter(this, void 0, void 0, function* () {
      return new Promise((ok, fail) => {
        this.driver.execute('select LAST_INSERT_ID()', (err, data) => {
          if (err) {
            fail(err)
          } else {
            ok(data && data.length === 1 && data[0]['LAST_INSERT_ID()'])
          }
        })
      })
    })
  }
  beginTransaction() {
    return Promise.resolve(undefined)
  }
  commit() {
    return Promise.resolve(undefined)
  }
  rollBack() {
    return Promise.resolve(undefined)
  }
}
