/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { NestedExpression } from '../fragment/nested-expression';
import { SqlVisitor } from '../../sql-visitor';
import { Expression } from './expression';
export declare class InPredicateExpression extends Expression {
    expression: Expression;
    values: Expression[];
    subQuery?: NestedExpression;
    not: boolean;
    constructor(expression: Expression, values: Expression[], subQuery?: NestedExpression, not?: boolean);
    accept(visitor: SqlVisitor): string;
}
