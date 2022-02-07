/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
import { Identifier } from '../identifier';
import { Expression } from './expression';
export declare class AsExpression extends SqlNode {
    name: Expression;
    as: Identifier;
    constructor(name: Expression, as: Identifier);
    accept(visitor: SqlVisitor): string;
}
