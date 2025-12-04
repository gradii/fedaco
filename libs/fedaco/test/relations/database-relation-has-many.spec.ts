import { isArray } from '@gradii/nanofn';
import { Column } from '../../src/annotation/column/column';
import { Model } from '../../src/fedaco/model';
import { HasMany } from '../../src/fedaco/relations/has-many';
import { Relation } from '../../src/fedaco/relations/relation';
import { getBuilder } from './relation-testing-helper';

let builder, related;

function getRelation(): HasMany {
  builder = getBuilder();
  // builder.shouldReceive('whereNotNull')._with('table.foreign_key');
  // builder.shouldReceive('where')._with('table.foreign_key', '=', 1);
  related = new Model();
  jest.spyOn(builder, 'getModel').mockReturnValue(related);
  // @ts-ignore
  builder._model = related;
  const parent = new Model();
  jest.spyOn(parent, 'GetAttribute').mockReturnValue(1);
  jest.spyOn(parent, 'GetCreatedAtColumn').mockReturnValue('created_at');
  jest.spyOn(parent, 'GetUpdatedAtColumn').mockReturnValue('updated_at');
  return new HasMany(builder, parent, '_table.foreign_key', 'id');
}

function expectNewModel(relation: Relation, attributes: Record<string, any>) {
  const model = new Model();
  model._fillable = ['name'];
  jest.spyOn(relation.getRelated(), 'SetAttribute').mockImplementation(
    // @ts-ignore
    (key: string, value: any) => {
      expect(key).toEqual('foreign_key');
      expect(value).toEqual(1);
    }
  );
  jest.spyOn(relation.getRelated(), 'NewInstance').mockImplementation((...args: any[]) => {
    // expect(args[0]).toEqual(attributes);
    return model;
  });
  return model;
}

function expectCreatedModel(relation: Relation, attributes: Record<string, any>) {
  const model = expectNewModel(relation, attributes);
  // model.expects(this.once()).method('save');
  jest.spyOn(model, 'Save').mockImplementation((...args: any[]) => {
    return Promise.resolve(true);
  });
  return model;
}

describe('test database fedaco has many', () => {
  it('find or new method finds model', async () => {
    const relation = getRelation();

    class dummy {
      setAttribute() {}
    }

    const model = new dummy();
    // @ts-ignore
    const spy1 = jest.spyOn(relation.getQuery(), 'find').mockReturnValue(model);
    const spy2 = jest.spyOn(model, 'setAttribute');
    expect(await relation.findOrNew('foo')).toBeInstanceOf(dummy);

    expect(spy1).toHaveBeenCalledWith('foo', ['*']);
    expect(spy2).not.toHaveBeenCalled();
  });

  it('find or new method returns new model with foreign key set', async () => {
    const relation = getRelation();

    class dummy {
      SetAttribute() {}
    }

    const model = new dummy();
    const spy1 = jest.spyOn(relation.getQuery(), 'find').mockReturnValue(null);
    // @ts-ignore
    const spy2 = jest.spyOn(relation.getRelated(), 'NewInstance').mockReturnValue(model);
    const spy3 = jest.spyOn(model, 'SetAttribute');
    expect(await relation.findOrNew('foo')).toBeInstanceOf(dummy);

    expect(spy1).toHaveBeenCalledWith('foo', ['*']);
    expect(spy3).toHaveBeenCalledWith('foreign_key', 1);
  });

  it('first or new method finds first model', async () => {
    const relation = getRelation();

    class dummy {
      setAttribute() {}
    }

    const model = new dummy();
    const spy1 = jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());
    // @ts-ignore
    const spy2 = jest.spyOn(relation.getQuery(), 'first').mockReturnValue(model);
    const spy3 = jest.spyOn(model, 'setAttribute');
    expect(await relation.firstOrNew(['foo'])).toBeInstanceOf(dummy);

    expect(spy1).toHaveBeenCalledWith(['foo']);
    expect(spy3).not.toHaveBeenCalled();
  });

  it('first or new method with values finds first model', async () => {
    const relation = getRelation();

    class dummy {
      setAttribute() {}
    }

    const model = new dummy();
    const spy1 = jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());
    // @ts-ignore
    const spy2 = jest.spyOn(relation.getQuery(), 'first').mockReturnValue(model);
    const spy22 = jest.spyOn(relation.getRelated(), 'NewInstance');
    const spy3 = jest.spyOn(model, 'setAttribute');
    expect(
      await relation.firstOrNew(
        {
          foo: 'bar',
        },
        {
          baz: 'qux',
        }
      )
    ).toBeInstanceOf(dummy);

    expect(spy1).toHaveBeenCalledWith({
      foo: 'bar',
    });
    expect(spy3).not.toHaveBeenCalled();
    expect(spy22).not.toHaveBeenCalled();
  });

  it('first or new method returns new model with foreign key set', async () => {
    const relation = getRelation();
    // @ts-ignore
    const spy1 = jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());
    jest.spyOn(relation.getQuery(), 'first').mockReturnValue(null);
    const model = expectNewModel(relation, { foo: 'foo' });
    expect(await relation.firstOrNew({ foo: 'foo' })).toEqual(model);

    expect(spy1).toHaveBeenCalledWith({ foo: 'foo' });
  });

  it('first or new method with values creates new model with foreign key set', async () => {
    const relation = getRelation();
    const spy1 = jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());
    const spy2 = jest.spyOn(relation.getQuery(), 'first').mockReturnValue(null);
    const model = expectNewModel(relation, {
      foo: 'bar',
      baz: 'qux',
    });
    expect(
      await relation.firstOrNew(
        {
          foo: 'bar',
        },
        {
          baz: 'qux',
        }
      )
    ).toEqual(model);

    expect(spy1).toHaveBeenCalledWith({
      foo: 'bar',
    });
    expect(spy2).toHaveBeenCalledWith();
  });

  it('first or create method finds first model', async () => {
    const relation = getRelation();
    const spy1 = jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());

    class dummy {
      SetAttribute() {}

      Save() {}
    }

    const model = new dummy();
    // @ts-ignore
    const spy2 = jest.spyOn(relation.getQuery(), 'first').mockReturnValue(Promise.resolve(model));
    const spy5 = jest.spyOn(relation.getRelated(), 'NewInstance');
    const spy3 = jest.spyOn(model, 'SetAttribute');
    const spy4 = jest.spyOn(model, 'Save');
    expect(await relation.firstOrCreate(['foo'])).toBeInstanceOf(dummy);
    expect(spy1).toHaveBeenCalledWith(['foo']);

    expect(spy3).not.toHaveBeenCalled();
    expect(spy4).not.toHaveBeenCalled();
    expect(spy5).not.toHaveBeenCalled();
  });

  it('first or create method with values finds first model', async () => {
    const relation = getRelation();
    const spy1 = jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());

    const model = new Model();
    jest.spyOn(relation.getQuery(), 'first').mockReturnValue(Promise.resolve(model));
    const spy2 = jest.spyOn(relation.getRelated(), 'NewInstance');
    const spy5 = jest.spyOn(relation.getRelated(), 'NewInstance');

    const spy3 = jest.spyOn(model, 'SetAttribute');
    const spy4 = jest.spyOn(model, 'Save');
    expect(
      await relation.firstOrCreate(
        {
          foo: 'bar',
        },
        {
          baz: 'qux',
        }
      )
    ).toBeInstanceOf(Model);
    expect(spy1).toHaveBeenCalledWith({
      foo: 'bar',
    });
    expect(spy2).not.toHaveBeenCalled();
    expect(spy3).not.toHaveBeenCalled();
    expect(spy4).not.toHaveBeenCalled();
    expect(spy5).not.toHaveBeenCalled();
  });

  it('first or create method creates new model with foreign key set', async () => {
    const relation = getRelation();
    jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());
    jest.spyOn(relation.getQuery(), 'first').mockReturnValue(null);
    // relation.getQuery().shouldReceive('where').once()._with(['foo']).andReturn(relation.getQuery());
    // relation.getQuery().shouldReceive('first').once()._with().andReturn(null);
    const model = expectCreatedModel(relation, { foo: 'foo' });
    expect(await relation.firstOrCreate({ foo: 'foo' })).toEqual(model);
  });

  it('first or create method with values creates new model with foreign key set', async () => {
    const relation = getRelation();
    // relation.getQuery().shouldReceive('where').once()._with({
    //   'foo': 'bar'
    // }).andReturn(relation.getQuery());
    const spy1 = jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());
    const spy2 = jest.spyOn(relation.getQuery(), 'first').mockReturnValue(null);

    // relation.getQuery().shouldReceive('first').once()._with().andReturn(null);
    const model = expectCreatedModel(relation, {
      foo: 'bar',
      baz: 'qux',
    });
    expect(
      await relation.firstOrCreate(
        {
          foo: 'bar',
        },
        {
          baz: 'qux',
        }
      )
    ).toEqual(model);
  });

  it('update or create method finds first model and updates', async () => {
    const relation = getRelation();

    const model = new Model();
    const spy1 = jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());
    const spy2 = jest.spyOn(relation.getQuery(), 'first').mockReturnValue(Promise.resolve(model));

    // relation.getQuery().shouldReceive('where').once()._with(['foo']).andReturn(relation.getQuery());
    // relation.getQuery().shouldReceive('first').once()._with().andReturn(model = m.mock(stdClass));
    // relation.getRelated().shouldReceive('newInstance').never();
    const spy5 = jest.spyOn(relation.getRelated(), 'NewInstance');
    const spy6 = jest.spyOn(model, 'Fill').mockReturnValue(model);
    jest.spyOn(model, 'Save').mockReturnValue(Promise.resolve(true));
    // model.shouldReceive('fill').once()._with(['bar']);
    // model.shouldReceive('save').once();
    expect(await relation.updateOrCreate({ foo: 'foo' }, { bar: 'bar' })).toBeInstanceOf(Model);
    expect(spy5).not.toHaveBeenCalled();
    expect(spy6).toHaveBeenCalledWith({ bar: 'bar' });
  });

  it('update or create method creates new model with foreign key set', async () => {
    const relation = getRelation();

    const model = new Model();
    const spy1 = jest.spyOn(relation.getQuery(), 'where').mockReturnValue(relation.getQuery());
    const spy2 = jest.spyOn(relation.getQuery(), 'first').mockReturnValue(null);
    const spy3 = jest.spyOn(relation.getRelated(), 'NewInstance').mockReturnValue(model);

    // relation.getQuery().shouldReceive('where').once()._with(['foo']).andReturn(relation.getQuery());
    // relation.getQuery().shouldReceive('first').once()._with().andReturn(model = m.mock(stdClass));
    // relation.getRelated().shouldReceive('newInstance').never();
    const spy10 = jest.spyOn(relation.getRelated(), 'NewInstance');
    const spy4 = jest.spyOn(model, 'Save').mockReturnValue(Promise.resolve(true));
    const spy5 = jest.spyOn(model, 'Fill').mockReturnValue(model);
    const spy6 = jest.spyOn(model, 'SetAttribute');
    // model.shouldReceive('fill').once()._with(['bar']);
    // model.shouldReceive('save').once();
    expect(await relation.updateOrCreate({ foo: 'foo' }, { bar: 'bar' })).toBeInstanceOf(Model);

    expect(spy5).toHaveBeenCalledWith({ bar: 'bar' });
    expect(spy6).toHaveBeenCalledWith('foreign_key', 1);
    expect(spy10).toHaveBeenCalledWith({ foo: 'foo' });
  });

  it('relation is properly initialized', () => {
    const relation = getRelation();
    const model = new Model();
    const spy1 = jest.spyOn(model, 'SetRelation');
    const models = relation.initRelation([model], 'foo');
    expect(models).toEqual([model]);
    expect(spy1).toHaveBeenCalledWith('foo', []);
  });

  it('eager constraints are properly added', () => {
    const relation = getRelation();

    const spy1 = jest.spyOn(relation.getParent(), 'GetKeyName').mockReturnValue('id');
    const spy2 = jest.spyOn(relation.getParent(), 'GetKeyType').mockReturnValue('int');
    const spy3 = jest.spyOn(relation.getQuery(), 'whereIntegerInRaw');

    // relation.getParent().shouldReceive('getKeyName').once().andReturn('id');
    // relation.getParent().shouldReceive('getKeyType').once().andReturn('int');
    // relation.getQuery().shouldReceive('whereIntegerInRaw').once()._with('table.foreign_key',
    //   [1, 2]);
    const model1 = new EloquentHasManyModelStub();
    model1.id = 1;
    const model2 = new EloquentHasManyModelStub();
    model2.id = 2;
    relation.addEagerConstraints([model1, model2]);
    expect(spy3).toHaveBeenCalledWith('_table.foreign_key', [1, 2]);
  });

  it('eager constraints are properly added with string key', () => {
    const relation = getRelation();

    const spy1 = jest.spyOn(relation.getParent(), 'GetKeyName').mockReturnValue('id');
    const spy2 = jest.spyOn(relation.getParent(), 'GetKeyType').mockReturnValue('string');
    const spy3 = jest.spyOn(relation.getQuery(), 'whereIn');

    const model1 = new EloquentHasManyModelStub();
    model1.id = 1;
    const model2 = new EloquentHasManyModelStub();
    model2.id = 2;
    relation.addEagerConstraints([model1, model2]);

    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalledWith('_table.foreign_key', [1, 2]);
  });

  it('models are properly matched to parents', async () => {
    const relation = getRelation();
    const result1 = new EloquentHasManyModelStub();
    result1.foreign_key = 1;
    const result2 = new EloquentHasManyModelStub();
    result2.foreign_key = 2;
    const result3 = new EloquentHasManyModelStub();
    result3.foreign_key = 2;
    const model1 = new EloquentHasManyModelStub();
    model1.id = 1;
    const model2 = new EloquentHasManyModelStub();
    model2.id = 2;
    const model3 = new EloquentHasManyModelStub();
    model3.id = 3;
    const models = relation.match([model1, model2, model3], [result1, result2, result3], 'foo');
    await models[0].foo;
    await models[1].foo;
    await models[2].foo;
    expect(models[0].foo[0].foreign_key).toEqual(1);
    expect(models[0].foo).toHaveLength(1);
    expect(models[1].foo[0].foreign_key).toEqual(2);
    expect(models[1].foo[1].foreign_key).toEqual(2);
    expect(models[1].foo).toHaveLength(2);
    expect(models[2].foo).toBeUndefined();
  });

  it('create many creates a related model for each record', async () => {
    const records = [
      {
        name: 'taylor',
      },
      {
        name: 'colin',
      },
    ];
    const relation = getRelation();
    const spy1 = jest.spyOn(relation.getRelated(), 'NewCollection').mockReturnValue([]);
    const jack = expectCreatedModel(relation, {
      name: 'jack',
    });
    const rowe = expectCreatedModel(relation, {
      name: 'rowe',
    });
    const instances = await relation.createMany(records);
    expect(isArray(instances)).toBeTruthy();
    expect(instances[0].GetAttribute('foreign_key')).toBe(1);
    expect(instances[1].GetAttribute('foreign_key')).toBe(1);

    expect(spy1).toHaveBeenCalled();
  });
});

export class EloquentHasManyModelStub extends Model {
  @Column()
  public foreign_key: any = 'foreign.value';

  @Column()
  public id: string | number;

  @Column()
  public foo: string;
}
