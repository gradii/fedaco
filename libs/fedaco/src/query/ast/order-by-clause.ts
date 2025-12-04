/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import type { OrderByElement } from './order-by-element';

export class OrderByClause extends SqlNode {
  constructor(public elements: OrderByElement[]) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitOrderByClause(this);
  }
}
