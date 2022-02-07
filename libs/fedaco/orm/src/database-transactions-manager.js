import { __awaiter } from 'tslib'
import { partition } from 'ramda'
import { DatabaseTransactionRecord } from './database-transaction-record'
export class DatabaseTransactionsManager {
  constructor() {
    this.transactions = []
  }

  begin(connection, level) {
    this.transactions.push(new DatabaseTransactionRecord(connection, level))
  }

  rollback(connection, level) {
    this.transactions = this.transactions.filter((transaction) => {
      return !(
        transaction.connection == connection && transaction.level > level
      )
    })
  }

  commit(connection) {
    return __awaiter(this, void 0, void 0, function* () {
      const [forThisConnection, forOtherConnections] = partition(
        (transaction) => {
          return transaction.connection == connection
        },
        this.transactions
      )
      this.transactions = forOtherConnections
      for (const conn of forThisConnection) {
        yield conn.executeCallbacks()
      }
    })
  }

  addCallback(callback) {
    const current = this.transactions[this.transactions.length - 1]
    if (current) {
      return current.addCallback(callback)
    }
    callback()
  }

  getTransactions() {
    return this.transactions
  }
}
