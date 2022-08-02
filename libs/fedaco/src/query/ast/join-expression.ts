/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { createKeyword } from '../../query-builder/ast-factory';
import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import type { ConditionExpression } from './expression/condition-expression';
import type { JoinOnExpression } from './join-on-expression';
import type { Identifier } from './identifier';
import type { JoinedTable } from './joined-table';
import type { PathExpression } from './path-expression';
import type { TableReferenceExpression } from './table-reference-expression';


export class JoinExpression extends SqlNode {
  constructor(
    public type = 'inner',
    public name: TableReferenceExpression | PathExpression | Identifier | JoinedTable,
    public on?: JoinOnExpression | ConditionExpression
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitJoinExpression(this);
  }

}

