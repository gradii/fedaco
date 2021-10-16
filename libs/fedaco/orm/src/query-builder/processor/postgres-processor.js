import { isNumber, isObject } from '@gradii/check-type'
import { Processor } from '../processor'
export class PostgresProcessor extends Processor {
  processInsertGetId(query, sql, values, sequence) {
    const connection = query.getConnection()
    connection.recordsHaveBeenModified()
    const result = connection.selectFromWriteConnection(sql, values)[0]
    sequence = sequence || 'id'
    const id = isObject(result) ? result[sequence] : result[sequence]
    return isNumber(id) ? id : id
  }

  processColumnListing(results) {
    return results.map((result) => {
      return result.column_name
    })
  }
}
