/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { ColumnReferenceExpression } from '../ast/column-reference-expression';
import { NumberLiteralExpression } from '../ast/expression/number-literal-expression';
import { StringLiteralExpression } from '../ast/expression/string-literal-expression';
import { FromTable } from '../ast/from-table';
import { Identifier } from '../ast/identifier';
import { JoinClause } from '../ast/join-clause';
import { JoinExpression } from '../ast/join-expression';
import { JoinOnExpression } from '../ast/join-on-expression';
import { JsonPathExpression } from '../ast/json-path-expression';
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
    constructor(
        input: string,
        location: any,
        absoluteOffset: number,
        tokens: Token[],
        inputLength: number,
        parseAction: boolean,
        errors: any[],
        offset: number
    );
    get next(): Token;

    get atEOF(): boolean;

    get inputIndex(): number;

    get currentEndIndex(): number;

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
    parseColumnWithoutAlias(
        defaultTable?: string | FromTable
    ): ColumnReferenceExpression;
    parseColumnAlias(): ColumnReferenceExpression;
    _parseColumnAsName(defaultTable?: FromTable): ColumnReferenceExpression;
    _parseColumnName(
        defaultTable?: FromTable
    ): JsonPathExpression | PathExpression | null;
    parseEqCondition(): void;
    parseExpression(): StringLiteralExpression | NumberLiteralExpression;
    parseGtCondition(): void;
    parseJoin(): JoinExpression;
    parseJoinClause(): JoinClause;
    parseLtCondition(): void;
    parseTableAlias(): TableReferenceExpression;

    _parseTableAsName(): TableReferenceExpression;
    parseTableColumn(): Token;
    _parseChainName(): Identifier[];
    _parseChainPathExpression(defaultTable?: FromTable): PathExpression | null;
    _parseJsonColumnPathExpression(
        defaultTable?: FromTable
    ): PathExpression | JsonPathExpression | null;
    _parseTableName(): TableName;
    parseUnaryExpression(): StringLiteralExpression | NumberLiteralExpression;
    parseAsName(): Identifier;

    parseUnaryTableColumn(): PathExpression | null;
    parseWhereCondition(): JoinOnExpression;
    peek(offset: number): Token;
    peekKeyword(keyword: string): boolean;
    peekKeywordAs(): boolean;
    peekKeywordJoin(): boolean;
    peekKeywordLet(): boolean;
    private skip;
}
