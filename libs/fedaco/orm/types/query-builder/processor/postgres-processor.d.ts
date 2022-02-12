/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Processor } from '../processor';
import { QueryBuilder } from '../query-builder';
export declare class PostgresProcessor extends Processor {
    processInsertGetId(
        query: QueryBuilder,
        sql: string,
        values: any[],
        sequence?: string
    ): Promise<any>;
    processColumnListing(results: any[]): any[];
}
