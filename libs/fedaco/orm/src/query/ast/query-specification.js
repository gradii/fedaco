import { QueryExpression } from './query-expression';

export class QuerySpecification extends QueryExpression {


  constructor(selectClause, fromClause, whereClause, groupByClause, havingClause, lockClause) {
    super();
    this.selectClause = selectClause;
    this.fromClause = fromClause;
    this.whereClause = whereClause;
    this.groupByClause = groupByClause;
    this.havingClause = havingClause;
    this.lockClause = lockClause;
  }

  accept(sqlVisitor) {
    return sqlVisitor.visitQuerySpecification(this);
  }
}
