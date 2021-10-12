import { ConnectionEvent } from './connection-event';

export class TransactionCommitted extends ConnectionEvent {
  constructor(connection) {
    super(connection);
  }
}
