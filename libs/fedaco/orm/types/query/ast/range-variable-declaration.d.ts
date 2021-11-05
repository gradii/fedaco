/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
/**
 * RangeVariableDeclaration ::= AbstractSchemaName ["AS"] AliasIdentificationVariable
 */
export declare class RangeVariableDeclaration extends SqlNode {
    abstractSchemaName: string;
    aliasIdentificationVariable?: string;
    isRoot: boolean;
    constructor(abstractSchemaName: string, aliasIdentificationVariable?: string, isRoot?: boolean);
    get name(): string;
    accept(visitor: SqlVisitor): string;
}
