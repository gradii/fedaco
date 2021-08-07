import { SqlVisitor } from '../../sql-visitor';
import { ConditionFactorExpression } from './condition-factor-expression';
import { ConditionTermExpression } from './condition-term-expression';
import { Expression } from './expression';


export class ConditionExpression extends Expression {
  constructor(
    public conditionTerms: Array<ConditionTermExpression | ConditionFactorExpression>
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitConditionExpression(this);
  }
}