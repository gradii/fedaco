/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isArray, isBlank } from '@gradii/nanofn';
import { Connection } from './connection';
import { RawExpression } from './query/ast/expression/raw-expression';
import type { Blueprint } from './schema/blueprint';

export abstract class BaseGrammar {
  protected connection: Connection;
  /*The grammar table prefix.*/
  protected tablePrefix = '';

  constructor(protected ctx: Record<string, any> = {}) {
  }

  /*Wrap an array of values.*/
  public wrapArray(values: any[]) {
    return values.map(it => this.wrap(it));
  }

  /*Wrap a table in keyword identifiers.*/
  public wrapTable(table: RawExpression | Blueprint | string): string {
    if (!this.isExpression(table)) {
      return this.wrap(this.tablePrefix + table, true);
    }
    return this.getValue(table as RawExpression) as string;
  }

  /*Wrap a value in keyword identifiers.*/
  public wrap(value: RawExpression | string, prefixAlias = false): string {
    if (this.isExpression(value)) {
      return this.getValue(value as RawExpression) as string;
    }
    if ((value as string).includes(' as ')) {
      return this.wrapAliasedValue(value as string, prefixAlias);
    }
    if (this.isJsonSelector(value as string)) {
      return this.wrapJsonSelector(value as string) as string;
    }
    return this.wrapSegments((value as string).split('.'));
  }

  /*Wrap a value that has an alias.*/
  protected wrapAliasedValue(value: string, prefixAlias = false): string {
    const segments = value.split(/\s+as\s+/i);
    if (prefixAlias) {
      segments[1] = this.tablePrefix + segments[1];
    }
    return this.wrap(segments[0]) + ' as ' + this.wrapValue(segments[1]);
  }

  protected wrapAliasedTable(value: string) {
    const segments = value.split(/s+ass+/i);

    return this.wrapTable(segments[0]) + ' as ' + this.wrapValue(this.tablePrefix + segments[1]);
  }

  /*Wrap the given value segments.*/
  protected wrapSegments(segments: any[]): string {
    return segments.map((segment, key) => {
      return key == 0 && segments.length > 1 ?
        this.wrapTable(segment) :
        this.wrapValue(segment);
    }).join('.');
  }

  /*Wrap a single string in keyword identifiers.*/
  protected wrapValue(value: string) {
    if (value !== '*') {
      return '"' + value.replace('"', '""') + '"';
    }
    return value;
  }

  /*Wrap the given JSON selector.*/
  protected wrapJsonSelector(value: string): string {
    throw new Error('RuntimeException This database engine does not support JSON operations.');
  }

  /*Determine if the given string is a JSON selector.*/
  protected isJsonSelector(value: string) {
    return value.includes('->');
  }

  /*Convert an array of column names into a delimited string.*/
  public columnize(columns: any[]) {
    return columns.map(it => this.wrap(it)).join(', ');
  }

  /*Create query parameter place-holders for an array.*/
  public parameterize(values: any[]) {
    return values.map(it => this.parameter(it)).join(', ');
  }

  /*Get the appropriate query parameter place-holder for a value.*/
  public parameter(value: any) {
    return this.isExpression(value) ? this.getValue(value) : '?';
  }

  /*Quote the given string literal.*/
  public quoteString(value: any[] | string): string {
    if (isArray(value)) {
      return value.map(it => this.quoteString(it)).join(', ');
    }
    return `'${value}'`;
  }

  public escape(value: any, binary = false) {
    if (isBlank(this.connection)) {
      throw new Error(
        'RuntimeException The database driver\'s grammar implementation does not support escaping values.');
    }

    return this.connection.escape(value, binary);
  }

  /*Determine if the given value is a raw expression.*/
  public isExpression(value: any) {
    return value instanceof RawExpression;
  }

  /*Get the value of a raw expression.*/
  public getValue(expression: RawExpression) {
    return expression.value;
  }

  /*Get the format for database stored dates.*/
  public getDateFormat() {
    return 'yyyy-MM-dd HH:mm:ss';
  }

  /*Get the grammar's table prefix.*/
  public getTablePrefix() {
    return this.tablePrefix;
  }

  /*Set the grammar's table prefix.*/
  public setTablePrefix(prefix: string) {
    this.tablePrefix = prefix;
    return this;
  }

  public setConnection(connection: Connection) {
    this.connection = connection;

    return this;
  }
}
