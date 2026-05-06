/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { MariadbDriverStmt } from './mariadb-driver-stmt';

export class MariadbDriverConnection {
  constructor(public driver: any) {}

  prepare(sql: string) {
    const stmt = this.driver.prepare(sql);
    return new MariadbDriverStmt(stmt);
  }
}
