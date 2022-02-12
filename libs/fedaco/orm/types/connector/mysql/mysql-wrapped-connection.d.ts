/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { WrappedConnection } from '../wrapped-connection';
import { MysqlWrappedStmt } from './mysql-wrapped-stmt';
export declare class MysqlWrappedConnection implements WrappedConnection {
    driver: import('mysql2').Connection;
    lastError: string;
    constructor(driver: import('mysql2').Connection);
    prepare(sql: string): Promise<MysqlWrappedStmt>;
    exec(sql: string): Promise<unknown>;
    execute(sql: string, bindings?: any[]): Promise<any>;
    lastInsertId(): Promise<number>;
    beginTransaction(): Promise<any>;
    commit(): Promise<any>;
    rollBack(): Promise<any>;
}
