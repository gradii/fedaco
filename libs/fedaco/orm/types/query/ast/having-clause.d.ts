/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
export declare class HavingClause extends SqlNode {
    expressions: SqlNode[];
    conjunction: string;
    constructor(expressions: SqlNode[], conjunction?: string);
    accept(visitor: SqlVisitor): string;
}
