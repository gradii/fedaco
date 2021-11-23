/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Connection as MysqlConnection } from 'mysql2';
import { WrappedConnection } from '../wrapped-connection';
import { MysqlWrappedStmt } from './mysql-wrapped-stmt';
export declare class MysqlWrappedConnection implements WrappedConnection {
    driver: MysqlConnection;
    lastError: string;
    constructor(driver: MysqlConnection);
    prepare(sql: string): Promise<MysqlWrappedStmt>;
    exec(sql: string): Promise<unknown>;
    execute(sql: string, bindings?: any[]): Promise<any>;
    lastInsertId(): Promise<number>;
    beginTransaction(): Promise<any>;
    commit(): Promise<any>;
    rollBack(): Promise<any>;
}
