/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
export declare class LockClause extends SqlNode {
    value: boolean | string;
    constructor(value: boolean | string);
    accept(visitor: SqlVisitor): string;
}
