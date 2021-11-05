/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { ForwardRefFn } from '../../query-builder/forward-ref';
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
export declare class Identifier extends SqlNode {
    name: string | ForwardRefFn<string>;
    constructor(name: string | ForwardRefFn<string>);
    accept(visitor: SqlVisitor): string;
}
