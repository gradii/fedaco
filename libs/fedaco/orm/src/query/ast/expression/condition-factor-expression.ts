import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';


export class ConditionFactorExpression extends SqlNode {
  constructor() {
    super();
  }

  accept(visitor: SqlVisitor) {
    super.accept(visitor);
  }
}