/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isNumber } from '@gradii/check-type';
import type { ProcessorInterface } from './processor-interface';
import type { QueryBuilder } from './query-builder';

export class Processor implements ProcessorInterface {
  processSelect(queryBuilder: QueryBuilder, results: any | any[]) {
    return results;
  }

  async processInsertGetId(query: QueryBuilder, sql: string, values: any[], sequence: string | null = null): Promise<any> {
    await query.getConnection().insert(sql, values);
    const id = await (await query.getConnection().getPdo()).lastInsertId();
    // return isNumber(id) ? /*cast type int*/ id : id;
    return id;
  }

  processColumnListing(results: any[]): string[] {
    return results;
  }
}
