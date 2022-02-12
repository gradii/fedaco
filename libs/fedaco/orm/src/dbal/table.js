/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export class Table {
  constructor(tableName, columns, indexes, foreignKeys) {
    this.tableName = tableName
    this.columns = columns
    this.indexes = indexes
    this.foreignKeys = foreignKeys
  }

  getColumns() {
    return []
  }

  getColumn(columnName) {
    return {}
  }
}
