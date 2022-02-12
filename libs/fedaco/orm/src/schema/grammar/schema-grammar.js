import { __awaiter } from 'tslib'
import { isBlank, isBoolean } from '@gradii/check-type'
import { tap } from 'ramda'
import { BaseGrammar } from '../../base-grammar'
import { TableDiff } from '../../dbal/table-diff'
import { upperCaseFirst } from '../../helper/str'
import { RawExpression } from '../../query/ast/expression/raw-expression'
import { Blueprint } from '../blueprint'
import { ColumnDefinition } from '../column-definition'

export class SchemaGrammar extends BaseGrammar {
  constructor() {
    super(...arguments)

    this.transactions = false

    this.fluentCommands = []

    this.ColumnDefinitionCommands = []
  }

  compileCreateDatabase(name, connection) {
    throw new Error(
      'LogicException This database driver does not support creating databases.'
    )
  }

  compileDropDatabaseIfExists(name) {
    throw new Error(
      'LogicException This database driver does not support dropping databases.'
    )
  }
  compileEnableForeignKeyConstraints() {
    throw new Error(
      'LogicException This database driver does not support enable foreign key constraints.'
    )
  }
  compileDisableForeignKeyConstraints() {
    throw new Error(
      'LogicException This database driver does not support disable foreign key constraints.'
    )
  }
  compileColumnListing(table) {
    throw new Error('not implement')
  }
  compileTableExists() {
    throw new Error('not implement')
  }
  compileEnableWriteableSchema() {
    throw new Error('not implement')
  }
  compileDisableWriteableSchema() {
    throw new Error('not implement')
  }
  compileRebuild() {
    throw new Error('not implement')
  }
  compileDropAllForeignKeys() {
    throw new Error('not implement')
  }
  compileDropAllTables(tables) {
    throw new Error('not implement')
  }
  compileDropAllViews(views) {
    throw new Error('not implement')
  }
  compileGetAllTables(...args) {
    throw new Error('not implement')
  }
  compileGetAllViews(...args) {
    throw new Error('not implement')
  }
  compileDropAllTypes(...args) {
    throw new Error('not implement')
  }
  compileGetAllTypes() {
    throw new Error('not implement')
  }

  compileRenameColumn(blueprint, command, connection) {}

  compileChange(blueprint, command, connection) {}

  compileForeign(blueprint, command) {
    let sql =
      `alter table ` +
      `${this.wrapTable(blueprint)} add constraint ${this.wrap(command.index)} `
    sql += `foreign key (${this.columnize(
      command.columns
    )}) references ${this.wrapTable(command.on)} (${this.columnize(
      command.references
    )})`
    if (!isBlank(command.onDelete)) {
      sql += ` on delete ${command.onDelete}`
    }
    if (!isBlank(command.onUpdate)) {
      sql += ` on update ${command.onUpdate}`
    }
    return sql
  }

  getColumns(blueprint) {
    const columns = []
    for (const column of blueprint.getAddedColumns()) {
      const sql = this.wrap(column.name) + ' ' + this.getType(column)
      columns.push(this.addModifiers(sql, blueprint, column))
    }
    return columns
  }

  getType(column) {
    const fn = 'type' + upperCaseFirst(column.type)
    if (fn in this) {
      return this[fn](column)
    } else {
      throw new Error(`Must define [${fn}] in ${this.constructor.name}`)
    }
  }

  typeComputed(column) {
    throw new Error(
      'RuntimeException This database driver does not support the computed type.'
    )
  }

  addModifiers(sql, blueprint, column) {
    for (const modifier of this.modifiers) {
      const method = `modify${modifier}`
      if (method in this) {
        sql += this[method](blueprint, column)
      }
    }
    return sql
  }

  getCommandByName(blueprint, name) {
    const commands = this.getCommandsByName(blueprint, name)
    if (commands.length > 0) {
      return commands[0]
    }
  }

  getCommandsByName(blueprint, name) {
    return blueprint.getCommands().filter((value) => {
      return value.name == name
    })
  }

  prefixArray(prefix, values) {
    return values.map((value) => {
      return prefix + ' ' + value
    })
  }

  wrapTable(table) {
    return super.wrapTable(
      table instanceof Blueprint ? table.getTable() : table
    )
  }

  wrapJsonFieldAndPath(column) {
    const parts = column.split('->')
    const field = this.wrap(parts[0])
    const path =
      parts.length > 1 ? ', ' + this.wrapJsonPath(parts[1], '->') : ''
    return [field, path]
  }

  wrapJsonPath(value, delimiter = '->') {
    value = value.replace(/([\\]+)?'/, `''`)
    return `'$."${value.replace(delimiter, '"."')}"'`
  }

  wrap(value, prefixAlias = false) {
    return super.wrap(
      value instanceof ColumnDefinition ? value.name : value,
      prefixAlias
    )
  }

  getDefaultValue(value) {
    if (value instanceof RawExpression) {
      return value.value
    }
    return isBoolean(value) ? `'${value}'` : `'${value}'`
  }

  getTableDiff(blueprint, schema) {
    return __awaiter(this, void 0, void 0, function* () {
      const table = this.getTablePrefix() + blueprint.getTable()
      const fromTable = yield schema.listTableDetails(table)
      return tap((tableDiff) => {
        tableDiff.fromTable = fromTable
      }, new TableDiff(table))
    })
  }
  getListDatabasesSQL() {
    throw new Error('not implement')
  }
  getListNamespacesSQL() {
    throw new Error('not implement')
  }
  getListSequencesSQL(database) {
    throw new Error('not implement')
  }
  getListTableColumnsSQL(table, database) {
    throw new Error('not implement')
  }
  getListTableIndexesSQL(table, database) {
    throw new Error('not implement')
  }
  getListTableForeignKeysSQL(table, database) {
    throw new Error('not implement')
  }
  getListTablesSQL() {
    throw new Error('not implement')
  }

  quoteStringLiteral(str) {
    const c = this.getStringLiteralQuoteCharacter()
    return c + str.replace(new RegExp(c, 'g'), c + c) + c
  }

  getStringLiteralQuoteCharacter() {
    return "'"
  }

  getFluentCommands() {
    return this.fluentCommands
  }

  getColumnDefinitionCommands() {
    return this.ColumnDefinitionCommands
  }

  supportsSchemaTransactions() {
    return this.transactions
  }
  supportsForeignKeyConstraints() {
    return false
  }
  getTypeMapping(type) {
    return type
  }
}
