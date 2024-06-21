/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { pluck } from 'ramda';
import { Processor } from '../processor';

export class SqliteProcessor extends Processor {
  /*Process the results of a column listing query.*/
  public processColumnListing(results: any[]) {
    return results.map(result => {
      return /*cast type object*/ result.name;
    });
  }

  public processColumns(results: any[], sql = ''): any[] {
    const hasPrimaryKey = pluck('primary', results).length === 1;

    return results.map(result => {
      const type      = result.type.toLowerCase();
      let matches     = /\b[^,(]+(?:\([^()]+\)[^,]*)?(?:(?:default|check|as)\s*(?:\(.*?\))?[^,]*)*collate\s+["'`]?(\w+)/i.exec(
        sql);
      const collation = matches != null ? matches[1] : undefined;

      const isGenerated = [2, 3].includes(result.extra);
      matches           = /\b'.preg_quote($result->name).'\b[^,]+\s+as\s+\(((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))*)\)/i.exec(
        sql);
      const expression  = isGenerated && matches != null ? matches[1] : undefined;
      return {
        name          : result.name,
        type_name     : type,
        type          : type,
        collation     : collation,
        nullable      : result.nullable,
        default       : result.default,
        auto_increment: hasPrimaryKey && result.primary && type === 'integer',
        comment       : null,
        generation    : isGenerated ? {
          type      : ({
            3      : 'stored',
            2      : 'virtual',
            default: null,
          } as any)[result.extra],
          expression: expression
        } : undefined,
      };
    });
  }

  public processIndexes(results: any[]) {
    let primaryCount = 0;

    let indexes = results.map((result) => {
      const isPrimary = result.primary;
      if (isPrimary) {
        primaryCount += 1;
      }

      return {
        'name'   : result.name.toLowerCase(),
        'columns': result.columns.split(','),
        'type'   : null,
        'unique' : result.unique,
        'primary': isPrimary,
      };
    });

    if (primaryCount > 1) {
      indexes = indexes.filter((index: any) => index['name'] !== 'primary');
    }

    return indexes;
  }

  public processForeignKeys(results: any[]) {
    return results.map((result) => {
      return {
        'name'           : null,
        'columns'        : result.columns.split(','),
        'foreign_schema' : null,
        'foreign_table'  : result.foreign_table,
        'foreign_columns': result.foreign_columns.split(','),
        'on_update'      : result.on_update.toLowerCase(),
        'on_delete'      : result.on_delete.toLowerCase(),
      };
    });
  }
}
