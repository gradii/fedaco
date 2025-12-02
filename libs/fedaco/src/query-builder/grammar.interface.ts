/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { NestedExpression } from '../query/ast/fragment/nested-expression';
import type { SqlVisitor } from '../query/sql-visitor';
import type { Builder } from './builder';

export interface GrammarInterface<T extends Builder = Builder> {
  stepJoinFragment(builder: T, visitor: SqlVisitor): string;

  stepNestedPredicate(builder: T, visitor: SqlVisitor): string;

  stepAggregateFragment(functionName: any, columns: any, visitor: SqlVisitor): string;

  compileDelete(builder: T, ctx?: any): string;

  compileExists(builder: T, ctx?: any): string;

  compileInsert(builder: T, values: any, insertOption?: string, ctx?: any): string;

  compileInsertGetId(builder: T, values: any, sequence: string, ctx?: any): string;

  compileInsertOrIgnore(builder: T, values: any, ctx?: any): string;

  compileInsertUsing(builder: T, columns: any, nestedExpression: NestedExpression, ctx?: any): string;

  compileSelect(builder: T, ctx?: any): string;

  compileTruncate(builder: T, ctx?: any): { [sql: string]: any[] };

  compileUpdate(builder: T, values: any, ctx?: any): string;

  compileUpsert(builder: T, values: any, uniqueBy: any[] | string,
                update: any[] | null, ctx?: any): string;

  predicateFuncName(funcName: string): string;

  distinct(distinct: boolean | any[]): string;

  distinctInAggregateFunctionCall(distinct: boolean | string[]): string;

  getOperators(): string[];

  prepareBindingsForUpdate(builder: T, visitor: SqlVisitor): string;

  prepareBindingForJsonContains(value: any): string;

  quoteColumnName(columnName: string): string;

  quoteSchemaName(tableName: string): string;

  quoteTableName(tableName: string): string;

  setTablePrefix(prefix: string): void;

  wrap(column: string): string;
}
