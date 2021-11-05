/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { OrderByElement } from './order-by-element';
export declare class OrderByClause extends SqlNode {
    elements: OrderByElement[];
    constructor(elements: OrderByElement[]);
    accept(visitor: SqlVisitor): string;
}
