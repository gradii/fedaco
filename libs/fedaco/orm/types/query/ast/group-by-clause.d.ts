/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
export declare class GroupByClause extends SqlNode {
    groups: SqlNode[];
    constructor(groups: SqlNode[]);
    accept(visitor: SqlVisitor): string;
}
