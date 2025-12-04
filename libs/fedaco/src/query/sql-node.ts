/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { SqlVisitor } from './sql-visitor';

export abstract class SqlNode {
  public __toString() {
    // return this.dump(this);
  }

  public accept(visitor: SqlVisitor, ctx?: any) {
    // throw ASTException.noDispatchForNode(this);
  }

  public dump(obj: object) {}
}
