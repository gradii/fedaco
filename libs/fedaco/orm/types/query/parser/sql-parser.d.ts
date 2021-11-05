/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { ForwardRefFn } from '../../query-builder/forward-ref';
import { _SqlParserAst } from './_sql-parser-ast';
export declare class SqlParser {
    index: number;
    private _lexer;
    constructor();
    static createSqlParser(sqlString: string): _SqlParserAst;
    _parseTable(): void;
    advance(): void;
    beginParse(target: string): void;
    parseFrom(): void;
    /**
     * join grammar
     *
     * join ::= "join" table (as tableAlias) ? condition
     * condition ::= columnReference"."fieldReference "=" columnReference"."fieldReference
     * @param joinStr
     */
    parseJoin(joinStr: string): void;
    /**
     * return joined table
     *
     * @param fromClause
     * @param joinStr
     */
    parseJoinPart(fromClause: string | ForwardRefFn<string>, joinStr: string): import("@gradii/fedaco").JoinExpression;
    parseOrderBy(orderBy: string): void;
    parseSelect(): void;
    parseWhere(): void;
}
