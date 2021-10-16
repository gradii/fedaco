import { Processor } from '../processor'
export class SqliteProcessor extends Processor {
  processColumnListing(results) {
    return results.map((result) => {
      return result.name
    })
  }
}
