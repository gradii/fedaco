/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { isBlank } from '@gradii/nanofn';
import type { Connection } from './connection';
import type { ConnectionPoolManager } from './connector/connection-pool-manager';
import type { DriverConnection } from './connector/driver-connection';
import type { DatabaseTransactionsManager } from './database-transactions-manager';
import type { Constructor } from './helper/constructor';
import { resolveDatabaseDriver } from './interface/database-driver';
import type { IsolationLevel, TransactionOptions } from './transaction-options';

export interface ManagesTransactions {
  /* The number of active transactions. */
  _transactions: number;
  /* The transaction manager instance. */
  _transactionsManager: DatabaseTransactionsManager;

  /* Execute a Closure within a transaction. */
  transaction(
    callback: (tx: Connection) => Promise<any | void>,
    optionsOrAttempts?: TransactionOptions | number
  ): Promise<any>;

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
      callback: (tx: Connection) => Promise<any | void>,
      optionsOrAttempts: TransactionOptions | number = 1,
    ): Promise<any> {
      // Normalize options - support legacy number parameter for attempts
      const options: TransactionOptions =
        typeof optionsOrAttempts === 'number'
          ? { attempts: optionsOrAttempts }
          : optionsOrAttempts;

      const attempts = options.attempts || 1;

      // If isolated transaction requested, use dedicated connection
      if (options.isolated) {
        return this._executeIsolatedTransaction(callback, options);
      }

      // Otherwise, use existing transaction logic (same connection)
      return this._executeRegularTransaction(callback, attempts, options);
    }

    /* Execute an isolated transaction with a dedicated connection from the pool. */
    private async _executeIsolatedTransaction(
      this: Connection & this,
      callback: (tx: Connection) => Promise<any>,
      options: TransactionOptions,
    ): Promise<any> {
      // Resolve the driver so we can wrap the dedicated driver connection in a fresh
      // Connection of the correct subclass (MysqlConnection, PostgresConnection,
      // etc) — same code path the connection-factory uses for the primary
      // connection. No subclass-specific cloning logic needed here.
      const config = (this as any).config;
      const driver = resolveDatabaseDriver(config['factory'], config);
      const poolManager = this._getPoolManager();

      // Acquire a dedicated driver connection. Use the pool when configured; otherwise open
      // a one-shot connection via the driver's connector. The fallback path
      // means drivers without pool support (eg SQLite) can still run isolated
      // transactions — at the cost of paying the connect handshake each call.
      const dedicatedDriverConnection = poolManager
        ? await poolManager.acquire()
        : await driver.createConnector(config);

      const isolatedConn = driver.createConnection(
        dedicatedDriverConnection,
        this.getDatabaseName(),
        this.getTablePrefix(),
        config,
      );

      try {
        if (options.isolationLevel) {
          await this._setIsolationLevelOnDriverConnection(dedicatedDriverConnection, options.isolationLevel);
        }

        await isolatedConn.beginTransaction();

        try {
          const op = () => callback(isolatedConn);
          const result = options.timeout
            ? await this._executeWithTimeout(op, options.timeout)
            : await op();

          await isolatedConn.commit();
          return result;
        } catch (e) {
          // Best-effort rollback. Swallow rollback errors so the original
          // failure (timeout, callback error, etc) is the one that surfaces.
          try {
            if (isolatedConn.transactionLevel() > 0) {
              await isolatedConn.rollBack();
            }
          } catch {
            /* ignore */
          }
          throw e;
        }
      } finally {
        if (poolManager) {
          await poolManager.release(dedicatedDriverConnection);
        } else {
          // Standalone connection from the createConnector fallback — close
          // it so we don't leak a socket/file handle per isolated transaction.
          try {
            await dedicatedDriverConnection.disconnect();
          } catch {
            /* ignore */
          }
        }
      }
    }

    /* Execute an operation with a timeout. The caller is responsible for
       any rollback — this helper only races the timeout. */
    private async _executeWithTimeout<T>(
      this: Connection & this,
      operation: () => Promise<T>,
      timeoutMs: number,
    ): Promise<T> {
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error(`Transaction timeout after ${timeoutMs}ms`)),
          timeoutMs,
        );
      });

      try {
        return await Promise.race([operation(), timeoutPromise]);
      } finally {
        clearTimeout(timeoutId!);
      }
    }

    /* Set the transaction isolation level on a driver connection. */
    private async _setIsolationLevelOnDriverConnection(
      this: Connection & this,
      driverConnection: DriverConnection,
      level: IsolationLevel,
    ): Promise<void> {
      const driver = this.getDriverName();
      let sql: string;

      switch (driver) {
        case 'mysql':
        case 'mariadb':
          sql = `SET TRANSACTION ISOLATION LEVEL ${level}`;
          break;
        case 'pgsql':
        case 'postgres':
          sql = `SET TRANSACTION ISOLATION LEVEL ${level}`;
          break;
        case 'sqlsrv':
          sql = `SET TRANSACTION ISOLATION LEVEL ${level}`;
          break;
        case 'sqlite':
          // SQLite doesn't support SET TRANSACTION ISOLATION LEVEL
          // It uses PRAGMA read_uncommitted for READ UNCOMMITTED
          if (level === 'READ UNCOMMITTED') {
            sql = 'PRAGMA read_uncommitted = 1';
          } else {
            // SQLite only supports SERIALIZABLE (default) and READ UNCOMMITTED
            return;
          }
          break;
        default:
          throw new Error(`Isolation level not supported for driver: ${driver}`);
      }

      await driverConnection.execute(sql, []);
    }

    /* Execute a regular transaction on the same connection (existing behavior). */
    private async _executeRegularTransaction(
      this: Connection & this,
      callback: (tx: Connection) => Promise<any>,
      attempts: number,
      options: TransactionOptions,
    ): Promise<any> {
      let callbackResult;

      for (let currentAttempt = 1; currentAttempt <= attempts; currentAttempt++) {
        await this.beginTransaction();

        try {
          // Apply isolation level if specified (only on outermost transaction)
          if (options.isolationLevel && this._transactions === 1) {
            await this._setIsolationLevel(this, options.isolationLevel);
          }

          // Execute with timeout if specified
          callbackResult = options.timeout
            ? await this._executeWithTimeout(() => callback(this), options.timeout)
            : await callback(this);
        } catch (e: any) {
          await this._handleTransactionException(e, currentAttempt, attempts);
          continue;
        }

        try {
          if (this._transactions == 1) {
            await (await this.getDriverConnection()).commit();
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

    /* Set the transaction isolation level. */
    private async _setIsolationLevel(
      this: Connection & this,
      connection: Connection,
      level: IsolationLevel,
    ): Promise<void> {
      const driver = connection.getDriverName();
      let sql: string;

      switch (driver) {
        case 'mysql':
        case 'mariadb':
          sql = `SET TRANSACTION ISOLATION LEVEL ${level}`;
          break;
        case 'pgsql':
        case 'postgres':
          sql = `SET TRANSACTION ISOLATION LEVEL ${level}`;
          break;
        case 'sqlsrv':
          sql = `SET TRANSACTION ISOLATION LEVEL ${level}`;
          break;
        case 'sqlite':
          // SQLite doesn't support SET TRANSACTION ISOLATION LEVEL
          // It uses PRAGMA read_uncommitted for READ UNCOMMITTED
          if (level === 'READ UNCOMMITTED') {
            sql = 'PRAGMA read_uncommitted = 1';
          } else {
            // SQLite only supports SERIALIZABLE (default) and READ UNCOMMITTED
            return;
          }
          break;
        default:
          throw new Error(`Isolation level not supported for driver: ${driver}`);
      }

      await connection.statement(sql, []);
    }

    /* Get the pool manager from the connection. */
    private _getPoolManager(this: Connection & this): ConnectionPoolManager | undefined {
      return this.getPoolManager();
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
          await (await this.getDriverConnection()).beginTransaction();
        } catch (e: any) {
          await this.handleBeginTransactionException(e);
        }
      } else if (this._transactions >= 1 && this._queryGrammar.supportsSavepoints()) {
        await this._createSavepoint();
      }
    }

    /* Create a save point within the database. */
    protected async _createSavepoint(this: Connection & this) {
      await (await this.getDriverConnection()).execute(this._queryGrammar.compileSavepoint('trans' + (this._transactions + 1)));
    }

    /* Handle an exception from a transaction beginning. */
    protected async handleBeginTransactionException(this: Connection & _Self, e: Error) {
      // @ts-ignore
      if (this.causedByLostConnection(e)) {
        this.reconnect();
        await (await this.getDriverConnection()).beginTransaction();
      } else {
        throw e;
      }
    }

    /* Commit the active database transaction. */
    public async commit(this: Connection & this) {
      if (this._transactions == 1) {
        await (await this.getDriverConnection()).commit();
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
        await (await this.getDriverConnection()).rollBack();
      } else if (this._queryGrammar.supportsSavepoints()) {
        await (await this.getDriverConnection()).execute(this._queryGrammar.compileSavepointRollBack('trans' + (toLevel + 1)));
      }
    }

    /* Handle an exception from a rollback. */
    protected handleRollBackException(this: Connection & _Self, e: Error) {
      // @ts-ignore
      if (this.causedByLostConnection(e.message || String(e))) {
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
