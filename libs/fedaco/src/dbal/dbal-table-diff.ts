/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import type { DbalTable } from './dbal-table';

export class DbalTableDiff {

  constructor(
    public tableName: string,
    public addedColumns ?: any[],
    public changedColumns ?: any[],
    public removedColumns ?: any[],
    public addedIndexes ?: any[],
    public changedIndexes ?: any[],
    public removedIndexes ?: any[],
    public fromTable?: DbalTable
  ) {

  }

}
