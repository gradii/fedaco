/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Connection } from './connection';
import { DatabaseManager } from './database-manager';
import { QueryBuilder } from './query-builder/query-builder';
export declare type ConnectionConfig = {
    database?: string;
    name?: string;
    driver?: string;
    url?: string;
    username?: string;
    password?: string;
};
export declare class DatabaseConfig {
    config: {
        database: {
            fetch?: number;
            default?: string;
            connections: {
                [key: string]: ConnectionConfig;
            };
        };
    };
    protected manager: DatabaseManager;
    protected static instance: DatabaseConfig;
    constructor();
    protected setupManager(): void;
    static connection(connection?: string | null): Connection;
    /**
     * Make this capsule instance available globally.
     */
    setAsGlobal(): void;
    static table(table: Function | QueryBuilder | string, as?: string | null, connection?: string | null): QueryBuilder;
    static schema(connection?: string | null): import("@gradii/fedaco").SchemaBuilder;
    getConnection(name?: string | null): Connection;
    addConnection(config: any, name?: string): void;
    bootFedaco(): void;
    getDatabaseManager(): DatabaseManager;
}
