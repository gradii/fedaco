/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import type { JoinExpression } from './join-expression';

export class JoinClause extends SqlNode {
  constructor(public joinExpression: JoinExpression) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitJoinClause(this);
  }
}
