/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export declare enum SyntaxKind {
    Character = 0,
    Identifier = 1,
    Keyword = 2,
    String = 3,
    Operator = 4,
    Number = 5,
    Error = 6
}
export declare class SqlLexer {
    tokenize(text: string): Token[];
}
export declare class Token {
    index: number;
    end: number;
    kind: SyntaxKind;
    numValue: number;
    strValue: string;
    constructor(index: number, end: number, kind: SyntaxKind, numValue: number, strValue: string);
    isCharacter(code: number): boolean;
    isError(): boolean;
    isIdentifier(): boolean;
    isKeyword(): boolean;
    isKeywordAs(): boolean;
    isKeywordFalse(): boolean;
    isKeywordJoin(): boolean;
    isKeywordLet(): boolean;
    isKeywordNull(): boolean;
    isKeywordThis(): boolean;
    isKeywordTrue(): boolean;
    isKeywordUndefined(): boolean;
    isNumber(): boolean;
    isOperator(operator: string): boolean;
    isString(): boolean;
    toNumber(): number;
    toString(): string | null;
}
export declare const EOF: Token;
