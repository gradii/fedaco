/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Processor } from '../processor';
import type { QueryBuilder } from '../query-builder';

export class MysqlProcessor extends Processor {
  /**
   * Process the results of a columns query.
   *
   */
  public processColumns(results: any[]) {
    return results.map((result) => {
      return {
        name          : result.name,
        type_name     : result.type_name,
        type          : result.type,
        collation     : result.collation,
        nullable      : result.nullable === 'YES',
        default       : result.default,
        auto_increment: result.extra === 'auto_increment',
        comment       : result.comment ? result.comment : null,
        generation    : result.expression
          ? {
              type:
                (
                  {
                    'STORED GENERATED' : 'stored',
                    'VIRTUAL GENERATED': 'virtual',
                  } as any
                )[result.extra] || null,
              expression: result.expression,
            }
          : null,
      };
    });
  }

  /**
   * Process the results of an indexes query.
   *
   */
  public processIndexes(results: any[]) {
    return results.map((result) => {
      const name = result.name.toLowerCase();
      return {
        name   : name,
        columns: result.columns.split(','),
        type   : result.type.toLowerCase(),
        unique : Boolean(result.unique),
        primary: name === 'primary',
      };
    });
  }

  /**
   * Process the results of a foreign keys query.
   *
   */
  public processForeignKeys(results: any[]) {
    return results.map(function (result) {
      return {
        name           : result.name,
        columns        : result.columns.split(','),
        foreign_schema : result.foreign_schema,
        foreign_table  : result.foreign_table,
        foreign_columns: result.foreign_columns.split(','),
        on_update      : result.on_update.toLowerCase(),
        on_delete      : result.on_delete.toLowerCase(),
      };
    });
  }

  async processInsertGetId(
    query: QueryBuilder,
    sql: string,
    values: any[],
    sequence: string | null = null,
  ): Promise<any> {
    return query.getConnection().insertGetId(sql, values, sequence);
  }
}
