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

  /*Process the results of a column listing query.*/
  public processColumnListing(results: any[]) {
    return results.map(result => {
      return /*cast type object*/ result.name;
    });
  }
}
