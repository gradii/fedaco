/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import type { Connection } from 'mysql2';
import { WrappedStmt } from '../wrapped-stmt';
export declare class MysqlWrappedStmt implements WrappedStmt {
    driverConnection: Connection;
    sqlStmt: string;
    private _bindingValues;
    _lastInsertId: number;
    _affectRows: number;
    constructor(driverConnection: Connection, sqlStmt: string);
    bindValues(bindings: any[]): this;
    execute(bindings?: any[]): Promise<unknown>;
    fetchAll(bindings?: any[]): Promise<unknown>;
    lastInsertId(): number;
    affectCount(): number;
    close(): void;
    bindValue(): this;
}
