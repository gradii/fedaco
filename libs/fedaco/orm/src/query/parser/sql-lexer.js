import * as asciiChars from './ascii-chars'
import {
  isExponentSign,
  isExponentStart,
  isIdentifierPart,
  isIdentifierStart,
  parseIntAutoRadix,
  unescape,
} from './helper'
import { KEYWORDS } from './keywords'
export var SyntaxKind
;(function (SyntaxKind) {
  SyntaxKind[(SyntaxKind['Character'] = 0)] = 'Character'
  SyntaxKind[(SyntaxKind['Identifier'] = 1)] = 'Identifier'
  SyntaxKind[(SyntaxKind['Keyword'] = 2)] = 'Keyword'
  SyntaxKind[(SyntaxKind['String'] = 3)] = 'String'
  SyntaxKind[(SyntaxKind['Operator'] = 4)] = 'Operator'
  SyntaxKind[(SyntaxKind['Number'] = 5)] = 'Number'
  SyntaxKind[(SyntaxKind['Error'] = 6)] = 'Error'
})(SyntaxKind || (SyntaxKind = {}))
function newCharacterToken(index, end, code) {
  return new Token(
    index,
    end,
    SyntaxKind.Character,
    code,
    String.fromCharCode(code)
  )
}
function newIdentifierToken(index, end, text) {
  return new Token(index, end, SyntaxKind.Identifier, 0, text)
}
function newKeywordToken(index, end, text) {
  return new Token(index, end, SyntaxKind.Keyword, 0, text)
}
function newOperatorToken(index, end, text) {
  return new Token(index, end, SyntaxKind.Operator, 0, text)
}
function newStringToken(index, end, text) {
  return new Token(index, end, SyntaxKind.String, 0, text)
}
function newNumberToken(index, end, n) {
  return new Token(index, end, SyntaxKind.Number, n, '')
}
function newErrorToken(index, end, message) {
  return new Token(index, end, SyntaxKind.Error, 0, message)
}
export class SqlLexer {
  tokenize(text) {
    const scanner = new _Scanner(text)
    const tokens = []
    let token = scanner.scanToken()
    while (token != null) {
      tokens.push(token)
      token = scanner.scanToken()
    }
    return tokens
  }
}

class _Scanner {
  constructor(input) {
    this.input = input
    this.peek = 0
    this.index = -1
    this.length = input.length
    this.advance()
  }
  advance() {
    this.peek =
      ++this.index >= this.length
        ? asciiChars.$EOF
        : this.input.charCodeAt(this.index)
  }
  error(message, offset) {
    const position = this.index + offset
    return newErrorToken(
      position,
      this.index,
      `Lexer Error: ${message} at column ${position} in expression [${this.input}]`
    )
  }
  scanCharacter(start, code) {
    this.advance()
    return newCharacterToken(start, this.index, code)
  }

  scanComplexOperator(start, one, twoCode, two, threeCode, three) {
    this.advance()
    let str = one
    if (this.peek == twoCode) {
      this.advance()
      str += two
    }
    if (threeCode != null && this.peek == threeCode) {
      this.advance()
      str += three
    }
    return newOperatorToken(start, this.index, str)
  }
  scanIdentifier() {
    const start = this.index
    this.advance()
    while (isIdentifierPart(this.peek)) {
      this.advance()
    }
    const str = this.input.substring(start, this.index)
    return KEYWORDS.indexOf(str.toLowerCase()) > -1
      ? newKeywordToken(start, this.index, str.toLowerCase())
      : newIdentifierToken(start, this.index, str)
  }
  scanNumber(start) {
    let simple = this.index === start
    this.advance()
    while (true) {
      if (asciiChars.isDigit(this.peek)) {
      } else if (this.peek == asciiChars.$PERIOD) {
        simple = false
      } else if (isExponentStart(this.peek)) {
        this.advance()
        if (isExponentSign(this.peek)) {
          this.advance()
        }
        if (!asciiChars.isDigit(this.peek)) {
          return this.error('Invalid exponent', -1)
        }
        simple = false
      } else {
        break
      }
      this.advance()
    }
    const str = this.input.substring(start, this.index)
    const value = simple ? parseIntAutoRadix(str) : parseFloat(str)
    return newNumberToken(start, this.index, value)
  }
  scanOperator(start, str) {
    this.advance()
    return newOperatorToken(start, this.index, str)
  }
  scanString() {
    const start = this.index
    const quote = this.peek
    this.advance()
    let buffer = ''
    let marker = this.index
    const input = this.input
    while (this.peek != quote) {
      if (this.peek == asciiChars.$BACKSLASH) {
        buffer += input.substring(marker, this.index)
        this.advance()
        let unescapedCode

        this.peek = this.peek
        if (this.peek == asciiChars.$u) {
          const hex = input.substring(this.index + 1, this.index + 5)
          if (/^[0-9a-f]+$/i.test(hex)) {
            unescapedCode = parseInt(hex, 16)
          } else {
            return this.error(`Invalid unicode escape [\\u${hex}]`, 0)
          }
          for (let i = 0; i < 5; i++) {
            this.advance()
          }
        } else {
          unescapedCode = unescape(this.peek)
          this.advance()
        }
        buffer += String.fromCharCode(unescapedCode)
        marker = this.index
      } else if (this.peek == asciiChars.$EOF) {
        return this.error('Unterminated quote', 0)
      } else {
        this.advance()
      }
    }
    const last = input.substring(marker, this.index)
    this.advance()
    return newStringToken(start, this.index, buffer + last)
  }
  scanToken() {
    const input = this.input,
      length = this.length
    let peek = this.peek,
      index = this.index

    while (peek <= asciiChars.$SPACE) {
      if (++index >= length) {
        peek = asciiChars.$EOF
        break
      } else {
        peek = input.charCodeAt(index)
      }
    }
    this.peek = peek
    this.index = index
    if (index >= length) {
      return null
    }

    if (isIdentifierStart(peek)) {
      return this.scanIdentifier()
    }
    if (asciiChars.isDigit(peek)) {
      return this.scanNumber(index)
    }
    const start = index
    switch (peek) {
      case asciiChars.$PERIOD:
        this.advance()
        return asciiChars.isDigit(this.peek)
          ? this.scanNumber(start)
          : newCharacterToken(start, this.index, asciiChars.$PERIOD)
      case asciiChars.$LPAREN:
      case asciiChars.$RPAREN:
      case asciiChars.$LBRACE:
      case asciiChars.$RBRACE:
      case asciiChars.$LBRACKET:
      case asciiChars.$RBRACKET:
      case asciiChars.$COMMA:
      case asciiChars.$COLON:
      case asciiChars.$SEMICOLON:
        return this.scanCharacter(start, peek)
      case asciiChars.$SQ:
      case asciiChars.$DQ:
        return this.scanString()
      case asciiChars.$HASH:
      case asciiChars.$PLUS:
      case asciiChars.$MINUS:
      case asciiChars.$STAR:
      case asciiChars.$SLASH:
      case asciiChars.$PERCENT:
      case asciiChars.$CARET:
        return this.scanOperator(start, String.fromCharCode(peek))
      case asciiChars.$QUESTION:
        return this.scanComplexOperator(start, '?', asciiChars.$PERIOD, '.')
      case asciiChars.$LT:
      case asciiChars.$GT:
        return this.scanComplexOperator(
          start,
          String.fromCharCode(peek),
          asciiChars.$EQ,
          '='
        )
      case asciiChars.$BANG:
      case asciiChars.$EQ:
        return this.scanComplexOperator(
          start,
          String.fromCharCode(peek),
          asciiChars.$EQ,
          '=',
          asciiChars.$EQ,
          '='
        )
      case asciiChars.$AMPERSAND:
        return this.scanComplexOperator(start, '&', asciiChars.$AMPERSAND, '&')
      case asciiChars.$BAR:
        return this.scanComplexOperator(start, '|', asciiChars.$BAR, '|')
      case asciiChars.$NBSP:
        while (asciiChars.isWhitespace(this.peek)) {
          this.advance()
        }
        return this.scanToken()
    }
    this.advance()
    return this.error(`Unexpected character [${String.fromCharCode(peek)}]`, 0)
  }
}
export class Token {
  constructor(index, end, kind, numValue, strValue) {
    this.index = index
    this.end = end
    this.kind = kind
    this.numValue = numValue
    this.strValue = strValue
  }
  isCharacter(code) {
    return this.kind == SyntaxKind.Character && this.numValue == code
  }
  isError() {
    return this.kind == SyntaxKind.Error
  }
  isIdentifier() {
    return this.kind == SyntaxKind.Identifier
  }
  isKeyword() {
    return this.kind == SyntaxKind.Keyword
  }
  isKeywordAs() {
    return this.kind == SyntaxKind.Keyword && this.strValue == 'as'
  }
  isKeywordFalse() {
    return this.kind == SyntaxKind.Keyword && this.strValue == 'false'
  }
  isKeywordJoin() {
    return this.kind == SyntaxKind.Keyword && this.strValue == 'join'
  }
  isKeywordLet() {
    return this.kind == SyntaxKind.Keyword && this.strValue == 'let'
  }
  isKeywordNull() {
    return this.kind == SyntaxKind.Keyword && this.strValue == 'null'
  }
  isKeywordThis() {
    return this.kind == SyntaxKind.Keyword && this.strValue == 'this'
  }
  isKeywordTrue() {
    return this.kind == SyntaxKind.Keyword && this.strValue == 'true'
  }
  isKeywordUndefined() {
    return this.kind == SyntaxKind.Keyword && this.strValue == 'undefined'
  }
  isNumber() {
    return this.kind == SyntaxKind.Number
  }
  isOperator(operator) {
    return this.kind == SyntaxKind.Operator && this.strValue == operator
  }
  isString() {
    return this.kind == SyntaxKind.String
  }
  toNumber() {
    return this.kind == SyntaxKind.Number ? this.numValue : -1
  }
  toString() {
    switch (this.kind) {
      case SyntaxKind.Character:
      case SyntaxKind.Identifier:
      case SyntaxKind.Keyword:
      case SyntaxKind.Operator:
      case SyntaxKind.String:
      case SyntaxKind.Error:
        return this.strValue
      case SyntaxKind.Number:
        return this.numValue.toString()
      default:
        return null
    }
  }
}
export const EOF = new Token(-1, -1, SyntaxKind.Character, 0, '')
