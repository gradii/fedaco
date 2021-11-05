/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export declare function isIdentifierStart(code: number): boolean;
export declare function isIdentifierPart(code: number): boolean;
export declare function isExponentStart(code: number): boolean;
export declare function isExponentSign(code: number): boolean;
export declare function isQuote(code: number): boolean;
export declare function unescape(code: number): number;
export declare function parseIntAutoRadix(text: string): number;
