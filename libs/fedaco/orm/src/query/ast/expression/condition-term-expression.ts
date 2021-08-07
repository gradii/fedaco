import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';


export class ConditionTermExpression extends SqlNode {
  constructor(

  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitConditionTermExpression(this);
  }
}