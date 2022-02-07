import { isString } from '@gradii/check-type'
import { createIdentifier } from '../../query-builder/ast-factory'
import { ColumnReferenceExpression } from '../ast/column-reference-expression'
import { NumberLiteralExpression } from '../ast/expression/number-literal-expression'
import { StringLiteralExpression } from '../ast/expression/string-literal-expression'
import { JsonPathColumn } from '../ast/fragment/json-path-column'
import { FromTable } from '../ast/from-table'
import { JoinClause } from '../ast/join-clause'
import { JoinExpression } from '../ast/join-expression'
import { JoinOnExpression } from '../ast/join-on-expression'
import { JsonPathExpression } from '../ast/json-path-expression'
import { PathExpression } from '../ast/path-expression'
import { TableName } from '../ast/table-name'
import { TableReferenceExpression } from '../ast/table-reference-expression'
import * as asciiChars from './ascii-chars'
import { EOF, SyntaxKind } from './sql-lexer'
export class _SqlParserAst {
  constructor(
    input,
    location,
    absoluteOffset,
    tokens,
    inputLength,
    parseAction,
    errors,
    offset
  ) {
    this.input = input
    this.location = location
    this.absoluteOffset = absoluteOffset
    this.tokens = tokens
    this.inputLength = inputLength
    this.parseAction = parseAction
    this.errors = errors
    this.offset = offset
    this.index = 0
    this.rparensExpected = 0
    this.rbracketsExpected = 0
    this.rbracesExpected = 0
  }
  get next() {
    return this.peek(0)
  }

  get atEOF() {
    return this.index >= this.tokens.length
  }

  get inputIndex() {
    return this.atEOF ? this.currentEndIndex : this.next.index + this.offset
  }

  get currentEndIndex() {
    if (this.index > 0) {
      const curToken = this.peek(-1)
      return curToken.end + this.offset
    }

    if (this.tokens.length === 0) {
      return this.inputLength + this.offset
    }
    return this.next.index + this.offset
  }

  get currentAbsoluteOffset() {
    return this.absoluteOffset + this.inputIndex
  }
  advance() {
    this.index++
  }
  consumeOptionalCharacter(code) {
    if (this.next.isCharacter(code)) {
      this.advance()
      return true
    } else {
      return undefined
    }
  }
  consumeOptionalOperator(op) {
    if (this.next.isOperator(op)) {
      this.advance()
      return true
    } else {
      return undefined
    }
  }
  eat() {
    const next = this.next
    this.advance()
    return next
  }
  error(message, index = null) {
    this.errors.push(
      new Error(`${message}, ${this.input}, ${index}, ${this.location}`)
    )
    this.skip()
  }
  expectCharacter(code) {
    if (this.consumeOptionalCharacter(code)) {
      return
    }
    this.error(`Missing expected ${String.fromCharCode(code)}`)
  }
  expectIdentifierOrKeyword() {
    const n = this.next
    if (!n.isIdentifier() && !n.isKeyword()) {
      this.error(`Unexpected token ${n}, expected identifier or keyword`)
      return ''
    }
    this.advance()
    return n.toString()
  }
  expectIdentifierOrKeywordOrString() {
    const n = this.next
    if (!n.isIdentifier() && !n.isKeyword() && !n.isString()) {
      this.error(
        `Unexpected token ${n}, expected identifier, keyword, or string`
      )
      return ''
    }
    this.advance()
    return n.toString()
  }
  expectOperator(operator) {
    if (this.consumeOptionalOperator(operator)) {
      return
    }
    this.error(`Missing expected operator ${operator}`)
  }
  parseBraceCondition() {}

  parseColumnWithoutAlias(defaultTable) {
    if (defaultTable instanceof FromTable) {
    } else if (isString(defaultTable)) {
      throw new Error('not implement parseColumnAlias with string type table')
    }
    const columnName = this._parseColumnName(defaultTable)
    if (!columnName) {
      throw new Error('columnName error')
    }
    return new ColumnReferenceExpression(columnName, undefined)
  }
  parseColumnAlias() {
    return this._parseColumnAsName()
  }
  _parseColumnAsName(defaultTable) {
    const columnName = this._parseColumnName(defaultTable)
    if (!columnName) {
      throw new Error('columnName error')
    }
    let alias
    if (this.peekKeywordAs()) {
      this.advance()
      alias = this._parseClainName()
        .map((it) => it.name)
        .join('.')
    }
    return new ColumnReferenceExpression(
      columnName,
      alias ? createIdentifier(alias) : undefined
    )
  }
  _parseColumnName(defaultTable) {
    const clainNamePaths = this._parseClainName()
    if (clainNamePaths.length > 0) {
      let ast
      if (clainNamePaths.length === 1 && defaultTable) {
        ast = new PathExpression([defaultTable, ...clainNamePaths])
      } else {
        ast = new PathExpression(clainNamePaths)
      }

      if (this.consumeOptionalOperator('-')) {
        if (this.consumeOptionalOperator('>')) {
          const name = this.expectIdentifierOrKeywordOrString()
          return new JsonPathColumn(
            ast,
            new JsonPathExpression([createIdentifier(name)])
          )
        }
      }
      return ast
    }

    return undefined
  }

  parseEqCondition() {}
  parseExpression() {
    if (this.next.isNumber()) {
      const num = this.eat()
      return new NumberLiteralExpression(num.numValue)
    } else if (this.next.isString()) {
      const value = this.eat()
      return new StringLiteralExpression(value.strValue)
    } else if (this.next.isIdentifier()) {
      const value = this.eat()
      return new StringLiteralExpression(value.strValue)
    }
    throw new Error('unexpected expression')
  }
  parseGtCondition() {}
  parseJoin() {
    const ast = this._parseTableAsName()
    let condition
    if (this.peekKeyword('on')) {
      this.advance()
      condition = this.parseWhereCondition()
    }
    if (ast instanceof TableReferenceExpression) {
      return new JoinExpression(undefined, ast, condition)
    } else {
      return undefined
    }
  }
  parseJoinClause() {
    if (this.next.isKeywordJoin()) {
      this.advance()
      return new JoinClause(this.parseJoin())
    }
    return undefined
  }
  parseLtCondition() {}
  parseTableAlias() {
    return this._parseTableAsName()
  }

  _parseTableAsName() {
    const tableName = this._parseTableName()
    if (!tableName) {
      throw new Error(
        `tableName error. table name can't be keyword like "select", "table", "join" etc`
      )
    }
    let alias
    if (this.peekKeywordAs()) {
      this.advance()
      alias = this.next
      this.advance()
    }
    return new TableReferenceExpression(
      tableName,
      alias ? createIdentifier(alias.strValue) : undefined
    )
  }
  parseTableColumn() {
    if (this.next.isIdentifier()) {
      const column = this.next
      this.advance()
      return column
    }
    return undefined
  }
  _parseClainName() {
    const paths = []
    if (this.consumeOptionalOperator('*')) {
      return [createIdentifier('*')]
    }
    if (this.next.isIdentifier()) {
      paths.push(createIdentifier(this.next.strValue))
      this.advance()
      while (this.consumeOptionalCharacter(asciiChars.$PERIOD)) {
        if (this.next.isIdentifier()) {
          const t = this.next
          this.advance()
          paths.push(createIdentifier(t.strValue))
        } else if (this.next.isOperator('*')) {
          paths.push(createIdentifier('*'))
        } else {
          throw new Error('invalid table name after period')
        }
      }
    }
    return paths
  }
  _parseTableName() {
    const clainNamePaths = this._parseClainName()
    if (clainNamePaths.length > 0) {
      return new TableName(clainNamePaths)
    }
    return undefined
  }
  parseUnaryExpression() {
    return this.parseExpression()
  }
  parseAsName() {
    let columnName = ''
    if (this.next.isIdentifier() || this.next.isCharacter(asciiChars.$PERIOD)) {
      const column = this.next
      this.advance()
      columnName += column.strValue
    }
    if (columnName) {
      return createIdentifier(columnName)
    }
    return undefined
  }

  parseUnaryTableColumn() {
    const table = this.parseTableColumn()
    if (table) {
      if (this.consumeOptionalCharacter(asciiChars.$PERIOD)) {
        const column = this.next
        this.advance()

        return new PathExpression([
          createIdentifier(table.strValue),
          createIdentifier(column.strValue),
        ])
      } else {
        return new PathExpression([createIdentifier(table.strValue)])
      }
    }
    return undefined
  }
  parseWhereCondition() {
    const tableColumn = this.parseUnaryTableColumn()

    if (tableColumn) {
      if (this.consumeOptionalOperator('=')) {
        const rightExpression = this.parseUnaryTableColumn()
        this.advance()
        return new JoinOnExpression(tableColumn, '=', rightExpression)
      }
    }
    return undefined
  }
  peek(offset) {
    const i = this.index + offset
    return i < this.tokens.length ? this.tokens[i] : EOF
  }
  peekKeyword(keyword) {
    return (
      this.next.kind == SyntaxKind.Keyword &&
      this.next.strValue == keyword.toLowerCase()
    )
  }
  peekKeywordAs() {
    return this.next.isKeywordAs()
  }
  peekKeywordJoin() {
    return this.next.isKeywordJoin()
  }
  peekKeywordLet() {
    return this.next.isKeywordLet()
  }
  skip() {
    let n = this.next
    while (
      this.index < this.tokens.length &&
      !n.isCharacter(asciiChars.$SEMICOLON) &&
      (this.rparensExpected <= 0 || !n.isCharacter(asciiChars.$RPAREN)) &&
      (this.rbracesExpected <= 0 || !n.isCharacter(asciiChars.$RBRACE)) &&
      (this.rbracketsExpected <= 0 || !n.isCharacter(asciiChars.$RBRACKET))
    ) {
      if (this.next.isError()) {
        this.errors.push(
          new Error(
            `this.next.toString()!, this.input, this.locationText(), this.location`
          )
        )
      }
      this.advance()
      n = this.next
    }
  }
}
