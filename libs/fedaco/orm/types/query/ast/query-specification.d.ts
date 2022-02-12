/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlVisitor } from '../sql-visitor';
import { FromClause } from './from-clause';
import { GroupByClause } from './group-by-clause';
import { HavingClause } from './having-clause';
import { LockClause } from './lock-clause';
import { QueryExpression } from './query-expression';
import { SelectClause } from './select-clause';
import { WhereClause } from './where-clause';

export declare class QuerySpecification extends QueryExpression {
    selectClause: SelectClause;
    fromClause?: FromClause;
    whereClause?: WhereClause;
    groupByClause?: GroupByClause;
    havingClause?: HavingClause;
    lockClause?: LockClause;
    constructor(
        selectClause: SelectClause,
        fromClause?: FromClause,
        whereClause?: WhereClause,
        groupByClause?: GroupByClause,
        havingClause?: HavingClause,
        lockClause?: LockClause
    );
    accept(sqlVisitor: SqlVisitor): string;
}
