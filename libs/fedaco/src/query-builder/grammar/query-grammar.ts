/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isAnyEmpty, isArray, isBlank, isString } from '@gradii/nanofn';
import { BaseGrammar } from '../../base-grammar';
import { camelCase } from '@gradii/nanofn';
import { AssignmentSetClause } from '../../query/ast/assignment-set-clause';
import { BinaryUnionQueryExpression } from '../../query/ast/binary-union-query-expression';
import { DeleteSpecification } from '../../query/ast/delete-specification';
import { ConditionExpression } from '../../query/ast/expression/condition-expression';
import { FunctionCallExpression } from '../../query/ast/expression/function-call-expression';
import { ParenthesizedExpression } from '../../query/ast/expression/parenthesized-expression';
import type { NestedExpression } from '../../query/ast/fragment/nested-expression';
import { FromClause } from '../../query/ast/from-clause';
import { FromTable } from '../../query/ast/from-table';
import { GroupByClause } from '../../query/ast/group-by-clause';
import { HavingClause } from '../../query/ast/having-clause';
import { InsertSpecification } from '../../query/ast/insert-specification';
import { JoinExpression } from '../../query/ast/join-expression';
import { JoinedTable } from '../../query/ast/joined-table';
import { LimitClause } from '../../query/ast/limit-clause';
import { LockClause } from '../../query/ast/lock-clause';
import { OffsetClause } from '../../query/ast/offset-clause';
import { OrderByClause } from '../../query/ast/order-by-clause';
import type { OrderByElement } from '../../query/ast/order-by-element';
import type { QueryExpression } from '../../query/ast/query-expression';
import { QuerySpecification } from '../../query/ast/query-specification';
import { SelectClause } from '../../query/ast/select-clause';
import { SelectScalarExpression } from '../../query/ast/select-scalar-expression';
import { TableReferenceExpression } from '../../query/ast/table-reference-expression';
import { UpdateSpecification } from '../../query/ast/update-specification';
import { ValuesInsertSource } from '../../query/ast/values-insert-source';
import { WhereClause } from '../../query/ast/where-clause';
import { SqlParser } from '../../query/parser/sql-parser';
import type { SqlNode } from '../../query/sql-node';
import type { SqlVisitor } from '../../query/sql-visitor';
import { bindingVariable, createIdentifier, raw } from '../ast-factory';
import type { Builder } from '../builder';
import type { GrammarInterface } from '../grammar.interface';
import type { JoinClauseBuilder, QueryBuilder } from '../query-builder';
import { QueryBuilderVisitor } from '../visitor/query-builder-visitor';

export abstract class QueryGrammar extends BaseGrammar implements GrammarInterface<QueryBuilder> {
  constructor() {
    super();
  }

  protected _selectComponents: string[] = [
    'aggregate',
    'columns',
    'from',
    'joins',
    'wheres',
    'groups',
    'havings',
    'orders',
    'limit',
    'offset',
    'lock',
  ];

  protected _prepareUpdateAst(builder: QueryBuilder, values: any) {

    const columnNodes = [];
    for (const [key, value] of Object.entries(values)) {
      const columnNode = SqlParser.createSqlParser(key).parseColumnWithoutAlias(builder._from);
      columnNodes.push(new AssignmentSetClause(
        columnNode,
        bindingVariable(value as any, 'update')
      ));
    }

    const ast = new UpdateSpecification(
      builder._from,
      columnNodes,
      builder._wheres.length > 0 ? new WhereClause(
        new ConditionExpression(builder._wheres)
      ) : undefined
    );

    if (builder._joins.length > 0) {
      (ast as UpdateSpecification).fromClause = new FromClause(builder._from,
        builder._joins as JoinedTable[]);
    }

    if (builder._limit >= 0) {
      (ast as UpdateSpecification).limitClause = new LimitClause(builder._limit);
    }

    if (builder._offset >= 0) {
      (ast as UpdateSpecification).offsetClause = new OffsetClause(builder._offset);
    }

    if (builder._orders.length > 0) {
      (ast as UpdateSpecification).orderByClause = new OrderByClause(
        builder._orders as OrderByElement[]
      );
    }

    return ast;
  }

  compileAggregateFragment(aggregateFunctionName: any,
                           aggregateColumns: any,
                           visitor: SqlVisitor) {
    return ``;
  }

  /*Compile a delete statement into SQL.*/
  public compileDelete(query: QueryBuilder) {
    let ast;
    if (query._joins.length > 0) {
      ast = this._prepareDeleteAstWithJoins(query);
    } else {
      ast = this._prepareDeleteAstWithoutJoins(query);
    }

    const visitor = this._createVisitor(query);

    return ast.accept(visitor);
  }

  compileExists(builder: QueryBuilder): string {
    return `SELECT exists(${this.compileSelect(builder)}) AS \`exists\``;
  }

  compileInsert(builder: QueryBuilder, values: any | any[], insertOption = 'into'): string {
    const visitor = this._createVisitor(builder);

    if (isAnyEmpty(values)) {
      return 'INSERT INTO ' + builder._from.accept(visitor) + ' DEFAULT VALUES';
    }

    // const ast = this._prepareSelectAst(builder);
    let keys;
    if (!isArray(values)) {
      values = [values];
    }
    if (values.length > 0) {
      keys = Object.keys(values[0]);
    }
    const sources: any[][] = values.map((it: Record<string, any>) => Object.values(it));

    const ast = new InsertSpecification(
      insertOption,
      new ValuesInsertSource(
        false,
        sources.map((columnValues: any[]) => {
          return columnValues.map(it => bindingVariable(it, 'insert'));
        })
      ),
      keys.map(it => {
        return SqlParser.createSqlParser(it).parseColumnAlias();
      }),
      builder._from
    );

    return ast.accept(visitor);
  }

  compileInsertGetId(builder: QueryBuilder, values: any, sequence: string): string {
    return this.compileInsert(builder, values);
  }

  compileInsertOrIgnore(builder: QueryBuilder, values: any | any[]): string {
    return this.compileInsert(builder, values, 'ignore into');
  }

  compileInsertUsing(builder: QueryBuilder, columns: string[],
                     nestedExpression: NestedExpression): string {
    const ast     = new InsertSpecification(
      'into',

      new ValuesInsertSource(
        false,
        [],
        nestedExpression
      ),
      columns.map((it: string) => {
        return SqlParser.createSqlParser(it).parseColumnAlias();
      }),
      builder._from
    );
    const visitor = this._createVisitor(builder);

    return ast.accept(visitor);
  }

  compileJoinFragment(builder: JoinClauseBuilder, visitor: SqlVisitor): string {
    let whereClause: ConditionExpression;
    if (builder._wheres.length > 0) {
      // todo check
      whereClause = new ConditionExpression(
        builder._wheres
      );
    }
    let table;
    if (isString(builder.table)) {
      table = SqlParser.createSqlParser(builder.table).parseTableAlias();
    } else if (builder.table instanceof TableReferenceExpression) {
      table = builder.table;
    } else {
      throw new Error('invalid table');
    }

    if (builder._joins.length > 0) {
      table = new JoinedTable(table, builder._joins as JoinExpression[]);
    }

    const ast = new JoinExpression(
      builder.type,
      table,
      whereClause
    );

    return ast.accept(visitor);
  }

  compileNestedPredicate(builder: Builder, visitor: SqlVisitor): string {
    const ast = new ParenthesizedExpression(
      new ConditionExpression(
        builder._wheres
      )
    );
    return ast.accept(visitor);
  }

  compileSelect(builder: Builder) {
    return '';
  }

  protected wrapUnion(sql: string) {
    return '(' + sql + ')';
  }

  protected compileUnionAggregate(builder: Builder) {
    return '';
  }

  protected concatenate(segments: any[]) {
    return '';
    // return implode(' ', array_filter(Segments, function (Value) {
    //   return (string) Value !== '';
    // }));
  }

  protected compileUnions(builder: Builder) {
    // Sql = '';
    //
    // foreach(Query->unions as Union);
    // {
    //   Sql. = This->compileUnion(Union);
    // }
    //
    // if (!empty(Query->unionOrders)) {
    //   Sql. = ' '.This;
    // ->
    //   compileOrders(Query, Query->unionOrders);
    // }
    //
    // if (isset(Query->unionLimit)) {
    //   Sql. = ' '.This;
    // ->
    //   compileLimit(Query, Query->unionLimit);
    // }
    //
    // if (isset(Query->unionOffset)) {
    //   Sql. = ' '.This;
    // ->
    //   compileOffset(Query, Query->unionOffset);
    // }
    //
    // return ltrim(Sql);
    return '';
  }

  /**
   * Compile the components necessary for a select clause.
   *
   * @param  \Illuminate\Database\Query\Builder  Query
   * @return array
   */
  protected compileComponents(builder: Builder) {
    const sql = [];

    // this._selectComponents.forEach();
    //
    // foreach (This->selectComponents as Component) {
    // if (isset(Query->Component)) {
    // Method = 'compile'.ucfirst(Component);
//
//   Sql[Component] = This->Method(Query, Query->Component);
// }
// }

// return Sql;
    return '';
  }

  compileTruncate(builder: QueryBuilder): { [sql: string]: any[] } {
    return {
      [`TRUNCATE TABLE ${builder._from.accept(
        this._createVisitor(builder))}`]: builder.getBindings()
    };
  }

  compileUpdate(builder: QueryBuilder, values: any): string {
    const ast = this._prepareUpdateAst(builder, values);

    const visitor = this._createVisitor(builder);

    return ast.accept(visitor);
  }

  compileUpsert(builder: Builder, values: any, uniqueBy: any[] | string,
                update: any[] | null): string {
    throw new Error('RuntimeException This database engine does not support upserts.');
  }

  compilePredicateFuncName(funcName: string) {
    if (funcName === 'JsonContains') {
      return 'json_contains';
    }
    return funcName;
  }

  distinct(query: QueryBuilder, distinct: boolean | any[]): string {
    // If the query is actually performing an aggregating select, we will let that
    // compiler handle the building of the select clauses, as it will need some
    // more syntax that is best handled by that function to keep things neat.
    if (!isBlank(query._aggregate)) {
      return '';
    }
    if (distinct !== false) {
      return 'DISTINCT';
    } else {
      return '';
    }
  }

  getOperators(): any[] {
    return [];
  }

  prepareBindingsForUpdate(builder: Builder, visitor: SqlVisitor): string {
    return '';
  }

  prepareBindingForJsonContains(value: any): string {
    return JSON.stringify(value);
  }

  quoteColumnName(columnName: string): string {
    return '';
  }

  quoteSchemaName(schemaName: string): string {
    return schemaName;
  }

  quoteTableName(tableName: string): string {
    return tableName;
  }

  setTablePrefix(prefix: string): this {
    return this;
  }

  wrap(column: string) {
    if (column === '*') {
      return '*';
    }
    return this.quoteColumnName(column.replace(/\s|'|"|`/g, ''));
  }

  protected _prepareAggregateAst(builder: QueryBuilder, ast: SqlNode): QuerySpecification {
    if (builder._unions.length > 0) {
      if (builder._aggregate) {
        ast = new QuerySpecification(
          new SelectClause(
            [
              new SelectScalarExpression(
                new FunctionCallExpression(
                  builder._aggregate.aggregateFunctionName,
                  builder._aggregate.aggregateColumns
                ),
                createIdentifier('aggregate')
              )
            ]
          ),
          new FromClause(
            new FromTable(
              new TableReferenceExpression(
                new ParenthesizedExpression(ast),
                createIdentifier('temp_table')
              )
            )
          )
        );
      }
    }

    return ast as QuerySpecification;
  }

  protected _prepareSelectAst(builder: QueryBuilder) {
    let whereClause, selectClause;
    if (builder._wheres.length > 0) {
      whereClause = new WhereClause(
        new ConditionExpression(
          builder._wheres
        )
      );
    }

    if (builder._aggregate && builder._unions.length === 0) {
      selectClause = new SelectClause(
        [
          new SelectScalarExpression(
            new FunctionCallExpression(
              builder._aggregate.aggregateFunctionName,
              builder._aggregate.aggregateColumns
            ),
            createIdentifier('aggregate')
          )
        ],
        builder._distinct
      );
    } else {
      selectClause = new SelectClause(
        builder._columns,
        builder._distinct
      );
    }

    let ast: QuerySpecification | BinaryUnionQueryExpression = new QuerySpecification(
      selectClause,
      builder._from ? new FromClause(builder._from, builder._joins as JoinedTable[]) : undefined,
      whereClause
    );

    if (builder._limit >= 0) {
      (ast as QueryExpression).limitClause = new LimitClause(builder._limit);
    }

    if (builder._offset >= 0) {
      (ast as QueryExpression).offsetClause = new OffsetClause(builder._offset);
    }

    if (builder._orders.length > 0) {
      (ast as QueryExpression).orderByClause = new OrderByClause(
        builder._orders as OrderByElement[]
      );
    }

    if (builder._groups.length > 0) {
      (ast as QuerySpecification).groupByClause = new GroupByClause(
        builder._groups
      );
    }

    if (builder._havings.length > 0) {
      (ast as QuerySpecification).havingClause = new HavingClause(
        builder._havings
      );
    }

    if (builder._lock !== undefined) {
      (ast as QuerySpecification).lockClause = new LockClause(
        builder._lock
      );
    }

    if (builder._unions.length > 0) {
      for (const it of builder._unions) {
        const rightSql = it.expression.toSql();
        const bindings = it.expression.getBindings();
        builder.addBinding(bindings, 'union');
        ast = new BinaryUnionQueryExpression(ast, raw(rightSql), it.all);
      }

      if (builder._unionLimit >= 0) {
        (ast as BinaryUnionQueryExpression).limitClause = new LimitClause(builder._unionLimit);
      }

      if (builder._unionOffset >= 0) {
        (ast as BinaryUnionQueryExpression).offsetClause = new OffsetClause(builder._unionOffset);
      }

      if (builder._unionOrders.length > 0) {
        (ast as BinaryUnionQueryExpression).orderByClause = new OrderByClause(
          builder._unionOrders as OrderByElement[]
        );
      }
    }

    // SELECT count(*) AS aggregate FROM ([SELECT STMT] UNION [SELECT STMT]) AS "temp_table"
    ast = this._prepareAggregateAst(builder, ast);

    return ast;
  }

  protected _createVisitor(queryBuilder: QueryBuilder): QueryBuilderVisitor {
    return new QueryBuilderVisitor(queryBuilder._grammar, queryBuilder);
  }

  /*Compile a delete statement without joins into SQL.*/
  protected _prepareDeleteAstWithoutJoins(builder: QueryBuilder) {
    return this._prepareDeleteAstWithJoins(builder);
  }

  /*Compile a delete statement with joins into SQL.*/
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
      (ast as DeleteSpecification).limitClause = new LimitClause(builder._limit);
    }

    if (builder._offset >= 0) {
      (ast as DeleteSpecification).offsetClause = new OffsetClause(builder._offset);
    }

    if (builder._orders.length > 0) {
      (ast as DeleteSpecification).orderByClause = new OrderByClause(
        builder._orders as OrderByElement[]
      );
    }

    return ast;
  }

  getDateFormat(): string {
    return 'yyyy-MM-dd HH:mm:ss';
    // todo remove me remove the comment
    // throw new Error('not implement');
  }

  /**
   * Determine if the grammar supports savepoints.
   */
  public supportsSavepoints() {
    return true;
  }

  public compileSavepoint(name: string) {
    return 'SAVEPOINT ' + name;
  }

  /**
   * Compile the SQL statement to execute a savepoint rollback.
   */
  public compileSavepointRollBack(name: string) {
    return `ROLLBACK TO SAVEPOINT ${name}`;
  }
}
