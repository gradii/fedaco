import {
  isBlank,
  isObject
} from '@gradii/check-type';
import { Constructor } from '../../helper/constructor';
import { ColumnReferenceExpression } from '../../query/ast/column-reference-expression';
import { AggregateFragment } from '../../query/ast/fragment/aggregate-fragment';
import { PathExpression } from '../../query/ast/path-expression';
import { SqlParser } from '../../query/parser/sql-parser';
import {
  createColumnReferenceExpression,
  createIdentifier,
  raw
} from '../ast-factory';
import { wrapToArray } from '../ast-helper';
import { QueryBuilder } from '../query-builder';

export interface QueryBuilderAggregate {
  aggregate(func: string, columns: any[]): this

  count(columns?: string): this

  doesntExist(columns?: string): this

  exists(columns?: string): this

  getCountForPagination(columns?: string[]): this

  max(columns?: string): this

  min(columns?: string): this

  sum(columns?: string): this
}

export type QueryBuilderAggregateCtor = Constructor<QueryBuilderAggregate>;

export function mixinAggregate<T extends Constructor<any>>(base: T): QueryBuilderAggregateCtor & T {
  return class _Self extends base {
    /*Set the aggregate property without running the query.*/
    _setAggregate(this: QueryBuilder & _Self, func: string, columns: Array<string|ColumnReferenceExpression>) {
      this._aggregate = new AggregateFragment(
        createIdentifier(func),
        columns.map(it => createColumnReferenceExpression(it))
      );
      if (this._groups.length === 0) {
        this._orders            = [];
        this._bindings['order'] = [];
      }
      return this;
    }

    /*Execute an aggregate function on the database.*/
    public aggregate(this: QueryBuilder & _Self, func: string, columns: any[] = ['*']) {
      const results = this.cloneWithout(
        this._unions.length > 0 ?
          [] :
          ['columns']
      )
        // .cloneWithoutBindings(this._unions.length > 0  ? [] : ['select'])
        ._setAggregate(func, columns)
        .get(columns);

      //todo check collection result
      if (results.length > 0) {
        return results[0]['aggregate'];
      }
    }

    /*Retrieve the "count" result of the query.*/
    public count(this: QueryBuilder & _Self, columns: string | string[] = '*') {
      return this.aggregate('count', wrapToArray(columns));
    }

    public doesntExist(this: QueryBuilder & _Self, columns: string | string[] = '*') {
      return !this.exists();
    }

    public exists(this: QueryBuilder & _Self, columns: string | string[] = '*') {
      let results = this._connection.select(
        this._grammar.compileExists(this), this.getBindings(), !this._useWriteConnection
      );
      if (results[0] !== undefined) {
        results = results[0];
        return results['exists'];
      }
      return false;
    }

    public getCountForPagination(this: QueryBuilder & _Self, columns: any[] = ['*']) {
      const results = this._runPaginationCountQuery(columns);
      if (results[0] === undefined) {
        return 0;
      } else if (isObject(results[0])) {
        return results[0].aggregate;
      }
      return results[0].aggregate;
    }

    public max(this: QueryBuilder & _Self, columns: string | string[] = '*') {
      return this.aggregate('max', wrapToArray(columns));
    }

    public min(this: QueryBuilder & _Self, columns: string | string[] = '*') {
      return this.aggregate('min', wrapToArray(columns));
    }

    public sum(this: QueryBuilder & _Self, columns: string | string[] = '*') {
      return this.aggregate('sum', wrapToArray(columns));
    }

    /*Run a pagination count query.*/
    protected _runPaginationCountQuery(this: QueryBuilder & _Self, columns: any[] = ['*']) {
      if (this._groups.length > 0 || this._havings.length > 0) {
        const clone = this._cloneForPaginationCount();
        if (clone._columns.length === 0 && this._joins.length > 0) {
          clone._columns = [new ColumnReferenceExpression(
            new PathExpression([
              this._from,
              createIdentifier('*')
            ]))];
        }
        return this.newQuery().from(
          raw('(' + clone.toSql() + ') as ' +
            this._grammar.quoteTableName('aggregate_table')
          )
        ).mergeBindings(clone).setAggregate('count', this._withoutSelectAliases(columns)).get().all();
      }
      const without = this._unions.length > 0 ? ['_orders', '_limit', '_offset'] : ['_columns', '_orders', '_limit', '_offset'];
      return this.cloneWithout(without)
        ._setAggregate('count', this._withoutSelectAliases(columns))
        .get();
    }

    /*Clone the existing query instance for usage in a pagination subquery.*/
    protected _cloneForPaginationCount(this: QueryBuilder & _Self,) {
      return this.cloneWithout(['_orders', '_limit', '_offset']);
    }

    /*Remove the column aliases since they will break count queries.*/
    protected _withoutSelectAliases(columns: string[]) {
      return columns.map(it => {
        const column                            = SqlParser.createSqlParser(it).parseColumnAlias();
        column.fieldAliasIdentificationVariable = undefined;
        return column;
      });
    }
  };
}
