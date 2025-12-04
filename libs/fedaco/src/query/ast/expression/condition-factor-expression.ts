/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../../sql-node';
import type { SqlVisitor } from '../../sql-visitor';

export class ConditionFactorExpression extends SqlNode {
  constructor() {
    super();
  }

  accept(visitor: SqlVisitor) {
    super.accept(visitor);
  }
}
