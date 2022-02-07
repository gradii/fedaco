/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { ColumnReferenceExpression } from '../ast/column-reference-expression';
import { NumberLiteralExpression } from '../ast/expression/number-literal-expression';
import { StringLiteralExpression } from '../ast/expression/string-literal-expression';
import { JsonPathColumn } from '../ast/fragment/json-path-column';
import { FromTable } from '../ast/from-table';
import { Identifier } from '../ast/identifier';
import { JoinClause } from '../ast/join-clause';
import { JoinExpression } from '../ast/join-expression';
import { JoinOnExpression } from '../ast/join-on-expression';
import { PathExpression } from '../ast/path-expression';
import { TableName } from '../ast/table-name';
import { TableReferenceExpression } from '../ast/table-reference-expression';
import { Token } from './sql-lexer';
export declare class _SqlParserAst {
    input: string;
    location: any;
    absoluteOffset: number;
    tokens: Token[];
    inputLength: number;
    parseAction: boolean;
    private errors;
    private offset;
    index: number;
    private rparensExpected;
    private rbracketsExpected;
    private rbracesExpected;
    constructor(input: string, location: any, absoluteOffset: number, tokens: Token[], inputLength: number, parseAction: boolean, errors: any[], offset: number);
    get next(): Token;
    /** Whether all the parser input has been processed. */
    get atEOF(): boolean;
    /**
     * Index of the next token to be processed, or the end of the last token if all have been
     * processed.
     */
    get inputIndex(): number;
    /**
     * End index of the last processed token, or the start of the first token if none have been
     * processed.
     */
    get currentEndIndex(): number;
    /**
     * Returns the absolute offset of the start of the current token.
     */
    get currentAbsoluteOffset(): number;
    advance(): void;
    consumeOptionalCharacter(code: number): boolean;
    consumeOptionalOperator(op: string): boolean;
    eat(): Token;
    error(message: string, index?: number | null): void;
    expectCharacter(code: number): void;
    expectIdentifierOrKeyword(): string;
    expectIdentifierOrKeywordOrString(): string;
    expectOperator(operator: string): void;
    parseBraceCondition(): void;
    parseColumnWithoutAlias(defaultTable?: string | FromTable): ColumnReferenceExpression;
    parseColumnAlias(): ColumnReferenceExpression;
    _parseColumnAsName(defaultTable?: FromTable): ColumnReferenceExpression;
    _parseColumnName(defaultTable?: FromTable): JsonPathColumn | PathExpression;
    parseEqCondition(): void;
    parseExpression(): NumberLiteralExpression | StringLiteralExpression;
    parseGtCondition(): void;
    parseJoin(): JoinExpression;
    parseJoinClause(): JoinClause;
    parseLtCondition(): void;
    parseTableAlias(): TableReferenceExpression;
    /**
     *
     */
    _parseTableAsName(): TableReferenceExpression;
    parseTableColumn(): Token;
    _parseClainName(): Identifier[];
    _parseTableName(): TableName;
    parseUnaryExpression(): NumberLiteralExpression | StringLiteralExpression;
    parseAsName(): Identifier;
    /**
     * @deprecated
     */
    parseUnaryTableColumn(): PathExpression;
    parseWhereCondition(): JoinOnExpression;
    peek(offset: number): Token;
    peekKeyword(keyword: string): boolean;
    peekKeywordAs(): boolean;
    peekKeywordJoin(): boolean;
    peekKeywordLet(): boolean;
    private skip;
}
