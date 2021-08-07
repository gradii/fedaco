import { QueryBuilder } from '../../../../query-builder/query-builder';
import { SqlVisitor } from '../../../sql-visitor';
import { Expression } from '../../expression/expression';


export class NestedPredicateExpression extends Expression {
  constructor(
    public query: QueryBuilder| string,
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitNestedPredicateExpression(this);
  }
}