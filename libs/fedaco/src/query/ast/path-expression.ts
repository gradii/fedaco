/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import type { FromTable } from './from-table';
import type { Identifier } from './identifier';

// MultiPartIdentifier
export class PathExpression extends SqlNode {
  public get serverIdentifier(): Identifier | null {
    return this.ChooseIdentifier(5) as Identifier;
  }

  public get databaseIdentifier(): Identifier | null {
    return this.ChooseIdentifier(4) as Identifier;
  }

  public get schemaIdentifier(): FromTable | null {
    return this.ChooseIdentifier(3) as FromTable;
  }

  public get tableIdentifier(): FromTable | null {
    return this.ChooseIdentifier(2) as FromTable;
  }

  public get columnIdentifier(): Identifier {
    return this.ChooseIdentifier(1) as Identifier;
  }

  constructor(public identifiers: Array<FromTable | Identifier>) {
    super();
  }

  protected ChooseIdentifier(modifier: number): Identifier | FromTable {
    const index = this.identifiers.length - modifier;
    return index < 0 ? undefined : this.identifiers[index];
  }

  public accept(visitor: SqlVisitor) {
    return visitor.visitPathExpression(this);
  }
}
