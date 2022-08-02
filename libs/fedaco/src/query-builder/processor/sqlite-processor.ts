/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Processor } from '../processor';

export class SqliteProcessor extends Processor {
  /*Process the results of a column listing query.*/
  public processColumnListing(results: any[]) {
    return results.map(result => {
      return /*cast type object*/ result.name;
    });
  }
}
