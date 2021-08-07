import { SqlVisitor } from '../../sql-visitor';
import { Expression } from './expression';

export class ParenthesizedExpression extends Expression {
  constructor(
    public expression: Expression
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitParenthesizedExpression(this)
  }
}