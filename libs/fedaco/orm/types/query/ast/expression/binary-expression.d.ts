/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlVisitor } from '../../sql-visitor';
import { Expression } from './expression';
export declare class BinaryExpression extends Expression {
    left: Expression;
    operator: 'and' | 'or';
    right: Expression;
    constructor(left: Expression, operator: 'and' | 'or', right: Expression);
    accept(visitor: SqlVisitor): string;
}
