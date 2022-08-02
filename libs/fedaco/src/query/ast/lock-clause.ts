/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';


export class LockClause extends SqlNode {
  constructor(
    public value: boolean | string,
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitLockClause(this);
  }
}
