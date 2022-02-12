/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../../../sql-node';
import { SqlVisitor } from '../../../sql-visitor';
import { Identifier } from '../../identifier';
import { OrderByElement } from '../../order-by-element';
export declare class RejectOrderElementExpression extends SqlNode {
    columns: Array<SqlNode | Identifier>;
    orderByElements: OrderByElement[];
    constructor(
        columns: Array<SqlNode | Identifier>,
        orderByElements: OrderByElement[]
    );
    accept(visitor: SqlVisitor): string;
}
