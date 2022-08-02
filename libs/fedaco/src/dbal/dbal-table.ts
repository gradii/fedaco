/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

/*Object Representation of a table.*/
export class DbalTable {
  // /**/
  // protected _columns: Column[] = [];
  // /**/
  // protected _indexes: Index[] = [];
  // /**/
  // protected _primaryKeyName: string = false;
  // /**/
  // protected _fkConstraints: ForeignKeyConstranumber[] = [];
  // /**/
  // protected _options: any[] = {
  //   create_options: []
  // };
  // /**/
  // protected _schemaConfig: SchemaConfig | null = null;
  // /**/
  // private implicitIndexes: Index[] = [];

  constructor(public tableName: string,
              public columns: any[],
              public indexes: any,
              public foreignKeys: any[]
  ) {
  }

  // /**/
  // constructor(
  //   tableName: string,
  //   columns: Column[]                                 = [],
  //   indexes: Index[]                                  = [],
  //   fkConstraints: any[]/*ForeignKeyConstranumber[]*/ = [],
  //   idGeneratorType: number                           = 0,
  //   options: any[]                                    = []
  // ) {
  //   if (tableName.length === 0) {
  //     throw new Error('DBALException.invalidTableName(tableName)');
  //   }
  //   // this._setName(tableName);
  //   for (const column of columns) {
  //     this._addColumn(column);
  //   }
  //   for (const idx of indexes) {
  //     this._addIndex(idx);
  //   }
  //   for (const constraint of fkConstraints) {
  //     this._addForeignKeyConstraint(constraint);
  //   }
  //   this._options = [...this._options, ...options];
  // }
  //
  // /**/
  // public setSchemaConfig(schemaConfig) {
  //   this._schemaConfig = schemaConfig;
  // }
  //
  // /*Sets the Primary Key.*/
  // public setPrimaryKey(
  //   columnNames: string[],
  //   indexName: string | false = false
  // ) {
  //   this._addIndex(
  //     this._createIndex(columnNames, indexName || 'primary', true, true)
  //   );
  //   for (const columnName of columnNames) {
  //     const column = this.getColumn(columnName);
  //     column.setNotnull(true);
  //   }
  //   return this;
  // }
  //
  // /**/
  // public addIndex(
  //   columnNames: string[],
  //   indexName: string | null = null,
  //   flags: string[]          = [],
  //   options: any[]           = []
  // ) {
  //   if (indexName === null) {
  //     const indexName = this._generateIdentifierName(
  //       [...[this.getName()], ...columnNames],
  //       'idx',
  //       this._getMaxIdentifierLength()
  //     );
  //   }
  //   return this._addIndex(
  //     this._createIndex(columnNames, indexName, false, false, flags, options)
  //   );
  // }
  //
  // /*Drops the primary key from this table.*/
  // public dropPrimaryKey() {
  //   this.dropIndex(this._primaryKeyName);
  //   this._primaryKeyName = false;
  // }
  //
  // /*Drops an index from this table.*/
  // public dropIndex(indexName) {
  //   const indexName = this.normalizeIdentifier(indexName);
  //   if (!this.hasIndex(indexName)) {
  //     throw SchemaException.indexDoesNotExist(indexName, this._name);
  //   }
  //   delete this._indexes[indexName];
  // }
  //
  // /**/
  // public addUniqueIndex(
  //   columnNames: string[],
  //   indexName: string | null = null,
  //   options: any[]           = []
  // ) {
  //   if (indexName === null) {
  //     const indexName = this._generateIdentifierName(
  //       [...[this.getName()], ...columnNames],
  //       'uniq',
  //       this._getMaxIdentifierLength()
  //     );
  //   }
  //   return this._addIndex(
  //     this._createIndex(columnNames, indexName, true, false, [], options)
  //   );
  // }
  //
  // /*Renames an index.*/
  // public renameIndex(oldIndexName, newIndexName = null) {
  //   const oldIndexName           = this.normalizeIdentifier(oldIndexName);
  //   const normalizedNewIndexName = this.normalizeIdentifier(newIndexName);
  //   if (oldIndexName === normalizedNewIndexName) {
  //     return this;
  //   }
  //   if (!this.hasIndex(oldIndexName)) {
  //     throw SchemaException.indexDoesNotExist(oldIndexName, this._name);
  //   }
  //   if (this.hasIndex(normalizedNewIndexName)) {
  //     throw SchemaException.indexAlreadyExists(
  //       normalizedNewIndexName,
  //       this._name
  //     );
  //   }
  //   const oldIndex = this._indexes[oldIndexName];
  //   if (oldIndex.isPrimary()) {
  //     this.dropPrimaryKey();
  //     return this.setPrimaryKey(oldIndex.getColumns(), newIndexName || false);
  //   }
  //   delete this._indexes[oldIndexName];
  //   if (oldIndex.isUnique()) {
  //     return this.addUniqueIndex(
  //       oldIndex.getColumns(),
  //       newIndexName,
  //       oldIndex.getOptions()
  //     );
  //   }
  //   return this.addIndex(
  //     oldIndex.getColumns(),
  //     newIndexName,
  //     oldIndex.getFlags(),
  //     oldIndex.getOptions()
  //   );
  // }
  //
  // /*Checks if an index begins in the order of the given columns.*/
  // public columnsAreIndexed(columnNames: string[]) {
  //   for (const index of this.getIndexes()) {
  //     if (index.spansColumns(columnNames)) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }
  //
  // /**/
  // public addColumn(columnName: string, typeName: string, options: any[] = []) {
  //   const column = new Column(columnName, Type.getType(typeName), options);
  //   this._addColumn(column);
  //   return column;
  // }
  //
  // /*Renames a Column.*/
  // public renameColumn(oldColumnName: string, newColumnName: string) {
  //   throw new DBALException(
  //     'Table#renameColumn() was removed, because it drops and recreates ' +
  //     'the column instead. There is no fix available, because a schema diff cannot reliably detect if a ' +
  //     'column was renamed or one column was created and another one dropped.'
  //   );
  // }
  //
  // /*Change Column Details.*/
  // public changeColumn(columnName: string, options: any[]) {
  //   const column = this.getColumn(columnName);
  //   column.setOptions(options);
  //   return this;
  // }
  //
  // /*Drops a Column from the Table.*/
  // public dropColumn(columnName: string) {
  //   const columnName = this.normalizeIdentifier(columnName);
  //   delete this._columns[columnName];
  //   return this;
  // }
  //
  // /*Adds a foreign key constraint.
  //
  //     Name is inferred from the local columns.*/
  // public addForeignKeyConstraint(
  //   foreignTable,
  //   localColumnNames: string[],
  //   foreignColumnNames: string[],
  //   options: any[]                = [],
  //   constraintName: string | null = null
  // ) {
  //   const constraintName =
  //           constraintName ||
  //           this._generateIdentifierName(
  //             [
  //               ...// cast type array
  //                 this.getName(),
  //               ...localColumnNames
  //             ],
  //             'fk',
  //             this._getMaxIdentifierLength()
  //           );
  //   return this.addNamedForeignKeyConstraint(
  //     constraintName,
  //     foreignTable,
  //     localColumnNames,
  //     foreignColumnNames,
  //     options
  //   );
  // }
  //
  // /*Adds a foreign key constraint.
  //
  //     Name is to be generated by the database itself.*/
  // public addUnnamedForeignKeyConstraint(
  //   foreignTable,
  //   localColumnNames: string[],
  //   foreignColumnNames: string[],
  //   options: any[] = []
  // ) {
  //   return this.addForeignKeyConstraint(
  //     foreignTable,
  //     localColumnNames,
  //     foreignColumnNames,
  //     options
  //   );
  // }
  //
  // /*Adds a foreign key constraint with a given name.*/
  // public addNamedForeignKeyConstraint(
  //   name: string,
  //   foreignTable,
  //   localColumnNames: string[],
  //   foreignColumnNames: string[],
  //   options: any[] = []
  // ) {
  //   if (foreignTable instanceof Table) {
  //     for (const columnName of foreignColumnNames) {
  //       if (!foreignTable.hasColumn(columnName)) {
  //         throw SchemaException.columnDoesNotExist(
  //           columnName,
  //           foreignTable.getName()
  //         );
  //       }
  //     }
  //   }
  //   for (const columnName of localColumnNames) {
  //     if (!this.hasColumn(columnName)) {
  //       throw SchemaException.columnDoesNotExist(columnName, this._name);
  //     }
  //   }
  //   const constraint = new ForeignKeyConstraint(
  //     localColumnNames,
  //     foreignTable,
  //     foreignColumnNames,
  //     name,
  //     options
  //   );
  //   this._addForeignKeyConstraint(constraint);
  //   return this;
  // }
  //
  // /**/
  // public addOption(name: string, value: any) {
  //   this._options[name] = value;
  //   return this;
  // }
  //
  // /*Returns whether this table has a foreign key constraint with the given name.*/
  // public hasForeignKey(constraintName: string) {
  //   constraintName = this.normalizeIdentifier(constraintName);
  //   return this._fkConstraints[constraintName] !== undefined;
  // }
  //
  // /*Returns the foreign key constraint with the given name.*/
  // public getForeignKey(constraintName) {
  //   constraintName = this.normalizeIdentifier(constraintName);
  //   if (!this.hasForeignKey(constraintName)) {
  //     throw SchemaException.foreignKeyDoesNotExist(constraintName, this._name);
  //   }
  //   return this._fkConstraints[constraintName];
  // }
  //
  // /*Removes the foreign key constraint with the given name.*/
  // public removeForeignKey(constraintName) {
  //   constraintName = this.normalizeIdentifier(constraintName);
  //   if (!this.hasForeignKey(constraintName)) {
  //     throw SchemaException.foreignKeyDoesNotExist(constraintName, this._name);
  //   }
  //   delete this._fkConstraints[constraintName];
  // }

  public getColumns(): any[] {
    return [];
  }

  // /*Returns ordered list of columns (primary keys are first, then foreign keys, then the rest)*/
  // public getColumns() {
  //   const primaryKey        = this.getPrimaryKey();
  //   const primaryKeyColumns = [];
  //   if (primaryKey !== null) {
  //     const primaryKeyColumns = this.filterColumns(primaryKey.getColumns());
  //   }
  //   return [
  //     ...primaryKeyColumns,
  //     ...this.getForeignKeyColumns(),
  //     ...this._columns
  //   ];
  // }
  //
  // /*Returns whether this table has a Column with the given name.*/
  // public hasColumn(columnName) {
  //   columnName = this.normalizeIdentifier(columnName);
  //   return this._columns[columnName] !== undefined;
  // }

  public getColumn(columnName: string): any {
    return {};
  }

  // /*Returns the Column with the given name.*/
  // public getColumn(columnName) {
  //   columnName = this.normalizeIdentifier(columnName);
  //   if (!this.hasColumn(columnName)) {
  //     throw SchemaException.columnDoesNotExist(columnName, this._name);
  //   }
  //   return this._columns[columnName];
  // }
  //
  // /*Returns the primary key.*/
  // public getPrimaryKey() {
  //   if (!this.hasPrimaryKey()) {
  //     return null;
  //   }
  //   return this.getIndex(this._primaryKeyName);
  // }
  //
  // /*Returns the primary key columns.*/
  // public getPrimaryKeyColumns() {
  //   const primaryKey = this.getPrimaryKey();
  //   if (primaryKey === null) {
  //     throw new DBALException(
  //       'Table ' + this.getName() + ' has no primary key.'
  //     );
  //   }
  //   return primaryKey.getColumns();
  // }
  //
  // /*Returns whether this table has a primary key.*/
  // public hasPrimaryKey() {
  //   return this._primaryKeyName && this.hasIndex(this._primaryKeyName);
  // }
  //
  // /*Returns whether this table has an Index with the given name.*/
  // public hasIndex(indexName) {
  //   indexName = this.normalizeIdentifier(indexName);
  //   return this._indexes[indexName] !== undefined;
  // }
  //
  // /*Returns the Index with the given name.*/
  // public getIndex(indexName) {
  //   indexName = this.normalizeIdentifier(indexName);
  //   if (!this.hasIndex(indexName)) {
  //     throw SchemaException.indexDoesNotExist(indexName, this._name);
  //   }
  //   return this._indexes[indexName];
  // }
  //
  // /**/
  // public getIndexes() {
  //   return this._indexes;
  // }
  //
  // /*Returns the foreign key constraints.*/
  // public getForeignKeys() {
  //   return this._fkConstraints;
  // }
  //
  // /**/
  // public hasOption(name: string) {
  //   return this._options[name] !== undefined;
  // }
  //
  // /**/
  // public getOption(name: string) {
  //   return this._options[name];
  // }
  //
  // /**/
  // public getOptions() {
  //   return this._options;
  // }
  //
  // /**/
  // public visit(visitor) {
  //   visitor.acceptTable(this);
  //   for (const column of this.getColumns()) {
  //     visitor.acceptColumn(this, column);
  //   }
  //   for (const index of this.getIndexes()) {
  //     visitor.acceptIndex(this, index);
  //   }
  //   for (const constraint of this.getForeignKeys()) {
  //     visitor.acceptForeignKey(this, constraint);
  //   }
  // }
  //
  // /*Clone of a Table triggers a deep clone of all affected assets.*/
  // // public __clone() {
  // //   for (const [k, column] of Object.entries(this._columns)) {
  // //     this._columns[k] = column.clone();
  // //   }
  // //   for (const [k, index] of Object.entries(this._indexes)) {
  // //     this._indexes[k] = index.clone();
  // //   }
  // //   for (const [k, fk] of Object.entries(this._fkConstraints)) {
  // //     this._fkConstraints[k] = fk.clone();
  // //     this._fkConstraints[k].setLocalTable(this);
  // //   }
  // // }
  //
  // public setComment(comment) {
  //   this.addOption('comment', comment);
  //   return this;
  // }
  //
  // public getComment() {
  //   return this._options['comment'];
  // }
  //
  // /**/
  // protected _getMaxIdentifierLength() {
  //   if (this._schemaConfig instanceof SchemaConfig) {
  //     return this._schemaConfig.getMaxIdentifierLength();
  //   }
  //   return 63;
  // }
  //
  // /**/
  // protected _addColumn(column) {
  //   let columnName = column.getName();
  //   columnName     = this.normalizeIdentifier(columnName);
  //   if (this._columns[columnName] !== undefined) {
  //     throw SchemaException.columnAlreadyExists(this.getName(), columnName);
  //   }
  //   this._columns[columnName] = column;
  // }
  //
  // /*Adds an index to the table.*/
  // protected _addIndex(indexCandidate) {
  //   let indexName                 = indexCandidate.getName();
  //   indexName                     = this.normalizeIdentifier(indexName);
  //   const replacedImplicitIndexes = [];
  //   for (const [name, implicitIndex] of Object.entries(this.implicitIndexes)) {
  //     if (
  //       !implicitIndex.isFullfilledBy(indexCandidate) ||
  //       !(this._indexes[name] !== undefined)
  //     ) {
  //       continue;
  //     }
  //     replacedImplicitIndexes.push(name);
  //   }
  //   if (
  //     (this._indexes[indexName] !== undefined &&
  //       !in_array(indexName, replacedImplicitIndexes, true)) ||
  //     (this._primaryKeyName !== false && indexCandidate.isPrimary())
  //   ) {
  //     throw SchemaException.indexAlreadyExists(indexName, this._name);
  //   }
  //   for (const name of replacedImplicitIndexes) {
  //     {
  //       delete this._indexes[name];
  //       delete this.implicitIndexes[name];
  //     }
  //   }
  //   if (indexCandidate.isPrimary()) {
  //     this._primaryKeyName = indexName;
  //   }
  //   this._indexes[indexName] = indexCandidate;
  //   return this;
  // }
  //
  // /**/
  // protected _addForeignKeyConstraint(constraint) {
  //   constraint.setLocalTable(this);
  //   if (strlen(constraint.getName())) {
  //     const name = constraint.getName();
  //   } else {
  //     const name = this._generateIdentifierName(
  //       [
  //         ...// cast type array
  //           this.getName(),
  //         ...constraint.getLocalColumns()
  //       ],
  //       'fk',
  //       this._getMaxIdentifierLength()
  //     );
  //   }
  //   const name                = this.normalizeIdentifier(name);
  //   this._fkConstraints[name] = constraint;
  //   const indexName           = this._generateIdentifierName(
  //     [...[this.getName()], ...constraint.getColumns()],
  //     'idx',
  //     this._getMaxIdentifierLength()
  //   );
  //   const indexCandidate      = this._createIndex(
  //     constraint.getColumns(),
  //     indexName,
  //     false,
  //     false
  //   );
  //   for (const existingIndex of this._indexes) {
  //     if (indexCandidate.isFullfilledBy(existingIndex)) {
  //       return;
  //     }
  //   }
  //   this._addIndex(indexCandidate);
  //   this.implicitIndexes[this.normalizeIdentifier(indexName)] = indexCandidate;
  // }
  //
  // /**/
  // private _createIndex(
  //   columnNames: string[],
  //   indexName: string,
  //   isUnique: boolean,
  //   isPrimary: boolean,
  //   flags: string[] = [],
  //   options: any[]  = []
  // ) {
  //   if (preg_match('(([^a-zA-Z0-9_]+))', this.normalizeIdentifier(indexName))) {
  //     throw SchemaException.indexNameInvalid(indexName);
  //   }
  //   for (const columnName of columnNames) {
  //     if (!this.hasColumn(columnName)) {
  //       throw SchemaException.columnDoesNotExist(columnName, this._name);
  //     }
  //   }
  //   return new Index(
  //     indexName,
  //     columnNames,
  //     isUnique,
  //     isPrimary,
  //     flags,
  //     options
  //   );
  // }
  //
  // /*Returns foreign key columns*/
  // private getForeignKeyColumns() {
  //   const foreignKeyColumns = [];
  //   for (const foreignKey of this.getForeignKeys()) {
  //     const foreignKeyColumns = [
  //       ...foreignKeyColumns,
  //       ...foreignKey.getColumns()
  //     ];
  //   }
  //   return this.filterColumns(foreignKeyColumns);
  // }
  //
  // /*Returns only columns that have specified names*/
  // private filterColumns(columnNames: string[]) {
  //   return array_filter(
  //     this._columns,
  //     (columnName) => {
  //       return in_array(columnName, columnNames, true);
  //     },
  //     ARRAY_FILTER_USE_KEY
  //   );
  // }
  //
  // /*Normalizes a given identifier.
  //
  //     Trims quotes and lowercases the given identifier.*/
  // private normalizeIdentifier(identifier) {
  //   if (identifier === null) {
  //     return '';
  //   }
  //   return this.trimQuotes(identifier.toLowerCase());
  // }
}
