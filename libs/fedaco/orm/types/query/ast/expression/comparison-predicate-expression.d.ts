/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
import { Expression } from './expression';
export declare class ComparisonPredicateExpression extends Expression {
    left: SqlNode;
    operator: string;
    right: SqlNode;
    constructor(left: SqlNode, operator: string, right: SqlNode);
    accept(visitor: SqlVisitor): string;
}
