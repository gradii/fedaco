/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
export declare class OffsetClause extends SqlNode {
    offset: number;
    constructor(offset: number);
    accept(visitor: SqlVisitor): string;
}
