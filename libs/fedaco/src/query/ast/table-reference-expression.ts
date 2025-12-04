/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import type { ParenthesizedExpression } from './expression/parenthesized-expression';
import type { NestedExpression } from './fragment/nested-expression';
import type { Identifier } from './identifier';
import type { PathExpression } from './path-expression';
import type { TableName } from './table-name';

export class TableReferenceExpression extends SqlNode {
  constructor(
    public expression: ParenthesizedExpression | TableName | NestedExpression,
    public alias?: Identifier | PathExpression,
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitTableReferenceExpression(this);
  }
}
