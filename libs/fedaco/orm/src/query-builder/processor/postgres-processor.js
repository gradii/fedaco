import { __awaiter } from 'tslib'
import { isNumber, isObject } from '@gradii/check-type'
import { Processor } from '../processor'
export class PostgresProcessor extends Processor {
  processInsertGetId(query, sql, values, sequence) {
    return __awaiter(this, void 0, void 0, function* () {
      const connection = query.getConnection()
      connection.recordsHaveBeenModified()
      const result = (yield connection.selectFromWriteConnection(
        sql,
        values
      ))[0]
      sequence = sequence || 'id'
      const id = isObject(result) ? result[sequence] : result[sequence]
      return isNumber(id) ? id : id
    })
  }

  processColumnListing(results) {
    return results.map((result) => {
      return result.column_name
    })
  }
}
