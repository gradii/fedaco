import { format } from 'date-fns';
import { Column } from '../../src/annotation/column/column';
import { Model } from '../../src/fedaco/model';
import { HasOne } from '../../src/fedaco/relations/has-one';
import { Relation } from '../../src/fedaco/relations/relation';
import { getBuilder } from './relation-testing-helper';

describe('test database fedaco relation', () => {
  it('set relation fail', () => {
    const parent = new EloquentRelationResetModelStub();
    const relation = new EloquentRelationResetModelStub();
    parent.SetRelation('test', relation);
    parent.SetRelation('foo', 'bar');
    expect(parent.ToArray()).not.toHaveProperty('foo');
  });

  it('unset existing relation', () => {
    const parent = new EloquentRelationResetModelStub();
    const relation = new EloquentRelationResetModelStub();
    parent.SetRelation('foo', relation);
    parent.UnsetRelation('foo');
    expect(parent.RelationLoaded('foo')).toBeFalsy();
  });

  it('touch method updates related timestamps', async () => {
    const builder = getBuilder();
    const parent = new Model();
    const spy1 = jest.spyOn(parent, 'GetAttribute').mockReturnValue(1);
    // parent.shouldReceive('getAttribute')._with('id').andReturn(1);
    const related = new EloquentNoTouchingModelStub();
    const spy2 = jest.spyOn(builder, 'getModel').mockReturnValue(related);
    // @ts-ignore
    builder._model = related;
    const spy3 = jest.spyOn(builder, 'whereNotNull');
    const spy4 = jest.spyOn(builder, 'where');
    const spy5 = jest.spyOn(builder, 'withoutGlobalScopes').mockReturnValue(builder);
    const relation = new HasOne(builder, parent, 'foreign_key', 'id');
    const spy6 = jest.spyOn(related, 'GetTable').mockReturnValue('table');
    const spy7 = jest.spyOn(related, 'GetUpdatedAtColumn').mockReturnValue('updated_at');
    const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const spy8 = jest.spyOn(related, 'FreshTimestampString').mockReturnValue(now);

    const spy9 = jest.spyOn(builder, 'update').mockReturnValue(Promise.resolve());

    await relation.Touch();
    expect(spy9).toHaveBeenCalledWith({ updated_at: now });
  });

  it('can disable parent touching for all models', async () => {
    const related = new EloquentNoTouchingModelStub();
    const spy1 = jest.spyOn(related, 'GetUpdatedAtColumn').mockReturnValue('updated_at');
    const spy2 = jest.spyOn(related, 'FreshTimestampString').mockReturnValue('');
    expect(EloquentNoTouchingModelStub.isIgnoringTouch()).toBeFalsy();
    await Model.withoutTouching(async () => {
      expect(EloquentNoTouchingModelStub.isIgnoringTouch()).toBeTruthy();
      const builder = getBuilder();
      const parent = new Model();
      const spy11 = jest.spyOn(parent, 'GetAttribute').mockReturnValue(1);
      const spy2 = jest.spyOn(builder, 'getModel').mockReturnValue(related);
      // @ts-ignore
      builder._model = related;
      const spy3 = jest.spyOn(builder, 'whereNotNull');
      const spy4 = jest.spyOn(builder, 'where');
      const spy5 = jest.spyOn(builder, 'withoutGlobalScopes').mockReturnValue(builder);

      const relation = new HasOne(builder, parent, 'foreign_key', 'id');

      const spy6 = jest.spyOn(builder, 'update');
      await relation.Touch();

      expect(spy11).toHaveBeenCalledWith('id');
      expect(spy6).not.toHaveBeenCalled();
    });
    expect(EloquentNoTouchingModelStub.isIgnoringTouch()).toBeFalsy();

    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
  });

  it('can disable touching for specific model', async () => {
    const related = new EloquentNoTouchingModelStub();
    const spy1 = jest.spyOn(related, 'GetUpdatedAtColumn');
    const spy2 = jest.spyOn(related, 'FreshTimestampString');
    const anotherRelated = new EloquentNoTouchingAnotherModelStub();
    expect(EloquentNoTouchingModelStub.isIgnoringTouch()).toBeFalsy();
    expect(EloquentNoTouchingAnotherModelStub.isIgnoringTouch()).toBeFalsy();
    await EloquentNoTouchingModelStub.withoutTouching(async () => {
      expect(EloquentNoTouchingModelStub.isIgnoringTouch()).toBeTruthy();
      expect(EloquentNoTouchingAnotherModelStub.isIgnoringTouch()).toBeFalsy();
      const builder = getBuilder();
      const parent = new Model();
      const spy10 = jest.spyOn(parent, 'GetAttribute').mockReturnValue(1);
      const spy11 = jest.spyOn(builder, 'getModel').mockReturnValue(related);
      // @ts-ignore
      builder._model = related;
      const spy12 = jest.spyOn(builder, 'whereNotNull');
      const spy13 = jest.spyOn(builder, 'where');
      const spy14 = jest.spyOn(builder, 'withoutGlobalScopes').mockReturnThis();

      const relation = new HasOne(builder, parent, 'foreign_key', 'id');
      const spy15 = jest.spyOn(builder, 'update');
      await relation.Touch();

      expect(spy15).not.toHaveBeenCalled();

      const anotherBuilder = getBuilder();
      const anotherParent = new Model();

      const spy16 = jest.spyOn(anotherParent, 'GetAttribute').mockReturnValue(2);
      const spy17 = jest.spyOn(anotherBuilder, 'getModel').mockReturnValue(anotherRelated);
      // @ts-ignore
      anotherBuilder._model = anotherRelated;

      const spy18 = jest.spyOn(anotherBuilder, 'whereNotNull');
      const spy19 = jest.spyOn(anotherBuilder, 'where');
      const spy20 = jest.spyOn(anotherBuilder, 'withoutGlobalScopes').mockReturnThis();

      const anotherRelation = new HasOne(anotherBuilder, anotherParent, 'foreign_key', 'id');
      const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

      const spy21 = jest.spyOn(anotherRelated, 'FreshTimestampString').mockReturnValue(now);
      const spy22 = jest.spyOn(anotherBuilder, 'update').mockReturnValue(Promise.resolve(true));

      await anotherRelation.Touch();

      expect(spy10).toHaveBeenCalledWith('id');
      expect(spy16).toHaveBeenCalledWith('id');
      expect(spy22).toHaveBeenCalledWith({
        updated_at: now,
      });
    });

    expect(EloquentNoTouchingModelStub.isIgnoringTouch()).toBeFalsy();
    expect(EloquentNoTouchingAnotherModelStub.isIgnoringTouch()).toBeFalsy();

    expect(spy1).not.toHaveBeenCalled();
  });

  it('parent model is not touched when child model is ignored', async () => {
    const related = new EloquentNoTouchingModelStub();
    const spy1 = jest.spyOn(related, 'GetUpdatedAtColumn');
    const spy2 = jest.spyOn(related, 'FreshTimestampString');

    const relatedChild = new EloquentNoTouchingChildModelStub();

    const spy3 = jest.spyOn(relatedChild, 'GetUpdatedAtColumn');
    const spy4 = jest.spyOn(relatedChild, 'FreshTimestampString');
    expect(await EloquentNoTouchingModelStub.isIgnoringTouch()).toBeFalsy();
    expect(await EloquentNoTouchingChildModelStub.isIgnoringTouch()).toBeFalsy();

    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
    expect(spy3).not.toHaveBeenCalled();
    expect(spy4).not.toHaveBeenCalled();

    await EloquentNoTouchingModelStub.withoutTouching(async () => {
      expect(await EloquentNoTouchingModelStub.isIgnoringTouch()).toBeTruthy();
      expect(await EloquentNoTouchingChildModelStub.isIgnoringTouch()).toBeTruthy();
      const builder = getBuilder();
      const parent = new Model();

      const spy11 = jest.spyOn(parent, 'GetAttribute').mockReturnValue(1);
      const spy12 = jest.spyOn(builder, 'getModel').mockReturnValue(related);
      // @ts-ignore
      builder._model = related;
      const spy13 = jest.spyOn(builder, 'whereNotNull');
      const spy14 = jest.spyOn(builder, 'where');
      const spy15 = jest.spyOn(builder, 'withoutGlobalScopes').mockReturnThis();

      // parent.shouldReceive('getAttribute')._with('id').andReturn(1);
      // builder.shouldReceive('whereNotNull');
      // builder.shouldReceive('where');
      // builder.shouldReceive('withoutGlobalScopes').andReturnSelf();
      const relation = new HasOne(builder, parent, 'foreign_key', 'id');
      const spy16 = jest.spyOn(builder, 'update');

      // builder.shouldReceive('update').never();
      await relation.Touch();
      expect(spy11).toHaveBeenCalledWith('id');
      expect(spy16).not.toHaveBeenCalled();

      const anotherBuilder = getBuilder();
      const anotherParent = new Model();

      const spy17 = jest.spyOn(anotherParent, 'GetAttribute').mockReturnValue(2);
      const spy18 = jest.spyOn(anotherBuilder, 'getModel').mockReturnValue(relatedChild);
      // @ts-ignore
      anotherBuilder._model = relatedChild;
      const spy19 = jest.spyOn(anotherBuilder, 'whereNotNull');
      const spy20 = jest.spyOn(anotherBuilder, 'where');
      const spy21 = jest.spyOn(anotherBuilder, 'withoutGlobalScopes').mockReturnThis();

      const anotherRelation = new HasOne(anotherBuilder, anotherParent, 'foreign_key', 'id');
      const spy22 = jest.spyOn(anotherBuilder, 'update');
      await anotherRelation.Touch();

      expect(spy17).toHaveBeenCalledWith('id');
      expect(spy22).not.toHaveBeenCalled();
    });
    expect(await EloquentNoTouchingModelStub.isIgnoringTouch()).toBeFalsy();
    expect(await EloquentNoTouchingChildModelStub.isIgnoringTouch()).toBeFalsy();
  });

  xit('ignored models state is reset when there are exceptions', async () => {
    const related = new EloquentNoTouchingModelStub();
    const spy = jest.spyOn(related, 'GetUpdatedAtColumn');
    const spy2 = jest.spyOn(related, 'FreshTimestampString');
    const relatedChild = new EloquentNoTouchingChildModelStub();
    const spy3 = jest.spyOn(relatedChild, 'GetUpdatedAtColumn');
    const spy4 = jest.spyOn(relatedChild, 'FreshTimestampString');
    expect(await EloquentNoTouchingModelStub.isIgnoringTouch()).toBeFalsy();
    expect(await EloquentNoTouchingChildModelStub.isIgnoringTouch()).toBeFalsy();
    expect(() => {
      EloquentNoTouchingModelStub.withoutTouching(() => {
        expect(EloquentNoTouchingModelStub.isIgnoringTouch()).toBeTruthy();
        expect(EloquentNoTouchingChildModelStub.isIgnoringTouch()).toBeTruthy();
        throw new Error();
      });
    }).not.toThrow('Exception was not thrown');
    expect(EloquentNoTouchingModelStub.isIgnoringTouch()).toBeFalsy();
    expect(EloquentNoTouchingChildModelStub.isIgnoringTouch()).toBeFalsy();
  });

  it('setting morph map with numeric array uses the table names', () => {
    Relation.morphMap([EloquentRelationResetModelStub]);
    expect(Relation.morphMap()).toEqual({
      reset: EloquentRelationResetModelStub,
    });
    Relation.morphMap([], false);
  });

  it('setting morph map with numeric keys', () => {
    Relation.morphMap({
      1: 'App\\User',
    });
    expect(Relation.morphMap()).toEqual({
      1: 'App\\User',
    });
    Relation.morphMap([], false);
  });

  it('without relations', async () => {
    const original = new EloquentNoTouchingModelStub();
    original.SetRelation('foo', 'baz');
    expect(original.GetRelation('foo')).toBe('baz');
    let model = await original.WithoutRelations();
    expect(model).toBeInstanceOf(EloquentNoTouchingModelStub);
    expect(original.RelationLoaded('foo')).toBeTruthy();
    expect(model.RelationLoaded('foo')).toBeFalsy();
    model = original.UnsetRelations();
    expect(model).toBeInstanceOf(EloquentNoTouchingModelStub);
    expect(original.RelationLoaded('foo')).toBeFalsy();
    expect(model.RelationLoaded('foo')).toBeFalsy();
  });

  // it('macroable', () => {
  //   Relation.macro('foo', () => {
  //     return 'foo';
  //   });
  //   const model    = new EloquentRelationResetModelStub();
  //   const relation = new EloquentRelationStub(model.newQuery(), model);
  //   const result   = relation.foo();
  //   expect(result).toBe('foo');
  // });

  // it('relation resolvers', () => {
  //   const model   = new EloquentRelationResetModelStub();
  //   const builder = getBuilder();
  //   const spy1    = jest.spyOn(builder, 'getModel').mockReturnValue(model);
  //   EloquentRelationResetModelStub.resolveRelationUsing('customer', model => {
  //     return new EloquentResolverRelationStub(builder, model);
  //   });
  //   expect(model.customer()).toBeInstanceOf(EloquentResolverRelationStub);
  //   expect(model.customer).toEqual({
  //     'key': 'value'
  //   });
  // });
});

export class EloquentRelationResetModelStub extends Model {
  _table: any = 'reset';

  public getQuery() {
    return this.NewQuery().getQuery();
  }
}

export class EloquentRelationStub extends Relation {
  public addConstraints() {}

  public addEagerConstraints(models: Model[]) {}

  // public initRelation(models, relation) {
  // }
  //
  // public match(models, results, relation) {
  // }
  //
  // public getResults() {
  // }
}

export class EloquentNoTouchingModelStub extends Model {
  _table: any = '_table';
  protected attributes: any = {
    id: 1,
  };
}

export class EloquentNoTouchingChildModelStub extends EloquentNoTouchingModelStub {}

export class EloquentNoTouchingAnotherModelStub extends Model {
  _table: any = 'another_table';

  @Column()
  id = 2;
}

export class EloquentResolverRelationStub extends EloquentRelationStub {
  // @ts-ignore
  public async getResults() {
    return {
      key: 'value',
    };
  }
}
