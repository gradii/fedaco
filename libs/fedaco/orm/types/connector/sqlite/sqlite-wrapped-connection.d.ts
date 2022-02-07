/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Database } from 'sqlite3';
import { WrappedConnection } from '../wrapped-connection';
import { SqliteWrappedStmt } from './sqlite-wrapped-stmt';
export declare class SqliteWrappedConnection implements WrappedConnection {
    driver: Database;
    constructor(driver: Database);
    execute(sql: string, bindings?: any[]): Promise<void>;
    prepare(sql: string): Promise<SqliteWrappedStmt>;
    lastInsertId(): Promise<number>;
    beginTransaction(): Promise<any>;
    commit(): Promise<any>;
    rollBack(): Promise<any>;
}
