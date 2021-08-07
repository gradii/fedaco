import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { JoinExpression } from './join-expression';


export class JoinClause extends SqlNode {
  constructor(public joinExpression: JoinExpression) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitJoinClause(this);
  }
}