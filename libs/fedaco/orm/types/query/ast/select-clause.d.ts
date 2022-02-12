/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { ColumnReferenceExpression } from './column-reference-expression';
import { RawBindingExpression } from './expression/raw-binding-expression';
import { RawExpression } from './expression/raw-expression';
import { SelectScalarExpression } from './select-scalar-expression';
export declare class SelectClause extends SqlNode {
    selectExpressions: Array<
        | ColumnReferenceExpression
        | SelectScalarExpression
        | RawExpression
        | RawBindingExpression
    >;
    distinct: boolean | any[];
    constructor(
        selectExpressions?: Array<
            | ColumnReferenceExpression
            | SelectScalarExpression
            | RawExpression
            | RawBindingExpression
        >,
        distinct?: boolean | any[]
    );
    accept(sqlVisitor: SqlVisitor): string;
}
