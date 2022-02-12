/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export class StatementPrepared {
  constructor(connection, statement) {
    this.statement = statement
    this.connection = connection
  }
}
