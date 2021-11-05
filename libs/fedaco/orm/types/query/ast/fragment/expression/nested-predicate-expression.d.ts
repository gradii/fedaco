/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { QueryBuilder } from '../../../../query-builder/query-builder';
import { SqlVisitor } from '../../../sql-visitor';
import { Expression } from '../../expression/expression';
export declare class NestedPredicateExpression extends Expression {
    query: QueryBuilder | string;
    visited: boolean;
    constructor(query: QueryBuilder | string);
    accept(visitor: SqlVisitor): string;
}
