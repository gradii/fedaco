/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { QueryBuilder } from './query-builder';
/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export interface ProcessorInterface {
    processSelect(queryBuilder: QueryBuilder, results: any): Promise<any>;
    processInsertGetId(query: QueryBuilder, sql: string, values: any[], sequence?: string): Promise<number>;
}
