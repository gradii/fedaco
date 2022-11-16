/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { has, isAnyEmpty, isArray, isBlank, isString } from '@gradii/nanofn';
import type { Connection } from '../connection';
// import { SqliteConnection } from '../connection/sqlite-connection';
import type { Model } from '../fedaco/model';
import { wrap } from '../helper/arr';
import { lowerFirst, upperFirst } from '@gradii/nanofn';
import { raw } from '../query-builder/ast-factory';
import { ColumnDefinition } from './column-definition';
import { ForeignIdColumnDefinition } from './foreign-id-column-definition';
import { ForeignKeyDefinition } from './foreign-key-definition';
import type { SchemaGrammar } from './grammar/schema-grammar';
import { SchemaBuilder } from './schema-builder';

export class Blueprint {
  /*The table the blueprint describes.*/
  protected table: string;
  /*The prefix of the table.*/
  protected prefix: string;
  /*The columns that should be added to the table.*/
  protected columns: ColumnDefinition[] = [];
  /*The commands that should be run for the table.*/
  protected commands: any[] = [];
  /*The storage engine that should be used for the table.*/
  public engine: string;
  /*The default character set that should be used for the table.*/
  public charset: string;
  /*The collation that should be used for the table.*/
  public collation: string;
  /*Whether to make the table temporary.*/
  public _temporary = false;
  /*The column to add new columns after.*/
  public _after: string;

  /*Create a new schema blueprint.*/
  public constructor(table: string, callback: Function | null = null, prefix: string = '') {
    this.table  = table;
    this.prefix = prefix;
    if (!isBlank(callback)) {
      callback(this);
    }
  }

  /*Execute the blueprint against the database.*/
  public async build(connection: Connection, grammar: SchemaGrammar) {
    for (const statement of await this.toSql(connection, grammar)) {
      await connection.statement(statement);
    }
  }

  /*Get the raw SQL statements for the blueprint.*/
  public toSql(connection: Connection, grammar: SchemaGrammar) {
    this.addImpliedCommands(grammar);
    let statements: string[] = [];
    this.ensureCommandsAreValid(connection);
    for (const command of this.commands) {
      const method = 'compile' + upperFirst(command.name);
      if (method in grammar) {
        // @ts-ignore
        const sql = grammar[method](this, command, connection);
        if (isArray(sql) && sql.length > 0) {
          statements = [...statements, ...sql];
        } else if (isString(sql) && sql.length > 0) {
          statements.push(sql);
        }
      } else {
        throw new Error(
          `command name ${command.name} is not exist in grammar ${grammar.constructor.name}`);
      }
    }
    return statements;
  }

  /*Ensure the commands on the blueprint are valid for the connection type.*/
  protected ensureCommandsAreValid(connection: Connection) {
    // todo check me
    // if (connection instanceof SqliteConnection) {
    //   if (this.commandsNamed(['dropColumn', 'renameColumn']).length > 1) {
    //     throw new Error(
    //       `BadMethodCallException SQLite doesn't support multiple calls to dropColumn / renameColumn in a single modification.`);
    //   }
    //   if (this.commandsNamed(['dropForeign']).length > 0) {
    //     throw new Error(
    //       `BadMethodCallException SQLite doesn't support dropping foreign keys (you would need to re-create the table).`);
    //   }
    // }
  }

  /*Get all of the commands matching the given names.*/
  protected commandsNamed(names: any) {
    return this.commands.filter(command => {
      return command.name in names;
    });
  }

  /*Add the commands that are implied by the blueprint's state.*/
  protected addImpliedCommands(grammar: SchemaGrammar) {
    if (this.getAddedColumns().length > 0 && !this.creating()) {
      this.commands.unshift(this.createCommand('add'));
    }
    if (this.getChangedColumns().length > 0 && !this.creating()) {
      this.commands.unshift(this.createCommand('change'));
    }
    this.addFluentIndexes();
    this.addFluentCommands(grammar);
  }

  /*Add the index commands fluently specified on columns.*/
  protected addFluentIndexes() {
    for (const column of this.columns) {
      for (const index of ['primary', 'unique', 'index', 'spatialIndex']) {
        // If the index has been specified on the given column, but is simply equal
        // to "true" (boolean), no name has been specified for this index so the
        // index method can be called without a name and it will generate one.
        if (column.get(index) === true) {
          // @ts-ignore
          this[index]([column.name]);
          column.set(index, false);
          break;
        } else if (has(column, index)) {
          // @ts-ignore
          this[index]([column.name], column.get(index));
          column.set(index, false);

          break;
        }
      }
    }
  }

  /*Add the fluent commands specified on any columns.*/
  public addFluentCommands(grammar: SchemaGrammar) {
    for (const column of this.columns) {
      for (const commandName of grammar.getFluentCommands()) {
        const attributeName = lowerFirst(commandName);
        if (!column.isset(attributeName)) {
          continue;
        }
        const value = column.get(attributeName);
        this.addCommand(commandName, {value, column});
      }
    }
  }

  /*Determine if the blueprint has a create command.*/
  public creating() {
    return this.commands.find(command => {
      return command.name === 'create';
    });
  }

  /*Indicate that the table needs to be created.*/
  public create() {
    return this.addCommand('create');
  }

  /*Indicate that the table needs to be temporary.*/
  public temporary() {
    this._temporary = true;
  }

  /*Indicate that the table should be dropped.*/
  public drop() {
    return this.addCommand('drop');
  }

  /*Indicate that the table should be dropped if it exists.*/
  public dropIfExists() {
    return this.addCommand('dropIfExists');
  }

  /*Indicate that the given columns should be dropped.*/
  public dropColumn(columns: any[] | any, ...args: any[]) {
    columns = isArray(columns) ? columns : [columns, ...args];
    return this.addCommand('dropColumn', {columns});
  }

  /*Indicate that the given columns should be renamed.*/
  public renameColumn(from: string, to: string) {
    return this.addCommand('renameColumn', {from, to});
  }

  /*Indicate that the given primary key should be dropped.*/
  public dropPrimary(index: string | any[] | null = null) {
    return this.dropIndexCommand('dropPrimary', 'primary', index);
  }

  /*Indicate that the given unique key should be dropped.*/
  public dropUnique(index: string | any[]) {
    return this.dropIndexCommand('dropUnique', 'unique', index);
  }

  /*Indicate that the given index should be dropped.*/
  public dropIndex(index: string | any[]) {
    return this.dropIndexCommand('dropIndex', 'index', index);
  }

  /*Indicate that the given spatial index should be dropped.*/
  public dropSpatialIndex(index: string | any[]) {
    return this.dropIndexCommand('dropSpatialIndex', 'spatialIndex', index);
  }

  /*Indicate that the given foreign key should be dropped.*/
  public dropForeign(index: string | any[]) {
    return this.dropIndexCommand('dropForeign', 'foreign', index);
  }

  /*Indicate that the given column and foreign key should be dropped.*/
  public dropConstrainedForeignId(column: string) {
    this.dropForeign([column]);
    return this.dropColumn(column);
  }

  /*Indicate that the given indexes should be renamed.*/
  public renameIndex(from: string, to: string) {
    return this.addCommand('renameIndex', {from, to});
  }

  /*Indicate that the timestamp columns should be dropped.*/
  public dropTimestamps() {
    this.dropColumn('created_at', 'updated_at');
  }

  /*Indicate that the timestamp columns should be dropped.*/
  public dropTimestampsTz() {
    this.dropTimestamps();
  }

  /*Indicate that the soft delete column should be dropped.*/
  public dropSoftDeletes(column: string = 'deleted_at') {
    this.dropColumn(column);
  }

  /*Indicate that the soft delete column should be dropped.*/
  public dropSoftDeletesTz(column: string = 'deleted_at') {
    this.dropSoftDeletes(column);
  }

  /*Indicate that the remember token column should be dropped.*/
  public dropRememberToken() {
    this.dropColumn('remember_token');
  }

  /*Indicate that the polymorphic columns should be dropped.*/
  public dropMorphs(name: string, indexName: string | null = null) {
    this.dropIndex(indexName || this.createIndexName('index', [`${name}_type`, `${name}_id`]));
    this.dropColumn(`${name}_type`, `${name}_id`);
  }

  /*Rename the table to a given name.*/
  public rename(to: string) {
    return this.addCommand('rename', {to});
  }

  /*Specify the primary key(s) for the table.*/
  public primary(columns: any[] | string, name: string | null = null,
                 algorithm: string | null                     = null) {
    return this.indexCommand('primary', columns, name, algorithm);
  }

  /*Specify a unique index for the table.*/
  public unique(columns: any[] | string, name: string | null = null,
                algorithm: string | null                     = null) {
    return this.indexCommand('unique', columns, name, algorithm);
  }

  /*Specify an index for the table.*/
  public index(columns: any[] | string, name: string | null = null,
               algorithm: string | null                     = null) {
    return this.indexCommand('index', columns, name, algorithm);
  }

  /*Specify a spatial index for the table.*/
  public spatialIndex(columns: any[] | string, name: string | null = null) {
    return this.indexCommand('spatialIndex', columns, name);
  }

  /*Specify a raw index for the table.*/
  public rawIndex(expression: string, name: string) {
    return this.index([raw(expression)], name);
  }

  /*Specify a foreign key for the table.*/
  public foreign(columns: any[] | string, name: string | null = null) {
    const command = new ForeignKeyDefinition(
      this.indexCommand('foreign', columns, name).getAttributes());

    this.commands[this.commands.length - 1] = command;
    return command;
  }

  /*Create a new auto-incrementing big integer (8-byte) column on the table.*/
  public id(column: string = 'id') {
    return this.bigIncrements(column);
  }

  /*Create a new auto-incrementing integer (4-byte) column on the table.*/
  public increments(column: string) {
    return this.unsignedInteger(column, true);
  }

  /*Create a new auto-incrementing integer (4-byte) column on the table.*/
  public integerIncrements(column: string) {
    return this.unsignedInteger(column, true);
  }

  /*Create a new auto-incrementing tiny integer (1-byte) column on the table.*/
  public tinyIncrements(column: string) {
    return this.unsignedTinyInteger(column, true);
  }

  /*Create a new auto-incrementing small integer (2-byte) column on the table.*/
  public smallIncrements(column: string) {
    return this.unsignedSmallInteger(column, true);
  }

  /*Create a new auto-incrementing medium integer (3-byte) column on the table.*/
  public mediumIncrements(column: string) {
    return this.unsignedMediumInteger(column, true);
  }

  /*Create a new auto-incrementing big integer (8-byte) column on the table.*/
  public bigIncrements(column: string) {
    return this.unsignedBigInteger(column, true);
  }

  /*Create a new char column on the table.*/
  public char(column: string, length: number | null = null) {
    length = length || SchemaBuilder._defaultStringLength;
    return this.addColumn('char', column, {length});
  }

  /*Create a new string column on the table.*/
  public string(column: string, length: number | null = null) {
    length = length || SchemaBuilder._defaultStringLength;
    return this.addColumn('string', column, {length});
  }

  /*Create a new tiny text column on the table.*/
  public tinyText(column: string) {
    return this.addColumn('tinyText', column);
  }

  /*Create a new text column on the table.*/
  public text(column: string) {
    return this.addColumn('text', column);
  }

  /*Create a new medium text column on the table.*/
  public mediumText(column: string) {
    return this.addColumn('mediumText', column);
  }

  /*Create a new long text column on the table.*/
  public longText(column: string) {
    return this.addColumn('longText', column);
  }

  /*Create a new integer (4-byte) column on the table.*/
  public integer(column: string, autoIncrement: boolean = false, unsigned: boolean = false) {
    return this.addColumn('integer', column, {autoIncrement, unsigned});
  }

  /*Create a new tiny integer (1-byte) column on the table.*/
  public tinyInteger(column: string, autoIncrement: boolean = false, unsigned: boolean = false) {
    return this.addColumn('tinyInteger', column, {autoIncrement, unsigned});
  }

  /*Create a new small integer (2-byte) column on the table.*/
  public smallInteger(column: string, autoIncrement: boolean = false, unsigned: boolean = false) {
    return this.addColumn('smallInteger', column, {autoIncrement, unsigned});
  }

  /*Create a new medium integer (3-byte) column on the table.*/
  public mediumInteger(column: string, autoIncrement: boolean = false, unsigned: boolean = false) {
    return this.addColumn('mediumInteger', column, {autoIncrement, unsigned});
  }

  /*Create a new big integer (8-byte) column on the table.*/
  public bigInteger(column: string, autoIncrement: boolean = false, unsigned: boolean = false) {
    return this.addColumn('bigInteger', column, {autoIncrement, unsigned});
  }

  /*Create a new unsigned integer (4-byte) column on the table.*/
  public unsignedInteger(column: string, autoIncrement: boolean = false) {
    return this.integer(column, autoIncrement, true);
  }

  /*Create a new unsigned tiny integer (1-byte) column on the table.*/
  public unsignedTinyInteger(column: string, autoIncrement: boolean = false) {
    return this.tinyInteger(column, autoIncrement, true);
  }

  /*Create a new unsigned small integer (2-byte) column on the table.*/
  public unsignedSmallInteger(column: string, autoIncrement: boolean = false) {
    return this.smallInteger(column, autoIncrement, true);
  }

  /*Create a new unsigned medium integer (3-byte) column on the table.*/
  public unsignedMediumInteger(column: string, autoIncrement: boolean = false) {
    return this.mediumInteger(column, autoIncrement, true);
  }

  /*Create a new unsigned big integer (8-byte) column on the table.*/
  public unsignedBigInteger(column: string, autoIncrement: boolean = false) {
    return this.bigInteger(column, autoIncrement, true);
  }

  /*Create a new unsigned big integer (8-byte) column on the table.*/
  public foreignId(column: string): ForeignIdColumnDefinition {
    return this.addColumnDefinition(new ForeignIdColumnDefinition(this, {
      'type'         : 'bigInteger',
      'name'         : column,
      'autoIncrement': false,
      'unsigned'     : true
    }));
  }

  /*Create a foreign ID column for the given model.*/
  public foreignIdFor(model: Model /*| string*/, column: string | null = null) {
    // if (isString(model)) {
    //   model = new model();
    // }
    return (model as Model).$getKeyType() === 'int' &&
    (model as Model).$getIncrementing() ?
      this.foreignId(column || (model as Model).$getForeignKey()) :
      this.foreignUuid(column || (model as Model).$getForeignKey());
  }

  /*Create a new float column on the table.*/
  public float(column: string, total: number = 8, places: number = 2, unsigned: boolean = false) {
    return this.addColumn('float', column, {total, places, unsigned});
  }

  /*Create a new double column on the table.*/
  public double(column: string, total: number | null = null, places: number | null = null,
                unsigned: boolean                                                  = false) {
    return this.addColumn('double', column, {total, places, unsigned});
  }

  /*Create a new decimal column on the table.*/
  public decimal(column: string, total: number = 8, places: number = 2, unsigned: boolean = false) {
    return this.addColumn('decimal', column, {total, places, unsigned});
  }

  /*Create a new unsigned float column on the table.*/
  public unsignedFloat(column: string, total: number = 8, places: number = 2) {
    return this.float(column, total, places, true);
  }

  /*Create a new unsigned double column on the table.*/
  public unsignedDouble(column: string, total: number = null, places: number = null) {
    return this.double(column, total, places, true);
  }

  /*Create a new unsigned decimal column on the table.*/
  public unsignedDecimal(column: string, total: number = 8, places: number = 2) {
    return this.decimal(column, total, places, true);
  }

  /*Create a new boolean column on the table.*/
  public boolean(column: string) {
    return this.addColumn('boolean', column);
  }

  /*Create a new enum column on the table.*/
  public enum(column: string, allowed: any[]) {
    return this.addColumn('enum', column, {allowed});
  }

  /*Create a new set column on the table.*/
  public set(column: string, allowed: any[]) {
    return this.addColumn('set', column, {allowed});
  }

  /*Create a new json column on the table.*/
  public json(column: string) {
    return this.addColumn('json', column);
  }

  /*Create a new jsonb column on the table.*/
  public jsonb(column: string) {
    return this.addColumn('jsonb', column);
  }

  /*Create a new date column on the table.*/
  public date(column: string) {
    return this.addColumn('date', column);
  }

  /*Create a new date-time column on the table.*/
  public dateTime(column: string, precision: number = 0) {
    return this.addColumn('dateTime', column, {precision});
  }

  /*Create a new date-time column (with time zone) on the table.*/
  public dateTimeTz(column: string, precision: number = 0) {
    return this.addColumn('dateTimeTz', column, {precision});
  }

  /*Create a new time column on the table.*/
  public time(column: string, precision: number = 0) {
    return this.addColumn('time', column, {precision});
  }

  /*Create a new time column (with time zone) on the table.*/
  public timeTz(column: string, precision: number = 0) {
    return this.addColumn('timeTz', column, {precision});
  }

  /*Create a new timestamp column on the table.*/
  public timestamp(column: string, precision: number = 0) {
    return this.addColumn('timestamp', column, {precision});
  }

  /*Create a new timestamp (with time zone) column on the table.*/
  public timestampTz(column: string, precision: number = 0) {
    return this.addColumn('timestampTz', column, {precision});
  }

  /*Add nullable creation and update timestamps to the table.*/
  public timestamps(precision: number = 0) {
    this.timestamp('created_at', precision).withNullable();
    this.timestamp('updated_at', precision).withNullable();
  }

  /*Add nullable creation and update timestamps to the table.

  Alias for self::timestamps().*/
  public nullableTimestamps(precision: number = 0) {
    this.timestamps(precision);
  }

  /*Add creation and update timestampTz columns to the table.*/
  public timestampsTz(precision: number = 0) {
    this.timestampTz('created_at', precision).withNullable();
    this.timestampTz('updated_at', precision).withNullable();
  }

  /*Add a "deleted at" timestamp for the table.*/
  public softDeletes(column: string = 'deleted_at', precision: number = 0) {
    return this.timestamp(column, precision).withNullable();
  }

  /*Add a "deleted at" timestampTz for the table.*/
  public softDeletesTz(column: string = 'deleted_at', precision: number = 0) {
    return this.timestampTz(column, precision).withNullable();
  }

  /*Create a new year column on the table.*/
  public year(column: string) {
    return this.addColumn('year', column);
  }

  /*Create a new binary column on the table.*/
  public binary(column: string) {
    return this.addColumn('binary', column);
  }

  /*Create a new uuid column on the table.*/
  public uuid(column: string = 'uuid') {
    return this.addColumn('uuid', column);
  }

  /*Create a new UUID column on the table with a foreign key constraint.*/
  public foreignUuid(column: string) {
    return this.addColumnDefinition(new ForeignIdColumnDefinition(this, {
      'type': 'uuid',
      'name': column
    }));
  }

  /*Create a new IP address column on the table.*/
  public ipAddress(column: string = 'ip_address') {
    return this.addColumn('ipAddress', column);
  }

  /*Create a new MAC address column on the table.*/
  public macAddress(column: string = 'mac_address') {
    return this.addColumn('macAddress', column);
  }

  /*Create a new geometry column on the table.*/
  public geometry(column: string) {
    return this.addColumn('geometry', column);
  }

  /*Create a new point column on the table.*/
  public point(column: string, srid: number | null = null) {
    return this.addColumn('point', column, {srid});
  }

  /*Create a new linestring column on the table.*/
  public lineString(column: string) {
    return this.addColumn('lineString', column);
  }

  /*Create a new polygon column on the table.*/
  public polygon(column: string) {
    return this.addColumn('polygon', column);
  }

  /*Create a new geometrycollection column on the table.*/
  public geometryCollection(column: string) {
    return this.addColumn('geometryCollection', column);
  }

  /*Create a new multipoint column on the table.*/
  public multiPoint(column: string) {
    return this.addColumn('multiPoint', column);
  }

  /*Create a new multilinestring column on the table.*/
  public multiLineString(column: string) {
    return this.addColumn('multiLineString', column);
  }

  /*Create a new multipolygon column on the table.*/
  public multiPolygon(column: string) {
    return this.addColumn('multiPolygon', column);
  }

  /*Create a new multipolygon column on the table.*/
  public multiPolygonZ(column: string) {
    return this.addColumn('multiPolygonZ', column);
  }

  /*Create a new generated, computed column on the table.*/
  public computed(column: string, expression: string) {
    return this.addColumn('computed', column, {expression});
  }

  /*Add the proper columns for a polymorphic table.*/
  public morphs(name: string, indexName: string | null = null) {
    if (SchemaBuilder._defaultMorphKeyType === 'uuid') {
      this.uuidMorphs(name, indexName);
    } else {
      this.numericMorphs(name, indexName);
    }
  }

  /*Add nullable columns for a polymorphic table.*/
  public nullableMorphs(name: string, indexName: string | null = null) {
    if (SchemaBuilder._defaultMorphKeyType === 'uuid') {
      this.nullableUuidMorphs(name, indexName);
    } else {
      this.nullableNumericMorphs(name, indexName);
    }
  }

  /*Add the proper columns for a polymorphic table using numeric IDs (incremental).*/
  public numericMorphs(name: string, indexName: string | null = null) {
    this.string(`${name}_type`);
    this.unsignedBigInteger(`${name}_id`);
    this.index([`${name}_type`, `${name}_id`], indexName);
  }

  /*Add nullable columns for a polymorphic table using numeric IDs (incremental).*/
  public nullableNumericMorphs(name: string, indexName: string | null = null) {
    this.string(`${name}_type`).withNullable();
    this.unsignedBigInteger(`${name}_id`).withNullable();
    this.index([`${name}_type`, `${name}_id`], indexName);
  }

  /*Add the proper columns for a polymorphic table using UUIDs.*/
  public uuidMorphs(name: string, indexName: string | null = null) {
    this.string(`${name}_type`);
    this.uuid(`${name}_id`);
    this.index([`${name}_type`, `${name}_id`], indexName);
  }

  /*Add nullable columns for a polymorphic table using UUIDs.*/
  public nullableUuidMorphs(name: string, indexName: string | null = null) {
    this.string(`${name}_type`).withNullable();
    this.uuid(`${name}_id`).withNullable();
    this.index([`${name}_type`, `${name}_id`], indexName);
  }

  /*Adds the `remember_token` column to the table.*/
  public rememberToken() {
    return this.string('remember_token', 100).withNullable();
  }

  /*Add a new index command to the blueprint.*/
  protected indexCommand(type: string, columns: any[] | any, index: string,
                         algorithm: string | null = null) {
    columns = wrap(columns);
    index   = index || this.createIndexName(type, columns);
    return this.addCommand(type, {index, columns, algorithm});
  }

  /*Create a new drop index command on the blueprint.*/
  protected dropIndexCommand(command: string, type: string, index: string | any[]) {
    let columns = [];
    if (isArray(index)) {
      index = this.createIndexName(type, columns = index);
    }
    return this.indexCommand(command, columns, index);
  }

  /*Create a default index name for the table.*/
  protected createIndexName(type: string, columns: any[]) {
    const index = (this.prefix + this.table + '_' + columns.join('_') + '_' + type).toLowerCase();
    return index.replace(/[-.]/g, '_');
  }

  /*Add a new column to the blueprint.*/
  public addColumn(type: 'ipAddress' | 'macAddress' | 'geometry' | 'point' | 'lineString' |
                     'polygon' | 'geometryCollection' | 'multiPoint' | 'multiLineString' |
                     'multiPolygon' | 'multiPolygonZ' | 'computed' | string,
                   name: string, parameters: Record<string, any> = {}) {
    return this.addColumnDefinition(
      new ColumnDefinition({type, name, ...parameters}));
  }

  /*Add a new column definition to the blueprint.*/
  protected addColumnDefinition<T extends ColumnDefinition = ColumnDefinition>(definition: T): T {
    this.columns.push(definition);
    if (this._after) {
      definition.after(this._after);
      this._after = definition.name;
    }
    return definition;
  }

  /*Add the columns from the callback after the given column.*/
  public after(column: string, callback: Function) {
    this._after = column;
    callback(this);
    this._after = null;
  }

  /*Remove a column from the schema blueprint.*/
  public removeColumn(name: string) {
    this.columns = this.columns.filter(c => {
      return c['name'] != name;
    });
    return this;
  }

  /*Add a new command to the blueprint.*/
  protected addCommand(name: string, parameters: any = {}) {
    const command = this.createCommand(name, parameters);
    this.commands.push(command);
    return command;
  }

  /*Create a new Fluent command.*/
  protected createCommand(name: string, parameters: any = {}) {
    return new ColumnDefinition({name, ...parameters});
  }

  /*Get the table the blueprint describes.*/
  public getTable() {
    return this.table;
  }

  /*Get the columns on the blueprint.*/
  public getColumns() {
    return this.columns;
  }

  /*Get the commands on the blueprint.*/
  public getCommands() {
    return this.commands;
  }

  /*Get the columns on the blueprint that should be added.*/
  public getAddedColumns(): ColumnDefinition[] {
    return this.columns.filter(column => {
      return !column.change;
    });
  }

  /*Get the columns on the blueprint that should be changed.*/
  public getChangedColumns() {
    return this.columns.filter(column => {
      return /*cast type bool*/ column.change;
    });
  }

  /*Determine if the blueprint has auto-increment columns.*/
  public hasAutoIncrementColumn() {
    return !isBlank(this.getAddedColumns().find(column => {
      return column.autoIncrement === true;
    }));
  }

  /*Get the auto-increment column starting values.*/
  public autoIncrementingStartingValues() {
    if (!this.hasAutoIncrementColumn()) {
      return [];
    }
    return this.getAddedColumns().map((column: ColumnDefinition) => {
      return column.autoIncrement === true ? column.get('startingValue', column.get('from')) : null;
    }).filter(it => !isAnyEmpty(it));
  }
}
