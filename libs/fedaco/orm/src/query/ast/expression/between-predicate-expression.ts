import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
import { Expression } from './expression';


export class BetweenPredicateExpression extends Expression {
  constructor(
    public expression: Expression,
    public leftBetween: Expression,
    public rightBetween: Expression,
    public not: boolean = false
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitBetweenPredicateExpression(this);
  }
}