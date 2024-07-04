/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import * as fs from 'fs';
import { SchemaBuilder } from '../schema-builder';

export class SqliteSchemaBuilder extends SchemaBuilder {
  /*Create a database in the schema.*/
  public createDatabase(name: string) {
    fs.writeFileSync(name, '');
  }

  /*Drop a database from the schema if the database exists.*/
  public dropDatabaseIfExists(name: string) {
    return fs.existsSync(name) ? fs.rmSync(name) : true;
  }

  /**
   * Get the tables for the database.
   *
   * @param  withSize
   * @return array
   */
  public async getTables(withSize = true) {
    if (withSize) {
      try {
        withSize = await this.connection.scalar(this.grammar.compileDbstatExists()) as boolean;
      } catch (e) {
        withSize = false;
      }
    }

    return this.connection.getPostProcessor().processTables(
      await this.connection.selectFromWriteConnection(this.grammar.compileTables(withSize))
    );
  }

  /**
   * Get the columns for a given table.
   *
   * @param  string  $table
   * @return array
   */
  public async getColumns(table: string) {
    table = this.connection.getTablePrefix() + table;

    return this.connection.getPostProcessor().processColumns(
      await this.connection.selectFromWriteConnection(this.grammar.compileColumns(table)),
      await this.connection.scalar(this.grammar.compileSqlCreateStatement(table))
    );
  }

  /*Drop all tables from the database.*/
  public async dropAllTables() {
    if (this.connection.getDatabaseName() !== ':memory:') {
      return this.refreshDatabaseFile();
    }
    await this.connection.select(this.grammar.compileEnableWriteableSchema());
    await this.connection.select(this.grammar.compileDropAllTables());
    await this.connection.select(this.grammar.compileDisableWriteableSchema());
    await this.connection.select(this.grammar.compileRebuild());
  }

  /*Drop all views from the database.*/
  public async dropAllViews() {
    await this.connection.select(this.grammar.compileEnableWriteableSchema());
    await this.connection.select(this.grammar.compileDropAllViews());
    await this.connection.select(this.grammar.compileDisableWriteableSchema());
    await this.connection.select(this.grammar.compileRebuild());
  }

  /*Empty the database file.*/
  public refreshDatabaseFile() {
    fs.writeFileSync(this.connection.getDatabaseName(), '');
  }
  //
  // protected _getPortableTableColumnDefinition(tableColumn: any) {
  //   const parts         = tableColumn['type'].split('(');
  //   tableColumn['type'] = parts[0].trim();
  //   if (parts[1] !== undefined) {
  //     tableColumn['length'] = +parts[1].replace(/\)$/, '');
  //   }
  //   let dbType   = tableColumn['type'].toLowerCase();
  //   let length   = tableColumn['length'] ?? null;
  //   let unsigned = false;
  //   if (dbType.includes(' unsigned')) {
  //     dbType   = dbType.replace(' unsigned', '');
  //     unsigned = true;
  //   }
  //   let fixed    = false;
  //   const type   = this.grammar.getTypeMapping(dbType);
  //   let _default = tableColumn['dflt_value'];
  //   if (_default === 'NULL') {
  //     _default = null;
  //   }
  //   if (_default !== null) {
  //     const matches = /^'(.*)'$/sg.exec(_default);
  //     if (matches) {
  //       _default = matches[1].replace(`''`, `'`);
  //     }
  //   }
  //   const notnull = /*cast type bool*/ tableColumn['notnull'];
  //   if (!(tableColumn['name'] !== undefined)) {
  //     tableColumn['name'] = '';
  //   }
  //   let precision = null;
  //   let scale     = null;
  //   switch (dbType) {
  //     case 'char':
  //       fixed = true;
  //       break;
  //     case 'float':
  //     case 'double':
  //     case 'real':
  //     case 'decimal':
  //     case 'numeric':
  //       if (tableColumn['length'] !== undefined) {
  //         if (!tableColumn['length'].includes(',')) {
  //           tableColumn['length'] += ',0';
  //         }
  //         [precision, scale] = tableColumn['length'].split(',').map(
  //           (it: string) => it.trim());
  //       }
  //       length = null;
  //       break;
  //   }
  //   const options = {
  //     'length'       : length,
  //     'unsigned'     : /*cast type bool*/ Boolean(unsigned),
  //     'fixed'        : fixed,
  //     'notnull'      : notnull,
  //     'default'      : _default,
  //     'precision'    : precision,
  //     'scale'        : scale,
  //     'autoincrement': false
  //   };
  //   return new DbalColumn(tableColumn['name'], type, options);
  // }
}
