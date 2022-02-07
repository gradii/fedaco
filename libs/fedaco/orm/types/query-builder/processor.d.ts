/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { ProcessorInterface } from './processor-interface';
import { QueryBuilder } from './query-builder';
export declare class Processor implements ProcessorInterface {
    processSelect(queryBuilder: QueryBuilder, results: any | any[]): any;
    processInsertGetId(query: QueryBuilder, sql: string, values: any[], sequence?: string | null): Promise<any>;
    processColumnListing(results: any[]): string[];
}
