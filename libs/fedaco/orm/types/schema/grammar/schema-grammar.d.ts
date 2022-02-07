/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { BaseGrammar } from '../../base-grammar';
import { Connection } from '../../connection';
import { TableDiff } from '../../dbal/table-diff';
import { RawExpression } from '../../query/ast/expression/raw-expression';
import { Blueprint } from '../blueprint';
import { ColumnDefinition } from '../column-definition';
import { ForeignKeyDefinition } from '../foreign-key-definition';
import { SchemaBuilder } from '../schema-builder';
export declare class SchemaGrammar extends BaseGrammar {
    protected modifiers: string[];
    protected transactions: boolean;
    /**
     * The commands to be executed outside of create or alter command.
     */
    protected fluentCommands: string[];
    protected ColumnDefinitionCommands: any[];
    compileCreateDatabase(name: string, connection: Connection): string;
    compileDropDatabaseIfExists(name: string): string;
    compileEnableForeignKeyConstraints(): string;
    compileDisableForeignKeyConstraints(): string;
    compileColumnListing(table?: string): string;
    compileTableExists(): string;
    compileEnableWriteableSchema(): string;
    compileDisableWriteableSchema(): string;
    compileRebuild(): string;
    compileDropAllForeignKeys(): string;
    compileDropAllTables(tables?: string[]): string;
    compileDropAllViews(views?: string[]): string;
    compileGetAllTables(...args: any[]): string;
    compileGetAllViews(...args: any[]): string;
    compileDropAllTypes(...args: any[]): string;
    compileGetAllTypes(): string;
    compileRenameColumn(blueprint: Blueprint, command: ColumnDefinition, connection: Connection): void;
    compileChange(blueprint: Blueprint, command: ColumnDefinition, connection: Connection): void;
    compileForeign(blueprint: Blueprint, command: ForeignKeyDefinition): string;
    protected getColumns(blueprint: Blueprint): string[];
    protected getType(column: ColumnDefinition): any;
    protected typeComputed(column: ColumnDefinition): void;
    protected addModifiers(sql: string, blueprint: Blueprint, column: ColumnDefinition): string;
    protected getCommandByName(blueprint: Blueprint, name: string): any;
    protected getCommandsByName(blueprint: Blueprint, name: string): any[];
    prefixArray(prefix: string, values: any[]): string[];
    wrapTable(table: any): string | number | boolean | void;
    protected wrapJsonFieldAndPath(column: string): (string | number | boolean | void)[];
    protected wrapJsonPath(value: string, delimiter?: string): string;
    wrap(value: RawExpression | string, prefixAlias?: boolean): string | number | boolean | void;
    protected getDefaultValue(value: any): string | number | boolean;
    getTableDiff(blueprint: Blueprint, schema: SchemaBuilder): Promise<TableDiff>;
    getListDatabasesSQL(): string;
    getListNamespacesSQL(): string;
    getListSequencesSQL(database: string): string;
    getListTableColumnsSQL(table: string, database: string): string;
    getListTableIndexesSQL(table: string, database: string): string;
    getListTableForeignKeysSQL(table: string, database?: string): string;
    getListTablesSQL(): string;
    quoteStringLiteral(str: string): string;
    getStringLiteralQuoteCharacter(): string;
    /**
     * Get the fluent commands for the grammar.
     */
    getFluentCommands(): string[];
    getColumnDefinitionCommands(): any[];
    supportsSchemaTransactions(): boolean;
    supportsForeignKeyConstraints(): boolean;
    getTypeMapping(type: string): string;
}
