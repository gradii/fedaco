/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { BindingVariable } from './binding-variable';
import { ColumnReferenceExpression } from './column-reference-expression';
import { RawBindingExpression } from './expression/raw-binding-expression';
import { RawExpression } from './expression/raw-expression';
export declare class AssignmentSetClause extends SqlNode {
    column: ColumnReferenceExpression;
    value: RawExpression | RawBindingExpression | BindingVariable;
    constructor(
        column: ColumnReferenceExpression,
        value: RawExpression | RawBindingExpression | BindingVariable
    );
    accept(visitor: SqlVisitor): string;
}
