/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { FromTable } from './from-table';
import { Identifier } from './identifier';
export declare class PathExpression extends SqlNode {
    paths: Array<FromTable | Identifier>;
    constructor(paths: Array<FromTable | Identifier>);
    accept(visitor: SqlVisitor): string;
}
