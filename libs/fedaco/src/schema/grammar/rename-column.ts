/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

// import { AbstractSchemaManager } from 'Doctrine/DBAL/Schema/AbstractSchemaManager';
// import { Column } from 'Doctrine/DBAL/Schema/Column';
// import { TableDiff } from 'Doctrine/DBAL/Schema/TableDiff';
// import { Connection } from 'Illuminate/Database/Connection';
// import { Blueprint } from 'Illuminate/Database/Schema/Blueprint';
// import { Grammar } from 'Illuminate/Database/Schema/Grammars/Grammar';
// import { Fluent } from 'Illuminate/Support/Fluent';
//
// export class RenameColumn {
//   /*Compile a rename column command.*/
//   public static compile(grammar: Grammar, blueprint: Blueprint, command: Fluent,
//                         connection: Connection) {
//     var schema           = connection.getDoctrineSchemaManager();
//     var databasePlatform = schema.getDatabasePlatform();
//     databasePlatform.registerDoctrineTypeMapping('enum', 'string');
//     var column = connection.getDoctrineColumn(grammar.getTablePrefix() + blueprint.getTable(),
//       command.from);
//     return /*cast type array*/ databasePlatform.getAlterTableSQL(
//       RenameColumn.getRenamedDiff(grammar, blueprint, command, column, schema));
//   }
//
//   /*Get a new column instance with the new column name.*/
//   protected static getRenamedDiff(grammar: Grammar, blueprint: Blueprint, command: Fluent,
//                                   column: Column, schema: AbstractSchemaManager) {
//     return RenameColumn.setRenamedColumns(grammar.getDoctrineTableDiff(blueprint, schema), command,
//       column);
//   }
//
//   /*Set the renamed columns on the table diff.*/
//   protected static setRenamedColumns(tableDiff: TableDiff, command: Fluent, column: Column) {
//     tableDiff.renamedColumns = {};
//     return tableDiff;
//   }
//
//   /*Get the writable column options.*/
//   private static getWritableColumnOptions(column: Column) {
//     return array_filter(column.toArray(), name => {
//       return method_exists(column, 'set' + name);
//     }, ARRAY_FILTER_USE_KEY);
//   }
// }
