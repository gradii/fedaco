/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { FedacoAnnotation } from './annotation.interface';

export interface ColumnAnnotation extends FedacoAnnotation {
  field?: string;

  unique?: boolean;

  // visible?: boolean;

  hidden?: boolean;
  // isPrimary?: boolean;
  //
  // columnName?: string;
  // // hasGetter?: boolean;
  // // hasSetter?: boolean;
  // serializeAs?: string;
  // /**
  //  * Invoked before serializing process happens
  //  */
  // serialize?: (value: any, attribute: string, model: any) => any;
  // /**
  //  * Invoked before create or update happens
  //  */
  // prepare?: (value: any, attribute: string, model: any) => any;
  // /**
  //  * Invoked when row is fetched from the database
  //  */
  // consume?: (value: any, attribute: string, model: any) => any;
  //
  // meta?: any;
  //
  // isDate?: boolean;
  //
  //
  // isEncryptedCastable?: boolean;
  //
  // isRelation?: boolean;
  //
  // isRelationUsing?: boolean;
  //
  // /**
  //  * specify for relation decoration.
  //  * will be dynamic define getter when the name of column not decorated as FedacoColumn
  //  * such as BelongsToColumn will have a foreignKey `user_id` defined,
  //  * if the model haven't define the foreignKey `user_id` as a normal column, it can't be accessed by
  //  * `model[user_id]`, so will dynamic defined like a `@Column user_id` on the model.
  //  */
  // foreignKey?: string;
}


export class FedacoColumn {
  static isTypeOf(obj: any) {
    return obj instanceof FedacoColumn;
  }
}
