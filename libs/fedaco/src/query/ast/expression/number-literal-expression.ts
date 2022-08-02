/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../../sql-node';
import type { SqlVisitor } from '../../sql-visitor';


export class NumberLiteralExpression extends SqlNode {

  constructor(
    public value: number
  ) {
    super();
  }

  get text() {
    return this.value.toString();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitNumberLiteralExpression(this);
  }
}
