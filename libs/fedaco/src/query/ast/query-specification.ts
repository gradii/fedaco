/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { SqlVisitor } from '../sql-visitor';
import type { FromClause } from './from-clause';
import type { GroupByClause } from './group-by-clause';
import type { HavingClause } from './having-clause';
import type { LockClause } from './lock-clause';
import { QueryExpression } from './query-expression';
import type { SelectClause } from './select-clause';
import type { WhereClause } from './where-clause';

/**
 * QueryExpression = SelectClause FromClause [WhereClause] [GroupByClause] [HavingClause] [OrderByClause]
 */
export class QuerySpecification extends QueryExpression {
  // public whereClause: WhereClause | null;
  // /**/
  // public groupByClause: GroupByClause | null;
  // /**/
  // public havingClause: HavingClause | null;
  // /**/
  // public orderByClause: OrderByClause | null;

  /**/
  public constructor(
    public selectClause: SelectClause,
    public fromClause?: FromClause,
    public whereClause?: WhereClause,
    public groupByClause?: GroupByClause,
    public havingClause?: HavingClause,
    public lockClause?: LockClause,
  ) {
    super();
  }

  /*{@inheritdoc}*/
  public accept(sqlVisitor: SqlVisitor) {
    return sqlVisitor.visitQuerySpecification(this);
  }
}
