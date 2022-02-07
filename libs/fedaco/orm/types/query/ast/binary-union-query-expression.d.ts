/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { QueryExpression } from './query-expression';
export declare class BinaryUnionQueryExpression extends QueryExpression {
    left: SqlNode;
    right: SqlNode;
    all: boolean;
    constructor(left: SqlNode, right: SqlNode, all: boolean);
    accept(visitor: SqlVisitor): string;
}
