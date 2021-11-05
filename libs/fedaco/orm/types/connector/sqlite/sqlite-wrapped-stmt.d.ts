/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Statement } from 'sqlite3';
import { WrappedStmt } from '../wrapped-stmt';
export declare class SqliteWrappedStmt implements WrappedStmt {
    driverStmt: Statement;
    private _bindingValues;
    _lastInsertId: number;
    _affectRows: number;
    constructor(driverStmt: Statement);
    bindValues(bindings: any[]): this;
    execute(bindings?: any[]): Promise<unknown>;
    fetchAll(bindings?: any[]): Promise<unknown>;
    lastInsertId(): number;
    affectCount(): number;
    close(): void;
    bindValue(): this;
}
