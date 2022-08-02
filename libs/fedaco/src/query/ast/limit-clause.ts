/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import { OrderByElement } from './order-by-element';


export class LimitClause extends SqlNode {
  constructor(
    public value: number
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitLimitClause(this);
  }
}
