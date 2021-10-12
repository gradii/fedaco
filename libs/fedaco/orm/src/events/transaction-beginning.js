import { ConnectionEvent } from './connection-event';

export class TransactionBeginning extends ConnectionEvent {
  constructor(connection) {
    super(connection);
  }
}
