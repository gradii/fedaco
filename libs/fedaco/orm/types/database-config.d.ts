import { DatabaseManager } from './database-manager';
import { ConnectionInterface } from './query-builder/connection-interface';
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
    static connection(connection?: string | null): ConnectionInterface;
    /**
     * Make this capsule instance available globally.
     */
    setAsGlobal(): void;
    static table(table: Function | QueryBuilder | string, as?: string | null, connection?: string | null): QueryBuilder;
    static schema(connection?: string | null): import("@gradii/fedaco").SchemaBuilder;
    getConnection(name?: string | null): ConnectionInterface;
    addConnection(config: any, name?: string): void;
    bootFedaco(): void;
    getDatabaseManager(): DatabaseManager;
}
