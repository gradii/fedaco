/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { ForwardRefFn } from '../../../query-builder/forward-ref';
import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
export declare class StringLiteralExpression extends SqlNode {
    value: string | ForwardRefFn<string>;
    constructor(value: string | ForwardRefFn<string>);
    get text(): string;
    accept(visitor: SqlVisitor): string;
}
