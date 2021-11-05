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
import { SetClause } from './set-clause';
import { WhereClause } from './where-clause';
export declare class UpdateSpecification extends SqlNode {
    target: FromTable;
    setClauses: SetClause[];
    whereClause?: WhereClause;
    fromClause?: FromClause;
    orderByClause?: OrderByClause;
    offsetClause?: OffsetClause;
    limitClause?: LimitClause;
    constructor(target: FromTable, setClauses: SetClause[], whereClause?: WhereClause, fromClause?: FromClause, orderByClause?: OrderByClause, offsetClause?: OffsetClause, limitClause?: LimitClause);
    accept(visitor: SqlVisitor): string;
}
