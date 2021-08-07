import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { BindingVariable } from './binding-variable';
import { ColumnReferenceExpression } from './column-reference-expression';
import { RawBindingExpression } from './expression/raw-binding-expression';
import { RawExpression } from './expression/raw-expression';

export class AssignmentSetClause extends SqlNode {
  constructor(
    public column: ColumnReferenceExpression,
    public value: RawExpression | RawBindingExpression | BindingVariable
  ) {
    super();
  }
  accept(visitor: SqlVisitor) {
    return visitor.visitAssignmentSetClause(this)
  }
}