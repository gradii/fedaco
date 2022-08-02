/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import type { NestedExpression } from './fragment/nested-expression';


export class OrderByElement extends SqlNode {
  constructor(
    public column: NestedExpression | SqlNode,
    public direction: string
  ) {
    super();
  }

  accept(visitor: SqlVisitor, ctx?: any) {
    return visitor.visitOrderByElement(this, ctx);
  }
}
