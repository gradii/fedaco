/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Connector } from './connector';
import { ConnectorInterface } from './connector-interface';
import { WrappedConnection } from './wrapped-connection';
export declare class SqlServerConnector extends Connector implements ConnectorInterface {
    protected options: any;
    connect(config: any[]): Promise<WrappedConnection>;
    protected getDsn(config: any): string;
}
