/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { QueryBuilder } from '../../../../query-builder/query-builder';
import type { SqlVisitor } from '../../../sql-visitor';
import { Expression } from '../../expression/expression';

export class NestedPredicateExpression extends Expression {
  visited = false;

  constructor(public query: QueryBuilder | string) {
    super();
  }

  accept(visitor: SqlVisitor) {
    if (this.visited) {
      throw new Error('NestedPredicateExpression should have different sql node. same sql node found!');
    }
    this.visited = true;
    return visitor.visitNestedPredicateExpression(this);
  }
}
