/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../../sql-node';
import type { SqlVisitor } from '../../sql-visitor';
import type { Identifier } from '../identifier';
import type { Expression } from './expression';

export class AsExpression extends SqlNode {

  constructor(
    public name: Expression,
    public as: Identifier
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitAsExpression(this);
  }
}
