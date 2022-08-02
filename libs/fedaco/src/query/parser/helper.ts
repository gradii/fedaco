/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import * as chars from './ascii-chars';


export function isIdentifierStart(code: number): boolean {
  return (chars.$a <= code && code <= chars.$z) || (chars.$A <= code && code <= chars.$Z) ||
    (code == chars.$_) || (code == chars.$$);
}

export function isIdentifierPart(code: number): boolean {
  return chars.isAsciiLetter(code) || chars.isDigit(code) || (code == chars.$_) ||
    (code == chars.$$);
}

export function isExponentStart(code: number): boolean {
  return code == chars.$e || code == chars.$E;
}

export function isExponentSign(code: number): boolean {
  return code == chars.$MINUS || code == chars.$PLUS;
}

export function isQuote(code: number): boolean {
  return code === chars.$SQ || code === chars.$DQ || code === chars.$BT;
}

export function unescape(code: number): number {
  switch (code) {
    case chars.$n:
      return chars.$LF;
    case chars.$f:
      return chars.$FF;
    case chars.$r:
      return chars.$CR;
    case chars.$t:
      return chars.$TAB;
    case chars.$v:
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
