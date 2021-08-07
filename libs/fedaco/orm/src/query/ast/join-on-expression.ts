import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { Expression } from './expression/expression';

export class JoinOnExpression extends SqlNode {
  constructor(
    public columnExpression: Expression,
    public operator: any,
    public rightExpression: Expression
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitJoinOnExpression(this);
  }
}