/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
export declare class RawExpression extends SqlNode {
    value: string | number | boolean | null;
    constructor(value: string | number | boolean | null);
    accept(visitor: SqlVisitor): string | number | boolean;
}
