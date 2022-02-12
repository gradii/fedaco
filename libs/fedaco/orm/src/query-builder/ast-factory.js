/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { BindingVariable } from '../query/ast/binding-variable'
import { ColumnReferenceExpression } from '../query/ast/column-reference-expression'
import { RawBindingExpression } from '../query/ast/expression/raw-binding-expression'
import { RawExpression } from '../query/ast/expression/raw-expression'
import { StringLiteralExpression } from '../query/ast/expression/string-literal-expression'
import { Identifier } from '../query/ast/identifier'
import { PathExpression } from '../query/ast/path-expression'
import { SyntaxKind, Token } from '../query/parser/sql-lexer'
import { SqlParser } from '../query/parser/sql-parser'
export function raw(value) {
  return new RawExpression(value)
}
export function bindingVariable(value, type = 'where') {
  if (value instanceof RawExpression) {
    return value
  }
  return new BindingVariable(raw(value), type)
}
export function rawSqlBindings(value, bindings, type = 'where') {
  return new RawBindingExpression(
    raw(value),
    bindings.map((it) => new BindingVariable(raw(it), type))
  )
}
export function createIdentifier(identifier) {
  return new Identifier(identifier)
}
export function createStringLiteral(identifier) {
  return new StringLiteralExpression(identifier)
}
export function createTableColumn(table, column) {
  return new ColumnReferenceExpression(
    new PathExpression([table, new Identifier(column)])
  )
}
export function createColumnReferenceExpression(column) {
  if (column instanceof ColumnReferenceExpression) {
    return column
  }
  if (column === '*') {
    return new ColumnReferenceExpression(
      new PathExpression([createIdentifier('*')])
    )
  }
  return SqlParser.createSqlParser(column).parseColumnAlias()
}
export function createKeyword(keyword) {
  return new Token(-1, -1, SyntaxKind.Keyword, 0, keyword)
}
