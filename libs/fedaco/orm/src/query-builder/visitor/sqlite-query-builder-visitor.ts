import { BinaryUnionQueryExpression } from '../../query/ast/binary-union-query-expression';
import { AsExpression } from '../../query/ast/expression/as-expression';
import { ComparisonPredicateExpression } from '../../query/ast/expression/comparison-predicate-expression';
import { FunctionCallExpression } from '../../query/ast/expression/function-call-expression';
import { createIdentifier } from '../ast-factory';
import { GrammarInterface } from '../grammar.interface';
import { QueryBuilder } from '../query-builder';
import { QueryBuilderVisitor } from './query-builder-visitor';


export class SqliteQueryBuilderVisitor extends QueryBuilderVisitor {
  constructor(
    _grammar: GrammarInterface,
    /**
     * @deprecated
     * todo remove queryBuilder. should use binding only
     */
    _queryBuilder: QueryBuilder
  ) {
    super(_grammar, _queryBuilder);
  }

  visitBinaryUnionQueryExpression(node: BinaryUnionQueryExpression) {
    let sql = `SELECT * FROM (${node.left.accept(this)}) UNION${node.all ? ' ALL' : ''} SELECT * FROM (${node.right.accept(this)})`;

    sql += this.visitQueryExpression(node)
    return sql;
  }

  visitFunctionCallExpression(node: FunctionCallExpression): string {
    const name = node.name.accept(this).toLowerCase();
    switch (name) {
      case 'date':
        return `strftime('%Y-%m-%d', ${
          node.parameters.map(it => it.accept(this)).join(', ')
        })`;
      case 'year':
        return `strftime('%Y', ${
          node.parameters.map(it => it.accept(this)).join(', ')
        })`;
      case 'month':
        return `strftime('%m', ${
          node.parameters.map(it => it.accept(this)).join(', ')
        })`;
      case 'day':
        return `strftime('%d', ${
          node.parameters.map(it => it.accept(this)).join(', ')
        })`;
      case 'time':
        return `strftime('%H:%M:%S', ${
          node.parameters.map(it => it.accept(this)).join(', ')
        })`;
    }

    return super.visitFunctionCallExpression(node);
  }

  visitComparisonExpression(node: ComparisonPredicateExpression): string {
    const operator = node.operator.toUpperCase();
    if (node.left instanceof FunctionCallExpression) {
      const functionName = node.left.name.accept(this).toLowerCase();
      if (['day', 'month', 'year', 'date', 'time'].includes(functionName)) {
        node.right = new FunctionCallExpression(
          createIdentifier('cast'),
          [
            new AsExpression(node.right,
              createIdentifier('text'))
          ]
        );
      }
    }

    if (['LIKE'].includes(operator)) {
      return `${node.left.accept(this)} ${operator} ${node.right.accept(this)}`;
    }

    return super.visitComparisonExpression(node);
  }
}