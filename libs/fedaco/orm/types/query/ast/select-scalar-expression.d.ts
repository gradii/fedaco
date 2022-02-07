/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { Expression } from './expression/expression';
export declare class SelectScalarExpression extends SqlNode {
    expression: Expression;
    columnName: SqlNode;
    constructor(expression: Expression, columnName: SqlNode);
    accept(visitor: SqlVisitor): string;
}
