export class MariadbWrappedStmt {
  constructor(driverStmt) {
    this.driverStmt = driverStmt
  }
  exec(bindings) {
    this.driverStmt.exec(bindings)
  }
  close() {
    this.driverStmt.close()
  }
}
