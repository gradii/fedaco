/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { FromTable } from './from-table';
import { Identifier } from './identifier';
export declare class PathExpression extends SqlNode {
    identifiers: Array<FromTable | Identifier>;
    get serverIdentifier(): Identifier | null;
    get databaseIdentifier(): Identifier | null;
    get schemaIdentifier(): FromTable | null;
    get tableIdentifier(): FromTable | null;
    get columnIdentifier(): Identifier;
    constructor(identifiers: Array<FromTable | Identifier>);
    protected ChooseIdentifier(modifier: number): Identifier | FromTable;
    accept(visitor: SqlVisitor): string;
}
