/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Connection } from '../connection';
export declare class QueryExecuted {
    sql: string;
    bindings: any[];
    time: number;
    connection: Connection;
    connectionName: string;
    constructor(sql: string, bindings: any[], time: number | null, connection: Connection);
}
