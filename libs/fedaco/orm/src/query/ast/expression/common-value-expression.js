import { Expression } from './expression';

export class CommonValueExpression extends Expression {
  constructor() {
    super();
  }

  accept(visitor) {
    return visitor.visitCommonValueExpression(this);
  }
}
