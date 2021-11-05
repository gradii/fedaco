/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SchemaBuilder } from '../schema-builder';
export declare class MysqlSchemaBuilder extends SchemaBuilder {
    createDatabase(name: string): Promise<any>;
    dropDatabaseIfExists(name: string): Promise<any>;
    hasTable(table: string): Promise<boolean>;
    getColumnListing(table: string): Promise<string[]>;
    dropAllTables(): Promise<void>;
    dropAllViews(): Promise<void>;
    getAllTables(): Promise<any>;
    getAllViews(): Promise<any>;
}
