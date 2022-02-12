/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlVisitor } from '../../sql-visitor';
import { Expression } from './expression';
export declare class BetweenPredicateExpression extends Expression {
    expression: Expression;
    leftBetween: Expression;
    rightBetween: Expression;
    not: boolean;
    constructor(
        expression: Expression,
        leftBetween: Expression,
        rightBetween: Expression,
        not?: boolean
    );
    accept(visitor: SqlVisitor): string;
}
