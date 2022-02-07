import { __awaiter } from 'tslib'

import { isBlank } from '@gradii/check-type'
export function mixinManagesTransactions(base) {
  return class _Self extends base {
    constructor() {
      super(...arguments)

      this._transactions = 0
    }

    transaction(callback, attempts = 1) {
      return __awaiter(this, void 0, void 0, function* () {
        let callbackResult
        for (
          let currentAttempt = 1;
          currentAttempt <= attempts;
          currentAttempt++
        ) {
          yield this.beginTransaction()
          try {
            callbackResult = yield callback(this)
          } catch (e) {
            yield this._handleTransactionException(e, currentAttempt, attempts)
            continue
          }
          try {
            if (this._transactions == 1) {
              yield (yield this.getPdo()).commit()
            }
            this._transactions = Math.max(0, this._transactions - 1)
            if (this._transactions == 0) {
              if (this._transactionsManager) {
                yield this._transactionsManager.commit(this.getName())
              }
            }
          } catch (e) {
            this.handleCommitTransactionException(e, currentAttempt, attempts)
            continue
          }
          this._fireConnectionEvent('committed')
          return callbackResult
        }
      })
    }

    _handleTransactionException(e, currentAttempt, maxAttempts) {
      return __awaiter(this, void 0, void 0, function* () {
        if (this.causedByConcurrencyError(e) && this._transactions > 1) {
          this._transactions--
          if (this._transactionsManager) {
            this._transactionsManager.rollback(
              this.getName(),
              this._transactions
            )
          }
          throw e
        }
        yield this.rollBack()
        if (this.causedByConcurrencyError(e) && currentAttempt < maxAttempts) {
          return
        }
        throw e
      })
    }

    beginTransaction() {
      return __awaiter(this, void 0, void 0, function* () {
        yield this._createTransaction()
        this._transactions++
        if (this._transactionsManager) {
          this._transactionsManager.begin(this.getName(), this._transactions)
        }
        this._fireConnectionEvent('beganTransaction')
      })
    }

    _createTransaction() {
      return __awaiter(this, void 0, void 0, function* () {
        if (this._transactions == 0) {
          this._reconnectIfMissingConnection()
          try {
            yield (yield this.getPdo()).beginTransaction()
          } catch (e) {
            yield this.handleBeginTransactionException(e)
          }
        } else if (
          this._transactions >= 1 &&
          this._queryGrammar.supportsSavepoints()
        ) {
          yield this._createSavepoint()
        }
      })
    }

    _createSavepoint() {
      return __awaiter(this, void 0, void 0, function* () {
        yield (yield this.getPdo()).execute(
          this._queryGrammar.compileSavepoint(
            'trans' + (this._transactions + 1)
          )
        )
      })
    }

    handleBeginTransactionException(e) {
      return __awaiter(this, void 0, void 0, function* () {
        if (this.causedByLostConnection(e)) {
          this.reconnect()
          yield (yield this.getPdo()).beginTransaction()
        } else {
          throw e
        }
      })
    }

    commit() {
      return __awaiter(this, void 0, void 0, function* () {
        if (this._transactions == 1) {
          yield (yield this.getPdo()).commit()
        }
        this._transactions = Math.max(0, this._transactions - 1)
        if (this._transactions == 0) {
          if (this._transactionsManager) {
            yield this._transactionsManager.commit(this.getName())
          }
        }
        this._fireConnectionEvent('committed')
      })
    }

    handleCommitTransactionException(e, currentAttempt, maxAttempts) {
      this._transactions = Math.max(0, this._transactions - 1)
      if (this.causedByConcurrencyError(e) && currentAttempt < maxAttempts) {
        return
      }
      if (this.causedByLostConnection(e)) {
        this._transactions = 0
      }
      throw e
    }

    rollBack(toLevel = null) {
      return __awaiter(this, void 0, void 0, function* () {
        toLevel = isBlank(toLevel) ? this._transactions - 1 : toLevel
        if (toLevel < 0 || toLevel >= this._transactions) {
          return
        }
        try {
          yield this.performRollBack(toLevel)
        } catch (e) {
          this.handleRollBackException(e)
        }
        this._transactions = toLevel
        if (this._transactionsManager) {
          this._transactionsManager.rollback(this.getName(), this._transactions)
        }
        this._fireConnectionEvent('rollingBack')
      })
    }

    performRollBack(toLevel) {
      return __awaiter(this, void 0, void 0, function* () {
        if (toLevel == 0) {
          yield (yield this.getPdo()).rollBack()
        } else if (this._queryGrammar.supportsSavepoints()) {
          yield (yield this.getPdo()).execute(
            this._queryGrammar.compileSavepointRollBack('trans' + (toLevel + 1))
          )
        }
      })
    }

    handleRollBackException(e) {
      if (this.causedByLostConnection(e)) {
        this._transactions = 0
        if (this._transactionsManager) {
          this._transactionsManager.rollback(this.getName(), this._transactions)
        }
      }
      throw e
    }

    transactionLevel() {
      return this._transactions
    }

    afterCommit(callback) {
      if (this._transactionsManager) {
        return this._transactionsManager.addCallback(callback)
      }
      throw new Error('RuntimeException Transactions Manager has not been set.')
    }

    setTransactionManager(manager) {
      this._transactionsManager = manager
      return this
    }

    unsetTransactionManager() {
      this._transactionsManager = null
    }
  }
}
