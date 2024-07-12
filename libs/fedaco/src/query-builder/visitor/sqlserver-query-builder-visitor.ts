/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isString } from '@gradii/nanofn';
import type { BinaryUnionQueryExpression } from '../../query/ast/binary-union-query-expression';
import { ColumnReferenceExpression } from '../../query/ast/column-reference-expression';
import type { DeleteSpecification } from '../../query/ast/delete-specification';
import { AsExpression } from '../../query/ast/expression/as-expression';
import { FunctionCallExpression } from '../../query/ast/expression/function-call-expression';
import { JsonPathExpression } from '../../query/ast/json-path-expression';
import type { LockClause } from '../../query/ast/lock-clause';
import type { OffsetClause } from '../../query/ast/offset-clause';
import type { QueryExpression } from '../../query/ast/query-expression';
import type { QuerySpecification } from '../../query/ast/query-specification';
import type { SelectClause } from '../../query/ast/select-clause';
import type { UpdateSpecification } from '../../query/ast/update-specification';
import { createIdentifier } from '../ast-factory';
import type { GrammarInterface } from '../grammar.interface';
import type { QueryBuilder } from '../query-builder';
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

  visitQuerySpecification(node: QuerySpecification): string {
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

    // use top n
    // if (node.limitClause) {
    //   sql += ` ${node.limitClause.accept(this)}`;
    // }

    if (node.offsetClause) {
      sql += ` ${node.offsetClause.accept(this)}`;
    }

    return sql;
  }

  visitSelectClause(node: SelectClause): string {
    let topSql = '';
    if (this._limitToTop !== undefined) {
      topSql = `top ${this._limitToTop} `;
    }

    if (node.selectExpressions.length > 0) {
      const selectExpressions = node.selectExpressions.map(expression => {
        return expression.accept(this);
      });
      return `SELECT${node.distinct ? ` ${this._grammar.distinct(
        this._queryBuilder,
        node.distinct)} ` : ' '}${topSql}${selectExpressions.join(
        ', ')}`;
    } else {
      return `SELECT${node.distinct ? ` ${this._grammar.distinct(
        this._queryBuilder,
        node.distinct)} ` : ' '}${topSql}*`;
    }
  }

  visitOffsetClause(node: OffsetClause): string {
    return `OFFSET ${node.offset} rows`;
  }

  visitDeleteSpecification(node: DeleteSpecification): string {
    let sql;

    if (this._queryBuilder._joins.length > 0) {
      sql = `DELETE ${node.target.accept(this).split(/\s+as\s+/i).pop()}`;
    } else {
      if (node.topRow > 0) {
        // language=SQL format=false
        sql = `DELETE top (${node.topRow}) FROM ${node.target.accept(this)}`;
      } else {
        // language=SQL format=false
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

  visitBinaryUnionQueryExpression(node: BinaryUnionQueryExpression): string {
    // language=SQL format=false
    let sql = `SELECT * FROM (${
      node.left.accept(this)
    }) AS [temp_table] UNION${node.all ? ' ALL' : ''} SELECT * FROM (${
      node.right.accept(this)
    }) AS [temp_table]`;

    sql += this.visitQueryExpression(node);

    return sql;
  }

  visitFunctionCallExpression(node: FunctionCallExpression): string {
    let funcName = node.name.accept(this);
    funcName     = this._grammar.compilePredicateFuncName(funcName);
    if (['date', 'time'].includes(funcName)) {
      if (node.parameters.length === 1) {
        node = new FunctionCallExpression(
          createIdentifier('cast'),
          [
            new AsExpression(node.parameters[0],
              createIdentifier(funcName))
          ]
        );
      }
    }

    if (['json_contains'].includes(funcName)) {
      const latestParam = node.parameters[node.parameters.length - 1];
      const restParams  = node.parameters.slice(0, node.parameters.length - 1);
      if (restParams.length === 1 && !(
        restParams[0] instanceof ColumnReferenceExpression &&
        restParams[0].expression instanceof JsonPathExpression
      )) {
        return `${latestParam.accept(this)} in (select [value] from openjson(${
          restParams.map(it => it.accept(this)).join(', ')
        }))`;
      }
      return `${latestParam.accept(this)} in (select [value] from ${
        restParams.map(it => it.accept(this)).join(', ')
      })`;
    }

    if (['json_length'].includes(funcName)) {
      return `(select count(*) from openjson(${
        node.parameters.map(it => it.accept(this)).join(', ').replace(/^openjson\((.+)\)$/, '$1')
      }))`;
    }

    return super.visitFunctionCallExpression(node);
  }

  visitJsonPathExpression(node: JsonPathExpression): string {
    const pathLeg = node.pathLeg.accept(this);
    if (pathLeg === '->') {
      return `openjson(${node.pathExpression.accept(this)}, "$.${node.jsonLiteral.accept(
        this)}")`;
    }
    throw new Error('unknown path leg');
    // return `'$.${node.pathExpression.map(it => `"${it.accept(this)}"`).join('.')}'`;
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

    throw new Error('unexpected lock clause');
  }
}
