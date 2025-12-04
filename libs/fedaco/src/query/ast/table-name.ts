/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SqlNode } from '../sql-node';
import type { SqlVisitor } from '../sql-visitor';
import type { Identifier } from './identifier';

export class TableName extends SqlNode {
  public get serverIdentifier() {
    return this.ChooseIdentifier(4);
  }

  public get databaseIdentifier() {
    return this.ChooseIdentifier(3);
  }

  public get schemaIdentifier() {
    return this.ChooseIdentifier(2);
  }

  public get baseIdentifier() {
    return this.ChooseIdentifier(1);
  }

  constructor(public identifiers: Identifier[]) {
    super();
  }

  protected ChooseIdentifier(modifier: number): Identifier {
    const index = this.identifiers.length - modifier;
    return index < 0 ? undefined : this.identifiers[index];
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitTableName(this);
  }
}
