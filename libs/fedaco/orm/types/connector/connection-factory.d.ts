/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { MysqlConnector } from './mysql/mysql-connector';
import { SqliteConnector } from './sqlite/sqlite-connector';
export declare class ConnectionFactory {
    make(config: any, name?: string | null): any;
    protected parseConfig(config: any, name: string): any;
    protected createSingleConnection(config: any): any;
    protected createReadWriteConnection(config: any[]): any;
    protected createReadPdo(config: any[]): () => Promise<any>;
    protected getReadConfig(config: any[]): any[];
    protected getWriteConfig(config: any[]): any[];
    protected getReadWriteConfig(config: any, type: string): any;
    protected mergeReadWriteConfig(config: any[], merge: any[]): any[];
    protected createPdoResolver(config: any): () => Promise<any>;
    protected createPdoResolverWithHosts(config: any): () => Promise<any>;
    protected parseHosts(config: any): any[];
    protected createPdoResolverWithoutHosts(config: any[]): () => Promise<any>;
    createConnector(config: any): SqliteConnector | MysqlConnector;
    protected createConnection(driver: string, connection: Function, database: string, prefix?: string, config?: any[]): any;
}
