import { __awaiter } from 'tslib'
import { isObject } from '@gradii/check-type'
import { ColumnReferenceExpression } from '../../query/ast/column-reference-expression'
import { AggregateFragment } from '../../query/ast/fragment/aggregate-fragment'
import { PathExpression } from '../../query/ast/path-expression'
import { SqlParser } from '../../query/parser/sql-parser'
import {
  createColumnReferenceExpression,
  createIdentifier,
  rawSqlBindings,
} from '../ast-factory'
import { wrapToArray } from '../ast-helper'
export function mixinAggregate(base) {
  return class _Self extends base {
    _setAggregate(func, columns) {
      this._aggregate = new AggregateFragment(
        createIdentifier(func),
        columns.map((it) => createColumnReferenceExpression(it))
      )
      if (this._groups.length === 0) {
        this._orders = []
        this._bindings['order'] = []
      }
      return this
    }

    aggregate(func, columns = ['*']) {
      return __awaiter(this, void 0, void 0, function* () {
        const results = yield this.cloneWithout(
          this._unions.length > 0 ? [] : ['columns']
        )

          ._setAggregate(func, columns)
          .get(columns)

        if (results.length > 0) {
          return results[0]['aggregate']
        }
      })
    }

    count(columns = '*') {
      return this.aggregate('count', wrapToArray(columns))
    }
    doesntExist(columns = '*') {
      return __awaiter(this, void 0, void 0, function* () {
        return !(yield this.exists())
      })
    }
    exists(columns = '*') {
      return __awaiter(this, void 0, void 0, function* () {
        this.applyBeforeQueryCallbacks()
        let results = yield this._connection.select(
          this._grammar.compileExists(this),
          this.getBindings(),
          !this._useWriteConnection
        )

        if (results[0] !== undefined) {
          results = results[0]

          return !!results['exists']
        }
        return false
      })
    }
    getCountForPagination(columns = ['*']) {
      return __awaiter(this, void 0, void 0, function* () {
        const results = yield this._runPaginationCountQuery(columns)
        if (results[0] === undefined) {
          return 0
        } else if (isObject(results[0])) {
          return results[0].aggregate
        }
        return results[0].aggregate
      })
    }
    max(columns = '*') {
      return this.aggregate('max', wrapToArray(columns))
    }
    min(columns = '*') {
      return this.aggregate('min', wrapToArray(columns))
    }
    sum(columns = '*') {
      return this.aggregate('sum', wrapToArray(columns))
    }

    _runPaginationCountQuery(columns = ['*']) {
      return __awaiter(this, void 0, void 0, function* () {
        if (this._groups.length > 0 || this._havings.length > 0) {
          const clone = this._cloneForPaginationCount()
          if (clone._columns.length === 0 && this._joins.length > 0) {
            clone._columns = [
              new ColumnReferenceExpression(
                new PathExpression([this._from, createIdentifier('*')])
              ),
            ]
          }
          const clonedSql = clone.toSql()
          const clonedBindings = clone.getBindings()
          return yield this.newQuery()
            .from(
              rawSqlBindings(
                '(' +
                  clonedSql +
                  ') as ' +
                  this._grammar.quoteTableName('aggregate_table'),
                clonedBindings,
                'from'
              )
            )
            ._setAggregate('count', this._withoutSelectAliases(columns))
            .get()
        }
        const without =
          this._unions.length > 0
            ? ['_orders', '_limit', '_offset']
            : ['_columns', '_orders', '_limit', '_offset']
        return yield this.cloneWithout(without)
          ._setAggregate('count', this._withoutSelectAliases(columns))
          .get()
      })
    }

    _cloneForPaginationCount() {
      return this.cloneWithout(['_orders', '_limit', '_offset'])
    }

    _withoutSelectAliases(columns) {
      return columns.map((it) => {
        const column = SqlParser.createSqlParser(it).parseColumnAlias()
        column.fieldAliasIdentificationVariable = undefined
        return column
      })
    }
  }
}
