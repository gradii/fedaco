/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { WrappedConnection } from '../wrapped-connection';
import { SqliteWrappedStmt } from './sqlite-wrapped-stmt';
export declare class SqliteWrappedConnection implements WrappedConnection {
    driver: import('sqlite3').Database;
    constructor(driver: import('sqlite3').Database);
    execute(sql: string, bindings?: any[]): Promise<void>;
    prepare(sql: string): Promise<SqliteWrappedStmt>;
    lastInsertId(): Promise<number>;
    beginTransaction(): Promise<any>;
    commit(): Promise<any>;
    rollBack(): Promise<any>;
}
