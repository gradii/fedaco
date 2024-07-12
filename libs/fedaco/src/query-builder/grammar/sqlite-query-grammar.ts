/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank, snakeCase } from '@gradii/nanofn';
import { ColumnReferenceExpression } from '../../query/ast/column-reference-expression';
import { DeleteSpecification } from '../../query/ast/delete-specification';
import { ConditionExpression } from '../../query/ast/expression/condition-expression';
import { InPredicateExpression } from '../../query/ast/expression/in-predicate-expression';
import { NestedExpression } from '../../query/ast/fragment/nested-expression';
import { Identifier } from '../../query/ast/identifier';
import { PathExpression } from '../../query/ast/path-expression';
import { WhereClause } from '../../query/ast/where-clause';
import { createIdentifier } from '../ast-factory';
import type { GrammarInterface } from '../grammar.interface';
import type { QueryBuilder } from '../query-builder';
import { SqliteQueryBuilderVisitor } from '../visitor/sqlite-query-builder-visitor';
import { QueryGrammar } from './query-grammar';

export class SqliteQueryGrammar extends QueryGrammar implements GrammarInterface {
  private _tablePrefix = '';

  compileJoins() {

  }

  protected _createVisitor(queryBuilder: QueryBuilder) {
    return new SqliteQueryBuilderVisitor(queryBuilder._grammar, queryBuilder);
  }

  compileInsertOrIgnore(builder: QueryBuilder, values: any | any[]): string {
    return this.compileInsert(builder, values, 'or ignore into');
  }

  /*Compile a truncate table statement into SQL.*/
  compileTruncate(query: QueryBuilder): { [sql: string]: any[] } {
    const table = query._from.accept(this._createVisitor(query));
    return {
      'DELETE FROM sqlite_sequence WHERE name = ?': [
        this.unQuoteTableName(table)
      ],
      ['DELETE FROM ' + `${table}`]               : []
    };
  }

  compileSelect(builder: QueryBuilder): string {

    const ast = this._prepareSelectAst(builder);

    const visitor = new SqliteQueryBuilderVisitor(builder._grammar, builder);

    return ast.accept(visitor);
  }

  distinct(distinct: boolean | any[]): string {
    if (distinct !== false) {
      return 'DISTINCT';
    } else {
      return '';
    }
  }

  compilePredicateFuncName(funcName: string): string {
    if (funcName === 'JsonLength') {
      return 'json_array_length';
    }
    return snakeCase(funcName);
  }

  quoteColumnName(columnName: string) {
    // if(keepSlashQuote) {
    //   return `\`${columnName.replace(/`/g, '``')}\``;
    // }
    if (columnName === '*') {
      return '*';
    }
    return `"${columnName.replace(/`/g, '')}"`;
  }

  quoteTableName(tableName: string): string {
    // if(keepSlashQuote) {
    //   return `\`${tableName.replace(/`/g, '``')}\``;
    // }
    return `"${this._tablePrefix}${tableName.replace(/`/g, '')}"`;
  }

  unQuoteTableName(tableName: string): string {
    return `${tableName.replace(/^"(.+?)"/g, '$1')}`;
  }

  setTablePrefix(prefix: string) {
    this._tablePrefix = prefix;
    return this;
  }

  protected _prepareDeleteAstWithJoins(builder: QueryBuilder) {

    const inBuilder = builder.cloneWithout([]);

    inBuilder.resetBindings();

    inBuilder._columns = [
      new ColumnReferenceExpression(
        new PathExpression(
          [
            builder._from,
            createIdentifier('rowid')
          ]
        )
      )
    ];
    inBuilder._wheres  = builder._wheres;

    const ast = new DeleteSpecification(builder._from,
      new WhereClause(
        new ConditionExpression(
          [
            new InPredicateExpression(
              new ColumnReferenceExpression(
                new PathExpression(
                  [new Identifier('rowid')]
                )
              ),
              [],
              new NestedExpression('where', inBuilder)
            )
          ]
        )
      ));

    return ast;
  }

  protected _prepareDeleteAstWithoutJoins(builder: QueryBuilder): DeleteSpecification {
    return this._prepareDeleteAstWithJoins(builder);
  }
}
