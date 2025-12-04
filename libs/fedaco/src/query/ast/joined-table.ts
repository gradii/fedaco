/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import type { JoinExpression } from './join-expression';
import type { TableReferenceExpression } from './table-reference-expression';

/**
 */
export class JoinedTable extends SqlNode {
  constructor(
    public from: TableReferenceExpression,
    public joinExpressions: JoinExpression[],
  ) {
    super();
  }

  public accept(sqlVisitor: SqlVisitor) {
    return sqlVisitor.visitJoinedTable(this);
  }
}
