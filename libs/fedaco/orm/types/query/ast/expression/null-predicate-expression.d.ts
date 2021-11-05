/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
import { ColumnReferenceExpression } from '../column-reference-expression';
export declare class NullPredicateExpression extends SqlNode {
    expression: ColumnReferenceExpression;
    not: boolean;
    constructor(expression: ColumnReferenceExpression, not?: boolean);
    accept(visitor: SqlVisitor): string;
}
