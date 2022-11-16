import { Model } from '../../src/fedaco/model';
import { MorphMany } from '../../src/fedaco/relations/morph-many';
import { MorphOne } from '../../src/fedaco/relations/morph-one';
import { getBuilder } from './relation-testing-helper';

let builder, related;

function getOneRelation() {
  builder = getBuilder();
  related = new Model();
  jest.spyOn(builder, 'getModel').mockReturnValue(related);
  const parent = new Model();
  jest.spyOn(parent, '$getAttribute').mockReturnValue(1);
  jest.spyOn(parent, '$getMorphClass').mockReturnValue('parent-model');
  jest.spyOn(builder, 'where').mockReturnValue(builder);
  return new MorphOne(builder, parent, '_table.morph_type', '_table.morph_id', 'id');
}

function getManyRelation() {
  builder = getBuilder();
  related = new Model();
  jest.spyOn(builder, 'getModel').mockReturnValue(related);
  const parent = new Model();
  jest.spyOn(parent, '$getAttribute').mockReturnValue(1);
  jest.spyOn(parent, '$getMorphClass').mockReturnValue('parent-model');
  return new MorphMany(builder, parent, '_table.morph_type', '_table.morph_id', 'id');
}

function getNamespacedRelation(alias: string) {
  // import Relation.morphMap({});
  builder = getBuilder();
  // builder.shouldReceive('whereNotNull').once()._with('table.morph_id');
  // builder.shouldReceive('where').once()._with('table.morph_id', '=', 1);
  related = new Model();

  jest.spyOn(builder, 'getModel').mockReturnValue(related);
  // builder.shouldReceive('getModel').andReturn(related);
  const parent = new EloquentModelNamespacedStub();
  jest.spyOn(parent, '$getAttribute').mockReturnValue(1);
  jest.spyOn(parent, '$getMorphClass').mockReturnValue(alias);
  // @ts-ignore
  jest.spyOn(builder, 'where').mockReturnValue(alias);
  // parent.shouldReceive('getAttribute')._with('id').andReturn(1);
  // parent.shouldReceive('getMorphClass').andReturn(alias);
  // builder.shouldReceive('where').once()._with('table.morph_type', alias);
  return new MorphOne(builder, parent, '_table.morph_type', '_table.morph_id', 'id');
}

describe('test database fedaco morph', () => {

  it('morph one eager constraints are properly added', () => {
    const relation = getOneRelation();

    const spy1 = jest.spyOn(relation.getParent(), '$getKeyName').mockReturnValue('id');
    const spy2 = jest.spyOn(relation.getParent(), '$getKeyType').mockReturnValue('string');
    const spy3 = jest.spyOn(relation.getQuery(), 'whereIn');
    const spy4 = jest.spyOn(relation.getQuery(), 'where');
    // relation.getParent().shouldReceive('getKeyName').once().andReturn('id');
    // relation.getParent().shouldReceive('getKeyType').once().andReturn('string');
    // relation.getQuery().shouldReceive('whereIn').once()._with('table.morph_id', [1, 2]);
    // relation.getQuery().shouldReceive('where').once()._with('table.morph_type',
    //   get_class(relation.getParent()));
    const model1 = new EloquentMorphResetModelStub();
    model1.id    = 1;
    const model2 = new EloquentMorphResetModelStub();
    model2.id    = 2;
    relation.addEagerConstraints([model1, model2]);
  });

  it('morph many eager constraints are properly added', () => {
    const relation = getManyRelation();

    jest.spyOn(relation.getParent(), '$getKeyName').mockReturnValue('id');
    jest.spyOn(relation.getParent(), '$getKeyType').mockReturnValue('int');
    jest.spyOn(relation.getQuery(), 'whereIntegerInRaw');
    jest.spyOn(relation.getQuery(), 'where');
    // relation.getParent().shouldReceive('getKeyName').once().andReturn('id');
    // relation.getParent().shouldReceive('getKeyType').once().andReturn('int');
    // relation.getQuery().shouldReceive('whereIntegerInRaw').once()._with('table.morph_id', [1, 2]);
    // relation.getQuery().shouldReceive('where').once()._with('table.morph_type',
    //   get_class(relation.getParent()));
    const model1 = new EloquentMorphResetModelStub();
    model1.id    = 1;
    const model2 = new EloquentMorphResetModelStub();
    model2.id    = 2;
    relation.addEagerConstraints([model1, model2]);
  });

  it('make function on morph', () => {
    // _SERVER['__fedaco.saved'] = false;
    const relation = getOneRelation();
    const instance = new Model();
    jest.spyOn(instance, '$setAttribute');
    // instance.shouldReceive('setAttribute').once()._with('morph_id', 1);
    // instance.shouldReceive('setAttribute').once()._with('morph_type',
    //   get_class(relation.getParent()));
    // instance.shouldReceive('save').never();
    jest.spyOn(relation.getRelated(), '$newInstance').mockReturnValue(instance);
    // relation.getRelated().shouldReceive('newInstance').once()._with({
    //   'name': 'taylor'
    // }).andReturn(instance);
    expect(relation.make({
      'name': 'taylor'
    })).toEqual(instance);
  });

  it('create function on morph', async () => {
    const relation = getOneRelation();
    const created  = new Model();

    const spy1 = jest.spyOn(created, '$setAttribute');
    const spy2 = jest.spyOn(relation.getRelated(), '$newInstance').mockReturnValue(created);
    const spy3 = jest.spyOn(created, '$save').mockReturnValue(Promise.resolve(true));

    expect(await relation.create({
      'name': 'taylor'
    })).toEqual(created);

    expect(spy1).toHaveBeenNthCalledWith(1, 'morph_id', 1);
    expect(spy1).toHaveBeenNthCalledWith(2, 'morph_type', 'parent-model');
    expect(spy2).toBeCalledWith({
      'name': 'taylor'
    });
  });

  it('find or new method finds model', async () => {
    const relation = getOneRelation();
    const model    = new Model();
    const spy1     = jest.spyOn(relation.getQuery(), 'find')
      // @ts-ignore
      .mockReturnValue(Promise.resolve(model));
    const spy2     = jest.spyOn(relation.getRelated(), '$newInstance');
    const spy3     = jest.spyOn(model, '$setAttribute');
    const spy4     = jest.spyOn(model, '$save');
    expect(await relation.findOrNew('foo')).toBeInstanceOf(Model);

    expect(spy1).toBeCalledWith('foo', ['*']);
    expect(spy3).not.toBeCalled();
    expect(spy4).not.toBeCalled();
  });

  it('find or new method returns new model with morph keys set', async () => {
    const relation = getOneRelation();
    const model    = new Model();
    jest.spyOn(relation.getQuery(), 'find').mockReturnValue(null);
    // relation.getQuery().shouldReceive('find').once()._with('foo', ['*']).andReturn(
    //   model = m.mock(Model));
    // relation.getRelated().shouldReceive('newInstance').never();
    jest.spyOn(relation.getRelated(), '$newInstance').mockReturnValue(model);
    jest.spyOn(model, '$setAttribute');
    jest.spyOn(model, '$save');

    // const relation = getOneRelation();
    // relation.getQuery().shouldReceive('find').once()._with('foo', ['*']).andReturn(null);
    // relation.getRelated().shouldReceive('newInstance').once()._with().andReturn(
    //   model = m.mock(Model));
    // model.shouldReceive('setAttribute').once()._with('morph_id', 1);
    // model.shouldReceive('setAttribute').once()._with('morph_type', get_class(relation.getParent()));
    // model.shouldReceive('save').never();
    expect(await relation.findOrNew('foo')).toBeInstanceOf(Model);
  });

  it('first or new method finds first model', async () => {
    const relation = getOneRelation();
    const model    = new Model();

    const spy1 = jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());
    const spy2 = jest.spyOn(relation.getQuery(), 'first').mockReturnValue(Promise.resolve(model));
    const spy3 = jest.spyOn(relation.getRelated(), '$newInstance');

    const spy4 = jest.spyOn(model, '$setAttribute');
    const spy5 = jest.spyOn(model, '$save');

    // relation.getQuery().shouldReceive('where').once()._with(['foo']).andReturn(relation.getQuery());
    // relation.getQuery().shouldReceive('first').once()._with().andReturn(model = m.mock(Model));
    // relation.getRelated().shouldReceive('newInstance').never();
    // model.shouldReceive('setAttribute').never();
    // model.shouldReceive('save').never();

    expect(await relation.firstOrNew(['foo'])).toBeInstanceOf(Model);

    expect(spy1).toBeCalledWith(['foo']);
    expect(spy2).toBeCalledWith();
    expect(spy3).not.toBeCalled();
    expect(spy4).not.toBeCalled();
    expect(spy5).not.toBeCalled();
  });

  it('first or new method with value finds first model', async () => {
    const relation = getOneRelation();
    const model    = new Model();

    const spy1 = jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());
    const spy2 = jest.spyOn(relation.getQuery(), 'first').mockReturnValue(Promise.resolve(model));
    const spy3 = jest.spyOn(relation.getRelated(), '$newInstance');

    const spy4 = jest.spyOn(model, '$setAttribute');
    const spy5 = jest.spyOn(model, '$save');

    // const relation = getOneRelation();
    // relation.getQuery().shouldReceive('where').once()._with({
    //   'foo': 'bar'
    // }).andReturn(relation.getQuery());
    // relation.getQuery().shouldReceive('first').once()._with().andReturn(model = m.mock(Model));
    // relation.getRelated().shouldReceive('newInstance').never();
    // model.shouldReceive('setAttribute').never();
    // model.shouldReceive('save').never();

    expect(await relation.firstOrNew({
      'foo': 'bar'
    }, {
      'baz': 'qux'
    })).toBeInstanceOf(Model);

    expect(spy1).toBeCalledWith({'foo': 'bar'});
    expect(spy2).toBeCalledWith();
    expect(spy3).not.toBeCalled();
    expect(spy4).not.toBeCalled();
    expect(spy5).not.toBeCalled();
  });

  it('first or new method returns new model with morph keys set', async () => {
    const relation = getOneRelation();
    const model    = new Model();

    const spy1 = jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());
    const spy2 = jest.spyOn(relation.getQuery(), 'first').mockReturnValue(Promise.resolve(null));
    const spy3 = jest.spyOn(relation.getRelated(), '$newInstance').mockReturnValue(model);

    const spy4 = jest.spyOn(model, '$setAttribute');
    const spy5 = jest.spyOn(model, '$save');

    // const relation = getOneRelation();
    // relation.getQuery().shouldReceive('where').once()._with(['foo']).andReturn(relation.getQuery());
    // relation.getQuery().shouldReceive('first').once()._with().andReturn(null);
    // relation.getRelated().shouldReceive('newInstance').once()._with(['foo']).andReturn(
    //   model = m.mock(Model));
    // model.shouldReceive('setAttribute').once()._with('morph_id', 1);
    // model.shouldReceive('setAttribute').once()._with('morph_type', get_class(relation.getParent()));
    // model.shouldReceive('save').never();

    expect(await relation.firstOrNew({foo: 'foo'})).toBeInstanceOf(Model);

    expect(spy1).toBeCalledWith({foo: 'foo'});
    expect(spy2).toBeCalledWith();
    expect(spy3).toBeCalledWith({foo: 'foo'});
    expect(spy4).toBeCalledWith('morph_id', 1);
    expect(spy5).not.toBeCalled()

  });

  it('first or new method with values returns new model with morph keys set', async () => {
    const relation = getOneRelation();
    const model    = new Model();

    const spy1 = jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());
    const spy2 = jest.spyOn(relation.getQuery(), 'first').mockReturnValue(Promise.resolve(null));
    const spy3 = jest.spyOn(relation.getRelated(), '$newInstance').mockReturnValue(model);

    const spy4 = jest.spyOn(model, '$setAttribute');
    const spy5 = jest.spyOn(model, '$save');

    expect(await relation.firstOrNew({
      'foo': 'bar'
    }, {
      'baz': 'qux'
    })).toBeInstanceOf(Model);

    expect(spy1).toBeCalledWith({'foo': 'bar'});
    expect(spy2).toBeCalledWith();
    expect(spy3).toBeCalledWith({
      'foo': 'bar',
      'baz': 'qux'
    });
    expect(spy4).toBeCalledWith('morph_id', 1);
    expect(spy4).toBeCalledWith('morph_type', 'parent-model');
    expect(spy5).not.toBeCalled();

  });
  it('first or create method finds first model', async () => {
    const relation = getOneRelation();
    const model    = new Model();

    const spy1 = jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());
    const spy2 = jest.spyOn(relation.getQuery(), 'first').mockReturnValue(Promise.resolve(model));
    const spy3 = jest.spyOn(relation.getRelated(), '$newInstance');

    const spy4 = jest.spyOn(model, '$setAttribute');
    const spy5 = jest.spyOn(model, '$save');

    expect(await relation.firstOrCreate(['foo'])).toBeInstanceOf(Model);

    expect(spy1).toBeCalledWith(['foo']);
    expect(spy2).toBeCalledWith();
    expect(spy3).not.toBeCalled();
    expect(spy4).not.toBeCalled();
    expect(spy5).not.toBeCalled();

  });
  it('first or create method with values finds first model', async () => {
    const relation = getOneRelation();
    const model    = new Model();

    const spy1 = jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());
    const spy2 = jest.spyOn(relation.getQuery(), 'first').mockReturnValue(Promise.resolve(model));
    const spy3 = jest.spyOn(relation.getRelated(), '$newInstance');

    const spy4 = jest.spyOn(model, '$setAttribute');
    const spy5 = jest.spyOn(model, '$save');

    expect(await relation.firstOrCreate({
      'foo': 'bar'
    }, {
      'baz': 'qux'
    })).toBeInstanceOf(Model);

    expect(spy1).toBeCalledWith({
      'foo': 'bar'
    });
    expect(spy2).toBeCalledWith();
    expect(spy3).not.toBeCalled();
    expect(spy4).not.toBeCalled();
    expect(spy5).not.toBeCalled();
  });

  it('first or create method creates new morph model', async () => {
    const relation = getOneRelation();
    const model    = new Model();

    const spy1 = jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());
    const spy2 = jest.spyOn(relation.getQuery(), 'first').mockReturnValue(Promise.resolve(null));
    const spy3 = jest.spyOn(relation.getRelated(), '$newInstance').mockReturnValue(model);

    const spy4 = jest.spyOn(model, '$setAttribute');
    const spy5 = jest.spyOn(model, '$save').mockReturnValue(Promise.resolve(true));

    expect(await relation.firstOrCreate({foo: 'foo'})).toBeInstanceOf(Model);

    expect(spy1).toBeCalledWith({foo: 'foo'});
    expect(spy2).toBeCalledWith();
    expect(spy3).toBeCalledWith({foo: 'foo'});
    expect(spy4).toHaveBeenNthCalledWith(1, 'morph_id', 1);
    expect(spy4).toHaveBeenNthCalledWith(2, 'morph_type', 'parent-model');
    expect(spy5).toBeCalled();
  });

  it('first or create method with values creates new morph model', async () => {
    const relation = getOneRelation();
    const model    = new Model();
    const spy1     = jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());
    const spy2     = jest.spyOn(relation.getQuery(), 'first').mockReturnValue(null);
    const spy3     = jest.spyOn(relation.getRelated(), '$newInstance').mockReturnValue(model);

    const spy4 = jest.spyOn(model, '$setAttribute');
    const spy5 = jest.spyOn(model, '$save').mockReturnValue(Promise.resolve(true));

    expect(await relation.firstOrCreate({
      'foo': 'bar'
    }, {
      'baz': 'qux'
    })).toBeInstanceOf(Model);

    expect(spy1).toBeCalledWith({'foo': 'bar'});
    expect(spy2).toBeCalledWith();
    expect(spy3).toBeCalledWith({
      'foo': 'bar',
      'baz': 'qux'
    });
    expect(spy4).toBeCalledWith('morph_id', 1);
    expect(spy4).toBeCalledWith('morph_type', 'parent-model');
    expect(spy5).toBeCalled();
  });

  it('update or create method finds first model and updates', async() => {
    const relation = getOneRelation();

    const model = new Model();
    const spy1  = jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());
    const spy2  = jest.spyOn(relation.getQuery(), 'first').mockReturnValue(Promise.resolve(model));
    const spy3  = jest.spyOn(relation.getRelated(), '$newInstance');

    const spy4 = jest.spyOn(model, '$setAttribute');
    const spy5 = jest.spyOn(model, '$fill').mockReturnValue(null);
    const spy6 = jest.spyOn(model, '$save').mockReturnValue(null);

    expect(await relation.updateOrCreate({foo: 'foo'}, {bar: 'bar'})).toBeInstanceOf(Model);

    expect(spy1).toBeCalledWith({foo: 'foo'});
    expect(spy2).toBeCalledWith();
    expect(spy3).not.toBeCalled();
    expect(spy4).not.toBeCalled();
    expect(spy5).toBeCalledWith({bar: 'bar'});
    expect(spy6).toBeCalled();
  });

  it('update or create method creates new morph model', async() => {
    const relation = getOneRelation();

    const model = new Model();
    const spy1  = jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());
    const spy2  = jest.spyOn(relation.getQuery(), 'first').mockReturnValue(null);
    const spy3  = jest.spyOn(relation.getRelated(), '$newInstance').mockReturnValue(model);

    const spy4 = jest.spyOn(model, '$setAttribute');
    const spy5 = jest.spyOn(model, '$save').mockReturnValue(Promise.resolve(true));
    const spy6 = jest.spyOn(model, '$fill').mockReturnValue(null);

    expect(await relation.updateOrCreate({foo: 'foo'}, {bar: 'bar'})).toBeInstanceOf(Model);

    expect(spy1).toBeCalledWith({foo: 'foo'});
    expect(spy2).toBeCalledWith();
    expect(spy3).toBeCalledWith({foo: 'foo'});
    expect(spy4).toBeCalledWith('morph_id', 1);
    expect(spy4).toBeCalledWith('morph_type', 'parent-model');
    expect(spy5).toBeCalled();
    expect(spy6).toBeCalledWith({bar: 'bar'});
  });

  it('create function on namespaced morph', async () => {
    const relation = getNamespacedRelation('namespace');
    const created  = new Model();

    const spy1 = jest.spyOn(created, '$setAttribute');
    const spy2 = jest.spyOn(relation.getRelated(), '$newInstance').mockReturnValue(created);
    const spy3 = jest.spyOn(created, '$save').mockReturnValue(Promise.resolve(true));

    expect(await relation.create({
      'name': 'taylor'
    })).toEqual(created);

    expect(spy1).toBeCalledWith('morph_id', 1);
    expect(spy1).toBeCalledWith('morph_type', 'namespace');
    expect(spy2).toBeCalledWith({
      'name': 'taylor'
    });
    expect(spy3).toBeCalled();
  });

});

export class EloquentMorphResetModelStub extends Model {
}

class EloquentModelNamespacedStub extends Model {
}
