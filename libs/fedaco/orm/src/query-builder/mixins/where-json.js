import { BindingVariable } from '../../query/ast/binding-variable'
import { FunctionCallExpression } from '../../query/ast/expression/function-call-expression'
import { NotExpression } from '../../query/ast/expression/not-expression'
import { RawExpression } from '../../query/ast/expression/raw-expression'
import { SqlParser } from '../../query/parser/sql-parser'
import { createIdentifier, raw } from '../ast-factory'
export function mixinWhereJson(base) {
  return class _Self extends base {
    _addJsonBasedWhere(column, value, conjunction = 'and', not) {
      const type = 'JsonContains'
      const leftNode = SqlParser.createSqlParser(column).parseUnaryTableColumn()
      let rightNode
      if (value instanceof RawExpression) {
        rightNode = value
      } else {
        rightNode = new BindingVariable(
          raw(this._grammar.prepareBindingForJsonContains(value)),
          'where'
        )
      }
      let ast = new FunctionCallExpression(createIdentifier(type), [
        leftNode,
        rightNode,
      ])
      if (not) {
        ast = new NotExpression(ast)
      }
      this.addWhere(ast, conjunction)
      return this
    }
    whereJsonContains(column, value, conjunction = 'and', not = false) {
      this._addJsonBasedWhere(column, value, conjunction, not)
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
      return this
    }
    orWhereJsonLength(column, operator, value) {
      return this.whereJsonLength(column, operator, value, 'or')
    }
  }
}
