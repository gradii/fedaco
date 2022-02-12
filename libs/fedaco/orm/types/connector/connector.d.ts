/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { WrappedConnection } from './wrapped-connection';

export declare class Connector {
    protected options: any;
    createConnection(
        dsn: string,
        config: any,
        options: any
    ): Promise<WrappedConnection>;
    protected createPdoConnection(
        dsn: string,
        username: string,
        password: string,
        options: any[]
    ): Promise<any>;
    protected isPersistentConnection(options: any[]): void;
    protected tryAgainIfCausedByLostConnection(
        e: any,
        dsn: string,
        username: string,
        password: string,
        options: any[]
    ): Promise<any>;
    getOptions(config: any): any;
    getDefaultOptions(): any;
    setDefaultOptions(options: any[]): void;
}
