/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { ForwardRefFn } from '../../query-builder/forward-ref';
import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';


export class Identifier extends SqlNode {
  constructor(
    public name: string | ForwardRefFn<string>
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitIdentifier(this);
  }
}
