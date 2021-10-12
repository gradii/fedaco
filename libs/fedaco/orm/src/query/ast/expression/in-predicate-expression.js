import { Expression } from './expression';

export class InPredicateExpression extends Expression {
  constructor(expression, values, subQuery, not = false) {
    super();
    this.expression = expression;
    this.values = values;
    this.subQuery = subQuery;
    this.not = not;
  }

  accept(visitor) {
    return visitor.visitInPredicateExpression(this);
  }
}
