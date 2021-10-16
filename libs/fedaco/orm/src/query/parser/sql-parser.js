import { _SqlParserAst } from './_sql-parser-ast'
import { SqlLexer } from './sql-lexer'
export class SqlParser {
  constructor() {
    this.index = 0
    this._lexer = new SqlLexer()
  }
  static createSqlParser(sqlString) {
    const _lexer = new SqlLexer()
    const tokens = _lexer.tokenize(sqlString)
    return new _SqlParserAst(
      sqlString,
      undefined,
      0,
      tokens,
      sqlString.length,
      true,
      [],
      0
    )
  }
  _parseTable() {}
  advance() {
    this.index++
  }
  beginParse(target) {}
  parseFrom() {}

  parseJoin(joinStr) {}

  parseJoinPart(fromClause, joinStr) {
    const _lexer = new SqlLexer()
    const tokens = _lexer.tokenize(joinStr)
    const parserAst = new _SqlParserAst(
      joinStr,
      undefined,
      0,
      tokens,
      joinStr.length,
      true,
      [],
      0
    )
    return parserAst.parseJoin()
  }
  parseOrderBy(orderBy) {
    const tokens = this._lexer.tokenize(orderBy)
    console.log(tokens.map((it) => it.toString()))
  }
  parseSelect() {}
  parseWhere() {}
}
