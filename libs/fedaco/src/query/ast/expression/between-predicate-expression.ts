/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { SqlVisitor } from '../../sql-visitor';
import { Expression } from './expression';

export class BetweenPredicateExpression extends Expression {
  constructor(
    public expression: Expression,
    public leftBetween: Expression,
    public rightBetween: Expression,
    public not = false,
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitBetweenPredicateExpression(this);
  }
}
