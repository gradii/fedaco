/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { replaceArray } from './helper/str'
export class QueryException {
  constructor(sql, bindings, message) {
    this.sql = sql
    this.bindings = bindings
    this.message = this.formatMessage(sql, bindings, message)
  }

  formatMessage(sql, bindings, message) {
    return `${message} (SQL: ${replaceArray(sql, '?', bindings)})`
  }

  getSql() {
    return this.sql
  }

  getBindings() {
    return this.bindings
  }
  toString() {
    return this.message
  }
}
