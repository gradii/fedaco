/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Connection } from './connection';
import { ConnectionFactory } from './connector/connection-factory';
import { ConnectionConfig } from './database-config';
import { ConnectionResolverInterface } from './interface/connection-resolver-interface';
export declare class DatabaseManager implements ConnectionResolverInterface {
    protected factory: ConnectionFactory;
    protected connections: any;
    protected reconnector: Function;
    constructor(factory: ConnectionFactory);
    connection(name?: string): Connection;
    protected parseConnectionName(name: string): string[];
    protected makeConnection(name: string): any;
    protected configuration(name: string): ConnectionConfig;
    protected configure(connection: Connection, type: string): Connection;
    protected setPdoForType(connection: Connection, type?: string | null): void;
    purge(name?: string | null): void;
    disconnect(name?: string | null): void;
    reconnect(name?: string | null): void;
    usingConnection(name: string, callback: Function): void;
    protected refreshPdoConnections(name: string): void;
    getDefaultConnection(): string;
    setDefaultConnection(name: string): void;
    supportedDrivers(): void;
    availableDrivers(): void;
    extend(name: string, resolver: Function): void;
    getConnections(): any;
    setReconnector(reconnector: Function): void;
}
