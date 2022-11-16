/* eslint-disable @typescript-eslint/ban-ts-comment,@typescript-eslint/no-empty-function */
import { FedacoBuilder } from './../../src/fedaco/fedaco-builder';
import { Model } from '../../src/fedaco/model';
import { BelongsTo } from '../../src/fedaco/relations/belongs-to';
import { Column } from '../../src/annotation/column/column';
import { getBuilder } from './relation-testing-helper';

let builder: FedacoBuilder<Model>, related: Model;

function getRelation(parent?: Model, keyType = 'int') {
  builder = getBuilder();
  // this.builder.shouldReceive('where').with('relation.id', '=', 'foreign.value');
  related = new Model();
  jest.spyOn(related, '$getKeyType').mockReturnValue(keyType);
  jest.spyOn(related, '$getKeyName').mockReturnValue('id');
  jest.spyOn(related, '$getTable').mockReturnValue('relation');
  jest.spyOn(builder, 'getModel').mockReturnValue(related);
  parent = parent || new EloquentBelongsToModelStub();
  return new BelongsTo(builder, parent, 'foreignKey', 'id', 'relation');
}

describe('test database fedaco belongs to', () => {

  it('belongs to with default', async () => {
    const relation = getRelation().withDefault();

    jest.spyOn(builder, 'first').mockReturnValueOnce(null);
    const newModel = new EloquentBelongsToModelStub();
    const spy2     = jest.spyOn(related, '$newInstance').mockReturnValue(newModel);

    expect(await relation.getResults()).toEqual(newModel);
    expect(spy2).toReturnWith(newModel);
  });

  it('belongs to with dynamic default', async () => {
    const relation = getRelation().withDefault((newModel: Model) => {
      newModel.username = 'taylor';
    });

    jest.spyOn(builder, 'first').mockReturnValueOnce(null);
    const newModel = new EloquentBelongsToModelStub();
    jest.spyOn(related, '$newInstance').mockReturnValue(newModel);

    expect(await relation.getResults()).toEqual(newModel);
    expect(newModel.username).toBe('taylor');
  });

  it('belongs to with array default', async () => {
    const relation = getRelation().withDefault({
      'username': 'taylor'
    });

    jest.spyOn(builder, 'first').mockReturnValueOnce(null);
    const newModel = new EloquentBelongsToModelStub();
    jest.spyOn(related, '$newInstance').mockReturnValue(newModel);

    expect(await relation.getResults()).toEqual(newModel);
    expect(newModel.username).toBe('taylor');
  });

  it('eager constraints are properly added', () => {
    const relation = getRelation();

    jest.spyOn(relation.getRelated(), '$getKeyName').mockReturnValue('id');
    jest.spyOn(relation.getRelated(), '$getKeyType').mockReturnValue('int');

    const spy3 = jest.spyOn(relation.getQuery(), 'whereIntegerInRaw');

    const models = [
      new EloquentBelongsToModelStub(),
      new EloquentBelongsToModelStub(),
      new AnotherEloquentBelongsToModelStub()
    ];
    relation.addEagerConstraints(models);

    expect(spy3).toBeCalledWith('relation.id', ['foreign.value', 'foreign.value.two']);
  });

  it('ids in eager constraints can be zero', () => {
    const relation = getRelation();

    jest.spyOn(relation.getRelated(), '$getKeyName').mockReturnValue('id');
    jest.spyOn(relation.getRelated(), '$getKeyType').mockReturnValue('int');

    const spy3   = jest.spyOn(relation.getQuery(), 'whereIntegerInRaw');
    const models = [new EloquentBelongsToModelStub(), new EloquentBelongsToModelStubWithZeroId()];
    relation.addEagerConstraints(models);
    expect(spy3).toBeCalledWith('relation.id', ['foreign.value', 0]);
  });

  it('relation is properly initialized', () => {
    const relation = getRelation();
    const model    = new Model();
    const spy1     = jest.spyOn(model, '$setRelation');
    const models   = relation.initRelation([model], 'foo');
    expect(models).toEqual([model]);
    expect(spy1).toBeCalledWith('foo', null);
  });

  it('models are properly matched to parents', () => {
    const relation = getRelation();
    const result1  = {
      $getAttribute(): any {
      }
    };
    jest.spyOn(result1, '$getAttribute').mockReturnValue(1);
    const result2 = {
      $getAttribute(): any {
      }
    };
    jest.spyOn(result2, '$getAttribute').mockReturnValue(2);
    const model1      = new EloquentBelongsToModelStub();
    model1.foreignKey = 1;
    const model2      = new EloquentBelongsToModelStub();
    model2.foreignKey = 2;
    const models      = relation.match(
      [model1, model2],
      // @ts-ignore
      [result1, result2],
      'foo');
    expect(models[0].$getRelationValue('foo').$getAttribute('id')).toEqual(1);
    expect(models[1].$getRelationValue('foo').$getAttribute('id')).toEqual(2);
  });

  it('associate method sets foreign key on model', () => {
    const parent = new Model();

    jest.spyOn(parent, '$getAttribute').mockReturnValue('foreign.value');
    const relation  = getRelation(parent);
    const associate = new Model();
    jest.spyOn(associate, '$getAttribute').mockReturnValue(1);
    const spy1 = jest.spyOn(parent, '$setAttribute');
    const spy2 = jest.spyOn(parent, '$setRelation');

    relation.associate(associate);

    expect(spy1).toBeCalledWith('foreignKey', 1);
    expect(spy2).toBeCalledWith('relation', associate);
  });

  it('dissociate method unsets foreign key on model', () => {
    const parent = new Model();
    jest.spyOn(parent, '$getAttribute').mockReturnValue('foreign.value');
    const relation = getRelation(parent);

    const spy1 = jest.spyOn(parent, '$setAttribute');
    const spy2 = jest.spyOn(parent, '$setRelation');

    relation.dissociate();

    expect(spy1).toBeCalledWith('foreignKey', null);
    expect(spy2).toBeCalledWith('relation', null);
  });

  it('associate method sets foreign key on model by id', () => {
    const parent = new Model();
    jest.spyOn(parent, '$getAttribute').mockReturnValue('foreign.value');
    const relation = getRelation(parent);

    const spy1 = jest.spyOn(parent, '$setAttribute');
    const spy3 = jest.spyOn(parent, '$isDirty');
    const spy2 = jest.spyOn(parent, '$unsetRelation');

    relation.associate(1);

    expect(spy1).toBeCalledWith('foreignKey', 1);
    expect(spy2).toBeCalledWith(relation.getRelationName());
    expect(spy3).not.toBeCalled();
  });

  it('default eager constraints when incrementing', () => {
    const relation = getRelation();

    jest.spyOn(relation.getRelated(), '$getKeyName').mockReturnValue('id');
    jest.spyOn(relation.getRelated(), '$getKeyType').mockReturnValue('int');
    const spy1 = jest.spyOn(relation.getQuery(), 'whereIntegerInRaw');

    const models = [new MissingEloquentBelongsToModelStub(), new MissingEloquentBelongsToModelStub()];
    relation.addEagerConstraints(models);

    expect(spy1).toBeCalledWith('relation.id', []);
  });

  it('default eager constraints when incrementing and non int key type', () => {
    const relation = getRelation(null, 'string');

    const spy1   = jest.spyOn(relation.getQuery(), 'whereIn');
    const models = [new MissingEloquentBelongsToModelStub(), new MissingEloquentBelongsToModelStub()];
    relation.addEagerConstraints(models);

    expect(spy1).toBeCalledWith('relation.id', []);
  });

  it('default eager constraints when not incrementing', () => {
    const relation = getRelation();

    jest.spyOn(relation.getRelated(), '$getKeyName').mockReturnValue('id');
    jest.spyOn(relation.getRelated(), '$getKeyType').mockReturnValue('int');
    const spy1   = jest.spyOn(relation.getQuery(), 'whereIntegerInRaw');
    const models = [new MissingEloquentBelongsToModelStub(), new MissingEloquentBelongsToModelStub()];
    relation.addEagerConstraints(models);

    expect(spy1).toBeCalledWith('relation.id', []);
  });

});

export class EloquentBelongsToModelStub extends Model {
  @Column()
  public foreignKey: any = 'foreign.value';

  @Column()
  username: string;
}

export class AnotherEloquentBelongsToModelStub extends Model {
  @Column()
  public foreignKey: any = 'foreign.value.two';
}

export class EloquentBelongsToModelStubWithZeroId extends Model {
  @Column()
  public foreignKey: any = 0;
}

export class MissingEloquentBelongsToModelStub extends Model {
  @Column()
  public foreignKey: any;
}
