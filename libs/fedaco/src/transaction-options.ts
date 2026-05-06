/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

/**
 * SQL transaction isolation levels.
 *
 * Controls how transaction integrity is visible to other transactions.
 */
export type IsolationLevel =
  | 'READ UNCOMMITTED'
  | 'READ COMMITTED'
  | 'REPEATABLE READ'
  | 'SERIALIZABLE';

/**
 * Options for configuring transaction behavior.
 */
export interface TransactionOptions {
  /**
   * Use a dedicated connection from the pool for this transaction.
   *
   * When true, the transaction acquires a connection from the pool,
   * preventing interference with other concurrent transactions.
   *
   * Requires connection pooling to be configured.
   *
   * @default false
   */
  isolated?: boolean;

  /**
   * Maximum time (in milliseconds) the transaction can run before timing out.
   *
   * When exceeded, the transaction is automatically rolled back.
   *
   * @default undefined (no timeout)
   */
  timeout?: number;

  /**
   * Transaction isolation level.
   *
   * Controls the degree to which the transaction is isolated from
   * modifications made by other concurrent transactions.
   */
  isolationLevel?: IsolationLevel;

  /**
   * Number of times to retry the transaction on concurrency errors.
   *
   * @default 1
   */
  attempts?: number;
}
