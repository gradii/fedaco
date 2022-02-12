/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Connection } from '../../connection';
import { Processor } from '../processor';
import { QueryBuilder } from '../query-builder';
export declare class SqlServerProcessor extends Processor {
    processInsertGetId(
        query: QueryBuilder,
        sql: string,
        values: any[],
        sequence?: string | null
    ): Promise<any>;
    protected processInsertGetIdForOdbc(connection: Connection): Promise<any>;
    processColumnListing(results: any[]): any[];
}
