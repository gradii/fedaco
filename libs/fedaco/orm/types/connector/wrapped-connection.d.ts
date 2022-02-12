/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { WrappedStmt } from './wrapped-stmt';

export interface WrappedConnection {
    prepare(sql: string): Promise<WrappedStmt>;
    execute(sql: string, bindings?: any[]): Promise<any>;
    lastInsertId(): Promise<number>;
    commit(): Promise<any>;
    beginTransaction(): Promise<any>;
    rollBack(): Promise<any>;
}
