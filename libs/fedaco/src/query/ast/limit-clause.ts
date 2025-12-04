/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';

export class LimitClause extends SqlNode {
  constructor(public value: number) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitLimitClause(this);
  }
}
