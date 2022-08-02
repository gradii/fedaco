/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { makeDecorator } from '@gradii/annotation';
import { Model } from '../../fedaco/model';
import { FedacoColumn } from '../column';

export interface TableAnnotation {
  /**
   * the database table name
   */
  tableName?: string;

  noPluralTable?: boolean;
  /**
   * the morph type name is used for morphOne morphMany.
   * this value is stored in morphTo table's morphType column
   */
  morphTypeName?: string;

  // /**
  //  * todo does it need to defined on table ? not the morphTo field?
  //  * the morph type map is used for morphTo.
  //  * the value map can decode the string the real Model.
  //  */
  // morphTypeMap?: Record<string, typeof Model>;

  /**
   * Indicates if the model should be timestamped.
   */
  timestamped?: boolean;

  hidden?: string[];
  visible?: string[];

  connection?: string;

  /**
   * specify the created_at column when timestamped.
   * default is created_at
   */
  created_at?: string;

  /**
   * specify the updated_at column when timestamped.
   * default is updated_at
   */
  updated_at?: string;

  /**
   * specify the deleted_at column when use soft delete.
   * default is deleted_at
   */
  deleted_at?: string;
}

export interface InjectableDecorator<T extends TableAnnotation> {
  (options?: T): any;

  isTypeOf(obj: any): obj is T;

  metadataName: string;

  new(options?: T): T;
}

export const Table: InjectableDecorator<TableAnnotation> = makeDecorator(
  'Fedaco:Table',
  (p?: TableAnnotation): TableAnnotation => ({...p}),
  FedacoColumn,
);
