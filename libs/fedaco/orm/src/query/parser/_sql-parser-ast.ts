import { createIdentifier } from '../../query-builder/ast-factory';
import { ColumnReferenceExpression } from '../ast/column-reference-expression';
import { NumberLiteralExpression } from '../ast/expression/number-literal-expression';
import { StringLiteralExpression } from '../ast/expression/string-literal-expression';
import { JsonPathColumn } from '../ast/fragment/json-path-column';
import { Identifier } from '../ast/identifier';
import { JoinClause } from '../ast/join-clause';
import { JoinExpression } from '../ast/join-expression';
import { JoinOnExpression } from '../ast/join-on-expression';
import { JsonPathExpression } from '../ast/json-path-expression';
import { PathExpression } from '../ast/path-expression';
import { TableName } from '../ast/table-name';
import { TableReferenceExpression } from '../ast/table-reference-expression';
import * as asciiChars from './ascii-chars';
import {
  EOF,
  SyntaxKind,
  Token
} from './sql-lexer';

export class _SqlParserAst {
  index: number             = 0;
  private rparensExpected   = 0;
  private rbracketsExpected = 0;
  private rbracesExpected   = 0;

  constructor(public input: string, public location: any, public absoluteOffset: number,
              public tokens: Token[], public inputLength: number, public parseAction: boolean,
              private errors: any[], private offset: number) {
  }

  get next(): Token {
    return this.peek(0);
  }

  /** Whether all the parser input has been processed. */
  get atEOF(): boolean {
    return this.index >= this.tokens.length;
  }

  /**
   * Index of the next token to be processed, or the end of the last token if all have been
   * processed.
   */
  get inputIndex(): number {
    return this.atEOF ? this.currentEndIndex : this.next.index + this.offset;
  }

  /**
   * End index of the last processed token, or the start of the first token if none have been
   * processed.
   */
  get currentEndIndex(): number {
    if (this.index > 0) {
      const curToken = this.peek(-1);
      return curToken.end + this.offset;
    }
    // No tokens have been processed yet; return the next token's start or the length of the input
    // if there is no token.
    if (this.tokens.length === 0) {
      return this.inputLength + this.offset;
    }
    return this.next.index + this.offset;
  }

  /**
   * Returns the absolute offset of the start of the current token.
   */
  get currentAbsoluteOffset(): number {
    return this.absoluteOffset + this.inputIndex;
  }

  advance() {
    this.index++;
  }

  consumeOptionalCharacter(code: number): boolean {
    if (this.next.isCharacter(code)) {
      this.advance();
      return true;
    } else {
      return undefined;
    }
  }

  consumeOptionalOperator(op: string): boolean {
    if (this.next.isOperator(op)) {
      this.advance();
      return true;
    } else {
      return undefined;
    }
  }

  eat() {
    const next = this.next;
    this.advance();
    return next;
  }

  error(message: string, index: number | null = null) {
    this.errors.push(new Error(`${message}, ${this.input}, ${index}, ${this.location}`));
    this.skip();
  }

  expectCharacter(code: number) {
    if (this.consumeOptionalCharacter(code)) return;
    this.error(`Missing expected ${String.fromCharCode(code)}`);
  }

  expectIdentifierOrKeyword(): string {
    const n = this.next;
    if (!n.isIdentifier() && !n.isKeyword()) {
      this.error(`Unexpected token ${n}, expected identifier or keyword`);
      return '';
    }
    this.advance();
    return n.toString() as string;
  }

  expectIdentifierOrKeywordOrString(): string {
    const n = this.next;
    if (!n.isIdentifier() && !n.isKeyword() && !n.isString()) {
      this.error(`Unexpected token ${n}, expected identifier, keyword, or string`);
      return '';
    }
    this.advance();
    return n.toString() as string;
  }

  expectOperator(operator: string) {
    if (this.consumeOptionalOperator(operator)) return;
    this.error(`Missing expected operator ${operator}`);
  }

  parseBraceCondition() {

  }

  parseColumnAlias(): ColumnReferenceExpression {
    return this._parseColumnAsName();
  }

  _parseColumnAsName(): ColumnReferenceExpression {
    const columnName = this._parseColumnName();
    if (!columnName) {
      throw new Error('columnName error');
    }
    let alias;
    if (this.peekKeywordAs()) {
      this.advance();
      alias = this._parseClainName().map(it => it.name).join('.');
    }
    return new ColumnReferenceExpression(
      columnName,
      alias ? createIdentifier(alias) : undefined
    );
  }

  _parseColumnName(): JsonPathColumn | PathExpression {
    const clainNamePaths = this._parseClainName();
    if (clainNamePaths.length > 0) {
      const ast = new PathExpression(clainNamePaths);

      // ->
      if (this.consumeOptionalOperator('-')) {
        if (this.consumeOptionalOperator('>')) {
          const name = this.expectIdentifierOrKeywordOrString();
          return new JsonPathColumn(
            ast,
            new JsonPathExpression([
              createIdentifier(name)
            ])
          );
        }
      }

      return ast;
    }


    // const paths = [];
    // if (this.next.isIdentifier()) {
    //   paths.push(createIdentifier(this.next.strValue));
    //   this.advance();
    //   while (this.consumeOptionalCharacter(asciiChars.$PERIOD)) {
    //     if (this.next.isIdentifier()) {
    //       const t = this.next;
    //       this.advance();
    //       paths.push(createIdentifier(t.strValue));
    //     } else {
    //       throw new Error('invalid table name after period');
    //     }
    //   }
    //   // ->
    //   // if(this.consumeOptionalCharacter(asciiChars.$MINUS)){
    //   //   if(this.consumeOptionalCharacter(asciiChars.$GT)) {
    //   //   }
    //   // }
    //   return new PathExpression(paths);
    // }
    return undefined;
  }

  //begin parse part

  parseEqCondition() {

  }

  parseExpression() {
    if (this.next.isNumber()) {
      const num = this.eat();
      return new NumberLiteralExpression(num.numValue);
    } else if (this.next.isString()) {
      const value = this.eat();
      return new StringLiteralExpression(value.strValue);
    } else if (this.next.isIdentifier()) {
      const value = this.eat();
      return new StringLiteralExpression(value.strValue);
    }
  }

  parseGtCondition() {

  }

  parseJoin() {
    const ast = this._parseTableAsName();
    let condition;
    if (this.peekKeyword('on')) {
      this.advance();
      condition = this.parseWhereCondition();
    }
    if (ast instanceof TableReferenceExpression) {
      return new JoinExpression(
        undefined,
        ast,
        condition
      );
    } else {
      return undefined;
    }
  }

  parseJoinClause() {
    if (this.next.isKeywordJoin()) {
      this.advance();
      return new JoinClause(this.parseJoin());
    }
    return undefined;
  }

  parseLtCondition() {

  }

  parseTableAlias() {
    return this._parseTableAsName();
  }

  /**
   *
   */
  _parseTableAsName(): TableReferenceExpression {
    const tableName = this._parseTableName();
    if (!tableName) {
      throw new Error('tableName error');
    }
    let alias;
    if (this.peekKeywordAs()) {
      this.advance();
      alias = this.next;
      this.advance();
    }
    return new TableReferenceExpression(
      tableName,
      alias ? createIdentifier(alias.strValue) : undefined
    );
  }

  parseTableColumn() {
    if (this.next.isIdentifier()) {
      const column = this.next;
      this.advance();
      return column;
    }
    return undefined;
  }

  _parseClainName(): Identifier[] {
    const paths = [];
    if (this.consumeOptionalOperator('*')) {
      return [createIdentifier('*')];
    }
    if (this.next.isIdentifier()) {
      paths.push(createIdentifier(this.next.strValue));
      this.advance();
      while (this.consumeOptionalCharacter(asciiChars.$PERIOD)) {
        if (this.next.isIdentifier()) {
          const t = this.next;
          this.advance();
          paths.push(createIdentifier(t.strValue));
        } else {
          throw new Error('invalid table name after period');
        }
      }
      // ->
      // if(this.consumeOptionalCharacter(asciiChars.$MINUS)){
      //   if(this.consumeOptionalCharacter(asciiChars.$GT)) {
      //   }
      // }
    }
    return paths;
  }

  _parseTableName(): TableName {
    const clainNamePaths = this._parseClainName();
    if (clainNamePaths.length > 0) {
      return new TableName(clainNamePaths);
    }
    return undefined;
  }

  parseUnaryExpression() {
    // const table = this.parseUnaryTableColumn();
    // if (table) {
    //   return table;
    // } else {
    return this.parseExpression();
    // }
  }

  parseAsName() {
    let columnName = '';
    if (this.next.isIdentifier() || this.next.isCharacter(asciiChars.$PERIOD)) {
      const column = this.next;
      this.advance();
      columnName += column.strValue;
    }
    if (columnName) {
      return createIdentifier(columnName);
    }
    return undefined;
  }

  /**
   * @deprecated
   */
  parseUnaryTableColumn() {
    const table = this.parseTableColumn();
    if (table) {
      if (this.consumeOptionalCharacter(asciiChars.$PERIOD)) {
        const column = this.next;
        this.advance();
        //report error
        return new PathExpression(
          [createIdentifier(table.strValue),
            createIdentifier(column.strValue)]
        );
      } else {
        return new PathExpression(
          [createIdentifier(table.strValue)]
        );
      }
    }
    return undefined;
  }

  parseWhereCondition() {
    const tableColumn = this.parseUnaryTableColumn();
    //this should be range
    if (tableColumn) {
      if (this.consumeOptionalOperator('=')) {
        const rightExpression = this.parseUnaryTableColumn();
        this.advance();
        return new JoinOnExpression(
          tableColumn,
          '=',
          rightExpression
        );
      }
    }
    return undefined;
  }

  peek(offset: number): Token {
    const i = this.index + offset;
    return i < this.tokens.length ? this.tokens[i] : EOF;
  }

  peekKeyword(keyword: string): boolean {
    return this.next.kind == SyntaxKind.Keyword && this.next.strValue == keyword.toLowerCase();
  }

  peekKeywordAs(): boolean {
    return this.next.isKeywordAs();
  }

  peekKeywordJoin(): boolean {
    return this.next.isKeywordJoin();
  }

  peekKeywordLet(): boolean {
    return this.next.isKeywordLet();
  }

  private skip() {
    let n = this.next;
    while (this.index < this.tokens.length && !n.isCharacter(asciiChars.$SEMICOLON) &&
    (this.rparensExpected <= 0 || !n.isCharacter(asciiChars.$RPAREN)) &&
    (this.rbracesExpected <= 0 || !n.isCharacter(asciiChars.$RBRACE)) &&
    (this.rbracketsExpected <= 0 || !n.isCharacter(asciiChars.$RBRACKET))) {
      if (this.next.isError()) {
        this.errors.push(
          new Error(`this.next.toString()!, this.input, this.locationText(), this.location`));
      }
      this.advance();
      n = this.next;
    }
  }

}