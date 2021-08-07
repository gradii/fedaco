import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { ParenthesizedExpression } from './expression/parenthesized-expression';
import { NestedExpression } from './fragment/nested-expression';
import { Identifier } from './identifier';
import { PathExpression } from './path-expression';
import { TableName } from './table-name';


export class TableReferenceExpression extends SqlNode {

  constructor(public expression: ParenthesizedExpression | TableName | NestedExpression,
              public alias?: Identifier|PathExpression) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitTableReferenceExpression(this);
  }
}