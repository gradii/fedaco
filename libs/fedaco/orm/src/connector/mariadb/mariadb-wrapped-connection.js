import { MariadbWrappedStmt } from './mariadb-wrapped-stmt'
export class MariadbWrappedConnection {
  constructor(driver) {
    this.driver = driver
  }
  prepare(sql) {
    const stmt = this.driver.prepare(sql)
    return new MariadbWrappedStmt(stmt)
  }
}
