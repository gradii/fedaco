import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { NestedPredicateExpression } from './fragment/expression/nested-predicate-expression';
import { NestedExpression } from './fragment/nested-expression';


export class OrderByElement extends SqlNode {
  constructor(
    public column: NestedExpression | SqlNode,
    public direction: string
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitOrderByElement(this);
  }
}