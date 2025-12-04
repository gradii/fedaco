/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { isBlank } from '@gradii/nanofn';
import type { Connection } from './connection';
import type { DatabaseTransactionsManager } from './database-transactions-manager';
import type { Constructor } from './helper/constructor';

export interface ManagesTransactions {
  /* The number of active transactions. */
  _transactions: number;
  /* The transaction manager instance. */
  _transactionsManager: DatabaseTransactionsManager;

  /* Execute a Closure within a transaction. */
  transaction(callback: (...args: any[]) => Promise<any | void>, attempts?: number): Promise<any>;

  /* Start a new database transaction. */
  beginTransaction(): Promise<void>;

  /* Commit the active database transaction. */
  commit(): Promise<void>;

  /* Rollback the active database transaction. */
  rollBack(toLevel?: number | null): Promise<void>;

  /* Get the number of active transactions. */
  transactionLevel(): number;

  /* Execute the callback after a transaction commits. */
  afterCommit(callback: Function): Promise<void>;

  /* Set the transaction manager instance on the connection. */
  setTransactionManager(manager: DatabaseTransactionsManager): this;

  /* Unset the transaction manager for this connection. */
  unsetTransactionManager(): void;
}

type ManagesTransactionsCtor = Constructor<ManagesTransactions>;

export function mixinManagesTransactions<T extends Constructor<any>>(base: T): ManagesTransactionsCtor {
  return class _Self extends base {
    /* The number of active transactions. */
    protected _transactions = 0;
    /* The transaction manager instance. */
    protected _transactionsManager: DatabaseTransactionsManager;

    /* Execute a Closure within a transaction. */
    public async transaction(
      this: Connection & this,
      callback: (...args: any[]) => Promise<any | void>,
      attempts = 1,
    ): Promise<any> {
      let callbackResult;
      for (let currentAttempt = 1; currentAttempt <= attempts; currentAttempt++) {
        await this.beginTransaction();
        try {
          callbackResult = await callback(this);
        } catch (e: any) {
          await this._handleTransactionException(e, currentAttempt, attempts);
          continue;
        }
        try {
          if (this._transactions == 1) {
            await (await this.getPdo()).commit();
          }
          this._transactions = Math.max(0, this._transactions - 1);
          if (this._transactions == 0) {
            if (this._transactionsManager) {
              await this._transactionsManager.commit(this.getName());
            }
          }
        } catch (e: any) {
          this.handleCommitTransactionException(e, currentAttempt, attempts);
          continue;
        }
        this._fireConnectionEvent('committed');
        return callbackResult;
      }
    }

    /* Handle an exception encountered when running a transacted statement. */
    protected async _handleTransactionException(
      this: Connection & this,
      e: Error,
      currentAttempt: number,
      maxAttempts: number,
    ): Promise<void> {
      if (this.causedByConcurrencyError(e) && this._transactions > 1) {
        this._transactions--;
        if (this._transactionsManager) {
          this._transactionsManager.rollback(this.getName(), this._transactions);
        }
        throw e;
      }
      await this.rollBack();
      if (this.causedByConcurrencyError(e) && currentAttempt < maxAttempts) {
        return;
      }
      throw e;
    }

    /* Start a new database transaction. */
    public async beginTransaction(this: Connection & this): Promise<void> {
      await this._createTransaction();
      this._transactions++;
      if (this._transactionsManager) {
        this._transactionsManager.begin(this.getName(), this._transactions);
      }
      this._fireConnectionEvent('beganTransaction');
    }

    /* Create a transaction within the database. */
    protected async _createTransaction(this: Connection & this) {
      if (this._transactions == 0) {
        await this._reconnectIfMissingConnection();
        try {
          await (await this.getPdo()).beginTransaction();
        } catch (e: any) {
          await this.handleBeginTransactionException(e);
        }
      } else if (this._transactions >= 1 && this._queryGrammar.supportsSavepoints()) {
        await this._createSavepoint();
      }
    }

    /* Create a save point within the database. */
    protected async _createSavepoint(this: Connection & this) {
      await (await this.getPdo()).execute(this._queryGrammar.compileSavepoint('trans' + (this._transactions + 1)));
    }

    /* Handle an exception from a transaction beginning. */
    protected async handleBeginTransactionException(this: Connection & _Self, e: Error) {
      // @ts-ignore
      if (this.causedByLostConnection(e)) {
        this.reconnect();
        await (await this.getPdo()).beginTransaction();
      } else {
        throw e;
      }
    }

    /* Commit the active database transaction. */
    public async commit(this: Connection & this) {
      if (this._transactions == 1) {
        await (await this.getPdo()).commit();
      }
      this._transactions = Math.max(0, this._transactions - 1);
      if (this._transactions == 0) {
        if (this._transactionsManager) {
          await this._transactionsManager.commit(this.getName());
        }
      }
      this._fireConnectionEvent('committed');
    }

    /* Handle an exception encountered when committing a transaction. */
    protected handleCommitTransactionException(
      this: Connection & _Self,
      e: Error,
      currentAttempt: number,
      maxAttempts: number,
    ) {
      this._transactions = Math.max(0, this._transactions - 1);
      if (this.causedByConcurrencyError(e) && currentAttempt < maxAttempts) {
        return;
      }
      // @ts-ignore
      if (this.causedByLostConnection(e)) {
        this._transactions = 0;
      }
      throw e;
    }

    /* Rollback the active database transaction. */
    public async rollBack(this: Connection & this, toLevel: number | null = null) {
      toLevel = isBlank(toLevel) ? this._transactions - 1 : toLevel;
      if (toLevel < 0 || toLevel >= this._transactions) {
        return;
      }
      try {
        await this.performRollBack(toLevel);
      } catch (e: any) {
        this.handleRollBackException(e);
      }
      this._transactions = toLevel;
      if (this._transactionsManager) {
        this._transactionsManager.rollback(this.getName(), this._transactions);
      }
      this._fireConnectionEvent('rollingBack');
    }

    /* Perform a rollback within the database. */
    protected async performRollBack(this: Connection & this, toLevel: number): Promise<void> {
      if (toLevel == 0) {
        await (await this.getPdo()).rollBack();
      } else if (this._queryGrammar.supportsSavepoints()) {
        await (await this.getPdo()).execute(this._queryGrammar.compileSavepointRollBack('trans' + (toLevel + 1)));
      }
    }

    /* Handle an exception from a rollback. */
    protected handleRollBackException(this: Connection & _Self, e: Error) {
      // @ts-ignore
      if (this.causedByLostConnection(e)) {
        this._transactions = 0;
        if (this._transactionsManager) {
          this._transactionsManager.rollback(this.getName(), this._transactions);
        }
      }
      throw e;
    }

    /* Get the number of active transactions. */
    public transactionLevel() {
      return this._transactions;
    }

    /* Execute the callback after a transaction commits. */
    public afterCommit(this: Connection & this, callback: Function) {
      if (this._transactionsManager) {
        return this._transactionsManager.addCallback(callback);
      }
      throw new Error('RuntimeException Transactions Manager has not been set.');
    }

    /* Set the transaction manager instance on the connection. */
    public setTransactionManager(manager: DatabaseTransactionsManager) {
      this._transactionsManager = manager;
      return this;
    }

    /* Unset the transaction manager for this connection. */
    public unsetTransactionManager() {
      this._transactionsManager = null;
    }
  };
}
