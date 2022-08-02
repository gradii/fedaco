/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isNumber, isObject } from '@gradii/check-type';
import { Processor } from '../processor';
import type { QueryBuilder } from '../query-builder';

export class PostgresProcessor extends Processor {
  /*Process an "insert get ID" query.*/
  public async processInsertGetId(query: QueryBuilder, sql: string, values: any[],
                            sequence?: string) {
    const connection = query.getConnection();
    connection.recordsHaveBeenModified();
    const result   = (await connection.selectFromWriteConnection(sql, values))[0];
    sequence = sequence || 'id';
    const id       = isObject(result) ? result[sequence] : result[sequence];
    return isNumber(id) ? /*cast type int*/ id : id;
  }

  /*Process the results of a column listing query.*/
  public processColumnListing(results: any[]) {
    return results.map(result => {
      return /*cast type object*/ result.column_name;
    });
  }
}
