/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SchemaBuilder } from '../schema-builder';
export declare class SqlServerSchemaBuilder extends SchemaBuilder {
    createDatabase(name: string): Promise<any>;
    dropDatabaseIfExists(name: string): Promise<any>;
    dropAllTables(): void;
    dropAllViews(): void;
}
