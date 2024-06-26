/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import * as chars from './ascii-chars';


export function isIdentifierStart(code: number): boolean {
  return (chars.A <= code && code <= chars.Z) || (chars.$A <= code && code <= chars.$Z) ||
    (code == chars.$_) || (code == chars.$$);
}

export function isIdentifierPart(code: number): boolean {
  return chars.isAsciiLetter(code) || chars.isDigit(code) || (code == chars.$_) ||
    (code == chars.$$);
}

export function isExponentStart(code: number): boolean {
  return code == chars.E || code == chars.$E;
}

export function isExponentSign(code: number): boolean {
  return code == chars.$MINUS || code == chars.$PLUS;
}

export function isQuote(code: number): boolean {
  return code === chars.$SQ || code === chars.$DQ || code === chars.$BT;
}

export function unescape(code: number): number {
  switch (code) {
    case chars.N:
      return chars.$LF;
    case chars.F:
      return chars.$FF;
    case chars.R:
      return chars.$CR;
    case chars.T:
      return chars.$TAB;
    case chars.V:
      return chars.$VTAB;
    default:
      return code;
  }
}

export function parseIntAutoRadix(text: string): number {
  const result: number = parseInt(text);
  if (isNaN(result)) {
    throw new Error('Invalid integer literal when parsing ' + text);
  }
  return result;
}
