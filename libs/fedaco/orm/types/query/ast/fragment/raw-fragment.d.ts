/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
export declare class RawFragment extends SqlNode {
    value: string | number | boolean;
    constructor(value: string | number | boolean);
    accept(visitor: SqlVisitor): void;
}
