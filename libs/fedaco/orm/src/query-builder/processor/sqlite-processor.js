/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Processor } from '../processor'
export class SqliteProcessor extends Processor {
  processColumnListing(results) {
    return results.map((result) => {
      return result.name
    })
  }
}
