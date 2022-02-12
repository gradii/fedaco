/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { ConnectionEvent } from './connection-event'
export class TransactionBeginning extends ConnectionEvent {
  constructor(connection) {
    super(connection)
  }
}
