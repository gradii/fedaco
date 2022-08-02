/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import type { BindingVariable } from './binding-variable';
import type { ColumnReferenceExpression } from './column-reference-expression';
import type { RawBindingExpression } from './expression/raw-binding-expression';
import type { RawExpression } from './expression/raw-expression';

export class AssignmentSetClause extends SqlNode {
  constructor(
    public column: ColumnReferenceExpression,
    public value: RawExpression | RawBindingExpression | BindingVariable
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitAssignmentSetClause(this);
  }
}
