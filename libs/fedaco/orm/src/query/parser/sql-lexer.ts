import * as asciiChars from './ascii-chars';
import {
  isExponentSign,
  isExponentStart,
  isIdentifierPart,
  isIdentifierStart,
  parseIntAutoRadix,
  unescape
} from './helper';
import { KEYWORDS } from './keywords';

export enum SyntaxKind {
  Character,
  Identifier,
  Keyword,
  String,
  Operator,
  Number,
  Error
}

function newCharacterToken(index: number, end: number, code: number): Token {
  return new Token(index, end, SyntaxKind.Character, code, String.fromCharCode(code));
}

function newIdentifierToken(index: number, end: number, text: string): Token {
  return new Token(index, end, SyntaxKind.Identifier, 0, text);
}

function newKeywordToken(index: number, end: number, text: string): Token {
  return new Token(index, end, SyntaxKind.Keyword, 0, text);
}

function newOperatorToken(index: number, end: number, text: string): Token {
  return new Token(index, end, SyntaxKind.Operator, 0, text);
}

function newStringToken(index: number, end: number, text: string): Token {
  return new Token(index, end, SyntaxKind.String, 0, text);
}

function newNumberToken(index: number, end: number, n: number): Token {
  return new Token(index, end, SyntaxKind.Number, n, '');
}

function newErrorToken(index: number, end: number, message: string): Token {
  return new Token(index, end, SyntaxKind.Error, 0, message);
}


export class SqlLexer {

  tokenize(text: string): Token[] {
    const scanner         = new _Scanner(text);
    const tokens: Token[] = [];
    let token             = scanner.scanToken();
    while (token != null) {
      tokens.push(token);
      token = scanner.scanToken();
    }
    return tokens;
  }

}

// tslint:disable-next-line:class-name
class _Scanner {
  length: number;
  peek: number  = 0;
  index: number = -1;

  constructor(public input: string) {
    this.length = input.length;
    this.advance();
  }

  advance() {
    this.peek = ++this.index >= this.length ?
      asciiChars.$EOF :
      this.input.charCodeAt(this.index);
  }

  error(message: string, offset: number): Token {
    const position: number = this.index + offset;
    return newErrorToken(
      position, this.index,
      `Lexer Error: ${message} at column ${position} in expression [${this.input}]`);
  }

  scanCharacter(start: number, code: number): Token {
    this.advance();
    return newCharacterToken(start, this.index, code);
  }

  /**
   * Tokenize a 2/3 char long operator
   *
   * @param start start index in the expression
   * @param one first symbol (always part of the operator)
   * @param twoCode code point for the second symbol
   * @param two second symbol (part of the operator when the second code point matches)
   * @param threeCode code point for the third symbol
   * @param three third symbol (part of the operator when provided and matches source expression)
   */
  scanComplexOperator(
    start: number, one: string, twoCode: number, two: string, threeCode?: number,
    three?: string): Token {
    this.advance();
    let str: string = one;
    if (this.peek == twoCode) {
      this.advance();
      str += two;
    }
    if (threeCode != null && this.peek == threeCode) {
      this.advance();
      str += three;
    }
    return newOperatorToken(start, this.index, str);
  }

  scanIdentifier(): Token {
    const start: number = this.index;
    this.advance();
    while (isIdentifierPart(this.peek)) this.advance();
    const str: string = this.input.substring(start, this.index);
    return KEYWORDS.indexOf(str.toLowerCase()) > -1 ? newKeywordToken(start, this.index, str.toLowerCase()) :
      newIdentifierToken(start, this.index, str);
  }

  scanNumber(start: number): Token {
    let simple: boolean = (this.index === start);
    this.advance();  // Skip initial digit.
    while (true) {
      if (asciiChars.isDigit(this.peek)) {
        // Do nothing.
      } else if (this.peek == asciiChars.$PERIOD) {
        simple = false;
      } else if (isExponentStart(this.peek)) {
        this.advance();
        if (isExponentSign(this.peek)) this.advance();
        if (!asciiChars.isDigit(this.peek)) return this.error('Invalid exponent', -1);
        simple = false;
      } else {
        break;
      }
      this.advance();
    }
    const str: string   = this.input.substring(start, this.index);
    const value: number = simple ? parseIntAutoRadix(str) : parseFloat(str);
    return newNumberToken(start, this.index, value);
  }

  scanOperator(start: number, str: string): Token {
    this.advance();
    return newOperatorToken(start, this.index, str);
  }

  scanString(): Token {
    const start: number = this.index;
    const quote: number = this.peek;
    this.advance();  // Skip initial quote.

    let buffer: string  = '';
    let marker: number  = this.index;
    const input: string = this.input;

    while (this.peek != quote) {
      if (this.peek == asciiChars.$BACKSLASH) {
        buffer += input.substring(marker, this.index);
        this.advance();
        let unescapedCode: number;
        // Workaround for TS2.1-introduced type strictness
        this.peek = this.peek;
        if (this.peek == asciiChars.$u) {
          // 4 character hex code for unicode character.
          const hex: string = input.substring(this.index + 1, this.index + 5);
          if (/^[0-9a-f]+$/i.test(hex)) {
            unescapedCode = parseInt(hex, 16);
          } else {
            return this.error(`Invalid unicode escape [\\u${hex}]`, 0);
          }
          for (let i: number = 0; i < 5; i++) {
            this.advance();
          }
        } else {
          unescapedCode = unescape(this.peek);
          this.advance();
        }
        buffer += String.fromCharCode(unescapedCode);
        marker = this.index;
      } else if (this.peek == asciiChars.$EOF) {
        return this.error('Unterminated quote', 0);
      } else {
        this.advance();
      }
    }

    const last: string = input.substring(marker, this.index);
    this.advance();  // Skip terminating quote.

    return newStringToken(start, this.index, buffer + last);
  }

  scanToken(): Token | null {
    const input = this.input, length = this.length;
    let peek    = this.peek, index = this.index;

    // Skip whitespace.
    while (peek <= asciiChars.$SPACE) {
      if (++index >= length) {
        peek = asciiChars.$EOF;
        break;
      } else {
        peek = input.charCodeAt(index);
      }
    }

    this.peek  = peek;
    this.index = index;

    if (index >= length) {
      return null;
    }

    // Handle identifiers and numbers.
    if (isIdentifierStart(peek)) return this.scanIdentifier();
    if (asciiChars.isDigit(peek)) return this.scanNumber(index);

    const start: number = index;
    switch (peek) {
      case asciiChars.$PERIOD:
        this.advance();
        return asciiChars.isDigit(this.peek) ? this.scanNumber(start) :
          newCharacterToken(start, this.index, asciiChars.$PERIOD);
      case asciiChars.$LPAREN:
      case asciiChars.$RPAREN:
      case asciiChars.$LBRACE:
      case asciiChars.$RBRACE:
      case asciiChars.$LBRACKET:
      case asciiChars.$RBRACKET:
      case asciiChars.$COMMA:
      case asciiChars.$COLON:
      case asciiChars.$SEMICOLON:
        return this.scanCharacter(start, peek);
      case asciiChars.$SQ:
      case asciiChars.$DQ:
        return this.scanString();
      case asciiChars.$HASH:
      case asciiChars.$PLUS:
      case asciiChars.$MINUS:
      case asciiChars.$STAR:
      case asciiChars.$SLASH:
      case asciiChars.$PERCENT:
      case asciiChars.$CARET:
        return this.scanOperator(start, String.fromCharCode(peek));
      case asciiChars.$QUESTION:
        return this.scanComplexOperator(start, '?', asciiChars.$PERIOD, '.');
      case asciiChars.$LT:
      case asciiChars.$GT:
        return this.scanComplexOperator(start, String.fromCharCode(peek), asciiChars.$EQ, '=');
      case asciiChars.$BANG:
      case asciiChars.$EQ:
        return this.scanComplexOperator(
          start, String.fromCharCode(peek), asciiChars.$EQ, '=', asciiChars.$EQ, '=');
      case asciiChars.$AMPERSAND:
        return this.scanComplexOperator(start, '&', asciiChars.$AMPERSAND, '&');
      case asciiChars.$BAR:
        return this.scanComplexOperator(start, '|', asciiChars.$BAR, '|');
      case asciiChars.$NBSP:
        while (asciiChars.isWhitespace(this.peek)) this.advance();
        return this.scanToken();
    }

    this.advance();
    return this.error(`Unexpected character [${String.fromCharCode(peek)}]`, 0);
  }
}

export class Token {
  constructor(
    public index: number,
    public end: number,
    public kind: SyntaxKind,
    public numValue: number,
    public strValue: string
  ) {
  }

  isCharacter(code: number): boolean {
    return this.kind == SyntaxKind.Character && this.numValue == code;
  }

  isError(): boolean {
    return this.kind == SyntaxKind.Error;
  }

  isIdentifier(): boolean {
    return this.kind == SyntaxKind.Identifier;
  }

  isKeyword(): boolean {
    return this.kind == SyntaxKind.Keyword;
  }

  isKeywordAs(): boolean {
    return this.kind == SyntaxKind.Keyword && this.strValue == 'as';
  }

  isKeywordFalse(): boolean {
    return this.kind == SyntaxKind.Keyword && this.strValue == 'false';
  }

  isKeywordJoin(): boolean {
    return this.kind == SyntaxKind.Keyword && this.strValue == 'join';
  }

  isKeywordLet(): boolean {
    return this.kind == SyntaxKind.Keyword && this.strValue == 'let';
  }

  isKeywordNull(): boolean {
    return this.kind == SyntaxKind.Keyword && this.strValue == 'null';
  }

  isKeywordThis(): boolean {
    return this.kind == SyntaxKind.Keyword && this.strValue == 'this';
  }

  isKeywordTrue(): boolean {
    return this.kind == SyntaxKind.Keyword && this.strValue == 'true';
  }

  isKeywordUndefined(): boolean {
    return this.kind == SyntaxKind.Keyword && this.strValue == 'undefined';
  }

  isNumber(): boolean {
    return this.kind == SyntaxKind.Number;
  }

  isOperator(operator: string): boolean {
    return this.kind == SyntaxKind.Operator && this.strValue == operator;
  }

  isString(): boolean {
    return this.kind == SyntaxKind.String;
  }

  toNumber(): number {
    return this.kind == SyntaxKind.Number ? this.numValue : -1;
  }

  toString(): string | null {
    switch (this.kind) {
      case SyntaxKind.Character:
      case SyntaxKind.Identifier:
      case SyntaxKind.Keyword:
      case SyntaxKind.Operator:
      case SyntaxKind.String:
      case SyntaxKind.Error:
        return this.strValue;
      case SyntaxKind.Number:
        return this.numValue.toString();
      default:
        return null;
    }
  }
}

export const EOF: Token = new Token(-1, -1, SyntaxKind.Character, 0, '');