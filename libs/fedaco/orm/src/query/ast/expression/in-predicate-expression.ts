import { NestedExpression } from '../fragment/nested-expression';
import { QueryBuilder } from './../../../query-builder/query-builder';
import { SqlVisitor } from '../../sql-visitor';
import { Expression } from './expression';


export class InPredicateExpression extends Expression {
  constructor(
    public expression: Expression,
    public values: Expression[],
    public subQuery?: NestedExpression,
    public not: boolean = false,
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitInPredicateExpression(this);
  }
}