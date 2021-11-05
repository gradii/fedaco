/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlVisitor } from '../../sql-visitor';
import { Expression } from './expression';
export declare class NotExpression extends Expression {
    expression: Expression;
    constructor(expression: Expression);
    accept(visitor: SqlVisitor): string;
}
