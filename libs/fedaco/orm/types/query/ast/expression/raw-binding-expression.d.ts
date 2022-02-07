/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlVisitor } from '../../sql-visitor';
import { BindingVariable } from '../binding-variable';
import { RawExpression } from './raw-expression';
export declare class RawBindingExpression extends RawExpression {
    raw: RawExpression;
    bindings: BindingVariable[];
    constructor(raw: RawExpression, bindings: BindingVariable[]);
    accept(visitor: SqlVisitor): string;
}
