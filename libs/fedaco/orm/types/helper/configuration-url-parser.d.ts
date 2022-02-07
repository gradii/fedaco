import { ConnectionConfig } from '../database-config';
export declare class ConfigurationUrlParser {
    protected static driverAliases: any;
    parseConfiguration(config: ConnectionConfig | string): any;
    protected getPrimaryOptions(url: any): import("ramda").Dictionary<any>;
    protected getDriver(url: any): any;
    protected getDatabase(url: any): any;
    protected getQueryOptions(url: any): any;
    protected parseUrl(url: string): URL;
    protected parseStringsToNativeTypes(value: Record<string, string | any>): Record<string, any> | any;
    static getDriverAliases(): any;
    static addDriverAlias(alias: string, driver: string): void;
}
