import { __awaiter } from 'tslib'
import { isNumber } from '@gradii/check-type'
import { Processor } from '../processor'
export class SqlServerProcessor extends Processor {
  processInsertGetId(query, sql, values, sequence = null) {
    return __awaiter(this, void 0, void 0, function* () {
      const connection = query.getConnection()
      yield connection.insert(sql, values)
      let id
      if (connection.getConfig('odbc') === true) {
        id = yield this.processInsertGetIdForOdbc(connection)
      } else {
      }
      return isNumber(id) ? id : id
    })
  }

  processInsertGetIdForOdbc(connection) {
    return __awaiter(this, void 0, void 0, function* () {
      const result = yield connection.selectFromWriteConnection(
        'SELECT CAST(COALESCE(SCOPE_IDENTITY(), @@IDENTITY) AS int) AS insertid'
      )
      if (!result) {
        throw new Error('Unable to retrieve lastInsertID for ODBC.')
      }
      const row = result[0]
      return row.insertid
    })
  }

  processColumnListing(results) {
    return results.map((result) => {
      return result.name
    })
  }
}
