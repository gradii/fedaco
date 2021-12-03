/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Connection } from '../connection';
export declare class SchemaDumped {
    connection: Connection;
    connectionName: string;
    path: string;
    constructor(connection: Connection, path: string);
}