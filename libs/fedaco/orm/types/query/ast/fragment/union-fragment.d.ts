/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { QueryBuilder } from '../../../query-builder/query-builder';
import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
export declare class UnionFragment extends SqlNode {
    expression: QueryBuilder;
    all: boolean;
    constructor(expression: QueryBuilder, all: boolean);
    accept(visitor: SqlVisitor): string;
}
