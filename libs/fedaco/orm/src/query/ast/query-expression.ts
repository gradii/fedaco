import { SqlNode } from '../sql-node';
import { LimitClause } from './limit-clause';
import { OffsetClause } from './offset-clause';
import { OrderByClause } from './order-by-clause';


export abstract class QueryExpression extends SqlNode {
  public orderByClause?: OrderByClause
  public offsetClause?: OffsetClause
  public limitClause?: LimitClause
}