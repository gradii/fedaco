import { Column } from '../../src/annotation/column/column';
import { MorphToColumn } from '../../src/annotation/relation-column/morph-to.relation-column';
import { FedacoRelationType } from '../../src/fedaco/fedaco-types';
import { Model } from '../../src/fedaco/model';
import { MorphTo } from '../../src/fedaco/relations/morph-to';
import { forwardRef } from '../../src/query-builder/forward-ref';
import { DatabaseConfig } from './../../src/database-config';
import { FedacoBuilder } from './../../src/fedaco/fedaco-builder';
import { SchemaBuilder } from './../../src/schema/schema-builder';
import { getBuilder } from './relation-testing-helper';

let builder: FedacoBuilder<Model>;

function getRelation(parent?: Model) {
  builder = getBuilder();
  const related = new Model();
  jest.spyOn(related, 'GetKeyName').mockReturnValue('id');
  jest.spyOn(related, 'GetTable').mockReturnValue('relation');
  jest.spyOn(builder, 'getModel').mockReturnValue(related);
  parent = parent || new EloquentMorphToModelStub();
  return new MorphTo(builder, parent, 'foreign_key', 'id', 'morph_type', 'relation');
}

function getRelationAssociate(parent: Model) {
  builder = getBuilder();

  const related = new Model();
  jest.spyOn(related, 'GetKey').mockReturnValue(1);
  jest.spyOn(related, 'GetTable').mockReturnValue('relation');
  jest.spyOn(builder, 'getModel').mockReturnValue(related);

  return new MorphTo(builder, parent, 'foreign_key', 'id', 'morph_type', 'relation');
}

function connection(connectionName = 'default') {
  return Model.getConnectionResolver().connection(connectionName);
}

function schema(connectionName = 'default'): SchemaBuilder {
  return connection(connectionName).getSchemaBuilder();
}

describe('test database fedaco morph to', () => {
  beforeAll(async () => {
    const db = new DatabaseConfig();
    db.addConnection({
      driver  : 'sqlite',
      database: ':memory:',
    });
    db.bootFedaco();
    db.setAsGlobal();
  });

  afterAll(async () => {});

  it('lookup dictionary is properly constructed', () => {
    const relation = getRelation();
    // fake model
    const one = {
      morph_type  : 'morph_type_1',
      foreign_key : 'foreign_key_1',
      GetAttribute: (key: string) => '',
    };
    // fake model
    const two = {
      morph_type  : 'morph_type_1',
      foreign_key : 'foreign_key_1',
      GetAttribute: (key: string) => '',
    } as unknown as Model;
    // fake model
    const three = {
      morph_type  : 'morph_type_2',
      foreign_key : 'foreign_key_2',
      GetAttribute: (key: string) => '',
    } as unknown as Model;
    // @ts-ignore
    jest.spyOn(one, 'GetAttribute').mockImplementation((key) => one[key]);
    // @ts-ignore
    jest.spyOn(two, 'GetAttribute').mockImplementation((key) => two[key]);
    // @ts-ignore
    jest.spyOn(three, 'GetAttribute').mockImplementation((key) => three[key]);
    relation.addEagerConstraints([
      // @ts-ignore
      one,
      two,
      three,
    ]);
    const dictionary = relation.getDictionary();
    expect(dictionary).toEqual({
      morph_type_1: {
        foreign_key_1: [one, two],
      },
      morph_type_2: {
        foreign_key_2: [three],
      },
    });
  });

  it('morph to with default', async () => {
    const relation = getRelation().withDefault();
    const spy1 = jest.spyOn(builder, 'first').mockReturnValue(null);
    const newModel = new EloquentMorphToModelStub();
    newModel._connection = 'default'; // hack for test
    newModel.SyncOriginal();
    const result = await relation.getResults();
    expect(result).toEqual(newModel);
    expect(spy1).toHaveBeenCalled();
  });

  it('morph to with dynamic default', async () => {
    const relation = getRelation().withDefault((newModel) => {
      newModel.username = 'taylor';
    });
    const spy1 = jest.spyOn(builder, 'first').mockReturnValue(null);
    const newModel = new EloquentMorphToModelStub();
    newModel.username = 'taylor';
    const result = await relation.getResults();
    result.SyncOriginal();
    newModel.SyncOriginal();
    newModel._connection = 'default'; // hack for test
    expect(result).toEqual(newModel);
    expect(result.username).toBe('taylor');
    expect(spy1).toHaveBeenCalled();
  });

  it('morph to with array default', async () => {
    const relation = getRelation().withDefault({
      username: 'taylor',
    });
    const spy1 = jest.spyOn(builder, 'first').mockReturnValue(null);
    const newModel = new EloquentMorphToModelStub();
    newModel.username = 'taylor';
    const result = await relation.getResults();
    newModel._connection = 'default'; // hack for test
    newModel.SyncOriginal();
    result.SyncOriginal();
    expect(result).toEqual(newModel);
    expect(result.username).toBe('taylor');
    expect(spy1).toHaveBeenCalled();
  });

  it('morph to with specified class default', async () => {
    const parent = new EloquentMorphToModelStub();
    parent.relation_type = 'EloquentMorphToRelatedStub';
    const relation = parent.NewRelation('relation').withDefault();
    const newModel = new EloquentMorphToRelatedStub();
    const result = await relation.getResults();
    newModel.SyncOriginal();
    result.SyncOriginal();
    newModel._connection = 'default'; // hack for test
    expect(result).toEqual(newModel);
  });

  it('associate method sets foreign key and type on model', async () => {
    const parent = new Model();
    const spy1 = jest.spyOn(parent, 'GetAttribute').mockReturnValue('foreign.value');
    const relation = getRelationAssociate(parent);
    const associate = new Model();

    // Model can't define column dynamically. directly spy id value
    associate.id = 1;
    // jest.spyOn(associate, 'getAttribute').mockReturnValue(1);
    jest.spyOn(associate, 'GetMorphClass').mockReturnValue('Model');
    const spy2 = jest.spyOn(parent, 'SetAttribute');
    const spy3 = jest.spyOn(parent, 'SetRelation');

    await relation.associate(associate);

    expect(spy1).toHaveBeenCalledWith('foreign_key');
    expect(spy2).toHaveBeenNthCalledWith(1, 'foreign_key', 1);
    expect(spy2).toHaveBeenNthCalledWith(2, 'morph_type', 'Model');

    expect(spy3).toHaveBeenNthCalledWith(1, 'relation', associate);
  });

  it('associate method ignores null value', async () => {
    const parent = new Model();
    const spy1 = jest.spyOn(parent, 'GetAttribute').mockReturnValue('foreign.value');
    const relation = getRelationAssociate(parent);
    const spy2 = jest.spyOn(parent, 'SetAttribute');
    const spy3 = jest.spyOn(parent, 'SetRelation');
    await relation.associate(null);
    expect(spy2).toHaveBeenNthCalledWith(1, 'foreign_key', null);
    expect(spy2).toHaveBeenNthCalledWith(2, 'morph_type', null);
    expect(spy3).toHaveBeenNthCalledWith(1, 'relation', null);
  });

  it('dissociate method deletes unsets key and type on model', async () => {
    const parent = new Model();
    const spy1 = jest.spyOn(parent, 'GetAttribute').mockReturnValue('foreign.value');
    const relation = getRelation(parent);
    const spy2 = jest.spyOn(parent, 'SetAttribute');
    const spy3 = jest.spyOn(parent, 'SetRelation');
    await relation.dissociate();
    expect(spy2).toHaveBeenNthCalledWith(1, 'foreign_key', null);
    expect(spy2).toHaveBeenNthCalledWith(2, 'morph_type', null);
    expect(spy3).toHaveBeenNthCalledWith(1, 'relation', null);
  });
});

export class EloquentMorphToModelStub extends Model {
  _table: any = 'fedaco_morph_to_model_stubs';

  @Column()
  foreign_key = 'foreign.value';

  @Column()
  username: string;

  @Column()
  relation_type: string;

  @MorphToColumn({
    morphTypeMap: {
      EloquentMorphToRelatedStub: forwardRef(() => EloquentMorphToRelatedStub),
    },
  })
  public relation: FedacoRelationType<any>;
}

export class EloquentMorphToRelatedStub extends Model {
  _table: any = 'fedaco_morph_to_related_stubs';
}
