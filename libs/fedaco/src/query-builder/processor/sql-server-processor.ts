/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isNumber } from '@gradii/nanofn';
import type { Connection } from '../../connection';
import { Processor } from '../processor';
import type { QueryBuilder } from '../query-builder';

export class SqlServerProcessor extends Processor {
  /*Process an "insert get ID" query.*/
  public async processInsertGetId(query: QueryBuilder, sql: string, values: any[],
                                  sequence: string | null = null) {
    const connection = query.getConnection() as Connection;
    await connection.insert(sql, values);
    let id;
    if (connection.getConfig('odbc') === true) {
      id = await this.processInsertGetIdForOdbc(connection);
    } else {
      // id = await connection.getPdo().lastInsertId();
    }
    return isNumber(id) ? /*cast type int*/ id : id;
  }

  /*Process an "insert get ID" query for ODBC.*/
  protected async processInsertGetIdForOdbc(connection: Connection) {
    const result = await connection.selectFromWriteConnection(
      'SELECT CAST(COALESCE(SCOPE_IDENTITY(), @@IDENTITY) AS int) AS insertid');
    if (!result) {
      throw new Error('Unable to retrieve lastInsertID for ODBC.');
    }
    const row = result[0];
    return row.insertid;
  }

  /**
   * Process the results of a columns query.
   */
  public processColumns($results: any[]) {
    return $results.map(function (result) {
      const typeName = result.type_name;
      const type     = ({
        'binary'        : 'binary',
        'varbinary'     : 'varbinary',
        'char'          : 'char',
        'varchar'       : 'varchar',
        'nchar'         : 'nchar',
        'nvarchar'      : result.length == -1 ?
          typeName + '(max)' :
          `${typeName}(${result.length})`,
        'decimal'       : 'decimal',
        'numeric'       : `${typeName}(${result.precision},${result.places})`,
        'float'         : 'float',
        'datetime2'     : 'datetime2',
        'datetimeoffset': 'datetimeoffset',
        'time'          : `${typeName}(${result.precision})`,
        default         : typeName,
      } as any)[typeName];

      return {
        'name'          : result.name,
        'type_name'     : result.type_name,
        'type'          : type,
        'collation'     : result.collation,
        'nullable'      : Boolean(result.nullable),
        'default'       : result.default,
        'auto_increment': Boolean(result.autoincrement),
        'comment'       : result.comment,
        'generation'    : result.expression ? {
          'type'      : result.persisted ? 'stored' : 'virtual',
          'expression': result.expression,
        } : null,
      };
    });
  }

  /**
   * Process the results of an indexes query.
   *
   */
  public processIndexes(results: any[]) {
    return results.map((result) => {
      return {
        'name'   : result.name.toLowerCase(),
        'columns': result.columns.split(','),
        'type'   : result.type.toLowerCase(),
        'unique' : Boolean(result.unique),
        'primary': Boolean(result.primary),
      };
    });
  }

  /**
   * Process the results of a foreign keys query.
   */
  public processForeignKeys(results: any[]) {
    return results.map((result) => {
      return {
        'name'           : result.name,
        'columns'        : result.columns.split(','),
        'foreign_schema' : result.foreign_schema,
        'foreign_table'  : result.foreign_table,
        'foreign_columns': result.foreign_columns.split(','),
        'on_update'      : result.on_update.replace(/_/g, ' ').toLowerCase(),
        'on_delete'      : result.on_delete.replace(/_/g, ' ').toLowerCase()
      };
    });
  }
}
