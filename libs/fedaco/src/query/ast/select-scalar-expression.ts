/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import type { Expression } from './expression/expression';


export class SelectScalarExpression extends SqlNode {
  constructor(
    public expression: Expression,
    // identifierOrValueExpression
    public columnName: SqlNode
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitSelectScalarExpression(this);
  }
}
