/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isNumber, isObject } from '@gradii/nanofn';
import { Processor } from '../processor';
import type { QueryBuilder } from '../query-builder';

export class PostgresProcessor extends Processor {
  /*Process an "insert get ID" query.*/
  public async processInsertGetId(query: QueryBuilder, sql: string, values: any[],
                                  sequence?: string) {
    const connection = query.getConnection();
    connection.recordsHaveBeenModified();
    const result = (await connection.selectFromWriteConnection(sql, values))[0];
    sequence     = sequence || 'id';
    const id     = isObject(result) ? result[sequence] : result[sequence];
    return isNumber(id) ? /*cast type int*/ id : id;
  }

  /**
   * Process the results of a types query.
   */
  public processTypes(results: any[]) {
    return results.map((result) => {
      return {
        'name'    : result.name,
        'schema'  : result.schema,
        'implicit': Boolean(result.implicit),
        'type'    : ({
          'b'    : 'base',
          'c'    : 'composite',
          'd'    : 'domain',
          'e'    : 'enum',
          'p'    : 'pseudo',
          'r'    : 'range',
          'm'    : 'multirange',
        } as any)[result.type.toLowerCase()] || null,
        'category': ({
          'a'    : 'array',
          'b'    : 'boolean',
          'c'    : 'composite',
          'd'    : 'date_time',
          'e'    : 'enum',
          'g'    : 'geometric',
          'i'    : 'network_address',
          'n'    : 'numeric',
          'p'    : 'pseudo',
          'r'    : 'range',
          's'    : 'string',
          't'    : 'timespan',
          'u'    : 'user_defined',
          'v'    : 'bit_string',
          'x'    : 'unknown',
          'z'    : 'internal_use',
        } as any)[result.category.toLowerCase()] || null,
      };
    });
  }

  /**
   * Process the results of a columns query.
   *
   */
  public processColumns(results: any[]) {
    return results.map(function (result) {

      const autoincrement = result.default !== null && result.default.startsWith('nextval(');

      return {
        'name'          : result.name,
        'type_name'     : result.type_name,
        'type'          : result.type,
        'collation'     : result.collation,
        'nullable'      : Boolean(result.nullable),
        'default'       : result.generated ? null : result.default,
        'auto_increment': autoincrement,
        'comment'       : result.comment,
        'generation'    : result.generated ? {
          'type'      : ({
            's'    : 'stored',
          } as any)[result.generated] || null,
          'expression': result.default,
        } : null,
      };
    });
  }

  /**
   * Process the results of an indexes query.
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
        'on_update'      : ({
          'a'    : 'no action',
          'r'    : 'restrict',
          'c'    : 'cascade',
          'n'    : 'set null',
          'd'    : 'set default',
        } as any)[result.on_update.toLowerCase()] || null,
        'on_delete'      : ({
          'a'    : 'no action',
          'r'    : 'restrict',
          'c'    : 'cascade',
          'n'    : 'set null',
          'd'    : 'set default',
        } as any)[result.on_delete.toLowerCase()] || null,
      };
    });
  }
}
