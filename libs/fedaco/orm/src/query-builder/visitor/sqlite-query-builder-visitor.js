import { AsExpression } from '../../query/ast/expression/as-expression';
import { FunctionCallExpression } from '../../query/ast/expression/function-call-expression';
import { createIdentifier } from '../ast-factory';
import { QueryBuilderVisitor } from './query-builder-visitor';

export class SqliteQueryBuilderVisitor extends QueryBuilderVisitor {
  constructor(_grammar,
              _queryBuilder) {
    super(_grammar, _queryBuilder);
  }

  visitBinaryUnionQueryExpression(node) {
    let sql = 'SELECT * FROM ' + `(${node.left.accept(this)}) UNION${node.all ? ' ALL' : ''} SELECT * FROM (${node.right.accept(this)})`;
    sql += this.visitQueryExpression(node);
    return sql;
  }

  visitFunctionCallExpression(node) {
    const name = node.name.accept(this).toLowerCase();
    switch (name) {
      case 'date':
        return `strftime('%Y-%m-%d', ${node.parameters.map(it => it.accept(this)).join(', ')})`;
      case 'year':
        return `strftime('%Y', ${node.parameters.map(it => it.accept(this)).join(', ')})`;
      case 'month':
        return `strftime('%m', ${node.parameters.map(it => it.accept(this)).join(', ')})`;
      case 'day':
        return `strftime('%d', ${node.parameters.map(it => it.accept(this)).join(', ')})`;
      case 'time':
        return `strftime('%H:%M:%S', ${node.parameters.map(it => it.accept(this)).join(', ')})`;
    }
    return super.visitFunctionCallExpression(node);
  }

  visitComparisonExpression(node) {
    const operator = node.operator.toUpperCase();
    if (node.left instanceof FunctionCallExpression) {
      const functionName = node.left.name.accept(this).toLowerCase();
      if (['day', 'month', 'year', 'date', 'time'].includes(functionName)) {
        node.right = new FunctionCallExpression(createIdentifier('cast'), [
          new AsExpression(node.right, createIdentifier('text'))
        ]);
      }
    }
    if (['LIKE'].includes(operator)) {
      return `${node.left.accept(this)} ${operator} ${node.right.accept(this)}`;
    }
    return super.visitComparisonExpression(node);
  }
}
