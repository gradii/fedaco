/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export class MariadbDriverStmt {
  constructor(public driverStmt: any) {}

  exec(bindings: any[]) {
    this.driverStmt.exec(bindings);
  }

  close() {
    this.driverStmt.close();
  }
}
