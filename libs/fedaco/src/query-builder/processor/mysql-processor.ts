/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Processor } from '../processor';
import type { QueryBuilder } from '../query-builder';

export class MysqlProcessor extends Processor {
  /*Process the results of a column listing query.*/
  public processColumnListing(results: any[]) {
    return results.map(result => {
      return /*cast type object*/ result.column_name;
    });
  }

  async processInsertGetId(query: QueryBuilder, sql: string, values: any[], sequence: string | null = null): Promise<any> {
    return query.getConnection().insertGetId(sql, values, sequence);
  }
}
