import { __awaiter } from 'tslib'
import { isObject } from '@gradii/check-type'
export class MysqlWrappedStmt {
  constructor(driverConnection, sqlStmt) {
    this.driverConnection = driverConnection
    this.sqlStmt = sqlStmt
    this._bindingValues = []
  }
  bindValues(bindings) {
    this._bindingValues = bindings
    return this
  }
  execute(bindings) {
    return __awaiter(this, void 0, void 0, function* () {
      console.log(
        `run this ${this.sqlStmt}`,
        bindings !== null && bindings !== void 0
          ? bindings
          : this._bindingValues
      )
      return new Promise((ok, fail) => {
        this.driverConnection.execute(
          this.sqlStmt,
          bindings !== null && bindings !== void 0
            ? bindings
            : this._bindingValues,
          (err, result, fields) => {
            if (err) {
              return fail(err)
            }
            ok(result)

            if (isObject(result) && 'affectedRows' in result) {
              this._affectRows = result.affectedRows
            } else {
            }
          }
        )
      })
    })
  }
  fetchAll(bindings) {
    return __awaiter(this, void 0, void 0, function* () {
      console.log(
        `run this ${this.sqlStmt}`,
        bindings !== null && bindings !== void 0
          ? bindings
          : this._bindingValues
      )
      return new Promise((ok, fail) => {
        this.driverConnection.query(
          this.sqlStmt,
          bindings !== null && bindings !== void 0
            ? bindings
            : this._bindingValues,
          (err, result, fields) => {
            if (err) {
              return fail(err)
            }
            ok(result)
          }
        )
      })
    })
  }
  lastInsertId() {
    return this._lastInsertId
  }
  affectCount() {
    return this._affectRows
  }
  close() {}
  bindValue() {
    return undefined
  }
}
