/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlVisitor } from './sql-visitor';

export abstract class SqlNode {

  public __toString() {
    // return this.dump(this);
  }

  public accept(visitor: SqlVisitor) {
    // throw ASTException.noDispatchForNode(this);
  }

  public dump(obj: object) {

  }
}
