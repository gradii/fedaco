/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { LimitClause } from './limit-clause';
import type { OffsetClause } from './offset-clause';
import type { OrderByClause } from './order-by-clause';


export abstract class QueryExpression extends SqlNode {
  public orderByClause?: OrderByClause;
  public offsetClause?: OffsetClause;
  public limitClause?: LimitClause;
}
