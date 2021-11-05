/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { LimitClause } from './limit-clause';
import { OffsetClause } from './offset-clause';
import { OrderByClause } from './order-by-clause';
export declare abstract class QueryExpression extends SqlNode {
    orderByClause?: OrderByClause;
    offsetClause?: OffsetClause;
    limitClause?: LimitClause;
}
