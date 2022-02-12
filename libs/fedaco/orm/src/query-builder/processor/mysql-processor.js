import { __awaiter } from 'tslib'
import { Processor } from '../processor'
export class MysqlProcessor extends Processor {
  processColumnListing(results) {
    return results.map((result) => {
      return result.column_name
    })
  }
  processInsertGetId(query, sql, values, sequence = null) {
    return __awaiter(this, void 0, void 0, function* () {
      return query.getConnection().insertGetId(sql, values, sequence)
    })
  }
}
