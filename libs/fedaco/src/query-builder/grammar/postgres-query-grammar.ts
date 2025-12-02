/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isArray, isBlank, snakeCase } from '@gradii/nanofn';
import { AssignmentSetClause } from '../../query/ast/assignment-set-clause';
import { ColumnReferenceExpression } from '../../query/ast/column-reference-expression';
import { DeleteSpecification } from '../../query/ast/delete-specification';
import { ConditionExpression } from '../../query/ast/expression/condition-expression';
import { InPredicateExpression } from '../../query/ast/expression/in-predicate-expression';
import { NestedExpression } from '../../query/ast/fragment/nested-expression';
import { Identifier } from '../../query/ast/identifier';
import { PathExpression } from '../../query/ast/path-expression';
import { UpdateSpecification } from '../../query/ast/update-specification';
import { WhereClause } from '../../query/ast/where-clause';
import { SqlParser } from '../../query/parser/sql-parser';
import { bindingVariable, createIdentifier } from '../ast-factory';
import type { GrammarInterface } from '../grammar.interface';
import type { QueryBuilder } from '../query-builder';
import { PostgresQueryBuilderVisitor } from '../visitor/postgres-query-builder-visitor';
import { QueryBuilderVisitor } from '../visitor/query-builder-visitor';
import { QueryGrammar } from './query-grammar';

export class PostgresQueryGrammar extends QueryGrammar implements GrammarInterface {
  private _tablePrefix = '';

  compileJoins() {

  }

  protected _createVisitor(queryBuilder: QueryBuilder, ctx: any = {}) {
    return new PostgresQueryBuilderVisitor(queryBuilder._grammar, queryBuilder, ctx);
  }

  predicateFuncName(funcName: string): string {
    if (funcName === 'JsonLength') {
      return 'json_array_length';
    }
    return snakeCase(funcName);
  }

  compileTruncate(query: QueryBuilder, ctx: any = {}): { [sql: string]: any[] } {
    return {
      [`TRUNCATE ${query._from.accept(this._createVisitor(query, ctx))} restart identity cascade`]: []
    };
  }

  compileSelect(builder: QueryBuilder, ctx: any = {}): string {
    const ast = this._prepareSelectAst(builder);

    const visitor = new PostgresQueryBuilderVisitor(builder._grammar, builder, ctx);

    return ast.accept(visitor);
  }

  quoteSchemaName(quoteSchemaName: string): string {
    // if(keepSlashQuote) {
    //   return `\`${tableName.replace(/`/g, '``')}\``;
    // }
    return `"${quoteSchemaName.replace(/`'"/g, '')}"`;
  }

  compileUpdate(builder: QueryBuilder, values: any, ctx: any = {}): string {
    const ast = this._prepareUpdateAst(builder, values);

    const visitor = new PostgresQueryBuilderVisitor(builder._grammar, builder, ctx);

    return ast.accept(visitor);
  }


  distinct(distinct: boolean | any[]): string {
    if (isArray(distinct)) {
      return `DISTINCT ON (${this.columnize(distinct)})`;
    } else if (distinct === true) {
      return 'DISTINCT';
    } else {
      return '';
    }
  }

  compileInsertOrIgnore(builder: QueryBuilder, values: any, ctx: any = {}): string {
    return this.compileInsert(builder, values, 'into', ctx) + ' ON conflict do nothing';
  }

  /*Compile an insert and get ID statement into SQL.*/
  public compileInsertGetId(query: QueryBuilder, values: any[], sequence = 'id', ctx: any = {}) {
    return `${this.compileInsert(query, values, undefined, ctx)} returning ${this.wrap(sequence)}`;
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

  _prepareUpdateAst(builder: QueryBuilder, values: any) {

    if (builder._joins.length > 0) {
      const columnNodes = [];
      for (const [key, value] of Object.entries(values)) {
        const columnNode = SqlParser.createSqlParser(key).parseColumnAlias();
        columnNodes.push(new AssignmentSetClause(
          columnNode,
          bindingVariable(value as any, 'update')
        ));
      }

      const inBuilder = builder.cloneWithout([]);

      inBuilder.resetBindings();

      inBuilder._columns = [
        new ColumnReferenceExpression(
          new PathExpression(
            [
              builder._from,
              createIdentifier('ctid')
            ]
          )
        )
      ];

      const ast = new UpdateSpecification(
        builder._from,
        columnNodes,
        new WhereClause(
          new ConditionExpression(
            [
              new InPredicateExpression(
                new ColumnReferenceExpression(
                  new PathExpression(
                    [new Identifier('ctid')]
                  )
                ),
                [],
                new NestedExpression('where', inBuilder)
              )
            ]
          )
        )
      );

      return ast;
    }

    return super._prepareUpdateAst(builder, values);
  }

  protected _prepareDeleteAstWithJoins(builder: QueryBuilder): DeleteSpecification {

    if (builder._joins.length > 0) {
      const inBuilder = builder.cloneWithout([]);
      inBuilder.resetBindings();
      inBuilder._columns = [
        new ColumnReferenceExpression(
          new PathExpression(
            [
              builder._from,
              createIdentifier('ctid')
            ]
          )
        )
      ];

      const ast = new DeleteSpecification(
        builder._from,
        new WhereClause(
          new ConditionExpression(
            [
              new InPredicateExpression(
                new ColumnReferenceExpression(
                  new PathExpression(
                    [new Identifier('ctid')]
                  )
                ),
                [],
                new NestedExpression('where', inBuilder)
              )
            ]
          )
        )
      );

      return ast;
    }

    return super._prepareDeleteAstWithJoins(builder);
  }

  setTablePrefix(prefix: string) {
    this._tablePrefix = prefix;
    return this;
  }

}
