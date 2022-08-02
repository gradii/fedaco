/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Scope } from '../../src/annotation/scope';
import { FedacoBuilder } from '../../src/fedaco/fedaco-builder';
import { Model } from '../../src/fedaco/model';
import { Table } from "../../src/annotation/table/table";

@Table({
  tableName: 'fedaco_builder_test_scope_stub',
})
export class FedacoBuilderTestScopeStub extends Model {

  @Scope({
    query: function (query: FedacoBuilder, arg1: any, arg2: any) {
      query.where('foo', 'bar');
    }
  })
  scopeApproved: any;
}
