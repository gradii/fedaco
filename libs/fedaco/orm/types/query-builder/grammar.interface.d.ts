/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { NestedExpression } from '../query/ast/fragment/nested-expression';
import { SqlVisitor } from '../query/sql-visitor';
import { Builder } from './builder';
export interface GrammarInterface {
    compileAggregateFragment(functionName: any, columns: any, visitor: SqlVisitor): string;
    compileDelete(builder: Builder): string;
    compileExists(builder: Builder): string;
    compileInsert(builder: Builder, values: any): string;
    compileInsertGetId(builder: Builder, values: any, sequence: string): string;
    compileInsertOrIgnore(builder: Builder, values: any): string;
    compileInsertUsing(builder: Builder, columns: any, nestedExpression: NestedExpression): string;
    compileJoinFragment(builder: Builder, visitor: SqlVisitor): string;
    compileNestedPredicate(builder: Builder, visitor: SqlVisitor): string;
    compileSelect(builder: Builder): string;
    compileTruncate(builder: Builder): {
        [sql: string]: any[];
    };
    compileUpdate(builder: Builder, values: any): string;
    compileUpsert(builder: Builder, values: any, uniqueBy: any[] | string, update: any[] | null): string;
    compilePredicateFuncName(funcName: string): string;
    distinct(distinct: boolean | any[]): string;
    getOperators(): string[];
    prepareBindingsForUpdate(builder: Builder, visitor: SqlVisitor): string;
    prepareBindingForJsonContains(value: any): string;
    quoteColumnName(columnName: string): string;
    quoteSchemaName(tableName: string): string;
    quoteTableName(tableName: string): string;
    setTablePrefix(prefix: string): void;
    wrap(column: string): string;
}
