import { isString } from '@gradii/check-type';
import { ColumnReferenceExpression } from '../../query/ast/column-reference-expression';
import { ComparisonPredicateExpression } from '../../query/ast/expression/comparison-predicate-expression';
import { FunctionCallExpression } from '../../query/ast/expression/function-call-expression';
import { LockClause } from '../../query/ast/lock-clause';
import { TableReferenceExpression } from '../../query/ast/table-reference-expression';
import { UpdateSpecification } from '../../query/ast/update-specification';
import { resolveIdentifier } from '../ast-helper';
import { GrammarInterface } from '../grammar.interface';
import { QueryBuilder } from '../query-builder';
import { QueryBuilderVisitor } from './query-builder-visitor';

const LIKES = ['LIKE', 'ILIKE', 'NOT LIKE', 'NOT ILIKE'];


export class PostgresQueryBuilderVisitor extends QueryBuilderVisitor {

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

  visitFunctionCallExpression(node: FunctionCallExpression): string {
    const name = node.name.accept(this).toLowerCase();

    if (['day', 'month', 'year'].includes(name)) {
      return `extract(${name} from ${
        node.parameters.map(it => it.accept(this)).join(', ')
      })`;
    }
    if (['date', 'time'].includes(name)) {
      return `${
        node.parameters.map(it => it.accept(this)).join(', ')
      }::${name}`;
    }

    return super.visitFunctionCallExpression(node);
  }

  visitComparisonExpression(node: ComparisonPredicateExpression): string {
    const operator = node.operator.toUpperCase();
    if (LIKES.includes(operator)) {
      return `${node.left.accept(this)}::text ${operator} ${node.right.accept(this)}`;
    }
    return super.visitComparisonExpression(node);
  }

  visitColumnReferenceExpression(node: ColumnReferenceExpression): string {
    if(this._queryBuilder._joins.length > 0){
      return super.visitColumnReferenceExpression(node);
    }else{
      return super.visitColumnReferenceExpression(node).split('.').pop();
    }
  }

  visitLockClause(node: LockClause) {
    if (node.value === true) {
      return `for update`;
    } else if (node.value === false) {
      return 'for share';
    } else if (isString(node.value)) {
      return node.value;
    }
  }

}