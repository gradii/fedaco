/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { JoinClauseBuilder } from '../../../query-builder/query-builder';
import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
export declare class JoinFragment extends SqlNode {
    joinQueryBuilder: JoinClauseBuilder;
    constructor(joinQueryBuilder: JoinClauseBuilder);
    accept(visitor: SqlVisitor): string;
}
