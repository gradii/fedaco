/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import type { FromClause } from './from-clause';
import type { FromTable } from './from-table';
import type { LimitClause } from './limit-clause';
import type { OffsetClause } from './offset-clause';
import type { OrderByClause } from './order-by-clause';
import type { SetClause } from './set-clause';
import type { WhereClause } from './where-clause';


export class UpdateSpecification extends SqlNode {
  constructor(
    public target: FromTable,
    public setClauses: SetClause[],
    public whereClause?: WhereClause,
    public fromClause?: FromClause,
    public orderByClause?: OrderByClause,
    public offsetClause?: OffsetClause,
    public limitClause?: LimitClause,
    // public  _target: TableReference,
    // public  _topRowFilter: TopRowFilter,
    // public  _outputIntoClause: OutputIntoClause,
    // public  _outputClause: OutputClause,

  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    visitor._isVisitUpdateSpecification = true;

    const rst = visitor.visitUpdateSpecification(this);

    visitor._isVisitUpdateSpecification = false;
    return rst;
  }
}
