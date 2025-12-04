/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isPresent } from '@gradii/nanofn';
import type { ProcessorInterface } from './processor-interface';
import type { QueryBuilder } from './query-builder';

export class Processor implements ProcessorInterface {
  processSelect(queryBuilder: QueryBuilder, results: any | any[]) {
    return results;
  }

  async processInsertGetId(
    query: QueryBuilder,
    sql: string,
    values: any[],
    sequence: string | null = null,
  ): Promise<any> {
    await query.getConnection().insert(sql, values);
    const id = await (await query.getConnection().getPdo()).lastInsertId();
    // return isNumber(id) ? /*cast type int*/ id : id;
    return id;
  }

  /**
   * Process the results of a tables query.
   */
  public processTables(results: any[]) {
    return results.map((result: any) => {
      return {
        name     : result.name,
        schema   : result.schema ?? null, // PostgreSQL and SQL Server
        size     : isPresent(result.size) ? +result.size : null,
        comment  : result.comment ?? null, // MySQL and PostgreSQL
        collation: result.collation ?? null, // MySQL only
        engine   : result.engine ?? null, // MySQL only
      };
    });
  }

  /**
   * Process the results of a views query.
   *
   */
  public processViews(results: any[]) {
    return results.map((result) => {
      return {
        name      : result.name,
        schema    : result.schema ?? null, // PostgreSQL and SQL Server
        definition: result.definition,
      };
    });
  }

  /**
   * Process the results of a types query.
   *
   */
  public processTypes(results: any[]) {
    return results;
  }

  processColumns(results: any[], sql?: string) {
    return results;
  }

  processIndexes(results: any[]) {
    return results;
  }

  processForeignKeys(results: any[]) {
    return results;
  }
}
