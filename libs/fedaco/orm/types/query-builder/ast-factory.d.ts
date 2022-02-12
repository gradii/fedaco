/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { BindingVariable } from '../query/ast/binding-variable';
import { ColumnReferenceExpression } from '../query/ast/column-reference-expression';
import { RawBindingExpression } from '../query/ast/expression/raw-binding-expression';
import { RawExpression } from '../query/ast/expression/raw-expression';
import { StringLiteralExpression } from '../query/ast/expression/string-literal-expression';
import { FromTable } from '../query/ast/from-table';
import { Identifier } from '../query/ast/identifier';
import { Token } from '../query/parser/sql-lexer';
import { ForwardRefFn } from './forward-ref';
export declare function raw(value: string | number | boolean): RawExpression;
export declare function bindingVariable(value: string | number | boolean | RawExpression, type?: string): RawExpression | BindingVariable;
export declare function rawSqlBindings(value: string | number | boolean, bindings: any[], type?: string): RawBindingExpression;
export declare function createIdentifier(identifier: string | ForwardRefFn<string>): Identifier;
export declare function createStringLiteral(identifier: string | ForwardRefFn<string>): StringLiteralExpression;
export declare function createTableColumn(table: FromTable | Identifier, column: string): ColumnReferenceExpression;
export declare function createColumnReferenceExpression(column: string | ColumnReferenceExpression): ColumnReferenceExpression;
export declare function createKeyword(keyword: string): Token;
