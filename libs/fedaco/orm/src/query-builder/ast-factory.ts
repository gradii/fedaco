import { BindingVariable } from '../query/ast/binding-variable';
import { ColumnReferenceExpression } from '../query/ast/column-reference-expression';
import { RawBindingExpression } from '../query/ast/expression/raw-binding-expression';
import { RawExpression } from '../query/ast/expression/raw-expression';
import { Identifier } from '../query/ast/identifier';
import { PathExpression } from '../query/ast/path-expression';
import {
  SyntaxKind,
  Token
} from '../query/parser/sql-lexer';
import { SqlParser } from '../query/parser/sql-parser';
import { ForwardRefFn } from './forward-ref';

export function raw(value: string | number | boolean) {
  return new RawExpression(value);
}

export function bindingVariable(value:  string | number | boolean | RawExpression, type = 'where'){
  if(value instanceof RawExpression) {
    return value
  }
  return new BindingVariable(raw(value), type);
}

export function rawSqlBindings(value: string | number | boolean, bindings: any[], type = 'where') {
  return new RawBindingExpression(raw(value), bindings.map(it => new BindingVariable(raw(it), type)));
}


export function createIdentifier(identifier: string | ForwardRefFn<string>) {
  return new Identifier(identifier);
}


export function createColumnReferenceExpression(column: string|ColumnReferenceExpression) {
  if(column instanceof ColumnReferenceExpression) {
    return column
  }

  if (column === '*') {
    return new ColumnReferenceExpression(
      new PathExpression(
        [createIdentifier('*')]
      )
    );
  }
  return SqlParser.createSqlParser(column).parseColumnAlias();
}


export function createKeyword(keyword: string) {
  return new Token(-1, -1, SyntaxKind.Keyword, 0, keyword);
}

