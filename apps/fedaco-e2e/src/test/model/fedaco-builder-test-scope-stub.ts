/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Scope } from '../../../../../libs/fedaco/src/annotation/scope';
import { FedacoBuilder } from '@gradii/fedaco';
import { Model } from '@gradii/fedaco';
import { Table } from '@gradii/fedaco';

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
