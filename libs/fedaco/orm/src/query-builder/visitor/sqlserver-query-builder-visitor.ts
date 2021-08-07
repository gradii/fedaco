import { isString } from '@gradii/check-type';
import { BinaryUnionQueryExpression } from '../../query/ast/binary-union-query-expression';
import { DeleteSpecification } from '../../query/ast/delete-specification';
import { AsExpression } from '../../query/ast/expression/as-expression';
import { FunctionCallExpression } from '../../query/ast/expression/function-call-expression';
import { LockClause } from '../../query/ast/lock-clause';
import { OffsetClause } from '../../query/ast/offset-clause';
import { QueryExpression } from '../../query/ast/query-expression';
import { QuerySpecification } from '../../query/ast/query-specification';
import { SelectClause } from '../../query/ast/select-clause';
import { UpdateSpecification } from '../../query/ast/update-specification';
import { createIdentifier } from '../ast-factory';
import { GrammarInterface } from '../grammar.interface';
import { QueryBuilder } from '../query-builder';
import { QueryBuilderVisitor } from './query-builder-visitor';


export class SqlserverQueryBuilderVisitor extends QueryBuilderVisitor {
  private _limitToTop: number;

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

  visitQuerySpecification(node: QuerySpecification) {
    if (node.limitClause) {
      this._limitToTop = node.limitClause.value;
    }

    let sql = `${node.selectClause.accept(this)}`;

    if (node.fromClause) {
      sql += ` ${node.fromClause.accept(this)}`;
    }

    if (node.lockClause) {
      sql += ` ${node.lockClause.accept(this)}`;
    }

    if (node.whereClause) {
      sql += ` ${node.whereClause.accept(this)}`;
    }

    if (node.groupByClause) {
      sql += ` ${node.groupByClause.accept(this)}`;
    }

    if (node.havingClause) {
      sql += ` ${node.havingClause.accept(this)}`;
    }

    sql += this.visitQueryExpression(node);


    this._limitToTop = undefined;
    return sql;
  }

  visitQueryExpression(node: QueryExpression) {
    let sql = '';
    if (node.orderByClause) {
      sql += ` ${node.orderByClause.accept(this)}`;
    }

    //use top n
    // if (node.limitClause) {
    //   sql += ` ${node.limitClause.accept(this)}`;
    // }

    if (node.offsetClause) {
      sql += ` ${node.offsetClause.accept(this)}`;
    }

    return sql;
  }

  visitSelectClause(node: SelectClause) {
    let topSql = '';
    if (this._limitToTop !== undefined) {
      topSql = `top ${this._limitToTop} `;
    }

    if (node.selectExpressions.length > 0) {
      const selectExpressions = node.selectExpressions.map(expression => {
        return expression.accept(this);
      });
      return `SELECT${node.distinct ? ` ${this._grammar.distinct(
        node.distinct)} ` : ' '}${topSql}${selectExpressions.join(
        ', ')}`;
    } else {
      return `SELECT${node.distinct ? ` ${this._grammar.distinct(node.distinct)} ` : ' '}${topSql}*`;
    }
  }

  visitOffsetClause(node: OffsetClause): string {
    return `OFFSET ${node.offset} rows`;
  }

  visitDeleteSpecification(node: DeleteSpecification) {
    let sql;

    if (this._queryBuilder._joins.length > 0) {
      sql = `DELETE ${node.target.accept(this).split(/\s+as\s+/i).pop()}`;
    } else {
      if (node.topRow > 0) {
        sql = `DELETE top (${node.topRow}) FROM ${node.target.accept(this)}`;
      } else {
        sql = `DELETE FROM ${node.target.accept(this)}`;
      }
    }

    if (node.fromClause) {
      sql += ` ${node.fromClause.accept(this)}`;
    }

    if (node.whereClause) {
      sql += ` ${node.whereClause.accept(this)}`;
    }

    if (this._queryBuilder._joins.length === 0) {
      if (node.orderByClause) {
        sql += ` ${node.orderByClause.accept(this)}`;
      }
      if (node.offsetClause) {
        sql += ` ${node.offsetClause.accept(this)}`;
      }
      if (node.limitClause) {
        sql += ` ${node.limitClause.accept(this)}`;
      }
    }

    return sql;
  }

  visitBinaryUnionQueryExpression(node: BinaryUnionQueryExpression) {
    let sql = `SELECT * FROM (${node.left.accept(
      this)}) AS [temp_table] UNION${node.all ? ' ALL' : ''} SELECT * FROM (${node.right.accept(
      this)}) AS [temp_table]`;

    sql += this.visitQueryExpression(node);

    return sql;
  }

  visitFunctionCallExpression(node: FunctionCallExpression): string {
    const functionName = node.name.accept(this).toLowerCase();
    if (['date', 'time'].includes(functionName)) {
      if (node.parameters.length === 1) {
        node = new FunctionCallExpression(
          createIdentifier('cast'),
          [
            new AsExpression(node.parameters[0],
              createIdentifier(functionName))
          ]
        );
      }
    }

    return `${node.name.accept(this).toLowerCase()}(${
      node.parameters.map(it => it.accept(this)).join(', ')
    })`;
  }

  visitUpdateSpecification(node: UpdateSpecification): string {
    let sql = `UPDATE ${node.target.accept(this).split(/\s+as\s+/ig).pop()}`;

    sql += ` SET ${node.setClauses.map(
      it => it.accept(this)).join(', ')
    }`;

    if (node.fromClause) {
      sql += ` ${node.fromClause.accept(this)}`;
    }

    if (node.whereClause) {
      sql += ` ${node.whereClause.accept(this)}`;
    }

    if (node.orderByClause) {
      sql += ` ${node.orderByClause.accept(this)}`;
    }
    if (node.offsetClause) {
      sql += ` ${node.offsetClause.accept(this)}`;
    }
    if (node.limitClause) {
      sql += ` ${node.limitClause.accept(this)}`;
    }
    return sql;
  }

  visitLockClause(node: LockClause): string {
    if (node.value === true) {
      return `with(rowlock,updlock,holdlock)`;
    } else if (node.value === false) {
      return 'with(rowlock,holdlock)';
    } else if (isString(node.value)) {
      return node.value;
    }
  }
}