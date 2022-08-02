/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { SqlVisitor } from '../../sql-visitor';
import type { ConditionFactorExpression } from './condition-factor-expression';
import type { ConditionTermExpression } from './condition-term-expression';
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
