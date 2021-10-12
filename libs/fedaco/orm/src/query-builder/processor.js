import { __awaiter } from 'tslib';

export class Processor {
  processSelect(queryBuilder, results) {
    return results;
  }

  processInsertGetId(query, sql, values, sequence = null) {
    return __awaiter(this, void 0, void 0, function* () {
      yield query.getConnection().insert(sql, values);
      const id = yield (yield query.getConnection().getPdo()).lastInsertId();

      return id;
    });
  }

  processColumnListing(results) {
    return results;
  }
}
