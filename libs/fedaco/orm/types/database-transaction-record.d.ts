/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export declare class DatabaseTransactionRecord {
    connection: string;
    level: number;
    protected callbacks: any[];
    constructor(connection: string, level: number);
    addCallback(callback: Function): void;
    executeCallbacks(): Promise<void>;
    getCallbacks(): any[];
}
