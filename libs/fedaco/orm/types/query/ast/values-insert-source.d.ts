/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { BindingVariable } from './binding-variable';
import { RawExpression } from './expression/raw-expression';
import { NestedExpression } from './fragment/nested-expression';
export declare class ValuesInsertSource extends SqlNode {
    isDefault: boolean;
    valuesList: (BindingVariable | RawExpression)[][];
    select?: NestedExpression;
    constructor(
        isDefault: boolean,
        valuesList?: (BindingVariable | RawExpression)[][],
        select?: NestedExpression
    );
    accept(visitor: SqlVisitor): string;
}
