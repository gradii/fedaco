/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Connection } from '../connection';
export declare class ConnectionEvent {
    connectionName: string;
    connection: Connection;
    constructor(connection: Connection);
}
