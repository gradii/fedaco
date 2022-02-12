/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { Identifier } from './identifier';
import { PathExpression } from './path-expression';
export declare class JsonPathExpression extends SqlNode {
    pathExpression: PathExpression;
    pathLeg: Identifier;
    jsonLiteral: Identifier;
    constructor(
        pathExpression: PathExpression,
        pathLeg: Identifier,
        jsonLiteral: Identifier
    );
    accept(visitor: SqlVisitor): string;
}
