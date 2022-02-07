/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
export declare class ConditionFactorExpression extends SqlNode {
    constructor();
    accept(visitor: SqlVisitor): void;
}
