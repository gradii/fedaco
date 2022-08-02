/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { NestedExpression } from '../query/ast/fragment/nested-expression';
import type { SqlVisitor } from '../query/sql-visitor';
import type { Builder } from './builder';

export interface GrammarInterface<T extends Builder = Builder> {
  compileAggregateFragment(functionName: any, columns: any, visitor: SqlVisitor): string;

  compileDelete(builder: T): string;

  compileExists(builder: T): string;

  compileInsert(builder: T, values: any): string;

  compileInsertGetId(builder: T, values: any, sequence: string): string;

  compileInsertOrIgnore(builder: T, values: any): string;

  compileInsertUsing(builder: T, columns: any, nestedExpression: NestedExpression): string;

  compileJoinFragment(builder: T, visitor: SqlVisitor): string;

  compileNestedPredicate(builder: T, visitor: SqlVisitor): string;

  compileSelect(builder: T): string;

  compileTruncate(builder: T): { [sql: string]: any[] };

  compileUpdate(builder: T, values: any): string;

  compileUpsert(builder: T, values: any, uniqueBy: any[] | string,
                update: any[] | null): string;

  compilePredicateFuncName(funcName: string): string;

  distinct(distinct: boolean | any[]): string;

  getOperators(): string[];

  prepareBindingsForUpdate(builder: T, visitor: SqlVisitor): string;

  prepareBindingForJsonContains(value: any): string;

  quoteColumnName(columnName: string): string;

  quoteSchemaName(tableName: string): string;

  quoteTableName(tableName: string): string;

  setTablePrefix(prefix: string): void;

  wrap(column: string): string;
}
