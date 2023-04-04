/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';


export class BindingVariable extends SqlNode {
  constructor(
    public bindingExpression: SqlNode,
    public type = 'where'
  ) {
    super();
  }

  public accept(visitor: SqlVisitor, ctx?: any) {
    return visitor.visitBindingVariable(this);
  }
}
