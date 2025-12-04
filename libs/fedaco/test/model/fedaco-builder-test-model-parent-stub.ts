/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  BelongsToManyColumn
} from '../../src/annotation/relation-column/belongs-to-many.relation-column';
import { BelongsToColumn } from '../../src/annotation/relation-column/belongs-to.relation-column';
import { HasManyColumn } from '../../src/annotation/relation-column/has-many.relation-column';
import { Table } from '../../src/annotation/table/table';
import { Model } from '../../src/fedaco/model';
import { Relation } from '../../src/fedaco/relations/relation';
import { forwardRef } from '../../src/query-builder/forward-ref';

@Table({
  tableName    : 'fedaco_builder_test_model_close_related_stub',
  noPluralTable: false
})
export class FedacoBuilderTestModelCloseRelatedStub extends Model {

  @HasManyColumn({
      related: forwardRef(() => FedacoBuilderTestModelFarRelatedStub)
    }
  )
  public bar: any[];

  @HasManyColumn({
      related: forwardRef(() => FedacoBuilderTestModelFarRelatedStub)
    }
  )
  public baz: any[];
}

@Table({
  tableName    : 'fedaco_builder_test_model_far_related_stub',
  noPluralTable: false
})
export class FedacoBuilderTestModelFarRelatedStub extends Model {
}

@Table({
  tableName    : 'fedaco_builder_test_model_parent_stub',
  noPluralTable: false
})
export class FedacoBuilderTestModelParentStub extends Model {

  @BelongsToColumn({
    related: FedacoBuilderTestModelCloseRelatedStub,
  })
  readonly foo: any;

  @BelongsToColumn({
    related   : FedacoBuilderTestModelCloseRelatedStub,
    foreignKey: 'foo_id'
  })
  public address: any;

  @BelongsToColumn({
    related   : FedacoBuilderTestModelCloseRelatedStub,
    foreignKey: 'foo_id',
    onQuery   : (r: Relation) => {
      r.where('active', true);
    }
  })
  public activeFoo: any;


  @BelongsToManyColumn({
    related        : FedacoBuilderTestModelCloseRelatedStub,
    table          : 'user_role',
    foreignPivotKey: 'self_id',
    relatedPivotKey: 'related_id'
  })

  public roles: any;
}

