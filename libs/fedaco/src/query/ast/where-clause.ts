/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import type { ConditionExpression } from './expression/condition-expression';


export class WhereClause extends SqlNode {
  constructor(
    public conditionExpression: ConditionExpression
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitWhereClause(this);
  }
}
