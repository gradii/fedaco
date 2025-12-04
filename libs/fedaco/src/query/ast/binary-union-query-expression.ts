/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import { QueryExpression } from './query-expression';

export class BinaryUnionQueryExpression extends QueryExpression {
  constructor(
    public left: SqlNode,
    public right: SqlNode,
    public all: boolean,
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitBinaryUnionQueryExpression(this);
  }
}
