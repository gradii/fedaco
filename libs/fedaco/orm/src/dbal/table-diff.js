export class TableDiff {
  constructor(
    tableName,
    addedColumns,
    changedColumns,
    removedColumns,
    addedIndexes,
    changedIndexes,
    removedIndexes,
    fromTable
  ) {
    this.tableName = tableName
    this.addedColumns = addedColumns
    this.changedColumns = changedColumns
    this.removedColumns = removedColumns
    this.addedIndexes = addedIndexes
    this.changedIndexes = changedIndexes
    this.removedIndexes = removedIndexes
    this.fromTable = fromTable
  }
}
