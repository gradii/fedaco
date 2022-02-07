/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
export declare class NumberLiteralExpression extends SqlNode {
    value: number;
    constructor(value: number);
    get text(): string;
    accept(visitor: SqlVisitor): string;
}
