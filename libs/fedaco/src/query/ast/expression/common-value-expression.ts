/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../../sql-node';
import type { SqlVisitor } from '../../sql-visitor';
import { Expression } from './expression';


export class CommonValueExpression extends Expression {
  constructor() {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitCommonValueExpression(this);
  }
}
