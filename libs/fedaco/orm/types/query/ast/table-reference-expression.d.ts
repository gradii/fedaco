/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { ParenthesizedExpression } from './expression/parenthesized-expression';
import { NestedExpression } from './fragment/nested-expression';
import { Identifier } from './identifier';
import { PathExpression } from './path-expression';
import { TableName } from './table-name';
export declare class TableReferenceExpression extends SqlNode {
    expression: ParenthesizedExpression | TableName | NestedExpression;
    alias?: Identifier | PathExpression;
    constructor(expression: ParenthesizedExpression | TableName | NestedExpression, alias?: Identifier | PathExpression);
    accept(visitor: SqlVisitor): string;
}
