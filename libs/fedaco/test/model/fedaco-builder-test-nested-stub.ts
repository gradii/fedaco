/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { type FedacoBuilder } from '../../src/fedaco/fedaco-builder';
import { mixinSoftDeletes } from '../../src/fedaco/mixins/soft-deletes';
import { Model } from '../../src/fedaco/model';

export interface FedacoBuilderTestNestedStub extends Model {
}

export class FedacoBuilderTestNestedStub extends mixinSoftDeletes<any>(Model) {
  _table = 'nest_table';

  public scopeEmpty(query: FedacoBuilder) {
    return query;
  }
}
