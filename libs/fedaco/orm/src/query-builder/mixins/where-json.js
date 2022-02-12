import { __classPrivateFieldGet } from 'tslib'
import { BindingVariable } from '../../query/ast/binding-variable'
import { ComparisonPredicateExpression } from '../../query/ast/expression/comparison-predicate-expression'
import { FunctionCallExpression } from '../../query/ast/expression/function-call-expression'
import { NotExpression } from '../../query/ast/expression/not-expression'
import { RawExpression } from '../../query/ast/expression/raw-expression'
import { SqlParser } from '../../query/parser/sql-parser'
import { bindingVariable, createIdentifier, raw } from '../ast-factory'
export function mixinWhereJson(base) {
  var __Self_instances,
    __Self__jsonBasedValue,
    __Self__based,
    __Self__addJsonBasedWhere,
    __Self__addJsonLengthBasedWhere,
    _a
  return (
    (_a = class _Self extends base {
      constructor() {
        super(...arguments)
        __Self_instances.add(this)
      }
      whereJsonContains(column, value, conjunction = 'and', not = false) {
        __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self__addJsonBasedWhere
        ).call(this, column, value, conjunction, not)
        return this
      }
      orWhereJsonContains(column, value) {
        return this.whereJsonContains(column, value, 'or')
      }
      whereJsonDoesntContain(column, value, conjunction = 'and') {
        return this.whereJsonContains(column, value, conjunction, true)
      }
      orWhereJsonDoesntContain(column, value) {
        return this.whereJsonDoesntContain(column, value, 'or')
      }
      whereJsonLength(column, operator, value, conjunction = 'and') {
        ;[value, operator] = this._prepareValueAndOperator(
          value,
          operator,
          arguments.length === 2
        )
        __classPrivateFieldGet(
          this,
          __Self_instances,
          'm',
          __Self__addJsonLengthBasedWhere
        ).call(this, column, operator, value, conjunction)
        return this
      }
      orWhereJsonLength(column, operator, value) {
        ;[value, operator] = this._prepareValueAndOperator(
          value,
          operator,
          arguments.length === 2
        )
        return this.whereJsonLength(column, operator, value, 'or')
      }
    }),
    (__Self_instances = new WeakSet()),
    (__Self__jsonBasedValue = function __Self__jsonBasedValue(value) {
      if (value instanceof RawExpression) {
        return value
      } else {
        return new BindingVariable(
          raw(this._grammar.prepareBindingForJsonContains(value)),
          'where'
        )
      }
    }),
    (__Self__based = function __Self__based(column) {
      return SqlParser.createSqlParser(column).parseColumnWithoutAlias()
    }),
    (__Self__addJsonBasedWhere = function __Self__addJsonBasedWhere(
      column,
      value,
      conjunction = 'and',
      not
    ) {
      const type = 'JsonContains'
      const leftNode = __classPrivateFieldGet(
        this,
        __Self_instances,
        'm',
        __Self__based
      ).call(this, column)
      const rightNode = __classPrivateFieldGet(
        this,
        __Self_instances,
        'm',
        __Self__jsonBasedValue
      ).call(this, value)
      let ast = new FunctionCallExpression(createIdentifier(type), [
        leftNode,
        rightNode,
      ])
      if (not) {
        ast = new NotExpression(ast)
      }
      this.addWhere(ast, conjunction)
      return this
    }),
    (__Self__addJsonLengthBasedWhere = function __Self__addJsonLengthBasedWhere(
      column,
      operator,
      value,
      conjunction = 'and'
    ) {
      const type = 'JsonLength'
      const leftNode = __classPrivateFieldGet(
        this,
        __Self_instances,
        'm',
        __Self__based
      ).call(this, column)
      const rightNode = bindingVariable(value, 'where')
      const ast = new ComparisonPredicateExpression(
        new FunctionCallExpression(createIdentifier(type), [leftNode]),
        operator,
        rightNode
      )
      this.addWhere(ast, conjunction)
      return this
    }),
    _a
  )
}
