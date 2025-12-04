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
import type { SqlVisitor } from '../sql-visitor';
import type { ExistsPredicateExpression } from './expression/exists-predicate-expression';
import type { NestedExpression } from './fragment/nested-expression';
import type { Identifier } from './identifier';
import type { JsonPathExpression } from './json-path-expression';
import type { PathExpression } from './path-expression';

export class ColumnReferenceExpression extends SqlNode {
  public constructor(
    public expression: JsonPathExpression | PathExpression | NestedExpression | ExistsPredicateExpression,
    public fieldAliasIdentificationVariable?: Identifier,
    public hiddenAliasResultVariable = false,
  ) {
    super();
  }

  public accept(sqlVisitor: SqlVisitor) {
    return sqlVisitor.visitColumnReferenceExpression(this);
  }
}
