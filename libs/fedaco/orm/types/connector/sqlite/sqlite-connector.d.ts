/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Connector } from '../connector';
import { ConnectorInterface } from '../connector-interface';
export declare class SqliteConnector extends Connector implements ConnectorInterface {
    connect(config: any): Promise<unknown>;
    createConnection(database: string, config: any, options: any): Promise<unknown>;
}
