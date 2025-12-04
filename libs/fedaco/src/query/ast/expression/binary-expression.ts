/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { SqlVisitor } from '../../sql-visitor';
import { Expression } from './expression';

export class BinaryExpression extends Expression {
  constructor(
    public left: Expression,
    public operator: 'and' | 'or',
    public right: Expression,
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitBinaryExpression(this);
  }
}
