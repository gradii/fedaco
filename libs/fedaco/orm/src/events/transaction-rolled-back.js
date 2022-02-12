import { ConnectionEvent } from './connection-event'
export class TransactionRolledBack extends ConnectionEvent {
  constructor(connection) {
    super(connection)
  }
}
