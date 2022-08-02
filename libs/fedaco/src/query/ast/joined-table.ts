/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ForwardRefFn } from '../../query-builder/forward-ref';
import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import { FromTable } from './from-table';
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
