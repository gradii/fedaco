/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { Expression } from './expression/expression';
export declare class JoinOnExpression extends SqlNode {
    columnExpression: Expression;
    operator: any;
    rightExpression: Expression;
    constructor(columnExpression: Expression, operator: any, rightExpression: Expression);
    accept(visitor: SqlVisitor): string;
}
