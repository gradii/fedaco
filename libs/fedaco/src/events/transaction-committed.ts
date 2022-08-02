/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import type { Connection } from '../connection';
import { ConnectionEvent } from './connection-event';

export class TransactionCommitted extends ConnectionEvent {
  constructor(connection: Connection) {
    super(connection);
  }
}
