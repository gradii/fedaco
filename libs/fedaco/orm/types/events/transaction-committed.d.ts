/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Connection } from '../connection';
import { ConnectionEvent } from './connection-event';
export declare class TransactionCommitted extends ConnectionEvent {
    constructor(connection: Connection);
}
