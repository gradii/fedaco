/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export interface WrappedStmt {
  bindValues(bindings: any[]): this;

  bindValue(): this;

  execute(bindings?: any[]): Promise<any>;

  affectCount(): number;
}
