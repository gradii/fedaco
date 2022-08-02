/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';


export class SetClause extends SqlNode {
  constructor() {
    super();
  }

  accept(visitor: SqlVisitor, ctx?: any) {
    return visitor.visitSetClause(this, ctx);
  }
}
