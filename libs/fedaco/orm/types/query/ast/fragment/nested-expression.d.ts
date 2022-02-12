/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { QueryBuilder } from '../../../query-builder/query-builder';
import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';
import { BindingVariable } from '../binding-variable';
import { RawExpression } from '../expression/raw-expression';
export declare class NestedExpression extends SqlNode {
    type: string;
    expression: QueryBuilder | RawExpression | string;
    bindings: BindingVariable[];
    constructor(
        type: string,
        expression: QueryBuilder | RawExpression | string,
        bindings?: BindingVariable[]
    );
    accept(visitor: SqlVisitor): string;
}
