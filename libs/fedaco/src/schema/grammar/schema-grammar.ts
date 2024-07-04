/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank, isBoolean, upperFirst } from '@gradii/nanofn';
import { BaseGrammar } from '../../base-grammar';
import type { Connection } from '../../connection';
import { RawExpression } from '../../query/ast/expression/raw-expression';
import { Blueprint } from '../blueprint';
import { ColumnDefinition } from '../column-definition';
import type { ForeignKeyDefinition } from '../foreign-key-definition';
// import { ChangeColumn } from './change-column';
// import { RenameColumn } from './rename-column';

export class SchemaGrammar extends BaseGrammar {

  protected modifiers: string[];

  /*If this Grammar supports schema changes wrapped in a transaction.*/
  protected transactions             = false;
  /**
   * The commands to be executed outside of create or alter command.
   */
  protected fluentCommands: string[] = [];

  public compileSqlCreateStatement(name: string, type?: string): string {
    throw new Error('not implemented');
  }

  public compileDbstatExists(): string {
    throw new Error('not implemented');
  }

  /*Compile a create database command.*/
  public compileCreateDatabase(name: string, connection: Connection): string {
    throw new Error('LogicException This database driver does not support creating databases.');
  }

  /*Compile a drop database if exists command.*/
  public compileDropDatabaseIfExists(name: string): string {
    throw new Error('LogicException This database driver does not support dropping databases.');
  }

  public compileTables(withSize?: boolean | string): string {
    throw new Error('LogicException This database driver does not support tables.');
  }

  public compileViews(database?: string): string {
    throw new Error('LogicException This database driver does not support views.');
  }

  public compileTypes(): string {
    throw new Error('LogicException This database driver does not support types.');
  }

  public compileColumns(database?: string, table?: string): string {
    throw new Error('LogicException This database driver does not support columns.');
  }

  public compileIndexes(database?: string, table?: string): string {
    throw new Error('LogicException This database driver does not support indexes.');
  }

  /*Compile a rename column command.*/
  public compileRenameColumn(blueprint: Blueprint, command: ColumnDefinition,
                             connection: Connection) {
    return `alter table ${
      this.wrapTable(blueprint)}
      rename column ${
        this.wrap(command.from)} to ${this.wrap(command.to)}`;
  }

  /*Compile a change column command into a series of SQL statements.*/
  public compileChange(blueprint: Blueprint, command: ColumnDefinition, connection: Connection) {
    throw new Error('LogicException This database driver does not support modifying columns.');
  }

  /**
   * Compile a fulltext index key command.
   *
   * @throws \RuntimeException
   */
  public compileFulltext(blueprint: Blueprint, command: ColumnDefinition) {
    throw new Error('RuntimeException This database driver does not support fulltext index creation.');
  }

  /**
   * Compile a drop fulltext index command.
   *
   * @return string
   *
   * @throws \RuntimeException
   */
  public compileDropFullText(blueprint: Blueprint, command: ColumnDefinition) {
    throw new Error('RuntimeException This database driver does not support fulltext index removal.');
  }

  /**
   * Compile a foreign key command.
   *
   * @return string
   */
  public compileForeign(blueprint: Blueprint, command: ForeignKeyDefinition) {
    // We need to prepare several of the elements of the foreign key definition
    // before we can create the SQL, such as wrapping the tables and convert
    // an array of columns to comma-delimited strings for the SQL queries.
    let sql = `alter table ${
      this.wrapTable(blueprint)
    } add constraint ${
        this.wrap(command.index)
      } `;

    // Once we have the initial portion of the SQL statement we will add on the
    // key name, table name, and referenced columns. These will complete the
    // main portion of the SQL statement and this SQL will almost be done.
    sql += `foreign key (${
      this.columnize(command.columns)
    }) references ${
      this.wrapTable(command.on)
    } (${
      this.columnize(command.references)
    })`;

    // Once we have the basic foreign key creation statement constructed we can
    // build out the syntax for what should happen on an update or delete of
    // the affected columns, which will get something like "cascade", etc.
    if (!isBlank(command.onDelete)) {
      sql += ` on delete ${command.onDelete}`;
    }

    if (!isBlank(command.onUpdate)) {
      sql += ` on update ${command.onUpdate}`;
    }

    return sql;
  }

  public compileDropForeign(blueprint: Blueprint, command: ForeignKeyDefinition) {
    throw new Error('RuntimeException This database driver does not support dropping foreign keys.');
  }

  /*Compile the blueprint's column definitions.*/
  protected getColumns(blueprint: Blueprint) {
    const columns = [];
    for (const column of blueprint.getAddedColumns()) {
      const sql = this.wrap(column.name) + ' ' + this.getType(column);
      columns.push(this.addModifiers(sql, blueprint, column));
    }
    return columns;
  }

  /*Get the SQL for the column data type.*/
  protected getType(column: ColumnDefinition) {
    const fn = 'type' + upperFirst(column.type);
    if (fn in this) {
      // @ts-ignore
      return this[fn](column);
    } else {
      throw new Error(`Must define [${fn}] in {this.constructor.name}`);
    }
  }

  /*Create the column definition for a generated, computed column type.*/
  protected typeComputed(column: ColumnDefinition) {
    throw new Error('RuntimeException This database driver does not support the computed type.');
  }

  /*Add the column modifiers to the definition.*/
  protected addModifiers(sql: string, blueprint: Blueprint, column: ColumnDefinition) {
    for (const modifier of this.modifiers) {
      const method = `modify${modifier}`;
      if (method in this) {
        // @ts-ignore
        sql += this[method](blueprint, column);
      }
    }
    return sql;
  }

  /*Get the primary key command if it exists on the blueprint.*/
  protected getCommandByName(blueprint: Blueprint, name: string) {
    const commands = this.getCommandsByName(blueprint, name);
    if (commands.length > 0) {
      return commands[0];
    }
  }

  /*Get all of the commands with a given name.*/
  protected getCommandsByName(blueprint: Blueprint, name: string) {
    return blueprint.getCommands().filter(value => {
      return value.name == name;
    });
  }

  protected hasCommand(blueprint: Blueprint, name: string) {
    for (const command of blueprint.getCommands()) {
      if (command.name === name) {
        return true;
      }
    }

    return false;
  }

  /*Add a prefix to an array of values.*/
  public prefixArray(prefix: string, values: any[]) {
    return values.map(value => {
      return prefix + ' ' + value;
    });
  }

  /*Wrap a table in keyword identifiers.*/
  public wrapTable(table: any): string {
    return super.wrapTable(table instanceof Blueprint ? table.getTable() : table);
  }

  /*Wrap a value in keyword identifiers.*/
  public wrap(value: ColumnDefinition | RawExpression | string, prefixAlias = false): string {
    return super.wrap(value instanceof ColumnDefinition ?
        value.name : value,
      prefixAlias);
  }

  /*Format a value so that it can be used in "default" clauses.*/
  protected getDefaultValue(value: any) {
    if (value instanceof RawExpression) {
      return value.value;
    }
    return isBoolean(value) ?
      `'${/*cast type int*/ value ? 1 : 0}'` : `'${/*cast type string*/ value}'`;
  }

  /**
   * Get the fluent commands for the grammar.
   */
  public getFluentCommands() {
    return this.fluentCommands;
  }

  /*Check if this Grammar supports schema changes wrapped in a transaction.*/
  public supportsSchemaTransactions() {
    return this.transactions;
  }

  public compileForeignKeys(schema?: string, table?: string): string {
    throw new Error('not implemented');
  }

  public compileEnableForeignKeyConstraints(): string {
    throw new Error(
      'LogicException This database driver does not support enable foreign key constraints.');
  }

  public compileDisableForeignKeyConstraints(): string {
    throw new Error(
      'LogicException This database driver does not support disable foreign key constraints.');
  }

  public compileEnableWriteableSchema(): string {
    throw new Error('not implement');
  }

  public compileDisableWriteableSchema(): string {
    throw new Error('not implement');
  }

  public compileRebuild(): string {
    throw new Error('not implement');
  }

  public compileDropAllForeignKeys(): string {
    throw new Error('not implement');
  }

  public compileDropAllTables(tables?: string[]): string {
    throw new Error('not implement');
  }

  public compileDropAllViews(views?: string[]): string {
    throw new Error('not implement');
  }

  /**
   *
   */
  public compileDropAllTypes(...args: any[]): string {
    throw new Error('not implement');
  }

  public compileDefaultSchema(): string {
    throw new Error('not implemented');
  }


  //
  //  public compileGetAllTypes(): string {
  //    throw new Error('not implement');
  //  }
  //
  //
  /*Split the given JSON selector into the field and the optional path and wrap them separately.*/
  protected wrapJsonFieldAndPath(column: string) {
    const parts = column.split('.');
    const field = this.wrap(parts[0]);
    const path  = parts.length > 1 ? ', ' + this.wrapJsonPath(parts[1], '.') : '';
    return [field, path];
  }

  /*Wrap the given JSON path.*/
  protected wrapJsonPath(value: string, delimiter = '->') {
    value          = value.replace(/([\\]+)?'/, `''`);
    const jsonPath = value.split(delimiter)
      .map(segment => this.wrapJsonPathSegment(segment))
      .join('.');
    return `'$${jsonPath.startsWith('[') ? '' : '.'}${jsonPath}'`;
  }

  protected wrapJsonPathSegment(segment: string) {
    const parts = /(\[[^\]]+\])+$/g.exec(segment);
    if (parts) {
      let key;
      if (parts[0] === '') {
        key = segment;
      } else {
        const pos = segment.indexOf(parts[0]);

        if (pos !== -1) {
          key = segment.substring(0, pos);
        } else {
          key = segment;
        }
      }

      if (key) {
        return `"${key}"${parts[0]}`;
      }

      return parts[0];
    }

    return `"${segment}"`;
  }

  //
  //  /*Create an empty Doctrine DBAL TableDiff from the Blueprint.*/
  //  public async getTableDiff(blueprint: Blueprint, schema: SchemaBuilder) {
  //    const table     = this.getTablePrefix() + blueprint.getTable();
  //    const fromTable = await schema.listTableDetails(table);
  //    return tap(tableDiff => {
  //      tableDiff.fromTable = fromTable;
  //    }, new DbalTableDiff(table));
  //  }
  //
  //
  //  getListDatabasesSQL(): string {
  //    throw new Error('not implement');
  //  }
  //
  //  getListNamespacesSQL(): string {
  //    throw new Error('not implement');
  //  }
  //
  //  getListSequencesSQL(database: string): string {
  //    throw new Error('not implement');
  //  }
  //
  //  getListTableColumnsSQL(table: string, database: string): string {
  //    throw new Error('not implement');
  //  }
  //
  //  getListTableIndexesSQL(table: string, database: string): string {
  //    throw new Error('not implement');
  //  }
  //
  //  getListTableForeignKeysSQL(table: string, database?: string): string {
  //    throw new Error('not implement');
  //  }
  //
  //  getListTablesSQL(): string {
  //    throw new Error('not implement');
  //  }
  //
  //  /*Quotes a literal string.
  // This method is NOT meant to fix SQL injections!
  // It is only meant to escape this platform's string literal
  // quote character inside the given literal string.*/
  //  public quoteStringLiteral(str: string) {
  //    const c = this.getStringLiteralQuoteCharacter();
  //    return c + str.replace(new RegExp(c, 'g'), c + c) + c;
  //  }
  //
  //  /*Gets the character used for string literal quoting.*/
  //  public getStringLiteralQuoteCharacter() {
  //    return '\'';
  //  }
  //
  //
  //  /*Get the ColumnDefinition commands for the grammar.*/
  //  public getColumnDefinitionCommands() {
  //    return this.ColumnDefinitionCommands;
  //  }
  //
  //
  //  public supportsForeignKeyConstraints() {
  //    return false;
  //  }
  //
  //  public getTypeMapping(type: string) {
  //    return type;
  //  }

  public escapeNames(names: string[]): string[] {
    throw new Error('not implemented');
  }
}
