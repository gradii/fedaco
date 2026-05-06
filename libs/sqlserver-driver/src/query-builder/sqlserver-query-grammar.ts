/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBoolean, snakeCase } from '@gradii/nanofn';
import {
  ConditionExpression,
  DeleteSpecification,
  FromClause,
  type GrammarInterface,
  type JoinedTable,
  OffsetClause,
  type QueryBuilder,
  QueryGrammar,
  WhereClause,
} from '@gradii/fedaco';
import { SqlserverQueryBuilderVisitor } from './sqlserver-query-builder-visitor';

export class SqlserverQueryGrammar extends QueryGrammar implements GrammarInterface {
  private _tablePrefix = '';

  compileSelect(builder: QueryBuilder, ctx: any = {}): string {
    const ast = this._prepareSelectAst(builder);

    const visitor = new SqlserverQueryBuilderVisitor(builder._grammar, builder, ctx);

    return ast.accept(visitor);
  }

  compileUpdate(builder: QueryBuilder, values: any, ctx: any = {}): string {
    const ast = this._prepareUpdateAst(builder, values);

    const visitor = new SqlserverQueryBuilderVisitor(builder._grammar, builder, ctx);

    return ast.accept(visitor);
  }

  compileInsertOrIgnore(builder: QueryBuilder, values: any, ctx: any = {}): string {
    throw new Error('RuntimeException');
  }

  predicateFuncName(funcName: string): string {
    return snakeCase(funcName);
  }

  distinct(distinct: boolean | any[]): string {
    if (distinct !== false) {
      return 'DISTINCT';
    } else {
      return '';
    }
  }

  prepareBindingForJsonContains(value: any): string {
    return isBoolean(value) ? JSON.stringify(value) : value;
  }

  quoteColumnName(columnName: string) {
    // if(keepSlashQuote) {
    //   return `\`${columnName.replace(/`/g, '``')}\``;
    // }
    if (columnName === '*') {
      return '*';
    }
    return `[${columnName.replace(/`/g, '')}]`;
  }

  quoteTableName(tableName: string): string {
    // if(keepSlashQuote) {
    //   return `\`${tableName.replace(/`/g, '``')}\``;
    // }
    return `[${this._tablePrefix}${tableName.replace(/`/g, '')}]`;
  }

  setTablePrefix(prefix: string) {
    this._tablePrefix = prefix;
    return this;
  }

  compileInsertGetId(builder: QueryBuilder, values: any, sequence: string, ctx: any = {}): string {
    return `set nocount on;${super.compileInsertGetId(
      builder,
      values,
      sequence,
      ctx,
    )};select scope_identity() as ${this.wrap(sequence)}`;
  }

  protected _createVisitor(queryBuilder: QueryBuilder, ctx: any = {}) {
    return new SqlserverQueryBuilderVisitor(queryBuilder._grammar, queryBuilder, ctx);
  }

  protected _prepareDeleteAstWithJoins(builder: QueryBuilder) {
    const ast = new DeleteSpecification(
      builder._from,
      builder._wheres.length > 0 ? new WhereClause(new ConditionExpression(builder._wheres)) : undefined,
    );

    if (builder._joins.length > 0) {
      (ast as DeleteSpecification).fromClause = new FromClause(builder._from, builder._joins as JoinedTable[]);
    }

    if (builder._limit >= 0) {
      (ast as DeleteSpecification).topRow = builder._limit;
    }

    if (builder._offset >= 0) {
      (ast as DeleteSpecification).offsetClause = new OffsetClause(builder._offset);
    }

    // if (builder._orders.length > 0) {
    //   (ast as UpdateSpecification).orderByClause = new OrderByClause(
    //     builder._orders as OrderByElement[]
    //   );
    // }

    return ast;
  }
}
