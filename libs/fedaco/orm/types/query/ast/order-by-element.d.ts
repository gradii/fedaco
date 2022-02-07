/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { NestedExpression } from './fragment/nested-expression';
export declare class OrderByElement extends SqlNode {
    column: NestedExpression | SqlNode;
    direction: string;
    constructor(column: NestedExpression | SqlNode, direction: string);
    accept(visitor: SqlVisitor, ctx?: any): string;
}
