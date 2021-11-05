/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
/**
 * SelectExpression ::= IdentificationVariable ["." "*"] | StateFieldPathExpression |
 * (AggregateExpression | "(" Subselect ")") [["AS"] ["HIDDEN"] FieldAliasIdentificationVariable]
 *
 * @example
 * SELECT foo, bar FROM `users`;
 *
 * SELECT f"oo, bar FROM `users`;
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { ExistsPredicateExpression } from './expression/exists-predicate-expression';
import { JsonPathColumn } from './fragment/json-path-column';
import { NestedExpression } from './fragment/nested-expression';
import { Identifier } from './identifier';
import { PathExpression } from './path-expression';
export declare class ColumnReferenceExpression extends SqlNode {
    expression: JsonPathColumn | PathExpression | NestedExpression | ExistsPredicateExpression;
    fieldAliasIdentificationVariable?: Identifier;
    hiddenAliasResultVariable: boolean;
    constructor(expression: JsonPathColumn | PathExpression | NestedExpression | ExistsPredicateExpression, fieldAliasIdentificationVariable?: Identifier, hiddenAliasResultVariable?: boolean);
    accept(sqlVisitor: SqlVisitor): string;
}
