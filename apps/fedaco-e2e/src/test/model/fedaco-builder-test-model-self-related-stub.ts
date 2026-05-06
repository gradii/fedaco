/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Table } from '../../src/annotation/table/table';
import { BelongsToManyColumn } from '../../src/annotation/relation-column/belongs-to-many.relation-column';
import { BelongsToColumn } from '../../src/annotation/relation-column/belongs-to.relation-column';
import { HasManyColumn } from '../../src/annotation/relation-column/has-many.relation-column';
import { HasOneColumn } from '../../src/annotation/relation-column/has-one.relation-column';
import { Model } from '../../src/fedaco/model';

export class FedacoBuilderTestModelFarRelatedStub extends Model {}

@Table({
  tableName: 'self_related_stubs',
})
export class FedacoBuilderTestModelSelfRelatedStub extends Model {
  // _table: any = 'self_related_stubs';

  @BelongsToColumn({
    related   : FedacoBuilderTestModelSelfRelatedStub,
    foreignKey: 'parent_id',
    ownerKey  : 'id',
    relation  : 'parent',
  })
  public parentFoo: any;

  @HasOneColumn({
    related   : FedacoBuilderTestModelSelfRelatedStub,
    foreignKey: 'parent_id',
    localKey  : 'id',
  })
  public childFoo: any;

  @HasManyColumn({
    related   : FedacoBuilderTestModelSelfRelatedStub,
    foreignKey: 'parent_id',
    localKey  : 'id',
  })
  public childFoos: any[];

  @BelongsToManyColumn({
    related        : FedacoBuilderTestModelSelfRelatedStub,
    table          : 'self_pivot',
    foreignPivotKey: 'child_id',
    relatedPivotKey: 'parent_id',
    parentKey      : 'parent_bars',
    // relatedKey
    // relation
  })
  public parentBars: any[];

  @BelongsToManyColumn({
    related        : FedacoBuilderTestModelSelfRelatedStub,
    table          : 'self_pivot',
    foreignPivotKey: 'parent_id',
    relatedPivotKey: 'child_id',
    parentKey      : 'child_bars',
    // relatedKey
    // relation
  })
  public childBars: any[];

  @HasManyColumn({
    related   : FedacoBuilderTestModelFarRelatedStub,
    foreignKey: 'foreign_key',
    localKey  : 'id',
  })
  public bazes: any[];
}
