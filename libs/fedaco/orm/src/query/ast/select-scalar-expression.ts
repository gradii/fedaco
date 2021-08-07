import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { Expression } from './expression/expression';


export class SelectScalarExpression extends SqlNode {
  constructor(
    public expression: Expression,
    //identifierOrValueExpression
    public columnName: SqlNode
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitSelectScalarExpression(this)
  }
}