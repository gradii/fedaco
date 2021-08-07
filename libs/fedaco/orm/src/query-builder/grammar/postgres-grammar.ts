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
import {
  bindingVariable,
  createIdentifier
} from '../ast-factory';
import { GrammarInterface } from '../grammar.interface';
import { QueryBuilder } from '../query-builder';
import { PostgresQueryBuilderVisitor } from '../visitor/postgres-query-builder-visitor';
import { QueryBuilderVisitor } from '../visitor/query-builder-visitor';
import { Grammar } from './grammar';

export class PostgresGrammar extends Grammar implements GrammarInterface {
  private _tablePrefix = '';

  compileJoins() {

  }

  protected _createVisitor(queryBuilder) {
    return new QueryBuilderVisitor(queryBuilder._grammar, queryBuilder);
  }

  compileTruncate(query: QueryBuilder): {[sql: string]: any[] } {
    return {
      [`TRUNCATE ${query._from.accept(this._createVisitor(query))} restart identity cascade`]: []
    };
  }

  compileSelect(builder: QueryBuilder): string {
    const ast = this._prepareSelectAst(builder);

    const visitor = new PostgresQueryBuilderVisitor(builder._grammar, builder);

    return ast.accept(visitor);
  }

  quoteSchemaName(quoteSchemaName): string {
    // if(keepSlashQuote) {
    //   return `\`${tableName.replace(/`/g, '``')}\``;
    // }
    return `"${quoteSchemaName.replace(/`'"/g, '')}"`;
  }

  compileUpdate(builder: QueryBuilder, values: any): string {
    const ast = this._prepareUpdateAst(builder, values);

    const visitor = new PostgresQueryBuilderVisitor(builder._grammar, builder);

    return ast.accept(visitor);
  }


  distinct(distinct: boolean | any[]): string {
    if (distinct !== false) {
      return 'DISTINCT';
    } else {
      return '';
    }
  }

  compileInsertOrIgnore(builder: QueryBuilder, values): string {
    return this.compileInsert(builder, values, 'into') + ' ON conflict do nothing';
  }

  /*Compile an insert and get ID statement into SQL.*/
  public compileInsertGetId(query: QueryBuilder, values: any[], sequence: string = 'id') {
    return `${this.compileInsert(query, values)} returning ${this.wrap(sequence)}`;
  }

  quoteColumnName(columnName: string) {
    // if(keepSlashQuote) {
    //   return `\`${columnName.replace(/`/g, '``')}\``;
    // }
    return `"${columnName.replace(/`/g, '')}"`;
  }

  quoteTableName(tableName): string {
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
  }

}