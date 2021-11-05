/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { DatabaseTransactionRecord } from './database-transaction-record';
export declare class DatabaseTransactionsManager {
    protected transactions: DatabaseTransactionRecord[];
    constructor();
    begin(connection: string, level: number): void;
    rollback(connection: string, level: number): void;
    commit(connection: string): Promise<void>;
    addCallback(callback: Function): void;
    getTransactions(): DatabaseTransactionRecord[];
}
