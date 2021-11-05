/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlVisitor } from '../../sql-visitor';
import { Expression } from './expression';
export declare class CommonValueExpression extends Expression {
    constructor();
    accept(visitor: SqlVisitor): string;
}
