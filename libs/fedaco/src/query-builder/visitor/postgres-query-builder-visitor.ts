/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isString } from '@gradii/nanofn';
import { BindingVariable } from '../../query/ast/binding-variable';
import type { ColumnReferenceExpression } from '../../query/ast/column-reference-expression';
import type { ComparisonPredicateExpression } from '../../query/ast/expression/comparison-predicate-expression';
import type { FunctionCallExpression } from '../../query/ast/expression/function-call-expression';
import type { JsonPathExpression } from '../../query/ast/json-path-expression';
import type { LockClause } from '../../query/ast/lock-clause';
import type { GrammarInterface } from '../grammar.interface';
import { QueryBuilder } from '../query-builder';
import { QueryBuilderVisitor } from './query-builder-visitor';

const LIKES = ['LIKE', 'ILIKE', 'NOT LIKE', 'NOT ILIKE'];

export class PostgresQueryBuilderVisitor extends QueryBuilderVisitor {
  constructor(
    _grammar: GrammarInterface,
    /**
     * @deprecated
     * todo remove queryBuilder. should use binding only
     */
    _queryBuilder: QueryBuilder,
    ctx: Record<string | 'offset', any>
  ) {
    ctx.offset = ctx.offset ?? 0;
    super(_grammar, _queryBuilder, ctx);
  }

  visitFunctionCallExpression(node: FunctionCallExpression): string {
    let funcName = node.name.accept(this);
    funcName = this._grammar.compilePredicateFuncName(funcName);
    if (['day', 'month', 'year'].includes(funcName)) {
      return `extract(${funcName} from ${node.parameters
        .map((it) => it.accept(this))
        .join(', ')})`;
    }
    if (['date', 'time'].includes(funcName)) {
      return `${node.parameters
        .map((it) => it.accept(this))
        .join(', ')}::${funcName}`;
    }
    if (['json_contains'].includes(funcName)) {
      return `(${node.parameters
        .slice(0, node.parameters.length - 1)
        .map((it) => it.accept(this))
        .join(', ')})::jsonb @> ${node.parameters[
        node.parameters.length - 1
      ].accept(this)}`;
    }
    if (['json_array_length'].includes(funcName)) {
      return `json_array_length((${node.parameters
        .map((it) => it.accept(this))
        .join(', ')})::json)`;
    }

    return super.visitFunctionCallExpression(node);
  }

  visitComparisonExpression(node: ComparisonPredicateExpression): string {
    const operator = node.operator.toUpperCase();
    if (LIKES.includes(operator)) {
      return `${node.left.accept(this)}::text ${operator} ${node.right.accept(
        this
      )}`;
    }
    return super.visitComparisonExpression(node);
  }

  visitColumnReferenceExpression(node: ColumnReferenceExpression): string {
    if (this._queryBuilder._joins.length > 0) {
      return super.visitColumnReferenceExpression(node);
    } else {
      // return super.visitColumnReferenceExpression(node).split('.').pop();
      return super.visitColumnReferenceExpression(node);
    }
  }

  visitJsonPathExpression(node: JsonPathExpression): string {
    const pathLeg = node.pathLeg.accept(this);
    if (pathLeg === '->') {
      return `${node.pathExpression.accept(this)}->"${node.jsonLiteral.accept(
        this
      )}"`;
    } else if (pathLeg === '->>') {
      return `${node.pathExpression.accept(this)}->>"${node.jsonLiteral.accept(
        this
      )}"`;
    }
    throw new Error('unknown path leg');
  }

  visitLockClause(node: LockClause) {
    if (node.value === true) {
      return `for update`;
    } else if (node.value === false) {
      return 'for share';
    } else if (isString(node.value)) {
      return node.value;
    }

    throw new Error('unexpected lock clause');
  }

  visitBindingVariable(node: BindingVariable): string {
    super.visitBindingVariable(node);
    this.ctx.offset = (this.ctx.offset ?? 0) + 1;
    return `$${this.ctx.offset}`;
  }
}
