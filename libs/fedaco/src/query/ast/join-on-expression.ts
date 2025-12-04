/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import type { Expression } from './expression/expression';

export class JoinOnExpression extends SqlNode {
  constructor(
    public columnExpression: Expression,
    public operator: any,
    public rightExpression: Expression,
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitJoinOnExpression(this);
  }
}
