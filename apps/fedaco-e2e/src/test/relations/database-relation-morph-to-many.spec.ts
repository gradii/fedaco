import { QueryBuilder } from './../../src/query-builder/query-builder';
import { FedacoBuilder } from '../../src/fedaco/fedaco-builder';
import { Model } from '../../src/fedaco/model';
import { MorphToMany } from '../../src/fedaco/relations/morph-to-many';
import { getBuilder } from './relation-testing-helper';
import { PrimaryColumn } from '../../src/annotation/column/primary.column';

function getRelationArguments() {
  const parent = new Model();
  jest.spyOn(parent, 'GetMorphClass').mockReturnValue(parent.constructor.name);
  jest.spyOn(parent, 'GetKey').mockReturnValue(1);
  jest.spyOn(parent, 'GetCreatedAtColumn').mockReturnValue('created_at');
  jest.spyOn(parent, 'GetUpdatedAtColumn').mockReturnValue('updated_at');
  jest.spyOn(parent, 'GetAttribute').mockReturnValue(1);

  const builder = getBuilder();
  const related = new Model();

  jest.spyOn(builder, 'getModel').mockReturnValue(related);
  jest.spyOn(related, 'GetTable').mockReturnValue('tags');
  jest.spyOn(related, 'GetKeyName').mockReturnValue('id');
  jest.spyOn(related, 'GetMorphClass').mockReturnValue(related.constructor.name);

  return [builder, parent, 'taggable', 'taggables', 'taggable_id', 'tag_id', 'id', 'id', 'relation_name', false];
}

function getRelation() {
  const [builder, parent] = getRelationArguments();
  return new MorphToMany(
    builder as FedacoBuilder,
    parent as Model,
    'taggable',
    'taggables',
    'taggable_id',
    'tag_id',
    'id',
    'id',
  );
}

describe('test database fedaco morph to many', () => {
  it('eager constraints are properly added', () => {
    const relation = getRelation();

    const spy1 = jest.spyOn(relation.getParent(), 'GetKeyName').mockReturnValue('id');
    const spy2 = jest.spyOn(relation.getParent(), 'GetKeyType').mockReturnValue('int');
    const spy3 = jest.spyOn(relation.getQuery(), 'whereIntegerInRaw');
    const spy4 = jest.spyOn(relation.getQuery(), 'where');

    const model1 = new EloquentMorphToManyModelStub();
    model1.id = 1;
    const model2 = new EloquentMorphToManyModelStub();
    model2.id = 2;

    relation.addEagerConstraints([model1, model2]);

    expect(spy3).toHaveBeenCalledWith('taggables.taggable_id', [1, 2]);
    expect(spy4).toHaveBeenCalledWith('taggables.taggable_type', relation.getParent().constructor.name);
  });

  it('attach inserts pivot table record', async () => {
    const args = getRelationArguments();
    const relation = new MorphToMany(
      args[0] as FedacoBuilder,
      args[1] as Model,
      args[2] as string,
      args[3] as string,
      args[4] as string,
      args[5] as string,
      args[6] as string,
      args[7] as string,
      args[8] as string,
    );
    const query: QueryBuilder = {
      // @ts-ignore
      from  : () => {},
      // @ts-ignore
      insert: () => {},
    };

    const query2: QueryBuilder = {
      // @ts-ignore
      newQuery: () => {},
    };

    const spy1 = jest.spyOn(query, 'from').mockReturnValue(query);
    const spy2 = jest.spyOn(query, 'insert').mockReturnValue(Promise.resolve(true));
    const spy3 = jest.spyOn(relation.getQuery(), 'getQuery').mockReturnValue(query2);
    const spy4 = jest.spyOn(query2, 'newQuery').mockReturnValue(query);
    const spy5 = jest.spyOn(relation, 'touchIfTouching').mockReturnValue(Promise.resolve());

    await relation.attach(2, {
      foo: 'bar',
    });

    expect(spy5).toHaveBeenCalled();

    expect(spy1).toHaveBeenCalledWith('taggables');
    expect(spy2).toHaveBeenCalledWith([
      {
        taggable_id  : 1,
        taggable_type: relation.getParent().constructor.name,
        tag_id       : 2,
        foo          : 'bar',
      },
    ]);
  });

  it('detach removes pivot table record', async () => {
    const args = getRelationArguments();
    const relation = new MorphToMany(
      args[0] as FedacoBuilder,
      args[1] as Model,
      args[2] as string,
      args[3] as string,
      args[4] as string,
      args[5] as string,
      args[6] as string,
      args[7] as string,
      args[8] as string,
    );

    const query: QueryBuilder = {
      // @ts-ignore
      from   : () => {},
      // @ts-ignore
      where  : () => {},
      // @ts-ignore
      whereIn: () => {},
      // @ts-ignore
      delete : () => {},
      // @ts-ignore
      insert : () => {},
    };

    const query2: QueryBuilder = {
      // @ts-ignore
      newQuery: () => {},
    };

    const spy1 = jest.spyOn(query, 'from').mockReturnValue(query);
    // @ts-ignore
    const spy2 = jest.spyOn(query, 'where').mockReturnValue(query);
    const spy3 = jest.spyOn(query, 'whereIn');
    const spy4 = jest.spyOn(query, 'delete').mockReturnValue(true);

    const spy5 = jest.spyOn(relation.getQuery(), 'getQuery').mockReturnValue(query2);
    const spy6 = jest.spyOn(query2, 'newQuery').mockReturnValue(query);
    const spy7 = jest.spyOn(relation, 'touchIfTouching').mockReturnValue(Promise.resolve());

    // query.shouldReceive('from').once()._with('taggables').andReturn(query);
    // query.shouldReceive('where').once()._with('taggable_id', 1).andReturn(query);
    // query.shouldReceive('where').once()._with('taggable_type',
    //   get_class(relation.getParent())).andReturn(query);
    // query.shouldReceive('whereIn').once()._with('tag_id', [1, 2, 3]);
    // query.shouldReceive('delete').once().andReturn(true);
    // relation.getQuery().shouldReceive('getQuery').andReturn(mockQueryBuilder = m.mock(stdClass));
    // mockQueryBuilder.shouldReceive('newQuery').once().andReturn(query);
    // relation.expects(this.once()).method('touchIfTouching');

    expect(await relation.detach([1, 2, 3])).toBeTruthy();

    expect(spy1).toHaveBeenCalledWith('taggables');
    expect(spy2).toHaveBeenNthCalledWith(1, 'taggables.taggable_id', 1);
    expect(spy2).toHaveBeenNthCalledWith(2, 'taggable_type', relation.getParent().constructor.name);

    expect(spy3).toHaveBeenCalledWith('taggables.tag_id', [1, 2, 3]);
    expect(spy4).toHaveBeenCalled();
    expect(spy7).toHaveBeenCalled();
  });

  it('detach method clears all pivot records when no i ds are given', async () => {
    const relation = getRelation();

    const query: QueryBuilder = {
      // @ts-ignore
      from   : () => {},
      // @ts-ignore
      where  : () => {},
      // @ts-ignore
      whereIn: () => {},
      // @ts-ignore
      delete : () => {},
      // @ts-ignore
      insert : () => {},
    };

    const query2: QueryBuilder = {
      // @ts-ignore
      newQuery: () => {},
    };

    const spy1 = jest.spyOn(query, 'from').mockReturnValue(query);
    const spy2 = jest.spyOn(query, 'where').mockReturnValue(query);
    const spy3 = jest.spyOn(query, 'whereIn').mockReturnValue(query);
    const spy4 = jest.spyOn(query, 'delete').mockReturnValue(true);
    const spy5 = jest.spyOn(relation.getQuery(), 'getQuery').mockReturnValue(query2);
    const spy6 = jest.spyOn(query2, 'newQuery').mockReturnValue(query);
    const spy7 = jest.spyOn(relation, 'touchIfTouching').mockReturnValue(Promise.resolve());

    // this('taggables').andReturn(query);
    // query.shouldReceive('where').once()._with('taggable_id', 1).andReturn(query);
    // query.shouldReceive('where').once()._with('taggable_type',
    //   get_class(relation.getParent())).andReturn(query);
    // query.shouldReceive('whereIn').never();
    // query.shouldReceive('from').once()._wi
    // query.shouldReceive('delete').once().andReturn(true);
    // relation.getQuery().shouldReceive('getQuery').andReturn(mockQueryBuilder = m.mock(stdClass));
    // mockQueryBuilder.shouldReceive('newQuery').once().andReturn(query);
    // relation.expects(this.once()).method('touchIfTouching');
    // expect(relation.detach()).toBeTruthy();

    expect(await relation.detach()).toBeTruthy();

    expect(spy1).toHaveBeenCalledWith('taggables');
    expect(spy2).toHaveBeenNthCalledWith(1, 'taggables.taggable_id', 1);
    expect(spy2).toHaveBeenNthCalledWith(2, 'taggable_type', relation.getParent().constructor.name);

    expect(spy3).not.toHaveBeenCalled();
    expect(spy4).toHaveBeenCalledWith();
  });
});

export class EloquentMorphToManyModelStub extends Model {
  _table = 'test_table';
  _guarded: any = [];

  @PrimaryColumn()
  id: number;
}
