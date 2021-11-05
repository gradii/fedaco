/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export declare class Connector {
    protected options: any;
    createConnection(dsn: string, config: any, options: any): void;
    protected createPdoConnection(dsn: string, username: string, password: string, options: any[]): void;
    protected isPersistentConnection(options: any[]): void;
    protected tryAgainIfCausedByLostConnection(e: any, dsn: string, username: string, password: string, options: any[]): void;
    getOptions(config: any): any;
    getDefaultOptions(): any;
    setDefaultOptions(options: any[]): void;
}
