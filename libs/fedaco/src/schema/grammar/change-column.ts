/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


// import { isBlank } from '@gradii/nanofn';
// import { Connection } from '../../connection';
// import { Comparator } from '../../dbal/comparator';
// import { upperCaseFirst } from '@gradii/nanofn';
// import { Blueprint } from '../blueprint';
// import { ColumnDefinition } from '../column-definition';
// import { SchemaGrammar } from './schema-grammar';
//
// export class ChangeColumn {
//   /*Compile a change column command into a series of SQL statements.*/
//   public static compile(grammar: SchemaGrammar, blueprint: Blueprint, command: ColumnDefinition,
//                         connection: Connection) {
//     if (!connection.isDoctrineAvailable()) {
//       throw new Error(
//         `RuntimeException Changing columns for table "${blueprint.getTable()}" requires Doctrine DBAL. Please install the doctrine/dbal package.`);
//     }
//     const schema           = connection.getDoctrineSchemaManager();
//     const databasePlatform = schema.getDatabasePlatform();
//     databasePlatform.registerDoctrineTypeMapping('enum', 'string');
//     const tableDiff = ChangeColumn.getChangedDiff(grammar, blueprint, schema);
//     if (tableDiff !== false) {
//       return /*cast type array*/ databasePlatform.getAlterTableSQL(tableDiff);
//     }
//     return [];
//   }
//
//   /*Get the Doctrine table difference for the given changes.*/
//   protected static getChangedDiff(grammar: SchemaGrammar, blueprint: Blueprint,
//                                   schema: AbstractSchemaManager) {
//     const current = schema.listTableDetails(grammar.getTablePrefix() + blueprint.getTable());
//     return new Comparator().diffTable(current,
//       ChangeColumn.getTableWithColumnChanges(blueprint, current));
//   }
//
//   /*Get a copy of the given Doctrine table after making the column changes.*/
//   protected static getTableWithColumnChanges(blueprint: Blueprint, table: Table) {
//     const table = ();
//     for (const columnDefine of blueprint.getChangedColumns()) {
//       const column = ChangeColumn.getDoctrineColumn(table, columnDefine);
//       for (const [key, value] of Object.entries(columnDefine.getAttributes())) {
//         if (!isBlank(option = ChangeColumn.mapColumnDefinitionOptionToDoctrine(key))) {
//           if (method_exists(column, method = 'set' + upperCaseFirst(option))) {
//             column[method](ChangeColumn.mapColumnDefinitionValueToDoctrine(option, value));
//             continue;
//           }
//           column.setCustomSchemaOption(option,
//             ChangeColumn.mapColumnDefinitionValueToDoctrine(option, value));
//         }
//       }
//     }
//     return table;
//   }
//
//   /*Get the Doctrine column instance for a column change.*/
//   protected static getDoctrineColumn(table: Table, ColumnDefinition: ColumnDefinition) {
//     return table.changeColumn(ColumnDefinition['name'],
//       ChangeColumn.getDoctrineColumnChangeOptions(ColumnDefinition)).getColumn(
//       ColumnDefinition['name']);
//   }
//
//   /*Get the Doctrine column change options.*/
//   protected static getDoctrineColumnChangeOptions(ColumnDefinition: ColumnDefinition) {
//     const options = {
//       'type': ChangeColumn.getDoctrineColumnType(ColumnDefinition['type'])
//     };
//     if (['text', 'mediumText', 'longText'].includes(ColumnDefinition['type'])) {
//       options['length'] = ChangeColumn.calculateDoctrineTextLength(ColumnDefinition['type']);
//     }
//     if (ChangeColumn.doesntNeedCharacterOptions(ColumnDefinition['type'])) {
//       options['customSchemaOptions'] = {
//         'collation': '',
//         'charset'  : ''
//       };
//     }
//     return options;
//   }
//
//   /*Get the doctrine column type.*/
//   protected static getDoctrineColumnType(type: string) {
//     type = type.toLowerCase();
//     switch (type) {
//       case 'biginteger':
//         type = 'bigint';
//         break;
//       case 'smallinteger':
//         type = 'smallint';
//         break;
//       case 'mediumtext':
//       case 'longtext':
//         type = 'text';
//         break;
//       case 'binary':
//         type = 'blob';
//         break;
//       case 'uuid':
//         type = 'guid';
//         break;
//     }
//     return Type.getType(type);
//   }
//
//   /*Calculate the proper column length to force the Doctrine text type.*/
//   protected static calculateDoctrineTextLength(type: string) {
//     switch (type) {
//       case 'mediumText':
//         return 65535 + 1;
//       case 'longText':
//         return 16777215 + 1;
//       default:
//         return 255 + 1;
//     }
//   }
//
//   /*Determine if the given type does not need character / collation options.*/
//   protected static doesntNeedCharacterOptions(type: string) {
//     return [
//       'bigInteger', 'binary', 'boolean', 'date', 'decimal', 'double', 'float', 'integer', 'json',
//       'mediumInteger', 'smallInteger', 'time', 'tinyInteger'
//     ].includes(type);
//   }
//
//   /*Get the matching Doctrine option for a given ColumnDefinition attribute name.*/
//   protected static mapColumnDefinitionOptionToDoctrine(attribute: string) {
//     switch (attribute) {
//       case 'type':
//       case 'name':
//         return;
//       case 'nullable':
//         return 'notnull';
//       case 'total':
//         return 'precision';
//       case 'places':
//         return 'scale';
//       default:
//         return attribute;
//     }
//   }
//
//   /*Get the matching Doctrine value for a given ColumnDefinition attribute.*/
//   protected static mapColumnDefinitionValueToDoctrine(option: string, value: any) {
//     return option === 'notnull' ? !value : value;
//   }
// }
