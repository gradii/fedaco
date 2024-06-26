/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Column } from '../../src/annotation/column/column';
import { JsonColumn } from '../../src/annotation/column/json.column';
import { Model } from '../../src/fedaco/model';
import { Pivot } from '../../src/fedaco/relations/pivot';


describe('test database fedaco pivot', () => {

  it('properties are set correctly', () => {
    const parent = new Model();
    jest.spyOn(parent, 'GetConnectionName').mockReturnValue('connection');

    // parent.getConnection().getQueryGrammar().shouldReceive('getDateFormat').andReturn(
    //   'Y-m-d H:i:s');
    parent.SetDateFormat('yyyy-MM-dd HH:mm:ss');
    const pivot = Pivot.fromAttributes(parent, {
      'foo'       : 'bar',
      'created_at': '2015-09-12'
    }, 'table', true);
    expect(pivot.GetAttributes()).toEqual({
      'foo'       : 'bar',
      'created_at': '2015-09-12'
    });
    expect(pivot.GetConnectionName()).toBe('connection');
    expect(pivot.GetTable()).toBe('table');
    expect(pivot._exists).toBeTruthy();
  });

  it('mutators are called from constructor', () => {
    const parent = new Model();
    jest.spyOn(parent, 'GetConnectionName').mockReturnValue('connection');
    const pivot = DatabaseEloquentPivotTestMutatorStub.fromAttributes(parent, {
      'foo': 'bar'
    }, 'table', true);
    expect(pivot.getMutatorCalled()).toBeFalsy();
    pivot.foo = 'bar';
    expect(pivot.getMutatorCalled()).toBeTruthy();
  });

  it('from raw attributes does not double mutate', () => {
    const parent = new Model();
    jest.spyOn(parent, 'GetConnectionName').mockReturnValue('connection');
    const pivot = DatabaseEloquentPivotTestJsonCastStub.fromRawAttributes(parent, {
      'foo': JSON.stringify({
        'name': 'Taylor'
      })
    }, 'table', true);
    expect(pivot.foo).toEqual({
      'name': 'Taylor'
    });
  });

  it('from raw attributes does not mutate', () => {
    const parent = new Model();
    jest.spyOn(parent, 'GetConnectionName').mockReturnValue('connection');
    const pivot = DatabaseEloquentPivotTestMutatorStub.fromRawAttributes(parent, {
      'foo': 'bar'
    }, 'table', true);
    expect(pivot.getMutatorCalled()).toBeFalsy();
  });
  it('properties unchanged are not dirty', () => {
    const parent = new Model();
    jest.spyOn(parent, 'GetConnectionName').mockReturnValue('connection');
    const pivot = Pivot.fromAttributes(parent, {
      'foo'  : 'bar',
      'shimy': 'shake'
    }, 'table', true);
    expect(pivot.GetDirty()).toEqual({});
  });

  it('properties changed are dirty', () => {
    const parent = new Model();
    jest.spyOn(parent, 'GetConnectionName').mockReturnValue('connection');
    const pivot = Pivot.fromAttributes(parent, {
      'foo'  : 'bar',
      'shimy': 'shake'
    }, 'table', true);
    pivot.SetAttribute('shimy', 'changed');
    expect(pivot.GetDirty()).toEqual({
      'shimy': 'changed'
    });
  });

  it('timestamp property is set if created at in attributes', () => {
    const parent = new Model();
    jest.spyOn(parent, 'GetConnectionName').mockReturnValue('connection');
    jest.spyOn(parent, 'GetDates').mockReturnValue([]);
    let pivot = DatabaseEloquentPivotTestDateStub.fromAttributes(parent, {
      'foo'       : 'bar',
      'created_at': 'foo'
    }, 'table');
    expect(pivot._timestamps).toBeTruthy();
    pivot = DatabaseEloquentPivotTestDateStub.fromAttributes(parent, {
      'foo': 'bar'
    }, 'table');
    expect(pivot._timestamps).toBeFalsy();
  });

  it('timestamp property is true when creating from raw attributes', () => {
    const parent = new Model();
    jest.spyOn(parent, 'GetConnectionName').mockReturnValue('connection');
    jest.spyOn(parent, 'GetDates').mockReturnValue([]);

    const pivot = Pivot.fromRawAttributes(parent, {
      'foo'       : 'bar',
      'created_at': 'foo'
    }, 'table');
    expect(pivot._timestamps).toBeTruthy();
  });

  it('keys can be set properly', () => {
    const parent = new Model();
    jest.spyOn(parent, 'GetConnectionName').mockReturnValue('connection');
    const pivot: Pivot = Pivot.fromAttributes(parent, {
      'foo': 'bar'
    }, 'table');
    pivot.SetPivotKeys('foreign', 'other');
    expect(pivot.GetForeignKey()).toBe('foreign');
    expect(pivot.GetOtherKey()).toBe('other');
  });

  it('delete method deletes model by keys', async () => {
    const pivot = new Pivot();
    const query = {
      where(arg: any): any {
        throw new Error('not implement');
      },
      delete(): boolean {
        throw new Error('not implement');
      }
    };

    // @ts-ignore
    const spy1 = jest.spyOn(pivot, 'NewQueryWithoutRelationships').mockReturnValue(query);
    pivot.SetPivotKeys('foreign', 'other');
    pivot.SetAttribute('foreign', 'foreign.value');
    pivot.SetAttribute('other', 'other.value');

    jest.spyOn(query, 'where').mockImplementationOnce((arg: any): any => {
      expect(arg).toEqual({
        'foreign': 'foreign.value',
        'other'  : 'other.value'
      });
      return query;
    }).mockReturnValue(query);
    // @ts-ignore
    jest.spyOn(query, 'delete').mockReturnValue(1);

    const rowsAffected = await pivot.Delete();
    expect(rowsAffected).toEqual(1);
  });

  it('pivot model table name is singular', () => {
    const pivot = new Pivot();
    expect(pivot.GetTable()).toBe('pivot');
  });

  it('pivot model with parent returns parents timestamp columns', () => {
    const parent = new Model();
    jest.spyOn(parent, 'GetCreatedAtColumn').mockReturnValue('parent_created_at');
    jest.spyOn(parent, 'GetUpdatedAtColumn').mockReturnValue('parent_updated_at');
    const pivotWithParent       = new Pivot();
    pivotWithParent.pivotParent = parent;
    expect(pivotWithParent.GetCreatedAtColumn()).toBe('parent_created_at');
    expect(pivotWithParent.GetUpdatedAtColumn()).toBe('parent_updated_at');
  });

  it('pivot model without parent returns model timestamp columns', () => {
    const model              = new DummyModel();
    const pivotWithoutParent = new Pivot();
    expect(pivotWithoutParent.GetCreatedAtColumn()).toEqual(model.GetCreatedAtColumn());
    expect(pivotWithoutParent.GetUpdatedAtColumn()).toEqual(model.GetUpdatedAtColumn());
  });

  it('without relations', () => {
    const original       = new Pivot();
    // @ts-ignore
    original.pivotParent = class foo {
    };
    original.SetRelation('bar', 'baz');
    expect(original.GetRelation('bar')).toBe('baz');
    let pivot = original.WithoutRelations();
    expect(pivot).toBeInstanceOf(Pivot);
    expect(original).not.toBe(pivot);
    // expect(original.pivotParent).toBe('foo');
    expect(pivot.pivotParent).toBeNull();
    expect(original.RelationLoaded('bar')).toBeTruthy();
    expect(pivot.RelationLoaded('bar')).toBeFalsy();
    pivot = original.UnsetRelations();
    expect(original).toEqual(pivot);
    expect(pivot.pivotParent).toBeNull();
    expect(pivot.RelationLoaded('bar')).toBeFalsy();
  });
});

export class DatabaseEloquentPivotTestDateStub extends Pivot {
  // public getDates() {
  //   return [];
  // }
}

export class DatabaseEloquentPivotTestMutatorStub extends Pivot {
  private mutatorCalled: any = false;

  @Column()
  set foo(value: any) {
    this.mutatorCalled = true;
    this.SetAttribute('foo', value);
  }

  public getMutatorCalled() {
    return this.mutatorCalled;
  }
}

export class DatabaseEloquentPivotTestJsonCastStub extends Pivot {
  protected casts: any = {
    'foo': 'json'
  };

  @JsonColumn()
  foo: any;
}

export class DummyModel extends Model {
}
