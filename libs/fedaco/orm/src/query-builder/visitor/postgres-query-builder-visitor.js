import { isString } from '@gradii/check-type';
import { QueryBuilderVisitor } from './query-builder-visitor';

const LIKES = ['LIKE', 'ILIKE', 'NOT LIKE', 'NOT ILIKE'];

export class PostgresQueryBuilderVisitor extends QueryBuilderVisitor {
  constructor(_grammar,
              _queryBuilder) {
    super(_grammar, _queryBuilder);
  }

  visitFunctionCallExpression(node) {
    const name = node.name.accept(this).toLowerCase();
    if (['day', 'month', 'year'].includes(name)) {
      return `extract(${name} from ${node.parameters.map(it => it.accept(this)).join(', ')})`;
    }
    if (['date', 'time'].includes(name)) {
      return `${node.parameters.map(it => it.accept(this)).join(', ')}::${name}`;
    }
    return super.visitFunctionCallExpression(node);
  }

  visitComparisonExpression(node) {
    const operator = node.operator.toUpperCase();
    if (LIKES.includes(operator)) {
      return `${node.left.accept(this)}::text ${operator} ${node.right.accept(this)}`;
    }
    return super.visitComparisonExpression(node);
  }

  visitColumnReferenceExpression(node) {
    if (this._queryBuilder._joins.length > 0) {
      return super.visitColumnReferenceExpression(node);
    } else {
      return super.visitColumnReferenceExpression(node).split('.').pop();
    }
  }

  visitLockClause(node) {
    if (node.value === true) {
      return `for update`;
    } else if (node.value === false) {
      return 'for share';
    } else if (isString(node.value)) {
      return node.value;
    }
    throw new Error('unexpected lock clause');
  }
}
