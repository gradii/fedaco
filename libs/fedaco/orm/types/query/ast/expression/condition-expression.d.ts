/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlVisitor } from '../../sql-visitor';
import { ConditionFactorExpression } from './condition-factor-expression';
import { ConditionTermExpression } from './condition-term-expression';
import { Expression } from './expression';
export declare class ConditionExpression extends Expression {
    conditionTerms: Array<ConditionTermExpression | ConditionFactorExpression>;
    constructor(
        conditionTerms: Array<
            ConditionTermExpression | ConditionFactorExpression
        >
    );
    accept(visitor: SqlVisitor): string;
}
