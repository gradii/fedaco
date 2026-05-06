/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { type FedacoBuilder } from '@gradii/fedaco';
import { mixinSoftDeletes } from '@gradii/fedaco';
import { Model } from '@gradii/fedaco';

export interface FedacoBuilderTestNestedStub extends Model {}

export class FedacoBuilderTestNestedStub extends mixinSoftDeletes<any>(Model) {
  _table = 'nest_table';

  public scopeEmpty(query: FedacoBuilder) {
    return query;
  }
}
