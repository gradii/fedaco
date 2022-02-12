/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { WrappedStmt } from '../wrapped-stmt';
export declare class SqliteWrappedStmt implements WrappedStmt {
    driverStmt: import('sqlite3').Statement;
    private _bindingValues;
    _lastInsertId: number;
    _affectRows: number;
    constructor(driverStmt: import('sqlite3').Statement);
    bindValues(bindings: any[]): this;
    execute(bindings?: any[]): Promise<unknown>;
    fetchAll(bindings?: any[]): Promise<unknown>;
    lastInsertId(): number;
    affectCount(): number;
    close(): void;
    bindValue(): this;
}
