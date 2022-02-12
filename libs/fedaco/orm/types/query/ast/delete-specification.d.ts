/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { FromClause } from './from-clause';
import { FromTable } from './from-table';
import { LimitClause } from './limit-clause';
import { OffsetClause } from './offset-clause';
import { OrderByClause } from './order-by-clause';
import { WhereClause } from './where-clause';
export declare class DeleteSpecification extends SqlNode {
    target: FromTable;
    whereClause?: WhereClause;
    fromClause?: FromClause;
    orderByClause?: OrderByClause;
    offsetClause?: OffsetClause;
    limitClause?: LimitClause;
    topRow?: number;
    constructor(
        target: FromTable,
        whereClause?: WhereClause,
        fromClause?: FromClause,
        orderByClause?: OrderByClause,
        offsetClause?: OffsetClause,
        limitClause?: LimitClause
    );
    accept(visitor: SqlVisitor): string;
}
