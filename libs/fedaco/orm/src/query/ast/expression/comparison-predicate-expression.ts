import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
import { Expression } from './expression';


export class ComparisonPredicateExpression extends Expression {
  constructor(
    public left: SqlNode,
    public operator: string,
    public right: SqlNode,
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitComparisonExpression(this);
  }
}