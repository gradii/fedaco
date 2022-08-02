/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { partition } from 'ramda';
import { DatabaseTransactionRecord } from './database-transaction-record';

export class DatabaseTransactionsManager {
  /*All of the recorded transactions.*/
  protected transactions: DatabaseTransactionRecord[] = [];

  /*Create a new database transactions manager instance.*/
  public constructor() {
  }

  /*Start a new database transaction.*/
  public begin(connection: string, level: number) {
    this.transactions.push(new DatabaseTransactionRecord(connection, level));
  }

  /*Rollback the active database transaction.*/
  public rollback(connection: string, level: number): void {
    this.transactions = this.transactions.filter(transaction => {
      return !(transaction.connection == connection && transaction.level > level);
    });
  }

  /*Commit the active database transaction.*/
  public async commit(connection: string) {
    const [forThisConnection, forOtherConnections] = partition((transaction => {
      return transaction.connection == connection;
    }), this.transactions);

    this.transactions = forOtherConnections;

    for (const conn of forThisConnection) {
      await conn.executeCallbacks();
    }
  }

  /*Register a transaction callback.*/
  public addCallback(callback: Function) {
    const current = this.transactions[this.transactions.length - 1];
    if (current) {
      return current.addCallback(callback);
    }
    callback();
  }

  /*Get all the transactions.*/
  public getTransactions() {
    return this.transactions;
  }
}
