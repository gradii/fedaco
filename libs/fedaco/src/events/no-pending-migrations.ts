/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export class NoPendingMigrations {
  /* The migration method that was called. */
  public method: string;

  /* Create a new event instance. */
  public constructor(method: string) {
    this.method = method;
  }
}
