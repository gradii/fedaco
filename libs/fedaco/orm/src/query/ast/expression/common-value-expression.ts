import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
import { Expression } from './expression';


export class CommonValueExpression extends Expression {
  constructor() {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitCommonValueExpression(this);
  }
}