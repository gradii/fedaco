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
import { RawExpression } from './expression/raw-expression';
import { JsonPathColumn } from './fragment/json-path-column';
import { NestedExpression } from './fragment/nested-expression';
import { Identifier } from './identifier';
import { PathExpression } from './path-expression';

export class ColumnReferenceExpression extends SqlNode {

  public constructor(
    public expression: JsonPathColumn | PathExpression | NestedExpression,
    public fieldAliasIdentificationVariable?: Identifier,
    public hiddenAliasResultVariable: boolean = false
  ) {
    super();
  }

  public accept(sqlVisitor: SqlVisitor) {
    return sqlVisitor.visitColumnReferenceExpression(this);
  }
}
