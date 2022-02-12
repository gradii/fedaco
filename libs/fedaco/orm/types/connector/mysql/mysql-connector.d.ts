/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Connector } from '../connector';
import { ConnectorInterface } from '../connector-interface';
import { MysqlWrappedConnection } from './mysql-wrapped-connection';
export declare class MysqlConnector
    extends Connector
    implements ConnectorInterface
{
    connect(config: any): Promise<MysqlWrappedConnection>;
    createConnection(
        database: string,
        config: any,
        options: any
    ): Promise<MysqlWrappedConnection>;
    protected configureIsolationLevel(connection: any, config: any): void;
    protected configureEncoding(connection: any, config: any): any;
    protected getCollation(config: any): string;
    protected configureTimezone(
        connection: MysqlWrappedConnection,
        config: any
    ): Promise<void>;
    protected getDsn(config: any[]): string;
    protected hasSocket(config: any): any;
    protected getSocketDsn(config: any): string;
    protected getHostDsn(config: any): string;
    protected setModes(connection: any, config: any): void;
    protected setCustomModes(connection: any, config: any): void;
    protected strictMode(
        connection: any,
        config: any
    ):
        | "set session sql_mode='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'"
        | "set session sql_mode='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION'";
}
