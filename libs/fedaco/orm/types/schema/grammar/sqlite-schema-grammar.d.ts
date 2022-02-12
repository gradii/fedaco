/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Connection } from '../../connection';
import { Blueprint } from '../blueprint';
import { ColumnDefinition } from '../column-definition';
import { ForeignKeyDefinition } from '../foreign-key-definition';
import { SchemaGrammar } from './schema-grammar';
export declare class SqliteSchemaGrammar extends SchemaGrammar {
    protected modifiers: string[];
    protected serials: string[];
    compileTableExists(): string;
    compileColumnListing(table: string): string;
    compileCreate(blueprint: Blueprint, command: ColumnDefinition): string;
    protected addForeignKeys(blueprint: Blueprint): any;
    protected getForeignKey(foreign: ForeignKeyDefinition): string;
    protected addPrimaryKeys(blueprint: Blueprint): string;
    compileAdd(blueprint: Blueprint, command: ColumnDefinition): string[];
    compileUnique(blueprint: Blueprint, command: ColumnDefinition): string;
    compileIndex(blueprint: Blueprint, command: ColumnDefinition): string;
    compileSpatialIndex(blueprint: Blueprint, command: ColumnDefinition): void;
    compileForeign(blueprint: Blueprint, command: ColumnDefinition): string;
    compileDrop(blueprint: Blueprint, command: ColumnDefinition): string;
    compileDropIfExists(
        blueprint: Blueprint,
        command: ColumnDefinition
    ): string;
    compileDropAllTables(): string;
    compileDropAllViews(): string;
    compileRebuild(): string;
    compileDropColumn(
        blueprint: Blueprint,
        command: ColumnDefinition,
        connection: Connection
    ): Promise<string>;
    compileDropUnique(blueprint: Blueprint, command: ColumnDefinition): string;
    compileDropIndex(blueprint: Blueprint, command: ColumnDefinition): string;
    compilePrimary(blueprint: Blueprint, command: ColumnDefinition): string;
    compileDropSpatialIndex(
        blueprint: Blueprint,
        command: ColumnDefinition
    ): void;
    compileRename(blueprint: Blueprint, command: ColumnDefinition): string;
    compileRenameIndex(
        blueprint: Blueprint,
        command: ColumnDefinition,
        connection: Connection
    ): void;
    compileEnableForeignKeyConstraints(): string;
    compileDisableForeignKeyConstraints(): string;
    compileEnableWriteableSchema(): string;
    compileDisableWriteableSchema(): string;
    protected typeChar(column: ColumnDefinition): string;
    protected typeString(column: ColumnDefinition): string;
    protected typeTinyText(column: ColumnDefinition): string;
    protected typeText(column: ColumnDefinition): string;
    protected typeMediumText(column: ColumnDefinition): string;
    protected typeLongText(column: ColumnDefinition): string;
    protected typeInteger(column: ColumnDefinition): string;
    protected typeBigInteger(column: ColumnDefinition): string;
    protected typeMediumInteger(column: ColumnDefinition): string;
    protected typeTinyInteger(column: ColumnDefinition): string;
    protected typeSmallInteger(column: ColumnDefinition): string;
    protected typeFloat(column: ColumnDefinition): string;
    protected typeDouble(column: ColumnDefinition): string;
    protected typeDecimal(column: ColumnDefinition): string;
    protected typeBoolean(column: ColumnDefinition): string;
    protected typeEnum(column: ColumnDefinition): string;
    protected typeJson(column: ColumnDefinition): string;
    protected typeJsonb(column: ColumnDefinition): string;
    protected typeDate(column: ColumnDefinition): string;
    protected typeDateTime(
        column: ColumnDefinition
    ): 'datetime' | 'datetime default CURRENT_TIMESTAMP';
    protected typeDateTimeTz(
        column: ColumnDefinition
    ): 'datetime' | 'datetime default CURRENT_TIMESTAMP';
    protected typeTime(column: ColumnDefinition): string;
    protected typeTimeTz(column: ColumnDefinition): string;
    protected typeTimestamp(
        column: ColumnDefinition
    ): 'datetime' | 'datetime default CURRENT_TIMESTAMP';
    protected typeTimestampTz(
        column: ColumnDefinition
    ): 'datetime' | 'datetime default CURRENT_TIMESTAMP';
    protected typeYear(column: ColumnDefinition): string;
    protected typeBinary(column: ColumnDefinition): string;
    protected typeUuid(column: ColumnDefinition): string;
    protected typeIpAddress(column: ColumnDefinition): string;
    protected typeMacAddress(column: ColumnDefinition): string;
    typeGeometry(column: ColumnDefinition): string;
    typePoint(column: ColumnDefinition): string;
    typeLineString(column: ColumnDefinition): string;
    typePolygon(column: ColumnDefinition): string;
    typeGeometryCollection(column: ColumnDefinition): string;
    typeMultiPoint(column: ColumnDefinition): string;
    typeMultiLineString(column: ColumnDefinition): string;
    typeMultiPolygon(column: ColumnDefinition): string;
    protected typeComputed(column: ColumnDefinition): void;
    protected modifyVirtualAs(
        blueprint: Blueprint,
        column: ColumnDefinition
    ): string;
    protected modifyStoredAs(
        blueprint: Blueprint,
        column: ColumnDefinition
    ): string;
    protected modifyNullable(
        blueprint: Blueprint,
        column: ColumnDefinition
    ): '' | ' not null';
    protected modifyDefault(
        blueprint: Blueprint,
        column: ColumnDefinition
    ): string;
    protected modifyIncrement(
        blueprint: Blueprint,
        column: ColumnDefinition
    ): '' | ' primary key autoincrement';
    protected wrapJsonSelector(value: string): string;
    getListTableColumnsSQL(table: string, database: string): string;
    getListTableIndexesSQL(table: string, database: string): string;
    getListTableForeignKeysSQL(table: string, database?: string): string;
    getListTablesSQL(): string;
    getAlterTableSQL(tableDiff: any): string;
}
