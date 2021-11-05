/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Column } from '../../dbal/column';
import { SchemaBuilder } from '../schema-builder';
export declare class SqliteSchemaBuilder extends SchemaBuilder {
    #private;
    createDatabase(name: string): void;
    dropDatabaseIfExists(name: string): true | void;
    dropAllTables(): void;
    dropAllViews(): void;
    refreshDatabaseFile(): void;
    protected _getPortableTableColumnDefinition(tableColumn: any): Column;
    listTableDetails(tableName: string): Promise<import("@gradii/fedaco/src/dbal/table").Table>;
}
