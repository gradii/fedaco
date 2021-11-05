/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Connection } from '../connection';
export declare class StatementPrepared {
    connection: Connection;
    statement: any;
    constructor(connection: Connection, statement: any);
}
