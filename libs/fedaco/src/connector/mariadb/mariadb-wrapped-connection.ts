/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { MariadbWrappedStmt } from './mariadb-wrapped-stmt';

export class MariadbWrappedConnection {

  constructor(public driver: any) {

  }

  prepare(sql: string) {
    const stmt = this.driver.prepare(sql);
    return new MariadbWrappedStmt(stmt);
  }

}
