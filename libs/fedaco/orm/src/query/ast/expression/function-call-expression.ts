import { SqlVisitor } from '../../sql-visitor';
import { Identifier } from '../identifier';
import { Expression } from './expression';

export class FunctionCallExpression extends Expression {
  constructor(
    public name: Identifier,
    public parameters: Expression[]
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitFunctionCallExpression(this);
  }
}