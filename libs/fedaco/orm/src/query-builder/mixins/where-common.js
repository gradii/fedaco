/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { isArray, isFunction, isObject, isString } from '@gradii/check-type'
import { BindingVariable } from '../../query/ast/binding-variable'
import { BinaryExpression } from '../../query/ast/expression/binary-expression'
import { ComparisonPredicateExpression } from '../../query/ast/expression/comparison-predicate-expression'
import { RawBindingExpression } from '../../query/ast/expression/raw-binding-expression'
import { RawExpression } from '../../query/ast/expression/raw-expression'
import { NestedPredicateExpression } from '../../query/ast/fragment/expression/nested-predicate-expression'
import { SqlParser } from '../../query/parser/sql-parser'
import { forwardRef } from '../forward-ref'
export function mixinWhereCommon(base) {
  return class _Self extends base {
    _addArrayOfWheres(column, conjunction, method = 'where') {
      return this.whereNested((query) => {
        if (isArray(column)) {
          for (const it of column) {
            query[method](...it)
          }
        } else if (isObject(column)) {
          for (const [key, value] of Object.entries(column)) {
            query[method](key, '=', value, conjunction)
          }
        }
      }, conjunction)
    }

    addNestedWhereQuery(query, conjunction = 'and') {
      if (query._wheres.length > 0) {
        this.addWhere(new NestedPredicateExpression(query), conjunction)
      }
      return this
    }
    addWhere(where, conjunction) {
      if (this._wheres.length > 0) {
        if (conjunction === 'and' || conjunction === 'or') {
          const left = this._wheres.pop()
          this._wheres.push(new BinaryExpression(left, conjunction, where))
        } else if (conjunction === 'andX' || conjunction === 'orX') {
          throw new Error('not implement')
        } else {
          throw new Error(
            `conjunction error should be one of 'and' | 'or' | 'andX' | 'orX'`
          )
        }
      } else {
        this._wheres.push(where)
      }
    }

    forNestedWhere() {
      return this.newQuery().from(forwardRef(() => this._from))
    }

    orWhere(column, operator, value) {
      ;[value, operator] = this._prepareValueAndOperator(
        value,
        operator,
        arguments.length === 2
      )
      return this.where(column, operator, value, 'or')
    }
    orWhereColumn(first, operator, second) {
      if (arguments.length === 2) {
        second = operator
        operator = '='
      }
      return this.whereColumn(first, operator, second, 'or')
    }
    orWhereRaw(sql, bindings) {
      return this.whereRaw(sql, bindings, 'or')
    }

    where(column, operator, value, conjunction = 'and') {
      if (
        (isArray(column) || isObject(column)) &&
        !(column instanceof RawExpression)
      ) {
        return this._addArrayOfWheres(column, conjunction)
      }
      ;[value, operator] = this._prepareValueAndOperator(
        value,
        operator,
        arguments.length === 2
      )
      if (isFunction(column)) {
        this.addWhere(this._createSubPredicate(column), conjunction)
      } else if (isString(column)) {
        const leftNode = SqlParser.createSqlParser(column).parseColumnAlias()
        let rightNode
        if (isFunction(value)) {
          rightNode = this._createSubQuery('where', value)
        } else if (value instanceof RawExpression) {
          rightNode = value
        } else {
          rightNode = new BindingVariable(new RawExpression(value), 'where')
        }
        this.addWhere(
          new ComparisonPredicateExpression(leftNode, operator, rightNode),
          conjunction
        )
      } else {
        throw new Error('not implement yet')
      }
      return this
    }

    whereColumn(first, operator, second, conjunction = 'and') {
      if (isArray(first)) {
        conjunction = operator
        return this._addArrayOfWheres(first, conjunction, 'whereColumn')
      }
      if (this._invalidOperator(operator)) {
        conjunction = second
        ;[second, operator] = [operator, '=']
      }
      const leftNode =
        first instanceof RawExpression
          ? first
          : SqlParser.createSqlParser(first).parseUnaryTableColumn()
      const rightNode =
        second instanceof RawExpression
          ? second
          : SqlParser.createSqlParser(second).parseUnaryTableColumn()
      this.addWhere(
        new ComparisonPredicateExpression(leftNode, operator, rightNode),
        conjunction
      )
      return this
    }
    whereNested(callback, conjunction = 'and') {
      const query = this.forNestedWhere()
      callback(query)
      return this.addNestedWhereQuery(query, conjunction)
    }

    whereRaw(sql, bindings = [], conjunction = 'and') {
      this.addWhere(
        new RawBindingExpression(
          new RawExpression(sql),
          bindings.map((it) => {
            return new BindingVariable(new RawExpression(it))
          })
        ),
        conjunction
      )

      return this
    }
    cleanBindings(bindings) {
      return bindings.filter((it) => !(it instanceof RawExpression))
    }
  }
}
