import { format } from 'date-fns';
import { Column } from '../../src/annotation/column/column';
import { Model } from '../../src/fedaco/model';
import { HasOne } from '../../src/fedaco/relations/has-one';
import { Relation } from '../../src/fedaco/relations/relation';
import { getBuilder } from './relation-testing-helper';

describe('test database fedaco relation', () => {

  it('set relation fail', () => {
    const parent   = new EloquentRelationResetModelStub();
    const relation = new EloquentRelationResetModelStub();
    parent.$setRelation('test', relation);
    parent.$setRelation('foo', 'bar');
    expect(parent.$toArray()).not.toHaveProperty('foo');
  });

  it('unset existing relation', () => {
    const parent   = new EloquentRelationResetModelStub();
    const relation = new EloquentRelationResetModelStub();
    parent.$setRelation('foo', relation);
    parent.$unsetRelation('foo');
    expect(parent.$relationLoaded('foo')).toBeFalsy();
  });

  it('touch method updates related timestamps', async() => {
    const builder  = getBuilder();
    const parent   = new (Model);
    const spy1     = jest.spyOn(parent, '$getAttribute').mockReturnValue(1);
    // parent.shouldReceive('getAttribute')._with('id').andReturn(1);
    const related  = new (EloquentNoTouchingModelStub);
    const spy2     = jest.spyOn(builder, 'getModel').mockReturnValue(related);
    // @ts-ignore
    builder._model = related;
    const spy3     = jest.spyOn(builder, 'whereNotNull');
    const spy4     = jest.spyOn(builder, 'where');
    const spy5     = jest.spyOn(builder, 'withoutGlobalScopes').mockReturnValue(builder);
    const relation = new HasOne(builder, parent, 'foreign_key', 'id');
    const spy6     = jest.spyOn(related, '$getTable').mockReturnValue('table');
    const spy7     = jest.spyOn(related, '$getUpdatedAtColumn').mockReturnValue('updated_at');
    const now      = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const spy8     = jest.spyOn(related, '$freshTimestampString').mockReturnValue(
      now
    );

    const spy9 = jest.spyOn(builder, 'update').mockReturnValue(Promise.resolve());

    await relation.$touch();
    expect(spy9).toBeCalledWith({'updated_at': now});
  });

  it('can disable parent touching for all models', async () => {
    const related = new EloquentNoTouchingModelStub();
    const spy1    = jest.spyOn(related, '$getUpdatedAtColumn').mockReturnValue('updated_at');
    const spy2    = jest.spyOn(related, '$freshTimestampString').mockReturnValue('');
    expect(EloquentNoTouchingModelStub.isIgnoringTouch()).toBeFalsy();
    await Model.withoutTouching(async () => {
      expect(EloquentNoTouchingModelStub.isIgnoringTouch()).toBeTruthy();
      const builder  = getBuilder();
      const parent   = new (Model);
      const spy11    = jest.spyOn(parent, '$getAttribute').mockReturnValue(1);
      const spy2     = jest.spyOn(builder, 'getModel').mockReturnValue(related);
      // @ts-ignore
      builder._model = related;
      const spy3     = jest.spyOn(builder, 'whereNotNull');
      const spy4     = jest.spyOn(builder, 'where');
      const spy5     = jest.spyOn(builder, 'withoutGlobalScopes').mockReturnValue(builder);

      const relation = new HasOne(builder, parent, 'foreign_key', 'id');

      const spy6 = jest.spyOn(builder, 'update');
      await relation.$touch();

      expect(spy11).toBeCalledWith('id');
      expect(spy6).not.toBeCalled();
    });
    expect(EloquentNoTouchingModelStub.isIgnoringTouch()).toBeFalsy();

    expect(spy1).not.toBeCalled();
    expect(spy2).not.toBeCalled();
  });

  it('can disable touching for specific model', async () => {
    const related        = new EloquentNoTouchingModelStub();
    const spy1           = jest.spyOn(related, '$getUpdatedAtColumn');
    const spy2           = jest.spyOn(related, '$freshTimestampString');
    const anotherRelated = new EloquentNoTouchingAnotherModelStub();
    expect(EloquentNoTouchingModelStub.isIgnoringTouch()).toBeFalsy();
    expect(EloquentNoTouchingAnotherModelStub.isIgnoringTouch()).toBeFalsy();
    await EloquentNoTouchingModelStub.withoutTouching(async () => {
      expect(EloquentNoTouchingModelStub.isIgnoringTouch()).toBeTruthy();
      expect(EloquentNoTouchingAnotherModelStub.isIgnoringTouch()).toBeFalsy();
      const builder  = getBuilder();
      const parent   = new Model;
      const spy10    = jest.spyOn(parent, '$getAttribute').mockReturnValue(1);
      const spy11    = jest.spyOn(builder, 'getModel').mockReturnValue(related);
      // @ts-ignore
      builder._model = related;
      const spy12    = jest.spyOn(builder, 'whereNotNull');
      const spy13    = jest.spyOn(builder, 'where');
      const spy14    = jest.spyOn(builder, 'withoutGlobalScopes').mockReturnThis();

      const relation = new HasOne(builder, parent, 'foreign_key', 'id');
      const spy15    = jest.spyOn(builder, 'update');
      await relation.$touch();

      expect(spy15).not.toBeCalled();

      const anotherBuilder = getBuilder();
      const anotherParent  = new Model();

      const spy16           = jest.spyOn(anotherParent, '$getAttribute').mockReturnValue(2);
      const spy17           = jest.spyOn(anotherBuilder, 'getModel').mockReturnValue(
        anotherRelated);
      // @ts-ignore
      anotherBuilder._model = anotherRelated;

      const spy18 = jest.spyOn(anotherBuilder, 'whereNotNull');
      const spy19 = jest.spyOn(anotherBuilder, 'where');
      const spy20 = jest.spyOn(anotherBuilder, 'withoutGlobalScopes').mockReturnThis();

      const anotherRelation = new HasOne(anotherBuilder, anotherParent, 'foreign_key', 'id');
      const now             = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

      const spy21 = jest.spyOn(anotherRelated, '$freshTimestampString').mockReturnValue(
        now
      );
      const spy22 = jest.spyOn(anotherBuilder, 'update').mockReturnValue(Promise.resolve(true));

      await anotherRelation.$touch();

      expect(spy10).toBeCalledWith('id');
      expect(spy16).toBeCalledWith('id');
      expect(spy22).toBeCalledWith({
        'updated_at': now
      });
    });

    expect(EloquentNoTouchingModelStub.isIgnoringTouch()).toBeFalsy();
    expect(EloquentNoTouchingAnotherModelStub.isIgnoringTouch()).toBeFalsy();

    expect(spy1).not.toBeCalled();
  });

  it('parent model is not touched when child model is ignored', async () => {
    const related = new EloquentNoTouchingModelStub();
    const spy1    = jest.spyOn(related, '$getUpdatedAtColumn');
    const spy2    = jest.spyOn(related, '$freshTimestampString');

    const relatedChild = new EloquentNoTouchingChildModelStub();

    const spy3 = jest.spyOn(relatedChild, '$getUpdatedAtColumn');
    const spy4 = jest.spyOn(relatedChild, '$freshTimestampString');
    expect(await EloquentNoTouchingModelStub.isIgnoringTouch()).toBeFalsy();
    expect(await EloquentNoTouchingChildModelStub.isIgnoringTouch()).toBeFalsy();

    expect(spy1).not.toBeCalled();
    expect(spy2).not.toBeCalled();
    expect(spy3).not.toBeCalled();
    expect(spy4).not.toBeCalled();

    await EloquentNoTouchingModelStub.withoutTouching(async () => {
      expect(await EloquentNoTouchingModelStub.isIgnoringTouch()).toBeTruthy();
      expect(await EloquentNoTouchingChildModelStub.isIgnoringTouch()).toBeTruthy();
      const builder = getBuilder();
      const parent  = new Model();

      const spy11    = jest.spyOn(parent, '$getAttribute').mockReturnValue(1);
      const spy12    = jest.spyOn(builder, 'getModel').mockReturnValue(related);
      // @ts-ignore
      builder._model = related;
      const spy13    = jest.spyOn(builder, 'whereNotNull');
      const spy14    = jest.spyOn(builder, 'where');
      const spy15    = jest.spyOn(builder, 'withoutGlobalScopes').mockReturnThis();

      // parent.shouldReceive('getAttribute')._with('id').andReturn(1);
      // builder.shouldReceive('whereNotNull');
      // builder.shouldReceive('where');
      // builder.shouldReceive('withoutGlobalScopes').andReturnSelf();
      const relation = new HasOne(builder, parent, 'foreign_key', 'id');
      const spy16    = jest.spyOn(builder, 'update');

      // builder.shouldReceive('update').never();
      await relation.$touch();
      expect(spy11).toBeCalledWith('id');
      expect(spy16).not.toBeCalled();

      const anotherBuilder = getBuilder();
      const anotherParent  = new Model();

      const spy17           = jest.spyOn(anotherParent, '$getAttribute').mockReturnValue(2);
      const spy18           = jest.spyOn(anotherBuilder, 'getModel').mockReturnValue(relatedChild);
      // @ts-ignore
      anotherBuilder._model = relatedChild;
      const spy19           = jest.spyOn(anotherBuilder, 'whereNotNull');
      const spy20           = jest.spyOn(anotherBuilder, 'where');
      const spy21           = jest.spyOn(anotherBuilder, 'withoutGlobalScopes').mockReturnThis();

      const anotherRelation = new HasOne(anotherBuilder, anotherParent, 'foreign_key', 'id');
      const spy22           = jest.spyOn(anotherBuilder, 'update');
      await anotherRelation.$touch();

      expect(spy17).toBeCalledWith('id');
      expect(spy22).not.toBeCalled();
    });
    expect(await EloquentNoTouchingModelStub.isIgnoringTouch()).toBeFalsy();
    expect(await EloquentNoTouchingChildModelStub.isIgnoringTouch()).toBeFalsy();
  });

  xit('ignored models state is reset when there are exceptions', async () => {
    const related      = new EloquentNoTouchingModelStub();
    const spy          = jest.spyOn(related, '$getUpdatedAtColumn');
    const spy2         = jest.spyOn(related, '$freshTimestampString');
    const relatedChild = new EloquentNoTouchingChildModelStub();
    const spy3         = jest.spyOn(relatedChild, '$getUpdatedAtColumn');
    const spy4         = jest.spyOn(relatedChild, '$freshTimestampString');
    expect(await EloquentNoTouchingModelStub.isIgnoringTouch()).toBeFalsy();
    expect(await EloquentNoTouchingChildModelStub.isIgnoringTouch()).toBeFalsy();
    expect(() => {
      EloquentNoTouchingModelStub.withoutTouching(() => {
        expect(EloquentNoTouchingModelStub.isIgnoringTouch()).toBeTruthy();
        expect(EloquentNoTouchingChildModelStub.isIgnoringTouch()).toBeTruthy();
        throw new Error();
      });
    }).not.toThrowError('Exception was not thrown');
    expect(EloquentNoTouchingModelStub.isIgnoringTouch()).toBeFalsy();
    expect(EloquentNoTouchingChildModelStub.isIgnoringTouch()).toBeFalsy();
  });

  it('setting morph map with numeric array uses the table names', () => {
    Relation.morphMap([EloquentRelationResetModelStub]);
    expect(Relation.morphMap()).toEqual({
      'reset': EloquentRelationResetModelStub
    });
    Relation.morphMap([], false);
  });

  it('setting morph map with numeric keys', () => {
    Relation.morphMap({
      1: 'App\\User'
    });
    expect(Relation.morphMap()).toEqual({
      1: 'App\\User'
    });
    Relation.morphMap([], false);
  });

  it('without relations', async () => {
    const original = new EloquentNoTouchingModelStub();
    original.$setRelation('foo', 'baz');
    expect(original.$getRelation('foo')).toBe('baz');
    let model = await original.$withoutRelations();
    expect(model).toBeInstanceOf(EloquentNoTouchingModelStub);
    expect(original.$relationLoaded('foo')).toBeTruthy();
    expect(model.$relationLoaded('foo')).toBeFalsy();
    model = original.$unsetRelations();
    expect(model).toBeInstanceOf(EloquentNoTouchingModelStub);
    expect(original.$relationLoaded('foo')).toBeFalsy();
    expect(model.$relationLoaded('foo')).toBeFalsy();
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
    return this.$newQuery().getQuery();
  }
}

export class EloquentRelationStub extends Relation {
  public addConstraints() {
  }

  public addEagerConstraints(models: Model[]) {
  }

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
  _table: any               = '_table';
  protected attributes: any = {
    'id': 1
  };
}

export class EloquentNoTouchingChildModelStub extends EloquentNoTouchingModelStub {
}

export class EloquentNoTouchingAnotherModelStub extends Model {
  _table: any = 'another_table';

  @Column()
  id = 2;
}

export class EloquentResolverRelationStub extends EloquentRelationStub {
  // @ts-ignore
  public async getResults() {
    return {
      'key': 'value'
    };
  }
}
