/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SchemaBuilder } from '../schema-builder';
export declare class PostgresSchemaBuilder extends SchemaBuilder {
    createDatabase(name: string): Promise<any>;
    dropDatabaseIfExists(name: string): Promise<any>;
    hasTable(table: string): Promise<boolean>;
    dropAllTables(): Promise<void>;
    dropAllViews(): Promise<void>;
    dropAllTypes(): Promise<void>;
    getAllTables(): Promise<any>;
    getAllViews(): Promise<any>;
    getAllTypes(): Promise<any>;
    getColumnListing(table: string): Promise<string[]>;
    protected parseSchemaAndTable(reference: string): any[];
    protected parseSearchPath(searchPath: string | any[]): string | any[];
}
