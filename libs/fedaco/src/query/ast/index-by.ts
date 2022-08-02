/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';

/**
 * IndexBy ::= "INDEX" "BY" SimpleStateFieldPathExpression
 */

export class IndexBy extends SqlNode {
  public constructor(
    public simpleStateFieldPathExpression: SqlNode/*: PathExpression*/ = null
  ) {
    super();
  }

  public accept(sqlVisitor: SqlVisitor) {
    return sqlVisitor.visitIndexBy(this);
  }
}
