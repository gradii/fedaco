/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
/**
 * node part is like a source file. it contains imports exports.
 */
export declare class NodePart<T extends SqlNode = SqlNode> extends SqlNode {
    part: T;
    references: any[];
    declarations: any[];
    constructor(part: T, references: any[], declarations: any[]);
    accept(visitor: SqlVisitor): string;
}
