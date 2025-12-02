/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isArray, isBlank, isBoolean, isNumber, isString } from '@gradii/nanofn';
import { uniq } from 'ramda';
import type { AssignmentSetClause } from '../../query/ast/assignment-set-clause';
import { BinaryUnionQueryExpression } from '../../query/ast/binary-union-query-expression';
import { BindingVariable } from '../../query/ast/binding-variable';
import type { ColumnReferenceExpression } from '../../query/ast/column-reference-expression';
import type { DeleteSpecification } from '../../query/ast/delete-specification';
import type { AsExpression } from '../../query/ast/expression/as-expression';
import type {
  BetweenPredicateExpression
} from '../../query/ast/expression/between-predicate-expression';
import type { BinaryExpression } from '../../query/ast/expression/binary-expression';
import type { CommonValueExpression } from '../../query/ast/expression/common-value-expression';
import type {
  ComparisonPredicateExpression
} from '../../query/ast/expression/comparison-predicate-expression';
import type { ConditionExpression } from '../../query/ast/expression/condition-expression';
import type { ExistsPredicateExpression } from '../../query/ast/expression/exists-predicate-expression';
import type { FunctionCallExpression } from '../../query/ast/expression/function-call-expression';
import type { InPredicateExpression } from '../../query/ast/expression/in-predicate-expression';
import type { NotExpression } from '../../query/ast/expression/not-expression';
import type { NullPredicateExpression } from '../../query/ast/expression/null-predicate-expression';
import type { NumberLiteralExpression } from '../../query/ast/expression/number-literal-expression';
import type { ParenthesizedExpression } from '../../query/ast/expression/parenthesized-expression';
import type { RawBindingExpression } from '../../query/ast/expression/raw-binding-expression';
import { RawExpression } from '../../query/ast/expression/raw-expression';
import type { StringLiteralExpression } from '../../query/ast/expression/string-literal-expression';
import type { AggregateFunctionCallFragment } from '../../query/ast/fragment/aggregate-function-call-fragment';
import type {
  NestedPredicateExpression
} from '../../query/ast/fragment/expression/nested-predicate-expression';
import type { JoinFragment } from '../../query/ast/fragment/join-fragment';
import type { JsonPathColumn } from '../../query/ast/fragment/json-path-column';
import { NestedExpression } from '../../query/ast/fragment/nested-expression';
import type {
  RejectOrderElementExpression
} from '../../query/ast/fragment/order/reject-order-element-expression';
import type { UnionFragment } from '../../query/ast/fragment/union-fragment';
import type { FromClause } from '../../query/ast/from-clause';
import type { FromTable } from '../../query/ast/from-table';
import type { GroupByClause } from '../../query/ast/group-by-clause';
import type { HavingClause } from '../../query/ast/having-clause';
import { Identifier } from '../../query/ast/identifier';
import type { IdentifyVariableDeclaration } from '../../query/ast/identify-variable-declaration';
import type { IndexBy } from '../../query/ast/index-by';
import type { InsertSpecification } from '../../query/ast/insert-specification';
import type { JoinClause } from '../../query/ast/join-clause';
import type { JoinExpression } from '../../query/ast/join-expression';
import type { JoinOnExpression } from '../../query/ast/join-on-expression';
import { JoinedTable } from '../../query/ast/joined-table';
import { JsonPathExpression } from '../../query/ast/json-path-expression';
import type { LimitClause } from '../../query/ast/limit-clause';
import type { LockClause } from '../../query/ast/lock-clause';
import type { NodePart } from '../../query/ast/node-part';
import type { OffsetClause } from '../../query/ast/offset-clause';
import type { OrderByClause } from '../../query/ast/order-by-clause';
import type { OrderByElement } from '../../query/ast/order-by-element';
import { PathExpression } from '../../query/ast/path-expression';
import type { QueryExpression } from '../../query/ast/query-expression';
import type { QuerySpecification } from '../../query/ast/query-specification';
import type { RangeVariableDeclaration } from '../../query/ast/range-variable-declaration';
import type { SelectClause } from '../../query/ast/select-clause';
import type { SelectInsertSource } from '../../query/ast/select-insert-source';
import type { SelectScalarExpression } from '../../query/ast/select-scalar-expression';
import type { SetClause } from '../../query/ast/set-clause';
import { TableName } from '../../query/ast/table-name';
import type { TableReferenceExpression } from '../../query/ast/table-reference-expression';
import type { UpdateSpecification } from '../../query/ast/update-specification';
import type { ValuesInsertSource } from '../../query/ast/values-insert-source';
import type { WhereClause } from '../../query/ast/where-clause';
import type { SqlNode } from '../../query/sql-node';
import type { SqlVisitor } from '../../query/sql-visitor';
import { resolveIdentifier } from '../ast-helper';
import { resolveForwardRef } from '../forward-ref';
import type { GrammarInterface } from '../grammar.interface';
import { QueryBuilder } from '../query-builder';
import type { FedacoBuilder } from '../../fedaco/fedaco-builder';
import {
  FedacoBuilderSymbol,
  RelationSymbol,
} from '../../symbol/fedaco-symbol';
import type { Relation } from '../../fedaco/relations/relation';

export class QueryBuilderVisitor implements SqlVisitor {
  protected inJoinExpression = false;
  protected explicitBindingType: string;

  _isVisitUpdateSpecification: boolean;

  constructor(
    protected _grammar: GrammarInterface,
    /**
     * @deprecated
     * todo remove queryBuilder. should use binding only
     */
    protected _queryBuilder: QueryBuilder,
    protected ctx: Record<string, any>
  ) {
  }

  visit() {
    return 'hello';
  }

  visitAggregateFunctionCallFragment(node: AggregateFunctionCallFragment): string {
    let funcName = node.aggregateFunctionName.accept(this);
    funcName     = this._grammar.predicateFuncName(funcName);
    let columns;
    if (isArray(node.distinct)) {
      const list = node.distinct.map((it: SqlNode) => it.accept(this) as unknown as string);
      columns    = this._grammar.distinctInAggregateFunctionCall(list);
    } else {
      columns = node.aggregateColumns.map(it => it.accept(this)).join(', ');
      if (node.distinct === true && columns !== '*') {
        columns = 'DISTINCT ' + columns;
      }
    }
    return `${funcName}(${columns})`;
  }

  visitAsExpression(node: AsExpression): string {
    return `${node.name.accept(this)} AS ${node.as.accept(this)}`;
  }

  visitDeleteSpecification(node: DeleteSpecification): string {
    // language=SQL format=false
    let sql = `DELETE FROM ${node.target.accept(this)}`;

    if (node.fromClause) {
      sql += ` ${node.fromClause.accept(this)}`;
    }

    if (node.whereClause) {
      sql += ` ${node.whereClause.accept(this)}`;
    }

    if (node.orderByClause) {
      sql += ` ${node.orderByClause.accept(this)}`;
    }
    if (node.offsetClause) {
      sql += ` ${node.offsetClause.accept(this)}`;
    }
    if (node.limitClause) {
      sql += ` ${node.limitClause.accept(this)}`;
    }
    return sql;
  }

  visitAssignmentSetClause(node: AssignmentSetClause): string {
    return `${node.column.accept(this)} = ${node.value.accept(this)}`;
  }

  visitBetweenPredicateExpression(node: BetweenPredicateExpression): string {
    return `${
      node.expression.accept(this)}${node.not ? ' NOT' : ''
    } BETWEEN ${node.leftBetween.accept(this)} AND ${node.rightBetween.accept(this)}`;
  }

  visitBinaryExpression(node: BinaryExpression): string {
    // 'and' | 'or'
    return `${node.left.accept(this)} ${node.operator.toUpperCase()} ${node.right.accept(this)}`;
  }

  visitBinaryUnionQueryExpression(node: BinaryUnionQueryExpression): string {
    let sql;
    if (node.left instanceof BinaryUnionQueryExpression) {
      const leftSql = node.left.accept(this)
      const rightSql = node.right instanceof NestedExpression
        ? node.right.accept(this)
        : `(${node.right.accept(this)})`;

      sql = `${leftSql} UNION${node.all ? ' ALL' : ''} ${rightSql}`;
    } else {
      const leftSql = node.left instanceof NestedExpression
        ? node.left.accept(this)
        : `(${node.left.accept(this)})`;

      const rightSql = node.right instanceof NestedExpression
        ? node.right.accept(this)
        : `(${node.right.accept(this)})`;

      sql = `${leftSql} UNION${node.all ? ' ALL' : ''} ${
        rightSql
      }`;
    }

    sql += this.visitQueryExpression(node);

    return sql;
  }

  /**
   * todo fixme binding variable
   * generate a placeholder for sql
   * @param node
   */
  visitBindingVariable(node: BindingVariable): string {
    this._queryBuilder.addBinding(
      node.bindingExpression.accept(this),
      this.explicitBindingType ??
      (node.type === 'where' && this.inJoinExpression ? 'join' : node.type)
    );
    // this._queryBuilder.addBinding(node.bindingExpression.dispatch(this), 'where')
    return `?`;
  }

  visitColumnReferenceExpression(node: ColumnReferenceExpression): string {
    const columnName = resolveIdentifier(node.fieldAliasIdentificationVariable);
    if (columnName) {
      return `${node.expression.accept(this)} AS ${this._grammar.quoteColumnName(
        columnName
      )}`;
    } else {
      return `${node.expression.accept(this)}`;
    }
  }

  visitCommonValueExpression(node: CommonValueExpression): string {
    throw new Error('Method not implemented.');
  }

  visitComparisonExpression(node: ComparisonPredicateExpression): string {
    const left = node.left.accept(this);
    if (
      node.right instanceof BindingVariable &&
      node.right.bindingExpression instanceof RawExpression &&
      node.right.bindingExpression.value == null
    ) {
      if (node.operator === '=') {
        return `${left} is null`;
      } else if (node.operator === '!=' || node.operator === '<>') {
        return `${left} is not null`;
      }
    }
    return `${left} ${node.operator} ${node.right.accept(this)}`;
  }

  /**
   * todo `AND` is not right here.
   * @param node
   */
  visitConditionExpression(node: ConditionExpression): string {
    return node.conditionTerms.map(it => it.accept(this)).join(' AND ');
  }

  visitConditionTermExpression(node: SqlNode): string {
    throw new Error('Method not implemented.');
  }

  visitExistsPredicateExpression(node: ExistsPredicateExpression): string {
    return `${node.not ? 'NOT EXISTS' : 'EXISTS'} ${node.expression.accept(this)}`;
  }

  visitFieldAsExpression(node: SqlNode): string {
    throw new Error('Method not implemented.');
  }

  visitFromClause(node: FromClause): string {
    if (node.joins.length > 0) {
      const joins = node.joins.map(it => it.accept(this));
      return `FROM ${node.from.accept(this)} ${joins.join(' ')}`;
    } else {
      return `FROM ${node.from.accept(this)}`;
    }

  }

  visitFromTable(node: FromTable): string {
    let rst;
    // if (node.table instanceof Identifier) {
    //   const tableName = node.table.accept(this);
    //   rst             = this._grammar.quoteTableName(tableName);
    // } else {
    rst = node.table.accept(this);
    // }
    if (node.indexBy) {
      // const indexBy = this._grammar.indexby(node.indexBy.dispatch(this));
      // result += indexBy;
    }
    return `${rst}`;
  }

  visitFunctionCallExpression(node: FunctionCallExpression): string {
    let funcName = node.name.accept(this);
    funcName     = this._grammar.predicateFuncName(funcName);

    return `${funcName}(${
      node.parameters.map(it => it.accept(this)).join(', ')
    })`;
  }

  visitGroupByClause(node: GroupByClause): string {
    return `GROUP BY ${node.groups.map(it => it.accept(this)).join(', ')}`;
  }

  visitHavingClause(node: HavingClause): string {
    return `HAVING ${node.expressions.map(it => it.accept(this)).join(',')}`;
  }

  visitIdentifier(node: Identifier): string {
    if (isString(node.name)) {
      return node.name;
    }
    return resolveForwardRef(node.name);
  }

  /**
   * @deprecated
   * @param node
   */
  visitIdentifyVariableDeclaration(node: IdentifyVariableDeclaration): string {
    let rst                               = '';
    const visitedRangeVariableDeclaration = node.rangeVariableDeclaration.accept(this);
    rst += visitedRangeVariableDeclaration;
    if (node.indexBy) {
      // const indexBy = this._grammar.indexby(node.indexBy.dispatch(this));
      // result += indexBy;
    }
    return rst;
  }

  visitInPredicateExpression(node: InPredicateExpression): string {
    if (node.subQuery) {
      return `${node.expression.accept(this)}${node.not ? ' NOT' : ''
      } IN ${node.subQuery.accept(this)}`;
    }

    if (node.values.length === 0) {
      if (node.not) {
        return `1 = 1`;
      } else {
        return `0 = 1`;
      }
    }
    return `${node.expression.accept(this)}${node.not ? ' NOT' : ''
    } IN (${node.values.map(it => it.accept(this)).join(', ')})`;
  }

  visitInsertSpecification(node: InsertSpecification): string {
    let sql = `INSERT ${node.insertOption.toUpperCase()} ${node.target.accept(this)}`;
    sql += ` (${node.columns.map(it => it.accept(this)).join(', ')})`;
    sql += `${node.insertSource.accept(this)}`;
    return sql;
  }

  visitJoinClause(node: JoinClause): string {
    throw new Error('not implement');
  }

  visitJoinExpression(node: JoinExpression): string {
    this.inJoinExpression = true;
    // todo remove identifier check
    let tableName;
    if (node.name instanceof Identifier) {
      tableName = this._grammar.quoteTableName(node.name.accept(this));
    } else if (node.name instanceof JoinedTable) {
      tableName = `(${node.name.accept(this)})`;
    } else {
      tableName = `${node.name.accept(this)}`;
    }

    const sql = `${node.type.toUpperCase()} JOIN ${tableName}${node.on ? ` ON ${node.on.accept(
      this)}` : ''}`;

    this.inJoinExpression = false;
    return sql;
  }

  visitJoinFragment(node: JoinFragment): string {
    return this._grammar.stepJoinFragment(node.joinQueryBuilder, this);
  }

  visitJoinOnExpression(node: JoinOnExpression): string {
    return `${node.columnExpression.accept(this)} ${node.operator} ${
      node.rightExpression.accept(this)
    }`;
  }

  visitJoinedTable(node: JoinedTable): string {
    return `${node.from.accept(this)} ${node.joinExpressions.map(it => it.accept(this)).join(' ')}`;
  }

  visitJsonPathColumn(node: JsonPathColumn): string {
    return `json_extract(${node.columns.accept(this)}, ${node.jsonPaths.accept(this)})`;
  }

  visitJsonPathExpression(node: JsonPathExpression): string {
    const pathLeg = node.pathLeg.accept(this);
    if (pathLeg === '->') {
      return `json_extract(${node.pathExpression.accept(this)}, "$.${node.jsonLiteral.accept(
        this)}")`;
    } else if (pathLeg === '->>') {
      return `json_unquote(json_extract(${
        node.pathExpression.accept(this)
      }, "$.${
        node.jsonLiteral.accept(this)
      }"))`;
    }
    throw new Error('unknown path leg');
    // return `'$.${node.pathExpression.map(it => `"${it.accept(this)}"`).join('.')}'`;
  }

  visitLimitClause(node: LimitClause): string {
    return `LIMIT ${node.value}`;
  }

  visitNestedExpression(node: NestedExpression): string {

    let sql;
    if(isString(node.expression)) {
      sql = `(${node.expression})`;

      // node.bindings.forEach(it => {
      //   it.accept(this);
      // });
      this._queryBuilder.addBinding(node.bindings, node.type);
    } if (node.expression instanceof QueryBuilder) {
      //must reset binding because
      node.expression.resetBindings();

      // // must reset to current grammar make sure the same context
      // node.expression._grammar = this._grammar;

      sql = `(${this._grammar.compileSelect(node.expression, this.ctx)})`;

      const bindings = node.expression.getBindings();
      this._queryBuilder.addBinding(bindings, node.type);
    } else if(
      (node.expression as FedacoBuilder)[FedacoBuilderSymbol] ||
      (node.expression as Relation)[RelationSymbol]
    ) {
      const {result, bindings} = (node.expression as FedacoBuilder | Relation).toSql(this.ctx);
      sql = `(${result})`;
      this._queryBuilder.addBinding(bindings, node.type);

    } else if (node.expression instanceof RawExpression) {
      // todo check raw binding. should put it in node type
      sql = `(${node.expression.accept(this)})`;
      // node.bindings.forEach(it => {
      //   it.accept(this);
      // });
      this._queryBuilder.addBinding(node.bindings, node.type);
    }

    return sql;
  }

  visitNestedPredicateExpression(node: NestedPredicateExpression): string {
    if (node.query instanceof QueryBuilder) {

      // // must reset to current grammar make sure the same context
      // node.query._grammar = this._grammar;

      return this._grammar.stepNestedPredicate(node.query, this);
    } else {
      return `(${node.query})`;
    }
  }

  visitNodePart(node: NodePart): string {
    return 'node part';
  }

  visitNullPredicateExpression(node: NullPredicateExpression): string {
    if (node.expression.expression instanceof JsonPathExpression) {
      const sql = node.expression.accept(this);
      if (node.not) {
        return `(${sql} IS NOT NULL AND json_type(${sql}) != 'NULL')`;
      } else {
        return `(${sql} IS NULL OR json_type(${sql}) = 'NULL')`;
      }
    }
    return `${node.expression.accept(this)}${node.not ? ' IS NOT NULL' : ' IS NULL'}`;
  }

  visitNumberLiteralExpression(node: NumberLiteralExpression): string {
    return `${node.value}`;
  }

  visitOffsetClause(node: OffsetClause): string {
    return `OFFSET ${node.offset}`;
  }

  visitOrderByClause(node: OrderByClause): string {
    return `ORDER BY ${node.elements.map(it => it.accept(this))
      .filter(it => !isBlank(it) && it.length > 0)
      .join(', ')}`;
  }

  visitOrderByElement(node: OrderByElement, ctx?: any): string {
    let rejectColumns = [];
    if (ctx && ctx.rejectColumns) {
      rejectColumns = ctx.rejectColumns;
    }
    const columnName = `${node.column.accept(this)}`;
    if (rejectColumns.includes(columnName)) {
      return '';
    } else {
      const direction = `${node.direction.toUpperCase()}`;
      return `${columnName} ${direction}`;
    }
  }

  visitParenthesizedExpression(node: ParenthesizedExpression): string {
    return `(${node.expression.accept(this)})`;
  }

  visitPathExpression(node: PathExpression): string {
    let schemaName = node.schemaIdentifier ? `${node.schemaIdentifier.accept(this)}` : null;
    let tableName  = node.tableIdentifier ? `${node.tableIdentifier.accept(this)}` : null;
    let columnName = node.columnIdentifier ? `${node.columnIdentifier.accept(this)}` : null;

    if (node.schemaIdentifier instanceof Identifier) {
      schemaName = this._grammar.quoteSchemaName(schemaName);
    }
    if (node.tableIdentifier instanceof Identifier) {
      tableName = this._grammar.quoteTableName(tableName);
    }
    if (node.columnIdentifier instanceof Identifier) {
      columnName = columnName === '*' ? '*' : this._grammar.quoteColumnName(columnName);
    }

    let tableAlias;

    if (tableName) {
      const withAlias = tableName.replace(/'"`/g, '').split(/\s+as\s+/i);
      if (withAlias.length > 1) {
        tableAlias = withAlias.pop();

        tableName = tableAlias;
      }
    }
    // last table no need for simple update(update with not join)
    if ((this._isVisitUpdateSpecification && !this._queryBuilder._joins.length)) {
      if (!tableAlias) {
        return columnName;
      }
    }

    if (tableName) {
      return `${tableName}.${columnName}`;
    }
    return columnName;
  }

  visitQueryExpression(node: QueryExpression): string {
    let sql = '';
    if (node.orderByClause) {
      sql += ` ${node.orderByClause.accept(this)}`;
    }

    if (node.limitClause) {
      sql += ` ${node.limitClause.accept(this)}`;
    }

    if (node.offsetClause) {
      sql += ` ${node.offsetClause.accept(this)}`;
    }

    return sql;
  }

  visitQuerySpecification(node: QuerySpecification): string {
    let sql = `${node.selectClause.accept(this)}`;

    if (node.fromClause) {
      sql += ` ${node.fromClause.accept(this)}`;
    }

    if (node.whereClause) {
      sql += ` ${node.whereClause.accept(this)}`;
    }

    if (node.groupByClause) {
      sql += ` ${node.groupByClause.accept(this)}`;
    }

    if (node.havingClause) {
      sql += ` ${node.havingClause.accept(this)}`;
    }

    if (node.lockClause) {
      sql += ` ${node.lockClause.accept(this)}`;
    }

    sql += this.visitQueryExpression(node);

    return sql;
  }

  visitRangeVariableDeclaration(node: RangeVariableDeclaration): string {
    const quoteTableName = this._grammar.quoteTableName(node.abstractSchemaName);
    if (node.aliasIdentificationVariable) {
      return `${quoteTableName} AS ${this._grammar.quoteTableName(
        node.aliasIdentificationVariable)}`;
    } else {
      return `${quoteTableName}`;
    }
  }

  visitRawBindingExpression(node: RawBindingExpression): string {
    node.bindings.forEach(it => {
      it.accept(this);
    });
    return `${node.raw.accept(this)}`;
  }

  visitRawExpression(node: RawExpression): string | number | boolean {
    if (isBoolean(node.value)) {
      return node.value;
    } else if (isNumber(node.value)) {
      return +node.value;
    } else if (isArray(node.value)) {
      return node.value;
    } else if (isBlank(node.value)) {
      return null;
    } else {
      return `${node.value}`;
    }
  }

  visitSelectClause(node: SelectClause): string {
    if (node.selectExpressions.length > 0) {
      const selectExpressions = node.selectExpressions.map(expression => {
        return expression.accept(this);
      });
      return `SELECT${node.distinct ? ` ${
        this._grammar.distinct(node.distinct)} ` : ' '}${selectExpressions.join(', ')}`;
    } else {
      return `SELECT${node.distinct ? ` ${this._grammar.distinct(node.distinct)} ` : ' '}*`;
    }
  }

  visitSelectInsertSource(node: SelectInsertSource): string {
    throw new Error('Method not implemented.');
  }

  visitSelectScalarExpression(node: SelectScalarExpression): string {
    return `${node.expression.accept(this)} AS ${node.columnName.accept(this)}`;
  }

  visitSetClause(node: SetClause): string {
    throw new Error('Method not implemented.');
  }

  visitStringLiteralExpression(node: StringLiteralExpression): string {
    if (isString(node.value)) {
      return `"${node.value.replace(/"'`/g, '')}"`;
    }
    return `"${resolveForwardRef(node.value).replace(/"'`/g, '')}"`;
  }

  visitTableName(node: TableName): string {
    const tableName = [];
    if (node.serverIdentifier) {
      tableName.push(node.serverIdentifier.accept(this));
    }
    if (node.databaseIdentifier) {
      tableName.push(node.databaseIdentifier.accept(this));
    }
    if (node.schemaIdentifier) {
      tableName.push(this._grammar.quoteSchemaName(node.schemaIdentifier.accept(this)));
    }

    if (node.baseIdentifier) {
      tableName.push(this._grammar.quoteTableName(node.baseIdentifier.accept(this)));
    } else {
      throw new Error('invalid table name');
    }

    return tableName.join('.');
  }

  visitTableReferenceExpression(node: TableReferenceExpression): string {
    let name;
    if (node.expression instanceof Identifier) {
      name = this._grammar.quoteTableName(node.expression.accept(this));
    } else if (node.expression instanceof PathExpression) {
      name = node.expression.accept(this);
    } else if (node.expression instanceof TableName) {
      name = node.expression.accept(this);
    } else {
      // todo improve me
      name = node.expression.accept(this);
    }
    if (node.alias) {
      const as = this._grammar.quoteTableName(node.alias.accept(this));
      return `${name} AS ${as}`;
    } else {
      return name;
    }
  }

  visitUnionFragment(node: UnionFragment): string {
    // return ` UNION${node.all ? ' ALL' : ''}`;
    throw new Error('should not run');
  }

  visitUpdateSpecification(node: UpdateSpecification): string {
    let sql = `UPDATE ${node.target.accept(this)}`;

    sql += ` SET ${node.setClauses.map(
      it => it.accept(this)).join(', ')
    }`;
    if (node.fromClause) {
      sql += ` ${node.fromClause.accept(this)}`;
    }
    if (node.whereClause) {
      sql += ` ${node.whereClause.accept(this)}`;
    }
    if (node.orderByClause) {
      sql += ` ${node.orderByClause.accept(this)}`;
    }
    if (node.offsetClause) {
      sql += ` ${node.offsetClause.accept(this)}`;
    }
    if (node.limitClause) {
      sql += ` ${node.limitClause.accept(this)}`;
    }
    return sql;
  }

  visitValuesInsertSource(node: ValuesInsertSource): string {
    if (node.isDefault) {
      return ' DEFAULT VALUES';
    } else if (node.select) {
      return ` ${node.select.accept(this)}`;
    } else {
      return ` VALUES ${node.valuesList.map(
        values => `(${values.map(it => it.accept(this)).join(', ')})`
      ).join(', ')}`;
    }
  }

  visitWhereClause(node: WhereClause): string {
    return `WHERE ${node.conditionExpression.accept(this)}`;
  }

  visitLockClause(node: LockClause): string {
    if (node.value === true) {
      return `for update`;
    } else if (node.value === false) {
      return 'lock in share mode';
    } else if (isString(node.value)) {
      return node.value;
    }
    throw new Error('unexpected lock clause');
  }

  visitRejectOrderElementExpression(node: RejectOrderElementExpression, ctx?: any): string {
    const parentRejectColumns = ctx && ctx.rejectColumns ? ctx.rejectColumns : [];
    const rejectColumns       = node.columns.map(it => it.accept(this));
    return `${node.orderByElements.map(it => it.accept(this, {
      rejectColumns: uniq([...rejectColumns, ...parentRejectColumns])
    })).filter(it => !isBlank(it) && it.length > 0).join(', ')}`;
  }

  visitNotExpression(node: NotExpression): string {
    return `not ${node.expression.accept(this)}`;
  }

  visitIndexBy(node: IndexBy): string {
    throw new Error('not implement');
  }
}

