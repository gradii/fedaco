/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Connection } from '../../connection';
import { Blueprint } from '../blueprint';
import { ColumnDefinition } from '../column-definition';
import { SchemaGrammar } from './schema-grammar';
export declare class PostgresSchemaGrammar extends SchemaGrammar {
    protected transactions: boolean;
    protected modifiers: string[];
    protected serials: string[];
    protected fluentCommands: string[];
    protected ColumnDefinitionCommands: string[];
    compileCreateDatabase(name: string, connection: Connection): string;
    compileDropDatabaseIfExists(name: string): string;
    compileTableExists(): string;
    compileColumnListing(): string;
    compileCreate(blueprint: Blueprint, command: ColumnDefinition): string[];
    compileAdd(blueprint: Blueprint, command: ColumnDefinition): string[];
    compileAutoIncrementStartingValues(blueprint: Blueprint): string[];
    compilePrimary(blueprint: Blueprint, command: ColumnDefinition): string;
    compileUnique(blueprint: Blueprint, command: ColumnDefinition): string;
    compileIndex(blueprint: Blueprint, command: ColumnDefinition): string;
    compileSpatialIndex(
        blueprint: Blueprint,
        command: ColumnDefinition
    ): string;
    compileForeign(blueprint: Blueprint, command: ColumnDefinition): string;
    compileDrop(blueprint: Blueprint, command: ColumnDefinition): string;
    compileDropIfExists(
        blueprint: Blueprint,
        command: ColumnDefinition
    ): string;
    compileDropAllTables(tables: any[]): string;
    compileDropAllViews(views: any[]): string;
    compileDropAllTypes(types: any[]): string;
    compileGetAllTables(searchPath: string[]): string;
    compileGetAllViews(searchPath: string[]): string;
    compileGetAllTypes(): string;
    compileDropColumn(blueprint: Blueprint, command: ColumnDefinition): string;
    compileDropPrimary(blueprint: Blueprint, command: ColumnDefinition): string;
    compileDropUnique(blueprint: Blueprint, command: ColumnDefinition): string;
    compileDropIndex(blueprint: Blueprint, command: ColumnDefinition): string;
    compileDropSpatialIndex(
        blueprint: Blueprint,
        command: ColumnDefinition
    ): string;
    compileDropForeign(blueprint: Blueprint, command: ColumnDefinition): string;
    compileRename(blueprint: Blueprint, command: ColumnDefinition): string;
    compileRenameIndex(blueprint: Blueprint, command: ColumnDefinition): string;
    compileEnableForeignKeyConstraints(): string;
    compileDisableForeignKeyConstraints(): string;

    compileComment(blueprint: Blueprint, command: ColumnDefinition): string;
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
    protected generatableColumn(type: string, column: ColumnDefinition): string;
    protected typeFloat(column: ColumnDefinition): string;
    protected typeDouble(column: ColumnDefinition): string;
    protected typeReal(column: ColumnDefinition): string;
    protected typeDecimal(column: ColumnDefinition): string;
    protected typeBoolean(column: ColumnDefinition): string;
    protected typeEnum(column: ColumnDefinition): string;
    protected typeJson(column: ColumnDefinition): string;
    protected typeJsonb(column: ColumnDefinition): string;
    protected typeDate(column: ColumnDefinition): string;
    protected typeDateTime(column: ColumnDefinition): string;
    protected typeDateTimeTz(column: ColumnDefinition): string;
    protected typeTime(column: ColumnDefinition): string;
    protected typeTimeTz(column: ColumnDefinition): string;
    protected typeTimestamp(column: ColumnDefinition): string;
    protected typeTimestampTz(column: ColumnDefinition): string;
    protected typeYear(column: ColumnDefinition): string;
    protected typeBinary(column: ColumnDefinition): string;
    protected typeUuid(column: ColumnDefinition): string;
    protected typeIpAddress(column: ColumnDefinition): string;
    protected typeMacAddress(column: ColumnDefinition): string;
    protected typeGeometry(column: ColumnDefinition): string;
    protected typePoint(column: ColumnDefinition): string;
    protected typeLineString(column: ColumnDefinition): string;
    protected typePolygon(column: ColumnDefinition): string;
    protected typeGeometryCollection(column: ColumnDefinition): string;
    protected typeMultiPoint(column: ColumnDefinition): string;
    typeMultiLineString(column: ColumnDefinition): string;
    protected typeMultiPolygon(column: ColumnDefinition): string;
    protected typeMultiPolygonZ(column: ColumnDefinition): string;
    private formatPostGisType;
    protected modifyCollate(
        blueprint: Blueprint,
        column: ColumnDefinition
    ): string;
    protected modifyNullable(
        blueprint: Blueprint,
        column: ColumnDefinition
    ): ' null' | ' not null';
    protected modifyDefault(
        blueprint: Blueprint,
        column: ColumnDefinition
    ): string;
    protected modifyIncrement(
        blueprint: Blueprint,
        column: ColumnDefinition
    ): '' | ' primary key';
    protected modifyVirtualAs(
        blueprint: Blueprint,
        column: ColumnDefinition
    ): string;
    protected modifyStoredAs(
        blueprint: Blueprint,
        column: ColumnDefinition
    ): string;
}
