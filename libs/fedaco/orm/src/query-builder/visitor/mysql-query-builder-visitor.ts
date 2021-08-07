import { DeleteSpecification } from '../../query/ast/delete-specification';
import { UpdateSpecification } from '../../query/ast/update-specification';
import { GrammarInterface } from '../grammar.interface';
import { QueryBuilder } from '../query-builder';
import { QueryBuilderVisitor } from './query-builder-visitor';


export class MysqlQueryBuilderVisitor extends QueryBuilderVisitor {
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

  visitDeleteSpecification(node: DeleteSpecification) {
    let sql;

    if(this._queryBuilder._joins.length > 0) {
      sql = `DELETE ${node.target.accept(this).split(/\s+as\s+/i).pop()}`;
    }else{
      sql = `DELETE FROM ${node.target.accept(this)}`;
    }

    if (node.fromClause) {
      sql += ` ${node.fromClause.accept(this)}`;
    }

    if (node.whereClause) {
      sql += ` ${node.whereClause.accept(this)}`;
    }

    if(this._queryBuilder._joins.length === 0) {
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

  visitUpdateSpecification(node: UpdateSpecification): string {
    let sql = `UPDATE ${node.target.accept(this)}`;

    this.explicitBindingType = 'updateJoin';
    if (node.fromClause) {
      sql += ` ${node.fromClause.joins.map(it => it.accept(this)).join(' ')}`;
    }
    this.explicitBindingType = undefined;

    sql += ` SET ${node.setClauses.map(
      it => it.accept(this)).join(', ')
    }`;

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
}