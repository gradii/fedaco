/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Processor } from '../processor';
import { QueryBuilder } from '../query-builder';
export declare class MysqlProcessor extends Processor {
    processColumnListing(results: any[]): any[];
    processInsertGetId(
        query: QueryBuilder,
        sql: string,
        values: any[],
        sequence?: string | null
    ): Promise<any>;
}
