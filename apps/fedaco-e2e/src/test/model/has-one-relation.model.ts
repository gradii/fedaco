/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { HasOneColumn, Model } from '@gradii/fedaco';

export class HasOneRelationModel extends Model {
  @HasOneColumn({})
  columnFoo: any;
}
