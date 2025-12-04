/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { BinaryUnionQueryExpression } from '../../query/ast/binary-union-query-expression';
import { AsExpression } from '../../query/ast/expression/as-expression';
import type { ComparisonPredicateExpression } from '../../query/ast/expression/comparison-predicate-expression';
import { FunctionCallExpression } from '../../query/ast/expression/function-call-expression';
import { createIdentifier } from '../ast-factory';
import type { GrammarInterface } from '../grammar.interface';
import type { QueryBuilder } from '../query-builder';
import { QueryBuilderVisitor } from './query-builder-visitor';
import { NestedExpression } from '../../query/ast/fragment/nested-expression';

export class SqliteQueryBuilderVisitor extends QueryBuilderVisitor {
  constructor(
    _grammar: GrammarInterface,
    /**
     * @deprecated
     * todo remove queryBuilder. should use binding only
     */
    _queryBuilder: QueryBuilder,
    ctx: Record<string, any>,
  ) {
    super(_grammar, _queryBuilder, ctx);
  }

  visitBinaryUnionQueryExpression(node: BinaryUnionQueryExpression): string {
    const leftSql = node.left instanceof NestedExpression ? node.left.accept(this) : `(${node.left.accept(this)})`;

    const rightSql = node.right instanceof NestedExpression ? node.right.accept(this) : `(${node.right.accept(this)})`;

    let sql = 'SELECT * FROM ' + `${leftSql} UNION${node.all ? ' ALL' : ''} SELECT * FROM ${rightSql}`;

    sql += this.visitQueryExpression(node);
    return sql;
  }

  visitFunctionCallExpression(node: FunctionCallExpression): string {
    let funcName = node.name.accept(this);
    funcName = this._grammar.predicateFuncName(funcName);
    switch (funcName) {
      case 'date':
        return `strftime('%Y-%m-%d', ${node.parameters.map((it) => it.accept(this)).join(', ')})`;
      case 'year':
        return `strftime('%Y', ${node.parameters.map((it) => it.accept(this)).join(', ')})`;
      case 'month':
        return `strftime('%m', ${node.parameters.map((it) => it.accept(this)).join(', ')})`;
      case 'day':
        return `strftime('%d', ${node.parameters.map((it) => it.accept(this)).join(', ')})`;
      case 'time':
        return `strftime('%H:%M:%S', ${node.parameters.map((it) => it.accept(this)).join(', ')})`;
      case 'json_contains':
        throw new Error('ExceptionRuntimeException sqlite does not support json_contains');
      case 'json_array_length': {
        return `${funcName}(${node.parameters
          .map((it) => it.accept(this))
          .join(', ')
          .replace(/^json_extract\((.+)\)$/, '$1')})`;
      }
    }

    return super.visitFunctionCallExpression(node);
  }

  visitComparisonExpression(node: ComparisonPredicateExpression): string {
    const operator = node.operator.toUpperCase();
    if (node.left instanceof FunctionCallExpression) {
      const functionName = node.left.name.accept(this).toLowerCase();
      if (['day', 'month', 'year', 'date', 'time'].includes(functionName)) {
        node.right = new FunctionCallExpression(createIdentifier('cast'), [
          new AsExpression(node.right, createIdentifier('text')),
        ]);
      }
    }

    if (['LIKE'].includes(operator)) {
      return `${node.left.accept(this)} ${operator} ${node.right.accept(this)}`;
    }

    return super.visitComparisonExpression(node);
  }
}
