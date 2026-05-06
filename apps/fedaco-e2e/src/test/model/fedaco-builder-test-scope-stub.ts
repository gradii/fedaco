/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import type { FedacoBuilder } from '@gradii/fedaco';
import { Model, Scope, Table } from '@gradii/fedaco';

@Table({
  tableName: 'fedaco_builder_test_scope_stub',
})
export class FedacoBuilderTestScopeStub extends Model {
  @Scope({
    query: function (query: FedacoBuilder, arg1: any, arg2: any) {
      query.where('foo', 'bar');
    },
  })
  scopeApproved: any;
}
