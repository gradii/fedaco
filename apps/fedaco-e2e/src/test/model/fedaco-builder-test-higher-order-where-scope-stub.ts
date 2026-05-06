/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { type FedacoBuilder } from '../../src/fedaco/fedaco-builder';
import { Model } from '../../src/fedaco/model';

export interface FedacoBuilderTestHigherOrderWhereScopeStub extends Model {}

export class FedacoBuilderTestHigherOrderWhereScopeStub extends Model {
  _table = 'nest_table';

  public scopeOne(query: FedacoBuilder) {
    query.where('one', 'foo');
  }

  public scopeTwo(query: FedacoBuilder) {
    query.where('two', 'bar');
  }

  public scopeThree(query: FedacoBuilder) {
    query.where('three', 'baz');
  }
}
