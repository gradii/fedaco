/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { HasOneColumn } from '../../src/annotation/relation-column/has-one.relation-column';
import { Model } from '../../src/fedaco/model';

export class RelationModel extends Model {

  @HasOneColumn()
  columnFoo: any;

}
