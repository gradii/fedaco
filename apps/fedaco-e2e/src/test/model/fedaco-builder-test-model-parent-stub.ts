/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Relation } from '@gradii/fedaco';
import { BelongsToColumn, BelongsToManyColumn, forwardRef, HasManyColumn, Model, Table } from '@gradii/fedaco';

@Table({
  tableName: 'fedaco_builder_test_model_close_related_stubs',
  noPluralTable: false,
})
export class FedacoBuilderTestModelCloseRelatedStub extends Model {
  @HasManyColumn({
    related: forwardRef(() => FedacoBuilderTestModelFarRelatedStub),
  })
  public bar: any[];

  @HasManyColumn({
    related: forwardRef(() => FedacoBuilderTestModelFarRelatedStub),
  })
  public baz: any[];
}

@Table({
  tableName: 'fedaco_builder_test_model_far_related_stubs',
  noPluralTable: false,
})
export class FedacoBuilderTestModelFarRelatedStub extends Model {}

@Table({
  tableName: 'fedaco_builder_test_model_parent_stubs',
  noPluralTable: false,
})
export class FedacoBuilderTestModelParentStub extends Model {
  @BelongsToColumn({
    related: FedacoBuilderTestModelCloseRelatedStub,
  })
  readonly foo: any;

  @BelongsToColumn({
    related: FedacoBuilderTestModelCloseRelatedStub,
    foreignKey: 'foo_id',
  })
  public address: any;

  @BelongsToColumn({
    related: FedacoBuilderTestModelCloseRelatedStub,
    foreignKey: 'foo_id',
    onQuery: (r: Relation) => {
      r.where('active', true);
    },
  })
  public activeFoo: any;

  @BelongsToManyColumn({
    related: FedacoBuilderTestModelCloseRelatedStub,
    table: 'user_role',
    foreignPivotKey: 'self_id',
    relatedPivotKey: 'related_id',
  })
  public roles: any;
}
