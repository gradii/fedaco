import { ForwardRefFn } from '../../query-builder/forward-ref';
import { _SqlParserAst } from './_sql-parser-ast';
import { SqlLexer } from './sql-lexer';

export class SqlParser {

  index: number            = 0;
  private _lexer: SqlLexer = new SqlLexer();

  constructor() {
  }

  static createSqlParser(sqlString) {
    const _lexer: SqlLexer = new SqlLexer();
    const tokens           = _lexer.tokenize(sqlString);
    return new _SqlParserAst(
      sqlString,
      undefined,
      0,
      tokens,
      sqlString.length,
      true,
      [],
      0
    );
  }

  _parseTable() {

  }

  advance() {
    this.index++;
  }

  beginParse(target) {

  }

  parseFrom() {

  }

  /**
   * join grammar
   *
   * join ::= "join" table (as tableAlias) ? condition
   * condition ::= columnReference"."fieldReference "=" columnReference"."fieldReference
   * @param joinStr
   */
  parseJoin(joinStr) {

  }

  /**
   * return joined table
   *
   * @param fromClause
   * @param joinStr
   */
  parseJoinPart(fromClause: string | ForwardRefFn<string>, joinStr: string) {
    const _lexer: SqlLexer = new SqlLexer();
    const tokens           = _lexer.tokenize(joinStr);
    const parserAst        = new _SqlParserAst(
      joinStr,
      undefined,
      0,
      tokens,
      joinStr.length,
      true,
      [],
      0
    );

    return parserAst.parseJoin();
  }

  parseOrderBy(orderBy) {
    const tokens = this._lexer.tokenize(orderBy);

    console.log(tokens.map(it => it.toString()));
  }

  parseSelect() {

  }

  parseWhere() {

  }
}


