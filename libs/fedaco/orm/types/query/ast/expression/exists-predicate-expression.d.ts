/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { NestedExpression } from '../fragment/nested-expression';
import { SqlVisitor } from '../../sql-visitor';
import { Expression } from './expression';
export declare class ExistsPredicateExpression extends Expression {
    expression: NestedExpression;
    not: boolean;
    constructor(expression: NestedExpression, not?: boolean);
    accept(visitor: SqlVisitor): string;
}
