/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { QueryBuilder } from './query-builder';

export interface ProcessorInterface {
  processSelect(queryBuilder: QueryBuilder, results: any): Promise<any>;

  processInsertGetId(query: QueryBuilder, sql: string, values: any[], sequence?: string): Promise<number>;
}
