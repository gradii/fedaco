/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';


export class HavingClause extends SqlNode {
  constructor(
    public expressions: SqlNode[],
    public conjunction: string = 'and'
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitHavingClause(this);
  }
}
