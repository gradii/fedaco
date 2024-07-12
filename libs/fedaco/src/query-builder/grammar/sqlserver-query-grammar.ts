/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank, isBoolean } from '@gradii/nanofn';
import { snakeCase } from '@gradii/nanofn';
import { DeleteSpecification } from '../../query/ast/delete-specification';
import { ConditionExpression } from '../../query/ast/expression/condition-expression';
import { FromClause } from '../../query/ast/from-clause';
import type { JoinedTable } from '../../query/ast/joined-table';
import { OffsetClause } from '../../query/ast/offset-clause';
import { WhereClause } from '../../query/ast/where-clause';
import type { GrammarInterface } from '../grammar.interface';
import type { QueryBuilder } from '../query-builder';
import { SqlserverQueryBuilderVisitor } from '../visitor/sqlserver-query-builder-visitor';
import { QueryGrammar } from './query-grammar';

export class SqlserverQueryGrammar extends QueryGrammar implements GrammarInterface {
  private _tablePrefix = '';


  compileSelect(builder: QueryBuilder): string {

    const ast = this._prepareSelectAst(builder);

    const visitor = new SqlserverQueryBuilderVisitor(builder._grammar, builder);

    return ast.accept(visitor);
  }

  compileUpdate(builder: QueryBuilder, values: any): string {
    const ast = this._prepareUpdateAst(builder, values);

    const visitor = new SqlserverQueryBuilderVisitor(builder._grammar, builder);

    return ast.accept(visitor);
  }

  compileInsertOrIgnore(builder: QueryBuilder, values: any): string {
    throw new Error('RuntimeException');
  }

  compilePredicateFuncName(funcName: string): string {
    return snakeCase(funcName);
  }

  distinct(query: QueryBuilder, distinct: boolean | any[]): string {
    if (! isBlank(query._aggregate)) {
      return '';
    }
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

  compileInsertGetId(builder: QueryBuilder, values: any, sequence: string): string {
    return `set nocount on;${super.compileInsertGetId(builder, values,
      sequence)};select scope_identity() as ${this.wrap(sequence)}`;
  }

  protected _createVisitor(queryBuilder: QueryBuilder) {
    return new SqlserverQueryBuilderVisitor(queryBuilder._grammar, queryBuilder);
  }

  protected _prepareDeleteAstWithJoins(builder: QueryBuilder) {
    const ast = new DeleteSpecification(
      builder._from,
      builder._wheres.length > 0 ? new WhereClause(
        new ConditionExpression(builder._wheres)
      ) : undefined
    );

    if (builder._joins.length > 0) {
      (ast as DeleteSpecification).fromClause = new FromClause(builder._from,
        builder._joins as JoinedTable[]);
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
