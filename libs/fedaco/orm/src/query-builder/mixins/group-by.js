/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { BindingVariable } from '../../query/ast/binding-variable'
import { RawBindingExpression } from '../../query/ast/expression/raw-binding-expression'
import { RawExpression } from '../../query/ast/expression/raw-expression'
import { SqlParser } from '../../query/parser/sql-parser'
import { raw } from '../ast-factory'
import { wrapToArray } from '../ast-helper'
export function mixinGroupBy(base) {
  return class _Self extends base {
    groupBy(...groups) {
      for (const group of groups) {
        const newAsts = wrapToArray(group).map((it) => {
          if (it instanceof RawExpression) {
            return it
          }
          return SqlParser.createSqlParser(it).parseColumnAlias()
        })
        this._groups = [...this._groups, ...newAsts]
      }
      return this
    }

    groupByRaw(sql, bindings = []) {
      this._groups.push(
        new RawBindingExpression(
          raw(sql),
          bindings.map((it) => {
            return new BindingVariable(raw(it))
          })
        )
      )
      return this
    }
  }
}
