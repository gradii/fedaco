/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isAnyEmpty, isArray, isBlank, isObject } from '@gradii/nanofn';
import { wrap } from '../../helper/arr';
import type { GrammarInterface } from '../grammar.interface';
import type { QueryBuilder } from '../query-builder';
import { MysqlQueryBuilderVisitor } from '../visitor/mysql-query-builder-visitor';
import { QueryBuilderVisitor } from '../visitor/query-builder-visitor';
import { QueryGrammar } from './query-grammar';

export class MysqlQueryGrammar extends QueryGrammar implements GrammarInterface<QueryBuilder> {
  private _tablePrefix = '';

  compileJoins() {
  }

  protected _createVisitor(queryBuilder: QueryBuilder) {
    return new MysqlQueryBuilderVisitor(queryBuilder._grammar, queryBuilder);
  }

  compileSelect(builder: QueryBuilder): string {
    const ast = this._prepareSelectAst(builder);

    const visitor = new MysqlQueryBuilderVisitor(builder._grammar, builder);

    return ast.accept(visitor);
  }

  compileUpdate(builder: QueryBuilder, values: any): string {
    const ast = this._prepareUpdateAst(builder, values);

    const visitor = new MysqlQueryBuilderVisitor(builder._grammar, builder);

    return ast.accept(visitor);
  }

  compileUpsert(builder: QueryBuilder, values: any, uniqueBy: any[] | string,
                update: any[] | null): string {
    const sql = this.compileInsert(builder, values) + ' on duplicate key update ';

    const columns: string[] = [];
    if (isObject(update)) {
      for (const [key, val] of Object.entries(update)) {
        columns.push(wrap(key) + ' = ' + this.parameter(val));
      }
    } else if (isArray(update)) {
      (update as any[]).forEach(val => {
        columns.push(`${wrap(val)} = values(${wrap(val)})`);
      });
    }
    return sql + columns.join(', ');
  }

  compilePredicateFuncName(funcName: string) {
    if (funcName === 'JsonLength') {
      return 'json_length';
    }
    return super.compilePredicateFuncName(funcName);
  }

  quoteColumnName(columnName: string) {
    // if(keepSlashQuote) {
    //   return `\`${columnName.replace(/`/g, '``')}\``;
    // }
    if (columnName === '*') {
      return columnName;
    }
    return `\`${columnName.replace(/`/g, '')}\``;
  }

  quoteTableName(tableName: string): string {
    // if(keepSlashQuote) {
    //   return `\`${tableName.replace(/`/g, '``')}\``;
    // }
    return `\`${this._tablePrefix}${tableName.replace(/`/g, '')}\``;
  }

  quoteSchemaName(quoteSchemaName: string): string {
    // if(keepSlashQuote) {
    //   return `\`${tableName.replace(/`/g, '``')}\``;
    // }
    return `\`${quoteSchemaName.replace(/`/g, '')}\``;
  }

  setTablePrefix(prefix: string) {
    this._tablePrefix = prefix;
    return this;
  }

  compileInsert(builder: QueryBuilder, values: any, insertOption: string = 'into'): string {
    if (isAnyEmpty(values)) {
      const visitor = new QueryBuilderVisitor(builder._grammar, builder);
      return 'INSERT INTO ' + `${builder._from.accept(visitor)} () VALUES ()`;
    }

    return super.compileInsert(builder, values, insertOption);
  }

  compileInsertGetId(builder: QueryBuilder, values: any, sequence: string): string {
    return `${this.compileInsert(builder, values, 'into')} returning ${this.wrap(sequence)}`;
  }
}
