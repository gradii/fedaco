import { isAnyEmpty, isBlank, isObject, isString, pluck } from '@gradii/nanofn';
import { createHash } from 'crypto';
import { format } from 'date-fns';
import { ArrayColumn } from '../src/annotation/column/array.column';
import { BooleanColumn } from '../src/annotation/column/boolean.column';
import { Column } from '../src/annotation/column/column';
import { CreatedAtColumn } from '../src/annotation/column/created-at.column';
import { DateColumn } from '../src/annotation/column/date.column';
import { DatetimeColumn } from '../src/annotation/column/datetime.column';
import { DecimalColumn } from '../src/annotation/column/decimal.column';
import { FloatColumn } from '../src/annotation/column/float.column';
import { IntegerColumn } from '../src/annotation/column/integer.column';
import { JsonColumn } from '../src/annotation/column/json.column';
import { ObjectColumn } from '../src/annotation/column/object.column';
import { PrimaryColumn } from '../src/annotation/column/primary.column';
import { TimestampColumn } from '../src/annotation/column/timestamp.column';
import { UpdatedAtColumn } from '../src/annotation/column/updated-at.column';
import { HasManyColumn } from '../src/annotation/relation-column/has-many.relation-column';
import { HasOneColumn } from '../src/annotation/relation-column/has-one.relation-column';
import { Table } from '../src/annotation/table/table';
import type { Connection } from '../src/connection';
import type { DatabaseTransactionsManager } from '../src/database-transactions-manager';
import { FedacoBuilder } from '../src/fedaco/fedaco-builder';
import type { FedacoRelationListType, FedacoRelationType } from '../src/fedaco/fedaco-types';
import type { Dispatcher } from '../src/fedaco/mixins/has-events';
import { Model } from '../src/fedaco/model';
import type { ConnectionResolverInterface } from '../src/interface/connection-resolver-interface';
import type { ConnectionInterface } from '../src/query-builder/connection-interface';
import { MysqlQueryGrammar } from '../src/query-builder/grammar/mysql-query-grammar';
import { Processor } from '../src/query-builder/processor';
import { QueryBuilder } from '../src/query-builder/query-builder';
import type { SchemaBuilder } from '../src/schema/schema-builder';
import { KeyAbleModel } from '../src/types/model-type';
import { FedacoModelNamespacedModel } from './model/fedaco-model-namespaced.model';

const global: any = {};

class Conn implements ConnectionInterface {
  _transactions: number;
  _transactionsManager: DatabaseTransactionsManager;

  transaction(callback: (...args: any[]) => Promise<any>, attempts?: number): Promise<any> {
    throw new Error('Method not implemented.');
  }

  beginTransaction(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  commit(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  rollBack(toLevel?: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  transactionLevel(): number {
    throw new Error('Method not implemented.');
  }

  afterCommit(callback: Function): Promise<void> {
    throw new Error('Method not implemented.');
  }

  setTransactionManager(manager: DatabaseTransactionsManager): this {
    throw new Error('Method not implemented.');
  }

  unsetTransactionManager(): void {
    throw new Error('Method not implemented.');
  }

  getSchemaBuilder(): SchemaBuilder {
    throw new Error('Method not implemented.');
  }

  getConfig() {}

  table(table: string | Function | QueryBuilder, as?: string): QueryBuilder {
    throw new Error('Method not implemented.');
  }

  getPdo() {
    throw new Error('Method not implemented.');
  }

  getQueryGrammar(): any {}

  getDatabaseName(): string {
    return 'default-database';
  }

  getPostProcessor(): any {}

  query(): QueryBuilder {
    return new QueryBuilder(this, new MysqlQueryGrammar(), new Processor());
  }

  async select() {
    return await Promise.resolve();
  }

  async insert(sql: string, bindings: any[]): Promise<boolean> {
    return false;
  }

  async update() {}

  async delete() {}

  async statement() {}

  async affectingStatement() {}

  getName() {
    return '';
  }

  recordsHaveBeenModified(): any {}

  selectFromWriteConnection(sql: string, values: any): any {}

  insertGetId(sql: string, bindings: any[], sequence?: string): Promise<any> | boolean {
    return undefined;
  }

  setTablePrefix(prefix: string): any {}
}

function getBuilder(): FedacoBuilder<any> {
  return new FedacoBuilder(new QueryBuilder(new Conn(), new MysqlQueryGrammar(), new Processor()));
}

function resolveModel(model: Model) {
  const connection = new Conn();

  const resolver: ConnectionResolverInterface = {
    getDefaultConnection(): any {},
    setDefaultConnection(name: string): any {},
    connection() {
      return connection;
    },
  };
  // model.
  // (model.constructor as typeof Model)._connectionResolver                    = new ResolveConnection();
  (model.constructor as typeof Model).resolver = resolver;
}

function setDispatch(modelClazz: typeof Model, util = true) {
  // const events = new Dispatcher();
  const events: Dispatcher = {
    forget(event: string): void {},
    until() {
      return util;
    },
    dispatch() {},
  };

  modelClazz.setEventDispatcher(events);
}

describe('test database fedaco model', () => {
  beforeAll(() => {
    const connection = new Conn();

    const resolver: ConnectionResolverInterface = {
      getDefaultConnection(): any {},
      setDefaultConnection(name: string): any {},
      connection() {
        return connection;
      },
    };
    (Model as typeof Model).setConnectionResolver(resolver);
  });

  it('attribute manipulation', () => {
    const model = new FedacoModelStub();
    model.name = 'foo';
    expect(model.name).toBe('foo');
    expect(model.name).not.toBeUndefined();
    model.UnsetAttribute('name');
    expect(model.name).toBeUndefined();
    model.list_items = {
      name: 'taylor',
    };
    expect(model.list_items).toEqual({
      name: 'taylor',
    });
    const attributes = model.GetAttributes();
    expect(attributes['list_items']).toEqual({
      name: 'taylor',
    });
  });

  it('dirty attributes', () => {
    const model = FedacoModelStub.initAttributes({
      foo: '1',
      bar: 2,
      baz: 3,
    });
    model.SyncOriginal();
    model.foo = 1;
    model.bar = 20;
    model.baz = 30;
    expect(model.IsDirty()).toBeTruthy();
    expect(model.IsDirty('foo')).toBeTruthy();
    expect(model.IsDirty('bar')).toBeTruthy();
    expect(model.IsDirty('foo', 'bar')).toBeTruthy();
    expect(model.IsDirty(['foo', 'bar'])).toBeTruthy();
  });

  it('int and null comparison when dirty', () => {
    const model = new FedacoModelCastingStub();
    model.intAttribute = null;
    model.SyncOriginal();
    expect(model.IsDirty('intAttribute')).toBeFalsy();
    model.ForceFill({
      intAttribute: 0,
    });
    expect(model.IsDirty('intAttribute')).toBeTruthy();
  });

  it('float and null comparison when dirty', () => {
    const model = new FedacoModelCastingStub();
    model.floatAttribute = null;
    model.SyncOriginal();
    expect(model.IsDirty('floatAttribute')).toBeFalsy();
    model.ForceFill({
      floatAttribute: 0,
    });
    expect(model.IsDirty('floatAttribute')).toBeTruthy();
  });

  it('decimal column metadata', () => {
    const model = new FedacoModelCastingStub();
    const spy = jest.spyOn(model, 'AsDecimal');
    model.defaultDecimal = 10.22;
    const defaultDecimal = model.defaultDecimal;
    expect(defaultDecimal).toBe('10.22');
    expect(spy).toHaveBeenCalledWith(10.22, 2);

    model.precisionDecimal = 10.1111;
    const precisionDecimal = model.precisionDecimal;
    expect(precisionDecimal).toBe('10.1111');
    expect(spy).toHaveBeenCalledWith(10.1111, 4);
  });

  it('dirty on cast or date attributes', () => {
    const model = new FedacoModelCastingStub();
    model.SetDateFormat('yyyy-MM-dd HH:mm:ss');
    // @ts-ignore
    model.boolAttribute = 1;
    model.foo = 1;
    model.bar = '2017-03-18';
    // @ts-ignore
    model.dateAttribute = '2017-03-18';
    // @ts-ignore
    model.datetimeAttribute = '2017-03-23 22:17:00';
    model.SyncOriginal();
    model.boolAttribute = true;
    model.foo = true;
    model.bar = '2017-03-18 00:00:00';
    // @ts-ignore
    model.dateAttribute = '2017-03-18 00:00:00';
    model.datetimeAttribute = null;
    expect(model.IsDirty()).toBeTruthy();
    expect(model.IsDirty('foo')).toBeTruthy();
    expect(model.IsDirty('bar')).toBeTruthy();
    expect(model.IsDirty('boolAttribute')).toBeFalsy();
    expect(model.IsDirty('dateAttribute')).toBeFalsy();
    expect(model.IsDirty('datetimeAttribute')).toBeTruthy();
  });

  it('dirty on casted objects', () => {
    const model = new FedacoModelCastingStub();
    model.SetRawAttributes({
      objectAttribute    : '["one","two","three"]',
      collectionAttribute: '["one","two","three"]',
    });
    model.SyncOriginal();
    model.objectAttribute = ['one', 'two', 'three'];
    model.collectionAttribute = ['one', 'two', 'three'];
    expect(model.IsDirty()).toBeFalsy();
    expect(model.IsDirty('objectAttribute')).toBeFalsy();
    expect(model.IsDirty('collectionAttribute')).toBeFalsy();
  });

  it('test timestamp fill', () => {
    const model = new FedacoModelCastingStub();
    model.Fill({
      timestampAttribute: new Date(),
    });

    expect(typeof model._attributes['timestampAttribute']).toBe('string');
  });

  it('clean attributes', () => {
    const model = FedacoModelStub.initAttributes({
      foo: '1',
      bar: 2,
      baz: 3,
    });
    model.SyncOriginal();
    model.foo = 1;
    model.bar = 20;
    model.baz = 30;
    expect(model.IsClean()).toBeFalsy();
    expect(model.IsClean('foo')).toBeFalsy();
    expect(model.IsClean('bar')).toBeFalsy();
    expect(model.IsClean('foo', 'bar')).toBeFalsy();
    expect(model.IsClean(['foo', 'bar'])).toBeFalsy();
  });

  it('clean when float update attribute', () => {
    let model = FedacoModelStub.initAttributes({
      castedFloat: 8 - 6.4,
    });
    model.SyncOriginal();
    model.castedFloat = 1.6;
    expect(model.OriginalIsEquivalent('castedFloat')).toBeTruthy();
    model = FedacoModelStub.initAttributes({
      castedFloat: 5.6,
    });
    model.SyncOriginal();
    model.castedFloat = 5.5;
    expect(model.OriginalIsEquivalent('castedFloat')).toBeFalsy();
  });

  it('calculated attributes', () => {
    const model = new FedacoModelStub();
    model.password = 'secret';
    const attributes = model.GetAttributes();
    expect('password' in attributes).toBeFalsy();
    expect(model.password).toBe('******');
    const hash = 'e5e9fa1ba31ecd1ae84f75caaa474f3a663f05f4';
    expect(attributes['password_hash']).toEqual(hash);
    // expect(model.password_hash).toEqual(hash);
  });

  //   it('array access to attributes', () => {
  //     let model = new FedacoModelStub({
  //       'attributes': 1,
  //       'connection': 2,
  //       'table': 3
  //     });
  //     delete model['table'];
  //     expect(model['attributes'] !== undefined).toBeTruthy();
  //     expect(1).toEqual(model['attributes']);
  //     expect(model['connection'] !== undefined).toBeTruthy();
  //     expect(2).toEqual(model['connection']);
  //     expect(model['table'] !== undefined).toBeFalsy();
  //     expect(null).toEqual(model['table']);
  //     expect(model['with'] !== undefined).toBeFalsy();
  //   });

  it('only', () => {
    const model = new FedacoModelStub();
    model.first_name = 'taylor';
    model.last_name = 'otwell';
    model.project = 'laravel';
    expect(model.Only('project')).toEqual({
      project: 'laravel',
    });
    expect(model.Only('first_name', 'last_name')).toEqual({
      first_name: 'taylor',
      last_name : 'otwell',
    });
    expect(model.Only(['first_name', 'last_name'])).toEqual({
      first_name: 'taylor',
      last_name : 'otwell',
    });
  });

  it('new instance returns new instance with attributes set', () => {
    const model = new FedacoModelStub();
    const instance: FedacoModelStub = model.NewInstance({
      name: 'general name',
    });
    expect(instance instanceof FedacoModelStub).toBe(true);
    expect(instance.name === 'general name').toBeTruthy();
  });

  it('new instance returns new instance with table set', () => {
    const model = new FedacoModelStub();
    model.SetTable('test');
    const newInstance = model.NewInstance();
    expect(newInstance.GetTable()).toBe('test');
  });

  // it('new instance returns new instance with merged casts', () => {
  //   const model = new FedacoModelStub();
  //   model.mergeCasts({
  //     'foo': 'date'
  //   });
  //   const newInstance = model.newInstance();
  //   expect('foo' in newInstance.getCasts()).toBeTruthy();
  //   expect(newInstance.getCasts()['foo']).toBe('date');
  // });

  it('create method saves new model', async () => {
    global['__fedaco.saved'] = false;
    const model = await new FedacoModelSaveStub().NewQuery().create({
      name: 'taylor',
    });
    expect(global['__fedaco.saved']).toBeTruthy();
    expect(model.name).toBe('taylor');
  });

  it('make method does not save new model', () => {
    global['__fedaco.saved'] = false;
    const model = new FedacoModelSaveStub().NewQuery().make({
      name: 'taylor',
    });
    expect(global['__fedaco.saved']).toBeFalsy();
    expect(model.name).toBe('taylor');
  });

  it('force create method saves new model with guarded attributes', async () => {
    global['__fedaco.saved'] = false;
    const model = await new FedacoModelSaveStub().NewQuery().forceCreate({
      id: 21,
    });
    expect(global['__fedaco.saved']).toBeTruthy();
    expect(model.id).toEqual(21);
  });

  // it('find method use write pdo', () => {
  //   new FedacoModelFindWithWritePdoStub().newQuery().onWriteConnection().find(1);
  // });

  // it('destroy method calls query builder correctly', () => {
  //   new FedacoModelDestroyStub().newQuery().destroy(1, 2, 3);
  // });
  //
  // it('destroy method calls query builder correctly with collection', () => {
  //   new FedacoModelDestroyStub().newQuery().destroy(new Collection([1, 2, 3]));
  // });

  it('with method calls query builder correctly', () => {
    const result = new FedacoModelWithStub().NewQuery().with('foo', 'bar');
    expect(result).toBe('foo');
  });

  it('without method removes eager loaded relationship correctly', () => {
    const model = new FedacoModelWithoutRelationStub();
    resolveModel(model);
    const instance = model.NewInstance().NewQuery().without('foo');
    expect(isAnyEmpty(instance.getEagerLoads())).toBeTruthy();
  });

  it('eager loading with columns', () => {
    const model = new FedacoModelWithoutRelationStub();
    const instance = model.NewInstance().NewQuery().with('foo:bar,baz', 'hadi');
    const builder = getBuilder();
    const spy1 = jest.spyOn(builder, 'select');
    expect(instance.getEagerLoads()['hadi']).not.toBeNull();
    expect(instance.getEagerLoads()['foo']).not.toBeNull();
    const closure = instance.getEagerLoads()['foo'];
    closure(builder);
    expect(spy1).toHaveBeenCalledWith(['bar', 'baz']);
  });

  it('with method calls query builder correctly with array', () => {
    const result = new FedacoModelWithStub().NewQuery().with(['foo', 'bar']);
    expect(result).toBe('foo');
  });

  it('update process', async () => {
    const model = new FedacoModelStub();
    const query = getBuilder();

    query.setModel(model);

    const spy1 = jest.spyOn(query, 'where');
    // @ts-ignore
    const spy2 = jest.spyOn(query, 'update').mockReturnValue(1);

    const spy3 = jest.spyOn(model, 'NewModelQuery').mockReturnValue(query);
    const spy4 = jest.spyOn(model, 'UpdateTimestamps').mockReturnValue(true);

    // const events = new Dispatcher();
    const events: Dispatcher = {
      forget(event: string): void {},
      until() {
        return true;
      },
      dispatch() {},
    };

    FedacoModelStub.setEventDispatcher(events);
    // @ts-ignore
    const spy5 = jest.spyOn(events, 'until').mockReturnValue(true);
    // @ts-ignore
    const spy6 = jest.spyOn(events, 'dispatch').mockReturnValue(true);

    model.id = 1;
    model.foo = 'bar';
    model.SyncOriginal();
    model.name = 'taylor';
    model._exists = true;

    const result = await model.Save();
    expect(result).toBeTruthy();

    expect(spy1).toHaveBeenCalledWith('id', '=', 1);
    expect(spy2).toHaveBeenCalledWith({ name: 'taylor' });

    expect(spy5.mock.calls).toEqual([
      ['fedaco.saving: stub', model],
      ['fedaco.updating: stub', model],
    ]);
    expect(spy6.mock.calls).toEqual([
      ['fedaco.updated: stub', model],
      ['fedaco.saved: stub', model],
    ]);
  });

  it('update process doesnt override timestamps', async () => {
    const model = new FedacoModelWithDateStub();
    const query = getBuilder();

    const spy1 = jest.spyOn(model, 'NewModelQuery').mockReturnValue(query);
    const spy2 = jest.spyOn(query, 'where');
    // @ts-ignore
    const spy3 = jest.spyOn(query, 'update').mockReturnValue(1);

    // const events = new Dispatcher();
    const events: Dispatcher = {
      forget(event: string): void {},
      until() {
        return true;
      },
      dispatch() {},
    };

    FedacoModelWithDateStub.setEventDispatcher(events);

    const spy4 = jest.spyOn(events, 'until');
    const spy5 = jest.spyOn(events, 'dispatch');

    model.id = 1;
    model.SyncOriginal();
    model.created_at = 'foo';
    model.updated_at = 'bar';
    model._exists = true;

    const result = await model.Save();

    expect(result).toBeTruthy();

    expect(spy2).toHaveBeenCalledWith('id', '=', 1);
    expect(spy3).toHaveBeenCalledWith({
      created_at: 'foo',
      updated_at: 'bar',
    });

    expect(spy1).toHaveReturnedWith(query);

    expect(spy4).toHaveBeenCalled();
    expect(spy5).toHaveBeenCalled();
  });

  it('save is canceled if saving event returns false', async () => {
    const model = new FedacoModelStub();
    const query = getBuilder();

    const spy1 = jest.spyOn(model, 'NewModelQuery').mockReturnValue(query);
    const spy2 = jest.spyOn(query, 'where');
    // @ts-ignore
    const spy3 = jest.spyOn(query, 'update').mockReturnValue(1);

    // const events = new Dispatcher();
    const events: Dispatcher = {
      forget(event: string): void {},
      until() {
        return false;
      },
      dispatch() {},
    };

    FedacoModelStub.setEventDispatcher(events);

    const spy4 = jest.spyOn(events, 'until').mockReturnValue(false);
    const spy5 = jest.spyOn(events, 'dispatch');

    model._exists = true;
    const result = await model.Save();

    expect(result).toBeFalsy();

    expect(spy4).toHaveBeenCalledWith(`fedaco.saving: stub`, model);
  });

  it('update is canceled if updating event returns false', async () => {
    const model = new FedacoModelStub();
    const query = getBuilder();

    const spy1 = jest.spyOn(model, 'NewModelQuery').mockReturnValue(query);
    const spy2 = jest.spyOn(query, 'where');
    // @ts-ignore
    const spy3 = jest.spyOn(query, 'update').mockReturnValue(1);

    // const events = new Dispatcher();
    const events: Dispatcher = {
      forget(event: string): void {},
      until() {
        return false;
      },
      dispatch() {},
    };

    FedacoModelStub.setEventDispatcher(events);

    const spy4 = jest.spyOn(events, 'until').mockReturnValueOnce(true);
    const spy5 = jest.spyOn(events, 'dispatch');

    model._exists = true;
    model.foo = 'bar';
    const result = await model.Save();

    expect(result).toBeFalsy();

    expect(spy4.mock.calls).toEqual([
      [`fedaco.saving: stub`, model],
      [`fedaco.updating: stub`, model],
    ]);
    expect(spy4).toHaveNthReturnedWith(1, true);
    expect(spy4).toHaveNthReturnedWith(2, false);
  });

  it('events can be fired with custom event objects', async () => {
    const model = new FedacoModelEventObjectStub();
    const query = getBuilder();

    const spy1 = jest.spyOn(model, 'NewModelQuery').mockReturnValue(query);
    const spy2 = jest.spyOn(query, 'where');
    // @ts-ignore
    const spy3 = jest.spyOn(query, 'update').mockReturnValue(1);

    // const events = new Dispatcher();
    const events: Dispatcher = {
      forget(event: string): void {},
      until() {
        return false;
      },
      dispatch() {},
    };

    FedacoModelEventObjectStub.setEventDispatcher(events);

    const spy4 = jest.spyOn(events, 'until');
    const spy5 = jest.spyOn(events, 'dispatch');

    model._exists = true;
    const result = await model.Save();

    expect(result).toBeFalsy();

    expect(spy4).toHaveBeenCalledWith('fedaco.saving: fedaco_model_saving_event_stubs', model);
    expect(spy4).toHaveReturnedWith(false);
  });

  it('update process without timestamps', async () => {
    const model = new FedacoModelEventObjectStub();
    const query = getBuilder();

    const spy1 = jest.spyOn(model, 'NewModelQuery').mockReturnValue(query);
    const spy11 = jest.spyOn(model, 'UpdateTimestamps').mockReturnValue(true);
    const spy12 = jest.spyOn(model, 'FireModelEvent');
    const spy2 = jest.spyOn(query, 'where');
    // @ts-ignore
    const spy3 = jest.spyOn(query, 'update').mockReturnValue(1);

    // const events = new Dispatcher();
    const events: Dispatcher = {
      forget(event: string): void {},
      until() {
        return true;
      },
      dispatch() {},
    };

    FedacoModelEventObjectStub.setEventDispatcher(events);

    const spy4 = jest.spyOn(events, 'until');
    const spy5 = jest.spyOn(events, 'dispatch');

    model._timestamps = false;
    model.id = 1;
    model.SyncOriginal();
    model.name = 'taylor';
    model._exists = true;
    const result = await model.Save();

    expect(result).toBeTruthy();

    expect(spy11).toHaveBeenCalledTimes(0);
    // expect(spy12).toReturnWith(true);
    expect(spy2).toHaveBeenCalledWith('id', '=', 1);
    expect(spy3).toHaveBeenCalledWith({
      name: 'taylor',
    });
    expect(spy3).toHaveReturnedWith(1);
  });

  it('update uses old primary key', async () => {
    const model = new FedacoModelStub();
    const query = getBuilder();

    const spy1 = jest.spyOn(model, 'NewModelQuery').mockReturnValue(query);
    const spy11 = jest.spyOn(model, 'UpdateTimestamps').mockReturnValue(true);
    const spy12 = jest.spyOn(model, 'FireModelEvent');
    const spy2 = jest.spyOn(query, 'where');
    // @ts-ignore
    const spy3 = jest.spyOn(query, 'update').mockReturnValue(1);

    // const events = new Dispatcher();
    const events: Dispatcher = {
      forget(event: string): void {},
      until() {
        return true;
      },
      dispatch() {},
    };

    FedacoModelStub.setEventDispatcher(events);

    const spy4 = jest.spyOn(events, 'until');
    const spy5 = jest.spyOn(events, 'dispatch');

    model.id = 1;
    model.SyncOriginal();
    model.id = 2;
    model.foo = 'bar';
    model._exists = true;
    const result = await model.Save();

    expect(result).toBeTruthy();

    expect(spy11).toHaveBeenCalledTimes(1);
    // expect(spy12).toReturnWith(true);
    expect(spy2).toHaveBeenCalledWith('id', '=', 1);
    expect(spy3).toHaveBeenCalledWith({
      id : 2,
      foo: 'bar',
    });
    expect(spy3).toHaveReturnedWith(1);

    expect(spy4.mock.calls).toEqual([
      [`fedaco.saving: stub`, model],
      [`fedaco.updating: stub`, model],
    ]);

    expect(spy5.mock.calls).toEqual([
      [`fedaco.updated: stub`, model],
      [`fedaco.saved: stub`, model],
    ]);
  });

  it('timestamps are returned as objects', () => {
    const model = new FedacoDateModelStub();
    const spy = jest.spyOn(model, 'GetDateFormat').mockReturnValue('yyyy-MM-dd');
    model.SetRawAttributes({
      created_at: '2012-12-04',
      updated_at: '2012-12-05',
    });

    expect(model.created_at instanceof Date).toBeTruthy();
    expect(model.updated_at instanceof Date).toBeTruthy();
  });

  it('timestamps are returned as objects from plain dates and timestamps', () => {
    const model = new FedacoDateModelStub();
    const spy = jest.spyOn(model, 'GetDateFormat').mockReturnValue('yyyy-MM-dd HH:mm:ss');
    model.SetRawAttributes({
      created_at: '2012-12-04',
      updated_at: new Date(),
    });

    expect(model.created_at instanceof Date).toBeTruthy();
    expect(model.updated_at instanceof Date).toBeTruthy();
  });

  it('timestamps are returned as objects on create', () => {
    const timestamps = {
      created_at: new Date(),
      updated_at: new Date(),
    };
    const model = new FedacoDateModelStub();
    // const resolver = new DatabaseManager();
    // Model.setConnectionResolver(new DatabaseManager());
    // resolver.shouldReceive('connection').andReturn(mockConnection = m.mock(stdClass));
    const conn = {
      getQueryGrammar() {},
      getDateFormat() {
        return 'yyyy-MM-dd HH:mm:ss';
      },
    };
    // @ts-ignore
    const spy1 = jest.spyOn(FedacoDateModelStub.resolver, 'connection').mockReturnValue(conn);
    // @ts-ignore
    const spy2 = jest.spyOn(conn, 'getQueryGrammar').mockReturnValue(conn);
    const spy3 = jest.spyOn(conn, 'getDateFormat').mockReturnValue('yyyy-MM-dd HH:mm:ss');

    const instance = model.NewInstance(timestamps);

    expect(instance.created_at instanceof Date).toBeTruthy();
    expect(instance.updated_at instanceof Date).toBeTruthy();
  });

  it('date time attributes return null if set to null', () => {
    const timestamps = {
      created_at: new Date(),
      updated_at: new Date(),
    };
    const model = new FedacoDateModelStub();
    // const resolver = new DatabaseManager();
    // Model.setConnectionResolver(new DatabaseManager());
    // resolver.shouldReceive('connection').andReturn(mockConnection = m.mock(stdClass));
    const conn = {
      getQueryGrammar() {},
      getDateFormat() {
        return 'yyyy-MM-dd HH:mm:ss';
      },
    };
    // @ts-ignore
    const spy1 = jest.spyOn(FedacoDateModelStub.resolver, 'connection').mockReturnValue(conn);
    // @ts-ignore
    const spy2 = jest.spyOn(conn, 'getQueryGrammar').mockReturnValue(conn);
    const spy3 = jest.spyOn(conn, 'getDateFormat').mockReturnValue('yyyy-MM-dd HH:mm:ss');

    const instance = model.NewInstance(timestamps);
    instance.created_at = null;
    expect(instance.created_at).toBeNull();
  });

  it('timestamps are created from strings and integers', () => {
    let model = new FedacoDateModelStub();
    model.created_at = '2013-05-22 00:00:00';
    expect(model.created_at).toBeInstanceOf(Date);
    model = new FedacoDateModelStub();
    model.created_at = new Date();
    expect(model.created_at).toBeInstanceOf(Date);
    model = new FedacoDateModelStub();
    model.created_at = 0;
    expect(model.created_at).toBeInstanceOf(Date);
    model = new FedacoDateModelStub();
    model.created_at = '2012-01-01';
    expect(model.created_at).toBeInstanceOf(Date);
  });

  it('from date time', () => {
    let value;
    const model = new FedacoModelStub();
    value = new Date('2015-04-17 22:59:01');
    expect(model.FromDateTime(value)).toBe('2015-04-17 22:59:01');
    value = new Date('2015-04-17 22:59:01');
    expect(value).toBeInstanceOf(Date);
    expect(value).toBeInstanceOf(Date);
    expect(model.FromDateTime(value)).toBe('2015-04-17 22:59:01');
    value = new Date('2015-04-17 22:59:01');
    expect(value).toBeInstanceOf(Date);
    expect(value).toBeInstanceOf(Date);
    expect(model.FromDateTime(value)).toBe('2015-04-17 22:59:01');
    value = '2015-04-17 22:59:01';
    expect(model.FromDateTime(value)).toBe('2015-04-17 22:59:01');
    value = '2015-04-17';
    expect(model.FromDateTime(value)).toBe('2015-04-17 00:00:00');
    value = '2015-4-17';
    expect(model.FromDateTime(value)).toBe('2015-04-17 00:00:00');
    value = 1429311541;
    expect(model.FromDateTime(value)).toBe(format(new Date('2015-04-17T22:59:01Z'), 'yyyy-MM-dd HH:mm:ss'));
    expect(model.FromDateTime(null)).toBeNull();
  });

  it('insert get id process', async () => {
    const model = new FedacoModelStub();
    const query = getBuilder();

    const spy1 = jest.spyOn(model, 'NewModelQuery').mockReturnValue(query);
    const spy11 = jest.spyOn(model, 'UpdateTimestamps').mockReturnValue(true);
    const spy12 = jest.spyOn(model, 'FireModelEvent');
    const spy13 = jest.spyOn(model, 'Refresh'); /* .mockReturnValue(true); */
    const spy2 = jest.spyOn(query, 'where');
    const spy22 = jest.spyOn(query, 'getConnection');
    // @ts-ignore
    const spy3 = jest.spyOn(query, 'insertGetId').mockImplementation((attributes, keyName) => {
      expect(attributes).toEqual({
        name: 'taylor',
      });
      expect(keyName).toBe('id');
      return 1;
    });

    // const events = new Dispatcher();
    const events: Dispatcher = {
      forget(event: string): void {},
      until() {
        return true;
      },
      dispatch() {},
    };

    FedacoModelStub.setEventDispatcher(events);

    const spy4 = jest.spyOn(events, 'until');
    const spy5 = jest.spyOn(events, 'dispatch');

    model.name = 'taylor';
    model._exists = false;

    const result = await model.Save();

    expect(result).toBeTruthy();
    expect(model.id).toEqual(1);
    expect(model._exists).toBeTruthy();

    expect(spy11).toHaveBeenCalledTimes(1);
    // expect(spy12).toReturnWith(true);
    // ignore this test use mock implement instead. because attributes is object will be filled with id => 1
    // expect(spy3).toBeCalledWith({
    //   'name': 'taylor'
    // }, 'id');
    expect(spy22).toHaveBeenCalled();
    expect(spy3).toHaveReturnedWith(1);

    expect(spy4.mock.calls).toEqual([
      [`fedaco.saving: stub`, model],
      [`fedaco.creating: stub`, model],
    ]);

    expect(spy5.mock.calls).toEqual([
      [`fedaco.created: stub`, model],
      [`fedaco.saved: stub`, model],
    ]);
  });

  it('insert process', async () => {
    const model = new FedacoModelStub();
    const query = getBuilder();

    model.SetIncrementing(false);

    const spy1 = jest.spyOn(model, 'NewModelQuery').mockReturnValue(query);
    const spy11 = jest.spyOn(model, 'UpdateTimestamps').mockReturnValue(true);
    const spy12 = jest.spyOn(model, 'FireModelEvent');
    const spy13 = jest.spyOn(model, 'Refresh'); /* .mockReturnValue(true); */
    const spy2 = jest.spyOn(query, 'where');
    const spy22 = jest.spyOn(query, 'getConnection');
    // @ts-ignore
    const spy3 = jest.spyOn(query, 'insert').mockReturnValue(1);

    // const events = new Dispatcher();
    const events: Dispatcher = {
      forget(event: string): void {},
      until() {
        return true;
      },
      dispatch() {},
    };

    FedacoModelStub.setEventDispatcher(events);

    const spy4 = jest.spyOn(events, 'until');
    const spy5 = jest.spyOn(events, 'dispatch');

    model.name = 'taylor';
    model._exists = false;
    const result = await model.Save();

    expect(result).toBeTruthy();
    expect(model.id).toBeUndefined();
    expect(model._exists).toBeTruthy();

    expect(spy11).toHaveBeenCalledTimes(1);
    expect(spy3).toHaveBeenCalledWith({
      name: 'taylor',
    });
    expect(spy3).toHaveReturnedWith(1);

    expect(spy4.mock.calls).toEqual([
      [`fedaco.saving: stub`, model],
      [`fedaco.creating: stub`, model],
    ]);

    expect(spy5.mock.calls).toEqual([
      [`fedaco.created: stub`, model],
      [`fedaco.saved: stub`, model],
    ]);
  });

  it('insert is canceled if creating event returns false', async () => {
    const model = new FedacoModelStub();
    const query = getBuilder();

    const spy1 = jest.spyOn(model, 'NewModelQuery').mockReturnValue(query);
    const spy11 = jest.spyOn(model, 'UpdateTimestamps'); /* .mockReturnValue(true); */
    const spy22 = jest.spyOn(query, 'getConnection');

    // const events = new Dispatcher();
    const events: Dispatcher = {
      forget(event: string): void {},
      until() {
        return false;
      },
      dispatch() {},
    };

    FedacoModelStub.setEventDispatcher(events);

    const spy4 = jest.spyOn(events, 'until').mockReturnValueOnce(true);
    const spy5 = jest.spyOn(events, 'dispatch');

    const result = await model.Save();

    expect(result).toBeFalsy();
    expect(model._exists).toBeFalsy();

    expect(spy4.mock.calls).toEqual([
      [`fedaco.saving: stub`, model],
      [`fedaco.creating: stub`, model],
    ]);

    expect(spy5).not.toHaveBeenCalled();
  });

  it('delete properly deletes model', async () => {
    const model = new FedacoModelStub();
    const query = getBuilder();

    const spy1 = jest.spyOn(model, 'NewModelQuery').mockReturnValue(query);
    // const spy11 = jest.spyOn(model, 'UpdateTimestamps');/*.mockReturnValue(true);*/
    // const spy12 = jest.spyOn(model, 'GetConnection');
    const spy13 = jest.spyOn(model, 'TouchOwners').mockReturnValue(Promise.resolve());
    const spy2 = jest.spyOn(query, 'where');
    const spy4 = jest.spyOn(query, 'delete').mockImplementationOnce(async () => {});

    // const events = new Dispatcher();
    const events: Dispatcher = {
      forget(event: string): void {},
      until() {
        return true;
      },
      dispatch() {},
    };

    FedacoModelStub.setEventDispatcher(events);

    model._exists = true;
    model.id = 1;
    await model.Delete();

    expect(spy2).toHaveBeenCalledWith('id', '=', 1);
    expect(spy4).toHaveBeenCalled();
    expect(spy13).toHaveBeenCalled();
  });

  it('push no relations', async () => {
    const model = new FedacoModelStub();
    const query = getBuilder();

    const spy1 = jest.spyOn(model, 'NewModelQuery').mockReturnValue(query);
    const spy11 = jest.spyOn(model, 'UpdateTimestamps').mockReturnValue(true);
    const spy12 = jest.spyOn(model, 'FireModelEvent');
    const spy13 = jest.spyOn(model, 'Refresh'); /* .mockReturnValue(true); */
    const spy2 = jest.spyOn(query, 'where');
    const spy22 = jest.spyOn(query, 'getConnection');
    // @ts-ignore
    const spy3 = jest.spyOn(query, 'insertGetId').mockImplementation((attributes, keyName) => {
      expect(attributes).toEqual({
        name: 'taylor',
      });
      expect(keyName).toBe('id');
      return 1;
    });

    model.name = 'taylor';
    model._exists = false;
    const result = await model.Push();

    expect(result).toBeTruthy();
    expect(model.id).toEqual(1);
    expect(model._exists).toBeTruthy();

    expect(spy11).toHaveBeenCalledTimes(1);
    // expect(spy12).toReturnWith(true);
    // expect(spy3).toBeCalledWith({
    //   'name': 'taylor'
    // }, 'id');
    expect(spy22).toHaveBeenCalled();
    expect(spy3).toHaveReturnedWith(1);
  });

  it('push empty one relation', async () => {
    const model = new FedacoModelStub();
    const query = getBuilder();

    const spy1 = jest.spyOn(model, 'NewModelQuery').mockReturnValue(query);
    const spy11 = jest.spyOn(model, 'UpdateTimestamps').mockReturnValue(true);
    const spy12 = jest.spyOn(model, 'FireModelEvent');
    const spy13 = jest.spyOn(model, 'Refresh'); /* .mockReturnValue(true); */
    const spy2 = jest.spyOn(query, 'where');
    const spy22 = jest.spyOn(query, 'getConnection');
    // @ts-ignore
    const spy3 = jest.spyOn(query, 'insertGetId').mockImplementation((attributes, keyName) => {
      expect(attributes).toEqual({
        name: 'taylor',
      });
      expect(keyName).toBe('id');
      return 1;
    });

    model.name = 'taylor';
    model._exists = false;
    model.SetRelation('relationOne', null);
    const result = await model.Push();

    expect(result).toBeTruthy();
    expect(model.id).toEqual(1);
    expect(model._exists).toBeTruthy();
    expect(model.relationOne).toBeNull();

    expect(spy11).toHaveBeenCalledTimes(1);

    expect(spy22).toHaveBeenCalled();
    expect(spy3).toHaveReturnedWith(1);
  });

  it('push one relation', async () => {
    setDispatch(FedacoModelStub, true);

    const related1 = new FedacoModelStub();
    const query = getBuilder();

    const spy1 = jest.spyOn(related1, 'NewModelQuery').mockReturnValue(query);
    const spy11_1 = jest.spyOn(related1, 'UpdateTimestamps').mockReturnValue(true);
    // @ts-ignore
    const spy3 = jest.spyOn(query, 'insertGetId').mockImplementation((attributes, keyName) => {
      expect(attributes).toEqual({
        name: 'related1',
      });
      expect(keyName).toBe('id');
      return 2;
    });

    related1.name = 'related1';
    related1._exists = false;

    // ######################################## model
    const model = new FedacoModelStub();
    const query2 = getBuilder();
    const spy2 = jest.spyOn(model, 'NewModelQuery').mockReturnValue(query2);
    const spy11 = jest.spyOn(model, 'UpdateTimestamps').mockReturnValue(true);
    // @ts-ignore
    const spy3_3 = jest.spyOn(query2, 'insertGetId').mockImplementation((attributes, keyName) => {
      expect(attributes).toEqual({
        name: 'taylor',
      });
      expect(keyName).toBe('id');
      return 1;
    });

    model.name = 'taylor';
    model._exists = false;
    model.SetRelation('relationOne', related1);

    const result = await model.Push();

    expect(result).toBeTruthy();
    expect(model.id).toEqual(1);
    expect(model._exists).toBeTruthy();
    expect(model.relationOne.id).toEqual(2);
    expect(model.relationOne._exists).toBeTruthy();
    expect(related1.id).toEqual(2);
    expect(related1._exists).toBeTruthy();
  });

  it('push empty many relation', async () => {
    const model = new FedacoModelStub();
    const query = getBuilder();

    const spy1 = jest.spyOn(model, 'NewModelQuery').mockReturnValue(query);
    const spy11 = jest.spyOn(model, 'UpdateTimestamps').mockReturnValue(true);
    const spy22 = jest.spyOn(query, 'getConnection');
    // @ts-ignore
    const spy3 = jest.spyOn(query, 'insertGetId').mockImplementation((attributes, keyName) => {
      expect(attributes).toEqual({
        name: 'taylor',
      });
      expect(keyName).toBe('id');
      return 1;
    });

    model.name = 'taylor';
    model._exists = false;
    model.SetRelation('relationMany', []);
    const result = await model.Push();

    expect(result).toBeTruthy();
    expect(model.id).toEqual(1);
    expect(model._exists).toBeTruthy();
    expect(model.relationMany).toEqual([]);

    expect(spy11).toHaveBeenCalledTimes(1);

    expect(spy22).toHaveBeenCalled();
    expect(spy3).toHaveReturnedWith(1);
  });

  it('push many relation', async () => {
    setDispatch(FedacoModelStub, true);

    // #### related1
    const related1 = new FedacoModelStub();
    const query0 = getBuilder();

    const spy1 = jest.spyOn(related1, 'NewModelQuery').mockReturnValue(query0);
    const spy11_1 = jest.spyOn(related1, 'UpdateTimestamps').mockReturnValue(true);
    // @ts-ignore
    const spy3 = jest.spyOn(query0, 'insertGetId').mockImplementation((attributes, keyName) => {
      expect(attributes).toEqual({
        name: 'related1',
      });
      expect(keyName).toBe('id');
      return 2;
    });

    related1.name = 'related1';
    related1._exists = false;

    // #### related2
    const related2 = new FedacoModelStub();
    const query1 = getBuilder();

    const spy1_1 = jest.spyOn(related2, 'NewModelQuery').mockReturnValue(query1);
    const spy11_11 = jest.spyOn(related2, 'UpdateTimestamps').mockReturnValue(true);
    // @ts-ignore
    const spy3_1 = jest.spyOn(query1, 'insertGetId').mockImplementation((attributes, keyName) => {
      expect(attributes).toEqual({
        name: 'related2',
      });
      expect(keyName).toBe('id');
      return 3;
    });

    related2.name = 'related2';
    related2._exists = false;

    // #### model
    const model = new FedacoModelStub();
    const query2 = getBuilder();

    const spy1_2 = jest.spyOn(model, 'NewModelQuery').mockReturnValue(query2);
    const spy11 = jest.spyOn(model, 'UpdateTimestamps').mockReturnValue(true);
    // @ts-ignore
    const spy3_2 = jest.spyOn(query2, 'insertGetId').mockImplementation((attributes, keyName) => {
      expect(attributes).toEqual({
        name: 'taylor',
      });
      expect(keyName).toBe('id');
      return 1;
    });

    model.name = 'taylor';
    model._exists = false;

    // ####
    model.SetRelation('relationMany', [related1, related2]);

    const result = await model.Push();
    expect(result).toBeTruthy();
    expect(model.id).toEqual(1);
    expect(model._exists).toBeTruthy();
    expect((model.relationMany as any[]).length).toBe(2);
    expect(pluck(model.relationMany as any[], 'id')).toEqual([2, 3]);
  });

  it('get and set table operations', () => {
    const model = new FedacoModelStub();
    expect(model.GetTable()).toBe('stub');
    model.SetTable('foo');
    expect(model.GetTable()).toBe('foo');
  });

  it('get key returns value of primary key', () => {
    const model = new FedacoModelStub();
    model.id = 1;
    expect(model.GetKey()).toEqual(1);
    expect(model.GetKeyName()).toBe('id');
  });

  it('connection management', () => {
    const resolver: ConnectionResolverInterface = {
      getDefaultConnection(): any {},
      setDefaultConnection(name: string): any {},
      connection() {
        return new Conn();
      },
    };

    FedacoModelStub.setConnectionResolver(resolver);
    const model = new FedacoModelStub();

    const spy1 = jest.spyOn(model, 'GetConnectionName').mockReturnValue('somethingElse');
    // @ts-ignore
    const spy3 = jest.spyOn(resolver, 'connection').mockReturnValue('bar');

    const retval = model.SetConnection('foo');
    const result = model.GetConnection();
    expect(model).toEqual(retval);
    expect(model._connection).toBe('foo');

    // expect(spy1).toBeCalled();

    expect(spy1).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalledWith('somethingElse');

    expect(result).toBe('bar');
  });

  it('to array', () => {
    const model = new FedacoModelStub();
    let array;
    model.name = 'foo';
    model.age = null;
    model.password = 'password1';
    model.SetHidden(['password']);
    model.SetRelation('names', [
      FedacoModelStub.initAttributes({
        bar: 'baz',
      }),
      FedacoModelStub.initAttributes({
        bam: 'boom',
      }),
    ]);
    model.SetRelation(
      'partner',
      FedacoModelStub.initAttributes({
        name: 'abby',
      }),
    );
    model.SetRelation('group', null);
    model.SetRelation('multi', []);
    array = model.ToArray();
    expect(isObject(array)).toBeTruthy();
    expect(array['name']).toBe('foo');
    expect(array['names'][0]['bar']).toBe('baz');
    expect(array['names'][1]['bam']).toBe('boom');
    expect(array['partner']['name']).toBe('abby');
    expect(array['group']).toBeNull();
    expect(array['multi']).toEqual([]);
    expect(array['password'] !== undefined).toBeFalsy();
    // model.setAppends(['appendable']);
    array = model.ToArray();
    // expect(array['appendable']).toBe('appended');
  });

  it('visible creates array whitelist', () => {
    const model = new FedacoModelStub();
    model.SetVisible(['name']);
    model.name = 'Taylor';
    model.age = 26;
    const array = model.ToArray();
    expect(array).toEqual({
      name: 'Taylor',
    });
  });

  it('hidden can also exclude relationships', () => {
    const model = new FedacoModelStub();
    model.name = 'Taylor';
    model.SetRelation('foo', ['bar']);
    model.SetHidden(['foo', 'list_items', 'password']);
    const array = model.ToArray();
    expect(array).toEqual({
      name: 'Taylor',
    });
  });

  it('get arrayable relations function exclude hidden relationships', () => {
    const model = new FedacoModelStub();
    model.SetRelation('foo', ['bar']);
    model.SetRelation('bam', ['boom']);
    model.SetHidden(['foo']);
    const array = model.GetArrayableRelations();
    expect(array).toEqual({
      bam: ['boom'],
    });
  });

  it('to array snake attributes', () => {
    let model = new FedacoModelStub();
    model.SetRelation('namesList', [
      FedacoModelStub.initAttributes({
        bar: 'baz',
      }),
      FedacoModelStub.initAttributes({
        bam: 'boom',
      }),
    ]);
    let array = model.ToArray();
    expect(array['names_list'][0]['bar']).toBe('baz');
    expect(array['names_list'][1]['bam']).toBe('boom');
    model = new FedacoModelCamelStub();
    model.SetRelation('namesList', [
      FedacoModelStub.initAttributes({
        bar: 'baz',
      }),
      FedacoModelStub.initAttributes({
        bam: 'boom',
      }),
    ]);
    array = model.ToArray();
    expect(array['namesList'][0]['bar']).toBe('baz');
    expect(array['namesList'][1]['bam']).toBe('boom');
  });

  it('to array uses mutators', () => {
    const model = new FedacoModelStub();
    model.list_items = [1, 2, 3];
    const array = model.ToArray();
    expect(array['list_items']).toEqual([1, 2, 3]);
  });

  it('hidden', () => {
    const model = FedacoModelStub.initAttributes({
      name: 'foo',
      age : 'bar',
      id  : 'baz',
    });
    model.SetHidden(['age', 'id']);
    const array = model.ToArray();
    expect(array).toHaveProperty('name');
    expect(array).not.toHaveProperty('age');
  });

  it('visible', () => {
    const model = FedacoModelStub.initAttributes({
      name: 'foo',
      age : 'bar',
      id  : 'baz',
    });
    model.SetVisible(['name', 'id']);
    const array = model.ToArray();
    expect(array).toHaveProperty('name');
    expect(array).not.toHaveProperty('age');
  });

  it('dynamic hidden', () => {
    const model = FedacoModelDynamicHiddenStub.initAttributes({
      name: 'foo',
      age : 'bar',
      id  : 'baz',
    });
    const array = model.ToArray();
    expect(array).toHaveProperty('name');
    expect(array).not.toHaveProperty('age');
  });

  it('with hidden', () => {
    const model = FedacoModelStub.initAttributes({
      name: 'foo',
      age : 'bar',
      id  : 'baz',
    });
    model.SetHidden(['age', 'id']);
    model.MakeVisible('age');
    const array = model.ToArray();
    expect(array).toHaveProperty('name');
    expect(array).toHaveProperty('age');
    expect(array).not.toHaveProperty('id');
  });

  it('make hidden', () => {
    const model = FedacoModelStub.initAttributes({
      name   : 'foo',
      age    : 'bar',
      address: 'foobar',
      id     : 'baz',
    });
    let array = model.ToArray();
    expect(array).toHaveProperty('name');
    expect(array).toHaveProperty('age');
    expect(array).toHaveProperty('address');
    expect(array).toHaveProperty('id');
    array = model.MakeHidden('address').ToArray();
    expect(array).not.toHaveProperty('address');
    expect(array).toHaveProperty('name');
    expect(array).toHaveProperty('age');
    expect(array).toHaveProperty('id');
    array = model.MakeHidden(['name', 'age']).ToArray();
    expect(array).not.toHaveProperty('name');
    expect(array).not.toHaveProperty('age');
    expect(array).not.toHaveProperty('address');
    expect(array).toHaveProperty('id');
  });

  it('dynamic visible', () => {
    const model = FedacoModelDynamicVisibleStub.initAttributes({
      name: 'foo',
      age : 'bar',
      id  : 'baz',
    });
    const array = model.ToArray();
    expect(array).toHaveProperty('name');
    expect(array).not.toHaveProperty('age');
  });

  it('make visible if', () => {
    const model = FedacoModelStub.initAttributes({
      name: 'foo',
      age : 'bar',
      id  : 'baz',
    });
    model.SetHidden(['age', 'id']);
    model.MakeVisibleIf(true, 'age');
    let array = model.ToArray();
    expect(array).toHaveProperty('name');
    expect(array).toHaveProperty('age');
    expect(array).not.toHaveProperty('id');
    model.SetHidden(['age', 'id']);
    model.MakeVisibleIf(false, 'age');
    array = model.ToArray();
    expect(array).toHaveProperty('name');
    expect(array).not.toHaveProperty('age');
    expect(array).not.toHaveProperty('id');
    model.SetHidden(['age', 'id']);
    model.MakeVisibleIf((m: FedacoModelStub) => {
      return !isBlank(m.name);
    }, 'age');
    array = model.ToArray();
    expect(array).toHaveProperty('name');
    expect(array).toHaveProperty('age');
    expect(array).not.toHaveProperty('id');
  });

  it('make hidden if', () => {
    const model = FedacoModelStub.initAttributes({
      name   : 'foo',
      age    : 'bar',
      address: 'foobar',
      id     : 'baz',
    });
    let array = model.ToArray();
    expect(array).toHaveProperty('name');
    expect(array).toHaveProperty('age');
    expect(array).toHaveProperty('address');
    expect(array).toHaveProperty('id');
    array = model.MakeHiddenIf(true, 'address').ToArray();
    expect(array).not.toHaveProperty('address');
    expect(array).toHaveProperty('name');
    expect(array).toHaveProperty('age');
    expect(array).toHaveProperty('id');
    model.MakeVisible('address');
    array = model.MakeHiddenIf(false, ['name', 'age']).ToArray();
    expect(array).toHaveProperty('name');
    expect(array).toHaveProperty('age');
    expect(array).toHaveProperty('address');
    expect(array).toHaveProperty('id');
    array = model
      .MakeHiddenIf(
        (m: FedacoModelStub) => {
          return !isBlank(m.id);
        },
        ['name', 'age'],
      )
      .ToArray();
    expect(array).toHaveProperty('address');
    expect(array).not.toHaveProperty('name');
    expect(array).not.toHaveProperty('age');
    expect(array).toHaveProperty('id');
  });

  it('fillable', () => {
    const model = new FedacoModelStub();
    model.Fillable(['name', 'age']);
    model.Fill({
      name: 'foo',
      age : 'bar',
    });
    expect(model.name).toBe('foo');
    expect(model.age).toBe('bar');
  });

  it('qualify column', () => {
    const model = new FedacoModelStub();
    expect(model.QualifyColumn('column')).toBe('stub.column');
  });

  it('force fill method fills guarded attributes', async () => {
    const model = await new FedacoModelSaveStub().ForceFill({
      id: 21,
    });
    expect(model.id).toEqual(21);
  });

  it('filling json attributes', () => {
    let model: Model = new FedacoModelStub();
    model.Fillable(['meta->name', 'meta->price', 'meta->size->width']);
    model.Fill({
      'meta->name'       : 'foo',
      'meta->price'      : 'bar',
      'meta->size->width': 'baz',
    });
    expect(model.ToArray()).toEqual({
      meta: JSON.stringify({
        name : 'foo',
        price: 'bar',
        size : {
          width: 'baz',
        },
      }),
    });
    model = FedacoModelStub.initAttributes({
      meta: JSON.stringify({
        name: 'Taylor',
      }),
    });
    model.Fillable(['meta->name', 'meta->price', 'meta->size->width']);
    model.Fill({
      'meta->name'       : 'foo',
      'meta->price'      : 'bar',
      'meta->size->width': 'baz',
    });
    expect(model.ToArray()).toEqual({
      meta: JSON.stringify({
        name : 'foo',
        price: 'bar',
        size : {
          width: 'baz',
        },
      }),
    });
  });

  it('unguard allows anything to be set', () => {
    const model = new FedacoModelStub();
    FedacoModelStub.unguard();
    model.Guard(['*']);
    model.Fill({
      name: 'foo',
      age : 'bar',
    });
    expect(model.name).toBe('foo');
    expect(model.age).toBe('bar');
    FedacoModelStub.unguard(false);
  });

  // xit('underscore properties are not filled', () => {
  //   const model = new FedacoModelStub();
  //   model.Fill({
  //     '_method': 'PUT'
  //   });
  //   expect(model.getAttributes()).toEqual([]);
  // });

  it('guarded', () => {
    const model = new FedacoModelStub();
    model.Guard(['name', 'age']);
    model.Fill({
      name: 'foo',
      age : 'bar',
      foo : 'bar',
    });
    expect(model.name !== undefined).toBeFalsy();
    expect(model.age !== undefined).toBeFalsy();
    expect(model.foo).toBe('bar');
  });

  it('fillable overrides guarded', () => {
    const model = new FedacoModelStub();
    model.Guard(['name', 'age']);
    model.Fillable(['age', 'foo']);
    model.Fill({
      name: 'foo',
      age : 'bar',
      foo : 'bar',
    });
    expect(model.name !== undefined).toBeFalsy();
    expect(model.age).toBe('bar');
    expect(model.foo).toBe('bar');
  });

  it('global guarded', () => {
    const model = new FedacoModelGlobalGuardedStub();
    model.Guard(['*']);
    expect(() => {
      model.Fill({
        name : 'foo',
        age  : 'bar',
        votes: 'baz',
      });
    }).toThrow('MassAssignmentException');
  });

  it('unguarded runs callback while being unguarded', async () => {
    const model = await FedacoModelStub.unguarded(async () => {
      return new FedacoModelStub().Guard(['*']).Fill({
        name: 'Taylor',
      });
    });
    expect(model.name).toBe('Taylor');
    expect(Model.isUnguarded()).toBeFalsy();
  });

  it('unguarded call does not change unguarded state', async () => {
    FedacoModelStub.unguard();
    const model = await FedacoModelStub.unguarded(async () => {
      return new FedacoModelStub().Guard(['*']).Fill({
        name: 'Taylor',
      });
    });
    expect(model.name).toBe('Taylor');
    expect(FedacoModelStub.isUnguarded()).toBeTruthy();
    FedacoModelStub.reguard();
  });

  it('unguarded call does not change unguarded state on exception', () => {
    try {
      Model.unguarded(() => {
        throw new Error();
      });
    } catch (e) {}
    expect(Model.isUnguarded()).toBeFalsy();
  });

  // xit('has one creates proper relation', () => {
  //   let model = new FedacoModelStub();
  //   resolveModel(model);
  //   let relation = (model as any).hasOne(FedacoModelSaveStub);
  //   expect(relation.getQualifiedForeignKeyName()).toBe('save_stub.fedaco_model_stub_id');
  //   model = new FedacoModelStub();
  //   resolveModel(model);
  //   relation = (model as any).hasOne(FedacoModelSaveStub, 'foo');
  //   expect(relation.getQualifiedForeignKeyName()).toBe('save_stub.foo');
  //   expect(relation.getParent()).toEqual(model);
  //   expect(relation.getQuery().getModel()).toBeInstanceOf(FedacoModelSaveStub);
  // });
  //
  // xit('morph one creates proper relation', () => {
  //   const model = new FedacoModelStub();
  //   resolveModel(model);
  //   const relation = (model as any).morphOne(FedacoModelSaveStub, 'morph');
  //   expect(relation.getQualifiedForeignKeyName()).toBe('save_stub.morph_id');
  //   expect(relation.getQualifiedMorphType()).toBe('save_stub.morph_type');
  //   expect(relation.getMorphClass()).toEqual(FedacoModelStub);
  // });
  //
  // xit('correct morph class is returned', () => {
  //   Relation.morphMap({
  //     alias: 'AnotherModel',
  //   });
  //   const model = new FedacoModelStub();
  //   try {
  //     expect(model.GetMorphClass()).toEqual(FedacoModelStub);
  //   } finally {
  //     Relation.morphMap([], false);
  //   }
  // });
  //
  // xit('has many creates proper relation', () => {
  //   let model = new FedacoModelStub();
  //   resolveModel(model);
  //   let relation = (model as any).hasMany(FedacoModelSaveStub);
  //   expect(relation.getQualifiedForeignKeyName()).toBe('save_stub.fedaco_model_stub_id');
  //   model = new FedacoModelStub();
  //   resolveModel(model);
  //   relation = (model as any).hasMany(FedacoModelSaveStub, 'foo');
  //   expect(relation.getQualifiedForeignKeyName()).toBe('save_stub.foo');
  //   expect(relation.getParent()).toEqual(model);
  //   expect(relation.getQuery().getModel()).toBeInstanceOf(FedacoModelSaveStub);
  // });
  //
  // xit('morph many creates proper relation', () => {
  //   const model = new FedacoModelStub();
  //   resolveModel(model);
  //   const relation = (model as any).morphMany(FedacoModelSaveStub, 'morph');
  //   expect(relation.getQualifiedForeignKeyName()).toBe('save_stub.morph_id');
  //   expect(relation.getQualifiedMorphType()).toBe('save_stub.morph_type');
  //   expect(relation.getMorphClass()).toEqual(FedacoModelStub);
  // });
  //
  // xit('belongs to creates proper relation', () => {
  //   let model = new FedacoModelStub();
  //   resolveModel(model);
  //   let relation = model.belongsToStub();
  //   expect(relation.getForeignKeyName()).toBe('belongs_to_stub_id');
  //   expect(relation.getParent()).toEqual(model);
  //   expect(relation.getQuery().getModel()).toBeInstanceOf(FedacoModelSaveStub);
  //   model = new FedacoModelStub();
  //   resolveModel(model);
  //   relation = model.belongsToExplicitKeyStub();
  //   expect(relation.getForeignKeyName()).toBe('foo');
  // });
  //
  // xit('morph to creates proper relation', () => {
  //   const model = new FedacoModelStub();
  //   resolveModel(model);
  //   const relation = model.morphToStub();
  //   expect(relation.getForeignKeyName()).toBe('morph_to_stub_id');
  //   expect(relation.getMorphType()).toBe('morph_to_stub_type');
  //   expect(relation.getRelationName()).toBe('morphToStub');
  //   expect(relation.getParent()).toEqual(model);
  //   expect(relation.getQuery().getModel()).toBeInstanceOf(FedacoModelSaveStub);
  //   const relation2 = model.morphToStubWithKeys();
  //   expect(relation2.getForeignKeyName()).toBe('id');
  //   expect(relation2.getMorphType()).toBe('type');
  //   expect(relation2.getRelationName()).toBe('morphToStubWithKeys');
  //   const relation3 = model.morphToStubWithName();
  //   expect(relation3.getForeignKeyName()).toBe('some_name_id');
  //   expect(relation3.getMorphType()).toBe('some_name_type');
  //   expect(relation3.getRelationName()).toBe('someName');
  //   const relation4 = model.morphToStubWithNameAndKeys();
  //   expect(relation4.getForeignKeyName()).toBe('id');
  //   expect(relation4.getMorphType()).toBe('type');
  //   expect(relation4.getRelationName()).toBe('someName');
  // });
  //
  // xit('belongs to many creates proper relation', () => {
  //   let model = new FedacoModelStub();
  //   resolveModel(model);
  //   let relation = (model as any).belongsToMany(FedacoModelSaveStub);
  //   expect(relation.getQualifiedForeignPivotKeyName()).toBe(
  //     'fedaco_model_save_stub_fedaco_model_stub.fedaco_model_stub_id',
  //   );
  //   expect(relation.getQualifiedRelatedPivotKeyName()).toBe(
  //     'fedaco_model_save_stub_fedaco_model_stub.fedaco_model_save_stub_id',
  //   );
  //   expect(relation.getParent()).toEqual(model);
  //   expect(relation.getQuery().getModel()).toBeInstanceOf(FedacoModelSaveStub);
  //   expect(relation.getRelationName()).toEqual('ddddd');
  //   model = new FedacoModelStub();
  //   resolveModel(model);
  //   relation = (model as any).belongsToMany(FedacoModelSaveStub, 'table', 'foreign', 'other');
  //   expect(relation.getQualifiedForeignPivotKeyName()).toBe('table.foreign');
  //   expect(relation.getQualifiedRelatedPivotKeyName()).toBe('table.other');
  //   expect(relation.getParent()).toEqual(model);
  //   expect(relation.getQuery().getModel()).toBeInstanceOf(FedacoModelSaveStub);
  // });

  // xit('relations with varied connections', () => {
  //   let model = new FedacoModelStub();
  //   model.setConnection('non_default');
  //   resolveModel(model);
  //   let relation = model.hasOne(EloquentNoConnectionModelStub);
  //   expect(relation.getRelated().getConnectionName()).toBe('non_default');
  //   model = new FedacoModelStub();
  //   model.setConnection('non_default');
  //   resolveModel(model);
  //   relation = model.hasOne(EloquentDifferentConnectionModelStub);
  //   expect(relation.getRelated().getConnectionName()).toBe('different_connection');
  //   model = new FedacoModelStub();
  //   model.setConnection('non_default');
  //   resolveModel(model);
  //   relation = model.morphOne(EloquentNoConnectionModelStub, 'type');
  //   expect(relation.getRelated().getConnectionName()).toBe('non_default');
  //   model = new FedacoModelStub();
  //   model.setConnection('non_default');
  //   resolveModel(model);
  //   relation = model.morphOne(EloquentDifferentConnectionModelStub, 'type');
  //   expect(relation.getRelated().getConnectionName()).toBe('different_connection');
  //   model = new FedacoModelStub();
  //   model.setConnection('non_default');
  //   resolveModel(model);
  //   relation = model.belongsTo(EloquentNoConnectionModelStub);
  //   expect(relation.getRelated().getConnectionName()).toBe('non_default');
  //   model = new FedacoModelStub();
  //   model.setConnection('non_default');
  //   resolveModel(model);
  //   relation = model.belongsTo(EloquentDifferentConnectionModelStub);
  //   expect(relation.getRelated().getConnectionName()).toBe('different_connection');
  //   model = new FedacoModelStub();
  //   model.setConnection('non_default');
  //   resolveModel(model);
  //   relation = model.hasMany(EloquentNoConnectionModelStub);
  //   expect(relation.getRelated().getConnectionName()).toBe('non_default');
  //   model = new FedacoModelStub();
  //   model.setConnection('non_default');
  //   resolveModel(model);
  //   relation = model.hasMany(EloquentDifferentConnectionModelStub);
  //   expect(relation.getRelated().getConnectionName()).toBe('different_connection');
  //   model = new FedacoModelStub();
  //   model.setConnection('non_default');
  //   resolveModel(model);
  //   relation = model.hasManyThrough(EloquentNoConnectionModelStub, FedacoModelSaveStub);
  //   expect(relation.getRelated().getConnectionName()).toBe('non_default');
  //   model = new FedacoModelStub();
  //   model.setConnection('non_default');
  //   resolveModel(model);
  //   relation = model.hasManyThrough(EloquentDifferentConnectionModelStub,
  //     FedacoModelSaveStub);
  //   expect(relation.getRelated().getConnectionName()).toBe('different_connection');
  //   model = new FedacoModelStub();
  //   model.setConnection('non_default');
  //   resolveModel(model);
  //   relation = model.belongsToMany(EloquentNoConnectionModelStub);
  //   expect(relation.getRelated().getConnectionName()).toBe('non_default');
  //   model = new FedacoModelStub();
  //   model.setConnection('non_default');
  //   resolveModel(model);
  //   relation = model.belongsToMany(EloquentDifferentConnectionModelStub);
  //   expect(relation.getRelated().getConnectionName()).toBe('different_connection');
  // });

  it('models assume their name', () => {
    const model = new FedacoModelWithoutTableStub();
    expect(model.GetTable()).toBe('fedaco_model_without_table_stubs');
    const namespacedModel = new FedacoModelNamespacedModel();
    expect(namespacedModel.GetTable()).toBe('fedaco_model_namespaced_models');
  });

  // xit('the mutator cache is populated', () => {
  //   const clazz = new FedacoModelStub();
  //   const expectedAttributes = ['list_items', 'password', 'appendable'];
  //   expect(clazz.getMutatedAttributes()).toEqual(expectedAttributes);
  // });

  it('route key is primary key', () => {
    const model = new FedacoModelNonIncrementingStub();
    model.id = 'foo';
    expect(model.GetRouteKey()).toBe('foo');
  });

  it('route name is primary key name', () => {
    const model = new FedacoModelStub();
    expect(model.GetRouteKeyName()).toBe('id');
  });

  it('clone model makes a fresh copy of the model', () => {
    const clazz = new FedacoModelStub();
    clazz.id = 1;
    clazz._exists = true;
    clazz.first = 'taylor';
    clazz.last = 'otwell';

    (clazz as KeyAbleModel).created_at = clazz.FreshTimestamp();
    (clazz as KeyAbleModel).updated_at = clazz.FreshTimestamp();
    clazz.SetRelation('foo', ['bar']);
    const clone = clazz.Replicate();
    expect(clone.id).toBeUndefined();
    expect(clone._exists).toBeFalsy();
    expect(clone.first).toBe('taylor');
    expect(clone.last).toBe('otwell');
    expect(clone.GetAttributes()).not.toHaveProperty('created_at');
    expect(clone.GetAttributes()).not.toHaveProperty('updated_at');
    expect(clone.foo).toEqual(['bar']);
  });

  //   it('model observers can be attached to models', () => {
  //     FedacoModelStub.setEventDispatcher(events = m.mock(Dispatcher));
  //     events.shouldReceive('listen').once()._with(
  //       'fedaco.creating: Illuminate\\Tests\\Database\\FedacoModelStub',
  //       EloquentTestObserverStub + '@creating');
  //     events.shouldReceive('listen').once()._with(
  //       'fedaco.saved: Illuminate\\Tests\\Database\\FedacoModelStub',
  //       EloquentTestObserverStub + '@saved');
  //     events.shouldReceive('forget');
  //     FedacoModelStub.observe(new EloquentTestObserverStub());
  //     FedacoModelStub.flushEventListeners();
  //   });

  //   it('model observers can be attached to models with string', () => {
  //     FedacoModelStub.setEventDispatcher(events = m.mock(Dispatcher));
  //     events.shouldReceive('listen').once()._with(
  //       'fedaco.creating: Illuminate\\Tests\\Database\\FedacoModelStub',
  //       EloquentTestObserverStub + '@creating');
  //     events.shouldReceive('listen').once()._with(
  //       'fedaco.saved: Illuminate\\Tests\\Database\\FedacoModelStub',
  //       EloquentTestObserverStub + '@saved');
  //     events.shouldReceive('forget');
  //     FedacoModelStub.observe(EloquentTestObserverStub);
  //     FedacoModelStub.flushEventListeners();
  //   });
  //   it('model observers can be attached to models through an array', () => {
  //     FedacoModelStub.setEventDispatcher(events = m.mock(Dispatcher));
  //     events.shouldReceive('listen').once()._with(
  //       'fedaco.creating: Illuminate\\Tests\\Database\\FedacoModelStub',
  //       EloquentTestObserverStub + '@creating');
  //     events.shouldReceive('listen').once()._with(
  //       'fedaco.saved: Illuminate\\Tests\\Database\\FedacoModelStub',
  //       EloquentTestObserverStub + '@saved');
  //     events.shouldReceive('forget');
  //     FedacoModelStub.observe([EloquentTestObserverStub]);
  //     FedacoModelStub.flushEventListeners();
  //   });
  //   it('throw exception on attaching not exists model observer with string', () => {
  //     this.expectException(InvalidArgumentException);
  //     FedacoModelStub.observe(NotExistClass);
  //   });
  //   it('throw exception on attaching not exists model observers through an array', () => {
  //     this.expectException(InvalidArgumentException);
  //     FedacoModelStub.observe([NotExistClass]);
  //   });
  //   it('model observers can be attached to models through calling observe method only once', () => {
  //     FedacoModelStub.setEventDispatcher(events = m.mock(Dispatcher));
  //     events.shouldReceive('listen').once()._with(
  //       'fedaco.creating: Illuminate\\Tests\\Database\\FedacoModelStub',
  //       EloquentTestObserverStub + '@creating');
  //     events.shouldReceive('listen').once()._with(
  //       'fedaco.saved: Illuminate\\Tests\\Database\\FedacoModelStub',
  //       EloquentTestObserverStub + '@saved');
  //     events.shouldReceive('listen').once()._with(
  //       'fedaco.creating: Illuminate\\Tests\\Database\\FedacoModelStub',
  //       EloquentTestAnotherObserverStub + '@creating');
  //     events.shouldReceive('listen').once()._with(
  //       'fedaco.saved: Illuminate\\Tests\\Database\\FedacoModelStub',
  //       EloquentTestAnotherObserverStub + '@saved');
  //     events.shouldReceive('forget');
  //     FedacoModelStub.observe([EloquentTestObserverStub, EloquentTestAnotherObserverStub]);
  //     FedacoModelStub.flushEventListeners();
  //   });
  //   it('without event dispatcher', () => {
  //     FedacoModelSaveStub.setEventDispatcher(events = m.mock(Dispatcher));
  //     events.shouldReceive('listen').once()._with(
  //       'fedaco.creating: Illuminate\\Tests\\Database\\FedacoModelSaveStub',
  //       EloquentTestObserverStub + '@creating');
  //     events.shouldReceive('listen').once()._with(
  //       'fedaco.saved: Illuminate\\Tests\\Database\\FedacoModelSaveStub',
  //       EloquentTestObserverStub + '@saved');
  //     events.shouldNotReceive('until');
  //     events.shouldNotReceive('dispatch');
  //     events.shouldReceive('forget');
  //     FedacoModelSaveStub.observe(EloquentTestObserverStub);
  //     let model = FedacoModelSaveStub.withoutEvents(() => {
  //       let model = new FedacoModelSaveStub();
  //       model.save();
  //       return model;
  //     });
  //     model.withoutEvents(() => {
  //       model.first_name = 'Taylor';
  //       model.save();
  //     });
  //     events.shouldReceive('until').once()._with(
  //       'fedaco.saving: Illuminate\\Tests\\Database\\FedacoModelSaveStub', model);
  //     events.shouldReceive('dispatch').once()._with(
  //       'fedaco.saved: Illuminate\\Tests\\Database\\FedacoModelSaveStub', model);
  //     model.last_name = 'Otwell';
  //     model.save();
  //     FedacoModelSaveStub.flushEventListeners();
  //   });
  //   it('set observable events', () => {
  //     let clazz = new FedacoModelStub();
  //     clazz.setObservableEvents(['foo']);
  //     expect(clazz.getObservableEvents()).toContains('foo');
  //   });
  //   it('add observable event', () => {
  //     let clazz = new FedacoModelStub();
  //     clazz.addObservableEvents('foo');
  //     expect(clazz.getObservableEvents()).toContains('foo');
  //   });
  //   it('add multiple observeable events', () => {
  //     let clazz = new FedacoModelStub();
  //     clazz.addObservableEvents('foo', 'bar');
  //     expect(clazz.getObservableEvents()).toContains('foo');
  //     expect(clazz.getObservableEvents()).toContains('bar');
  //   });
  //   it('remove observable event', () => {
  //     let clazz = new FedacoModelStub();
  //     clazz.setObservableEvents(['foo', 'bar']);
  //     clazz.removeObservableEvents('bar');
  //     expect(clazz.getObservableEvents()).toNotContains('bar');
  //   });
  //   it('remove multiple observable events', () => {
  //     let clazz = new FedacoModelStub();
  //     clazz.setObservableEvents(['foo', 'bar']);
  //     clazz.removeObservableEvents('foo', 'bar');
  //     expect(clazz.getObservableEvents()).toNotContains('foo');
  //     expect(clazz.getObservableEvents()).toNotContains('bar');
  //   });
  //   it('get model attribute method throws exception if not relation', () => {
  //     this.expectException(LogicException);
  //     this.expectExceptionMessage(
  //       'Illuminate\\Tests\\Database\\FedacoModelStub::incorrectRelationStub must return a relationship instance.');
  //     let model = new FedacoModelStub();
  //     model.incorrectRelationStub;
  //   });
  //   it('model is booted on unserialize', () => {
  //     let model = new FedacoModelBootingTestStub();
  //     expect(FedacoModelBootingTestStub.isBooted()).toBeTruthy();
  //     model.foo = 'bar';
  //     let string = serialize(model);
  //     let model = null;
  //     FedacoModelBootingTestStub.unboot();
  //     expect(FedacoModelBootingTestStub.isBooted()).toBeFalsy();
  //     unserialize(string);
  //     expect(FedacoModelBootingTestStub.isBooted()).toBeTruthy();
  //   });
  //   it('models trait is initialized', () => {
  //     let model = new FedacoModelStubWithTrait();
  //     expect(model.fooBarIsInitialized).toBeTruthy();
  //   });
  //   it('appending of attributes', () => {
  //     let model = new FedacoModelAppendsStub();
  //     expect(model.is_admin !== undefined).toBeTruthy();
  //     expect(model.camelCased !== undefined).toBeTruthy();
  //     expect(model.StudlyCased !== undefined).toBeTruthy();
  //     expect(model.is_admin).toBe('admin');
  //     expect(model.camelCased).toBe('camelCased');
  //     expect(model.StudlyCased).toBe('StudlyCased');
  //     expect(model.hasAppended('is_admin')).toBeTruthy();
  //     expect(model.hasAppended('camelCased')).toBeTruthy();
  //     expect(model.hasAppended('StudlyCased')).toBeTruthy();
  //     expect(model.hasAppended('not_appended')).toBeFalsy();
  //     model.setHidden(['is_admin', 'camelCased', 'StudlyCased']);
  //     expect(model.toArray()).toEqual([]);
  //     model.setVisible([]);
  //     expect(model.toArray()).toEqual([]);
  //   });
  //   it('get mutated attributes', () => {
  //     let model = new FedacoModelGetMutatorsStub();
  //     expect(model.getMutatedAttributes()).toEqual(['first_name', 'middle_name', 'last_name']);
  //     FedacoModelGetMutatorsStub.resetMutatorCache();
  //     FedacoModelGetMutatorsStub.snakeAttributes = false;
  //     expect(model.getMutatedAttributes()).toEqual(['firstName', 'middleName', 'lastName']);
  //   });
  it('replicate creates a new model instance with same attribute values', () => {
    const model = new FedacoTimestampStub();
    jest.spyOn(model, 'FromDateTime').mockReturnValue('foo date');
    jest.spyOn(model, 'AsDateTime').mockImplementation((value) => value);
    model.id = 'id';
    model.foo = 'bar';
    model.created_at = new Date();
    model.updated_at = new Date();
    expect(model.created_at).toBe('foo date');
    expect(model.updated_at).toBe('foo date');
    const replicated = model.Replicate();
    expect(replicated.id).toBeUndefined();
    expect(replicated.foo).toBe('bar');
    expect(replicated.created_at).toBeUndefined();
    expect(replicated.updated_at).toBeUndefined();
  });

  //   it('replicating event is fired when replicating model', () => {
  //     let model = new FedacoModelStub();
  //     model.setEventDispatcher(events = m.mock(Dispatcher));
  //     events.shouldReceive('dispatch').once()._with('fedaco.replicating: ' + get_class(model),
  //       m.on(m => {
  //         return model.is(m);
  //       }));
  //     model.replicate();
  //   });
  //   it('increment on existing model calls query and sets attribute', () => {
  //     let model = m.mock(FedacoModelStub + '[newQueryWithoutRelationships]');
  //     model.exists = true;
  //     model.id = 1;
  //     model.syncOriginalAttribute('id');
  //     model.foo = 2;
  //     model.shouldReceive('newQueryWithoutRelationships').andReturn(query = m.mock(stdClass));
  //     query.shouldReceive('where').andReturn(query);
  //     query.shouldReceive('increment');
  //     model.publicIncrement('foo', 1);
  //     expect(model.isDirty()).toBeFalsy();
  //     model.publicIncrement('foo', 1, {
  //       'category': 1
  //     });
  //     expect(model.foo).toEqual(4);
  //     expect(model.category).toEqual(1);
  //     expect(model.isDirty('category')).toBeTruthy();
  //   });
  //   it('relationship touch owners is propagated', () => {
  //     let relation = this.getMockBuilder(BelongsTo).setMethods(
  //       ['touch']).disableOriginalConstructor().getMock();
  //     relation.expects(this.once()).method('touch');
  //     let model = m.mock(FedacoModelStub + '[partner]');
  //     this.addMockConnection(model);
  //     model.shouldReceive('partner').once().andReturn(relation);
  //     model.setTouchedRelations(['partner']);
  //     let mockPartnerModel = m.mock(FedacoModelStub + '[touchOwners]');
  //     mockPartnerModel.shouldReceive('touchOwners').once();
  //     model.setRelation('partner', mockPartnerModel);
  //     model.touchOwners();
  //   });
  //   it('relationship touch owners is not propagated if no relationship result', () => {
  //     let relation = this.getMockBuilder(BelongsTo).setMethods(
  //       ['touch']).disableOriginalConstructor().getMock();
  //     relation.expects(this.once()).method('touch');
  //     let model = m.mock(FedacoModelStub + '[partner]');
  //     this.addMockConnection(model);
  //     model.shouldReceive('partner').once().andReturn(relation);
  //     model.setTouchedRelations(['partner']);
  //     model.setRelation('partner', null);
  //     model.touchOwners();
  //   });
  //   it('model attributes are casted when present in casts array', () => {
  //     let model = new FedacoModelCastingStub();
  //     model.setDateFormat('Y-m-d H:i:s');
  //     model.intAttribute = '3';
  //     model.floatAttribute = '4.0';
  //     model.stringAttribute = 2.5;
  //     model.boolAttribute = 1;
  //     model.booleanAttribute = 0;
  //     model.objectAttribute = {
  //       'foo': 'bar'
  //     };
  //     let obj = new stdClass();
  //     obj.foo = 'bar';
  //     model.arrayAttribute = obj;
  //     model.jsonAttribute = {
  //       'foo': 'bar'
  //     };
  //     model.dateAttribute = '1969-07-20';
  //     model.datetimeAttribute = '1969-07-20 22:56:00';
  //     model.timestampAttribute = '1969-07-20 22:56:00';
  //     model.collectionAttribute = new BaseCollection();
  //     expect(model.intAttribute).toIsInt();
  //     expect(model.floatAttribute).toIsFloat();
  //     expect(model.stringAttribute).toIsString();
  //     expect(model.boolAttribute).toIsBool();
  //     expect(model.booleanAttribute).toIsBool();
  //     expect(model.objectAttribute).toIsObject();
  //     expect(model.arrayAttribute).toIsArray();
  //     expect(model.jsonAttribute).toIsArray();
  //     expect(model.boolAttribute).toBeTruthy();
  //     expect(model.booleanAttribute).toBeFalsy();
  //     expect(model.objectAttribute).toEqual(obj);
  //     expect(model.arrayAttribute).toEqual({
  //       'foo': 'bar'
  //     });
  //     expect(model.jsonAttribute).toEqual({
  //       'foo': 'bar'
  //     });
  //     expect(model.jsonAttributeValue()).toBe('{"foo":"bar"}');
  //     expect(model.dateAttribute).toBeInstanceOf(Carbon);
  //     expect(model.datetimeAttribute).toBeInstanceOf(Carbon);
  //     expect(model.collectionAttribute).toBeInstanceOf(BaseCollection);
  //     expect(model.dateAttribute.toDateString()).toBe('1969-07-20');
  //     expect(model.datetimeAttribute.toDateTimeString()).toBe('1969-07-20 22:56:00');
  //     expect(model.timestampAttribute).toEqual(-14173440);
  //     let arr = model.toArray();
  //     expect(arr['intAttribute']).toIsInt();
  //     expect(arr['floatAttribute']).toIsFloat();
  //     expect(arr['stringAttribute']).toIsString();
  //     expect(arr['boolAttribute']).toIsBool();
  //     expect(arr['booleanAttribute']).toIsBool();
  //     expect(arr['objectAttribute']).toIsObject();
  //     expect(arr['arrayAttribute']).toIsArray();
  //     expect(arr['jsonAttribute']).toIsArray();
  //     expect(arr['collectionAttribute']).toIsArray();
  //     expect(arr['boolAttribute']).toBeTruthy();
  //     expect(arr['booleanAttribute']).toBeFalsy();
  //     expect(arr['objectAttribute']).toEqual(obj);
  //     expect(arr['arrayAttribute']).toEqual({
  //       'foo': 'bar'
  //     });
  //     expect(arr['jsonAttribute']).toEqual({
  //       'foo': 'bar'
  //     });
  //     expect(arr['dateAttribute']).toBe('1969-07-20 00:00:00');
  //     expect(arr['datetimeAttribute']).toBe('1969-07-20 22:56:00');
  //     expect(arr['timestampAttribute']).toEqual(-14173440);
  //   });
  //   it('model date attribute casting resets time', () => {
  //     let model = new FedacoModelCastingStub();
  //     model.setDateFormat('Y-m-d H:i:s');
  //     model.dateAttribute = '1969-07-20 22:56:00';
  //     expect(model.dateAttribute.toDateTimeString()).toBe('1969-07-20 00:00:00');
  //     let arr = model.toArray();
  //     expect(arr['dateAttribute']).toBe('1969-07-20 00:00:00');
  //   });
  //   it('model attribute casting preserves null', () => {
  //     let model = new FedacoModelCastingStub();
  //     model.intAttribute = null;
  //     model.floatAttribute = null;
  //     model.stringAttribute = null;
  //     model.boolAttribute = null;
  //     model.booleanAttribute = null;
  //     model.objectAttribute = null;
  //     model.arrayAttribute = null;
  //     model.jsonAttribute = null;
  //     model.dateAttribute = null;
  //     model.datetimeAttribute = null;
  //     model.timestampAttribute = null;
  //     model.collectionAttribute = null;
  //     let attributes = model.getAttributes();
  //     expect(attributes['intAttribute']).toNull();
  //     expect(attributes['floatAttribute']).toNull();
  //     expect(attributes['stringAttribute']).toNull();
  //     expect(attributes['boolAttribute']).toNull();
  //     expect(attributes['booleanAttribute']).toNull();
  //     expect(attributes['objectAttribute']).toNull();
  //     expect(attributes['arrayAttribute']).toNull();
  //     expect(attributes['jsonAttribute']).toNull();
  //     expect(attributes['dateAttribute']).toNull();
  //     expect(attributes['datetimeAttribute']).toNull();
  //     expect(attributes['timestampAttribute']).toNull();
  //     expect(attributes['collectionAttribute']).toNull();
  //     expect(model.intAttribute).toNull();
  //     expect(model.floatAttribute).toNull();
  //     expect(model.stringAttribute).toNull();
  //     expect(model.boolAttribute).toNull();
  //     expect(model.booleanAttribute).toNull();
  //     expect(model.objectAttribute).toNull();
  //     expect(model.arrayAttribute).toNull();
  //     expect(model.jsonAttribute).toNull();
  //     expect(model.dateAttribute).toNull();
  //     expect(model.datetimeAttribute).toNull();
  //     expect(model.timestampAttribute).toNull();
  //     expect(model.collectionAttribute).toNull();
  //     let array = model.toArray();
  //     expect(array['intAttribute']).toNull();
  //     expect(array['floatAttribute']).toNull();
  //     expect(array['stringAttribute']).toNull();
  //     expect(array['boolAttribute']).toNull();
  //     expect(array['booleanAttribute']).toNull();
  //     expect(array['objectAttribute']).toNull();
  //     expect(array['arrayAttribute']).toNull();
  //     expect(array['jsonAttribute']).toNull();
  //     expect(array['dateAttribute']).toNull();
  //     expect(array['datetimeAttribute']).toNull();
  //     expect(array['timestampAttribute']).toNull();
  //     expect(attributes['collectionAttribute']).toNull();
  //   });
  //   it('model attribute casting fails on unencodable data', () => {
  //     this.expectException(JsonEncodingException);
  //     this.expectExceptionMessage(
  //       'Unable to encode attribute [objectAttribute] for model [Illuminate\\Tests\\Database\\FedacoModelCastingStub] to JSON: Malformed UTF-8 characters, possibly incorrectly encoded.');
  //     let model = new FedacoModelCastingStub();
  //     model.objectAttribute = {
  //       'foo': 'b\u00F8r'
  //     };
  //     let obj = new stdClass();
  //     obj.foo = 'b\u00F8r';
  //     model.arrayAttribute = obj;
  //     model.jsonAttribute = {
  //       'foo': 'b\u00F8r'
  //     };
  //     model.getAttributes();
  //   });
  //   it('model attribute casting with special float values', () => {
  //     let model = new FedacoModelCastingStub();
  //     model.floatAttribute = 0;
  //     expect(model.floatAttribute).toEqual(0);
  //     model.floatAttribute = 'Infinity';
  //     expect(model.floatAttribute).toEqual(INF);
  //     model.floatAttribute = INF;
  //     expect(model.floatAttribute).toEqual(INF);
  //     model.floatAttribute = '-Infinity';
  //     expect(model.floatAttribute).toEqual(-INF);
  //     model.floatAttribute = -INF;
  //     expect(model.floatAttribute).toEqual(-INF);
  //     model.floatAttribute = 'NaN';
  //     expect(model.floatAttribute).toNan();
  //     model.floatAttribute = NAN;
  //     expect(model.floatAttribute).toNan();
  //   });
  //   it('merge casts merges casts', () => {
  //     let model = new FedacoModelCastingStub();
  //     let castCount = count(model.getCasts());
  //     expect(model.getCasts()).not.toHaveProperty('foo');
  //     model.mergeCasts({
  //       'foo': 'date'
  //     });
  //     expect(model.getCasts()).toCount(castCount + 1);
  //     expect(model.getCasts()).toHaveProperty('foo');
  //   });
  //   it('updating non existent model fails', () => {
  //     let model = new FedacoModelStub();
  //     expect(model.update()).toBeFalsy();
  //   });
  //   it('isset behaves correctly with attributes and relationships', () => {
  //     let model = new FedacoModelStub();
  //     expect(model.nonexistent !== undefined).toBeFalsy();
  //     model.some_attribute = 'some_value';
  //     expect(model.some_attribute !== undefined).toBeTruthy();
  //     model.setRelation('some_relation', 'some_value');
  //     expect(model.some_relation !== undefined).toBeTruthy();
  //   });
  //   it('non existing attribute with internal method name doesnt call method', () => {
  //     let model = m.mock(FedacoModelStub + '[delete,getRelationValue]');
  //     model.name = 'Spark';
  //     model.shouldNotReceive('delete');
  //     model.shouldReceive('getRelationValue').once()._with('belongsToStub').andReturn('relation');
  //     expect(model.belongsToStub).toBe('relation');
  //     expect(model.name).toBe('Spark');
  //     expect(model.delete).toNull();
  //     let model = m.mock(FedacoModelStub + '[delete]');
  //     model.delete = 123;
  //     expect(model.delete).toEqual(123);
  //   });
  //   it('int key type preserved', () => {
  //     let model = this.getMockBuilder(FedacoModelStub).setMethods(
  //       ['newModelQuery', 'updateTimestamps', 'refresh']).getMock();
  //     let query = m.mock(Builder);
  //     query.shouldReceive('insertGetId').once()._with([], 'id').andReturn(1);
  //     query.shouldReceive('getConnection').once();
  //     model.expects(this.once()).method('newModelQuery').willReturn(query);
  //     expect(model.save()).toBeTruthy();
  //     expect(model.id).toEqual(1);
  //   });
  //   it('string key type preserved', () => {
  //     let model = this.getMockBuilder(EloquentKeyTypeModelStub).setMethods(
  //       ['newModelQuery', 'updateTimestamps', 'refresh']).getMock();
  //     let query = m.mock(Builder);
  //     query.shouldReceive('insertGetId').once()._with([], 'id').andReturn('string id');
  //     query.shouldReceive('getConnection').once();
  //     model.expects(this.once()).method('newModelQuery').willReturn(query);
  //     expect(model.save()).toBeTruthy();
  //     expect(model.id).toBe('string id');
  //   });
  //   it('scopes method', () => {
  //     let model = new FedacoModelStub();
  //     this.addMockConnection(model);
  //     let scopes = {
  //       0: 'published',
  //       'category': 'Laravel',
  //       'framework': ['Laravel', '5.3']
  //     };
  //     expect(model.scopes(scopes)).toBeInstanceOf(Builder);
  //     expect(model.scopesCalled).toEqual(scopes);
  //   });
  //   it('scopes method with string', () => {
  //     let model = new FedacoModelStub();
  //     this.addMockConnection(model);
  //     expect(model.scopes('published')).toBeInstanceOf(Builder);
  //     expect(model.scopesCalled).toEqual(['published']);
  //   });
  //   it('is with null', () => {
  //     let firstInstance = new FedacoModelStub({
  //       'id': 1
  //     });
  //     let secondInstance = null;
  //     expect(firstInstance.is(secondInstance)).toBeFalsy();
  //   });
  //   it('is with the same model instance', () => {
  //     let firstInstance = new FedacoModelStub({
  //       'id': 1
  //     });
  //     let secondInstance = new FedacoModelStub({
  //       'id': 1
  //     });
  //     let result = firstInstance.is(secondInstance);
  //     expect(result).toBeTruthy();
  //   });
  //   it('is with another model instance', () => {
  //     let firstInstance = new FedacoModelStub({
  //       'id': 1
  //     });
  //     let secondInstance = new FedacoModelStub({
  //       'id': 2
  //     });
  //     let result = firstInstance.is(secondInstance);
  //     expect(result).toBeFalsy();
  //   });
  //   it('is with another table', () => {
  //     let firstInstance = new FedacoModelStub({
  //       'id': 1
  //     });
  //     let secondInstance = new FedacoModelStub({
  //       'id': 1
  //     });
  //     secondInstance.setTable('foo');
  //     let result = firstInstance.is(secondInstance);
  //     expect(result).toBeFalsy();
  //   });
  //   it('is with another connection', () => {
  //     let firstInstance = new FedacoModelStub({
  //       'id': 1
  //     });
  //     let secondInstance = new FedacoModelStub({
  //       'id': 1
  //     });
  //     secondInstance.setConnection('foo');
  //     let result = firstInstance.is(secondInstance);
  //     expect(result).toBeFalsy();
  //   });
  //   it('without touching callback', () => {
  //     new FedacoModelStub({
  //       'id': 1
  //     });
  //     let called = false;
  //     FedacoModelStub.withoutTouching(() => {
  //       let called = true;
  //     });
  //     expect(called).toBeTruthy();
  //   });
  //   it('without touching on callback', () => {
  //     new FedacoModelStub({
  //       'id': 1
  //     });
  //     let called = false;
  //     Model.withoutTouchingOn([FedacoModelStub], () => {
  //       let called = true;
  //     });
  //     expect(called).toBeTruthy();
  //   });
  //   it('add mock connection', () => {
  //     model.setConnectionResolver(resolver = m.mock(ConnectionResolverInterface));
  //     resolver.shouldReceive('connection').andReturn(connection = m.mock(Connection));
  //     connection.shouldReceive('getQueryGrammar').andReturn(grammar = m.mock(Grammar));
  //     connection.shouldReceive('getPostProcessor').andReturn(processor = m.mock(Processor));
  //     connection.shouldReceive('query').andReturnUsing(() => {
  //       return new BaseBuilder(connection, grammar, processor);
  //     });
  //   });
  //   it('touching model with timestamps', () => {
  //     expect(Model.isIgnoringTouch(Model)).toBeFalsy();
  //   });
  //   it('not touching model with updated at null', () => {
  //     expect(Model.isIgnoringTouch(FedacoModelWithUpdatedAtNull)).toBeTruthy();
  //   });
  //   it('not touching model without timestamps', () => {
  //     expect(Model.isIgnoringTouch(FedacoModelWithoutTimestamps)).toBeTruthy();
  //   });
  //   it('get original casts attributes', () => {
  //     let model = new FedacoModelCastingStub();
  //     model.intAttribute = '1';
  //     model.floatAttribute = '0.1234';
  //     model.stringAttribute = 432;
  //     model.boolAttribute = '1';
  //     model.booleanAttribute = '0';
  //     let stdClass = new stdClass();
  //     stdClass.json_key = 'json_value';
  //     model.objectAttribute = stdClass;
  //     let array = {
  //       'foo': 'bar'
  //     };
  //     let collection = collect(array);
  //     model.arrayAttribute = array;
  //     model.jsonAttribute = array;
  //     model.collectionAttribute = collection;
  //     model.syncOriginal();
  //     model.intAttribute = 2;
  //     model.floatAttribute = 0.443;
  //     model.stringAttribute = '12';
  //     model.boolAttribute = true;
  //     model.booleanAttribute = false;
  //     model.objectAttribute = stdClass;
  //     model.arrayAttribute = {
  //       'foo': 'bar2'
  //     };
  //     model.jsonAttribute = {
  //       'foo': 'bar2'
  //     };
  //     model.collectionAttribute = collect({
  //       'foo': 'bar2'
  //     });
  //     expect(model.getOriginal('intAttribute')).toIsInt();
  //     expect(model.getOriginal('intAttribute')).toEqual(1);
  //     expect(model.intAttribute).toEqual(2);
  //     expect(model.getAttribute('intAttribute')).toEqual(2);
  //     expect(model.getOriginal('floatAttribute')).toIsFloat();
  //     expect(model.getOriginal('floatAttribute')).toEqual(0.1234);
  //     expect(model.floatAttribute).toEqual(0.443);
  //     expect(model.getOriginal('stringAttribute')).toIsString();
  //     expect(model.getOriginal('stringAttribute')).toBe('432');
  //     expect(model.stringAttribute).toBe('12');
  //     expect(model.getOriginal('boolAttribute')).toIsBool();
  //     expect(model.getOriginal('boolAttribute')).toBeTruthy();
  //     expect(model.boolAttribute).toBeTruthy();
  //     expect(model.getOriginal('booleanAttribute')).toIsBool();
  //     expect(model.getOriginal('booleanAttribute')).toBeFalsy();
  //     expect(model.booleanAttribute).toBeFalsy();
  //     expect(model.getOriginal('objectAttribute')).toEqual(stdClass);
  //     expect(model.getOriginal('objectAttribute')).toEqual(model.getAttribute('objectAttribute'));
  //     expect(model.getOriginal('arrayAttribute')).toEqual(array);
  //     expect(model.getOriginal('arrayAttribute')).toEqual({
  //       'foo': 'bar'
  //     });
  //     expect(model.getAttribute('arrayAttribute')).toEqual({
  //       'foo': 'bar2'
  //     });
  //     expect(model.getOriginal('jsonAttribute')).toEqual(array);
  //     expect(model.getOriginal('jsonAttribute')).toEqual({
  //       'foo': 'bar'
  //     });
  //     expect(model.getAttribute('jsonAttribute')).toEqual({
  //       'foo': 'bar2'
  //     });
  //     expect(model.getOriginal('collectionAttribute').toArray()).toEqual({
  //       'foo': 'bar'
  //     });
  //     expect(model.getAttribute('collectionAttribute').toArray()).toEqual({
  //       'foo': 'bar2'
  //     });
  //   });
  //   it('unsaved model', () => {
  //     let user = new UnsavedModel();
  //     user.name = null;
  //     expect(user.name).toNull();
  //   });
});
// describe('test fedaco test observer stub', () => {
//   it('creating', () => {
//   });
//   it('saved', () => {
//   });
// });
// describe('test fedaco test another observer stub', () => {
//   it('creating', () => {
//   });
//   it('saved', () => {
//   });
// });
//

@Table({
  tableName    : 'stub',
  noPluralTable: true,
})
export class FedacoModelGlobalGuardedStub extends Model {
  _guarded: any = [];

  @Column({
    fillable: false,
  })
  id: number | string;

  @Column({
    fillable: false,
  })
  name: string;

  @Column({
    fillable: false,
  })
  age: number;

  @Column({
    fillable: false,
  })
  votes: number;
}

@Table({
  tableName    : 'stub',
  noPluralTable: true,
})
export class FedacoModelStub extends Model {
  _connection: any;
  _scopesCalled: any = [];
  // _table: any             = 'stub';
  _guarded: any = [];
  morph_to_stub_type: any = FedacoModelSaveStub;

  // _casts: any = {
  //   'castedFloat': 'float'
  // };

  @Column()
  id: number | string;

  @Column({
    fillable: false,
  })
  name: string;

  @Column({
    fillable: false,
  })
  age: number;

  @Column()
  first: string;

  @Column()
  last: string;

  @FloatColumn()
  castedFloat: number;

  @Column()
  list_items: any;

  @Column()
  public get listItems() {
    return JSON.parse(this._attributes['list_items']);
  }

  public set listItems(value) {
    this._attributes['list_items'] = JSON.stringify(value);
  }

  @Column({
    fillable: false,
  })
  foo: any;

  @Column({
    fillable: false,
  })
  bar: any;

  @Column()
  baz: any;

  @Column() first_name: string;
  @Column() last_name: string;
  @Column() project: any;

  @HasOneColumn() relationOne: FedacoRelationType<any>;
  @HasManyColumn() relationMany: FedacoRelationListType<any>;

  // @CreatedAtColumn() created_at: Date | string | number;
  // @UpdatedAtColumn() updated_at: Date | string | number;

  public get password() {
    return '******';
  }

  public set password(value) {
    this._attributes['password_hash'] = createHash('sha1').update(value, 'utf8').digest('hex');
  }

  public publicIncrement(column: string, amount = 1, extra: any[] = []) {
    return this.Increment(column, amount, extra);
  }

  public belongsToStub() {
    // return this.belongsTo(FedacoModelSaveStub);
  }

  public morphToStub() {
    // return this.morphTo();
  }

  public morphToStubWithKeys() {
    // return this.morphTo(null, 'type', 'id');
  }

  public morphToStubWithName() {
    // return this.morphTo('someName');
  }

  public morphToStubWithNameAndKeys() {
    // return this.morphTo('someName', 'type', 'id');
  }

  public belongsToExplicitKeyStub() {
    // return this.belongsTo(FedacoModelSaveStub, 'foo');
  }

  public incorrectRelationStub() {
    return 'foo';
  }

  public GetDates(): any[] {
    return [];
  }

  public get appendable() {
    return 'appended';
  }

  public scopePublished(builder: FedacoBuilder) {
    // this.scopesCalled.push('published');
  }

  public scopeCategory(builder: FedacoBuilder, category: any) {
    // this.scopesCalled['category'] = category;
  }

  public scopeFramework(builder: FedacoBuilder, framework: any, version: any) {
    // this.scopesCalled['framework'] = [framework, version];
  }
}

export class FedacoModelWithDateStub extends FedacoModelStub {
  @Column() created_at: Date | string;
  @Column() updated_at: Date | string;
}

//
// /*trait*/
// export class FooBarTrait {
//   public fooBarIsInitialized: any = false;
//
//   public initializeFooBarTrait() {
//     this.fooBarIsInitialized = true;
//   }
// }
//
// export class FedacoModelStubWithTrait extends FedacoModelStub {
// }
//
export class FedacoModelCamelStub extends FedacoModelStub {
  public static snakeAttributes: any = false;
}

export class FedacoDateModelStub extends FedacoModelStub {
  public GetDates() {
    return ['created_at', 'updated_at'];
  }

  @DateColumn() created_at: Date | string | number;
  @DateColumn() updated_at: Date | string | number;
}

export class FedacoTimestampStub extends FedacoModelStub {
  @CreatedAtColumn() created_at: Date | string | number;
  @UpdatedAtColumn() updated_at: Date | string | number;
}

export class FedacoModelSaveStub extends Model {
  _table: any = 'save_stub';
  _guarded: any = ['id'];

  @Column() id: number;
  @Column() name: string;

  public async Save(options: any): Promise<boolean> {
    // if (this.fireModelEvent('saving') === false) {
    //   return false;
    // }
    global['__fedaco.saved'] = true;
    this.FireModelEvent('saved', false);
    return true;
  }

  public SetIncrementing(value: boolean) {
    this._incrementing = value;
    return this;
  }

  public GetConnection(): Connection {
    const conn = new Conn();
    const grammar = new MysqlQueryGrammar();
    const processor = new Processor();
    const spy1 = jest.spyOn(conn, 'getQueryGrammar').mockReturnValue(grammar);
    const spy2 = jest.spyOn(conn, 'getPostProcessor').mockReturnValue(processor);
    const spy3 = jest.spyOn(conn, 'getName').mockReturnValue('processor');
    const spy4 = jest.spyOn(conn, 'query').mockImplementation(() => {
      return new QueryBuilder(conn, grammar, processor);
    });

    // @ts-ignore
    return conn;
  }
}

//
// export class EloquentKeyTypeModelStub extends FedacoModelStub {
//   protected keyType: any = 'string';
// }
//
export class FedacoModelFindWithWritePdoStub extends Model {
  // public newQuery() {
  //   // let mock = m.mock(Builder);
  //   // mock.shouldReceive('useWritePdo').once().andReturnSelf();
  //   // mock.shouldReceive('find').once()._with(1).andReturn('foo');
  //   // return mock;
  // }
}

export class FedacoModelDestroyStub extends Model {
  // public newQuery() {
  //   let mock = m.mock(Builder);
  //   mock.shouldReceive('whereIn').once()._with('id', [1, 2, 3]).andReturn(mock);
  //   mock.shouldReceive('get').once().andReturn([model = m.mock(stdClass)]);
  //   model.shouldReceive('delete').once();
  //   return mock;
  // }
}

// export class FedacoModelHydrateRawStub extends Model {
//   public static hydrate(items, connection = null) {
//     return 'hydrated';
//   }
//
//   public getConnection() {
//     let mock = m.mock(Connection);
//     mock.shouldReceive('select').once()._with('SELECT ?', ['foo']).andReturn([]);
//     return mock;
//   }
// }
//
export class FedacoModelWithStub extends Model {
  public NewQuery() {
    const builder = getBuilder();
    // @ts-ignore
    const spy1 = jest.spyOn(builder, 'with').mockReturnValue('foo');
    return builder;
  }
}

@Table({
  tableName: 'fedaco_model_without_relation_stub',
})
export class FedacoModelWithoutRelationStub extends Model {
  public _with: any = ['foo'];
  _guarded: any = [];

  // public getEagerLoads() {
  //   return this._eagerLoads;
  // }
}

@Table({
  tableName: 'fedaco_model_without_table_stubs',
})
export class FedacoModelWithoutTableStub extends Model {}

//
// describe('test fedaco model booting test stub', () => {
//   it('unboot', () => {
//     delete FedacoModelBootingTestStub.booted[FedacoModelBootingTestStub];
//   });
//   it('is booted', () => {
//     return array_key_exists(FedacoModelBootingTestStub, FedacoModelBootingTestStub.booted);
//   });
// });
//

@Table({
  tableName: 'fedaco_model_appends_stub',
})
export class FedacoModelAppendsStub extends Model {
  _appends: any = ['is_admin', 'camelCased', 'StudlyCased'];

  public getIsAdminAttribute() {
    return 'admin';
  }

  public getCamelCasedAttribute() {
    return 'camelCased';
  }

  public getStudlyCasedAttribute() {
    return 'StudlyCased';
  }
}

//
// export class FedacoModelGetMutatorsStub extends Model {
//   public static resetMutatorCache() {
//     FedacoModelGetMutatorsStub.mutatorCache = [];
//   }
//
//   public getFirstNameAttribute() {
//   }
//
//   public getMiddleNameAttribute() {
//   }
//
//   public getLastNameAttribute() {
//   }
//
//   public doNotgetFirstInvalidAttribute() {
//   }
//
//   public doNotGetSecondInvalidAttribute() {
//   }
//
//   public doNotgetThirdInvalidAttributeEither() {
//   }
//
//   public doNotGetFourthInvalidAttributeEither() {
//   }
// }
//
export class FedacoModelCastingStub extends Model {
  _dateFormat = 'yyyy-MM-dd HH:mm:ss';

  _fillable = [
    'intAttribute',
    'floatAttribute',
    'stringAttribute',
    'boolAttribute',
    'booleanAttribute',
    'objectAttribute',
    'arrayAttribute',
    'jsonAttribute',
    'collectionAttribute',
    'dateAttribute',
    'datetimeAttribute',
    'timestampAttribute',
  ];

  // _casts: any = {
  //   'intAttribute'       : 'int',
  //   'floatAttribute'     : 'float',
  //   'stringAttribute'    : 'string',
  //   'boolAttribute'      : 'bool',
  //   'booleanAttribute'   : 'boolean',
  //   'objectAttribute'    : 'object',
  //   'arrayAttribute'     : 'array',
  //   'jsonAttribute'      : 'json',
  //   'collectionAttribute': 'collection',
  //   'dateAttribute'      : 'date',
  //   'datetimeAttribute'  : 'datetime',
  //   'timestampAttribute' : 'timestamp'
  // };

  @Column() foo: any;
  @Column() bar: any;

  @IntegerColumn() intAttribute: number;
  @FloatColumn() floatAttribute: number;
  @Column() stringAttribute: string;
  @BooleanColumn() boolAttribute: boolean;
  @BooleanColumn() booleanAttribute: boolean;
  @ObjectColumn() objectAttribute: any;
  @ArrayColumn() arrayAttribute: any[];
  @JsonColumn() jsonAttribute: any;
  @ArrayColumn() collectionAttribute: any[];
  @DateColumn() dateAttribute: Date;
  @DatetimeColumn() datetimeAttribute: Date;
  @TimestampColumn() timestampAttribute: Date;

  @DecimalColumn() defaultDecimal: number;
  @DecimalColumn({ precision: 4 }) precisionDecimal: number;

  public jsonAttributeValue() {
    return this._attributes['jsonAttribute'];
  }

  SerializeDate(date: Date) {
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  }
}

//
export class FedacoModelDynamicHiddenStub extends Model {
  _table: any = 'stub';
  _guarded: any = [];

  public GetHidden() {
    return ['age', 'id'];
  }
}

export class FedacoModelDynamicVisibleStub extends Model {
  _table: any = 'stub';
  _guarded: any = [];

  @Column()
  public GetVisible() {
    return ['name', 'id'];
  }
}

export class FedacoModelNonIncrementingStub extends Model {
  _table: any = 'stub';
  _guarded: any = [];
  _incrementing: any = false;

  @PrimaryColumn()
  id: number | string;
}

//
// export class EloquentNoConnectionModelStub extends FedacoModelStub {
// }
//
// export class EloquentDifferentConnectionModelStub extends FedacoModelStub {
//   public connection: any = 'different_connection';
// }
//
export class FedacoModelSavingEventStub {}

@Table({
  tableName: 'fedaco_model_saving_event_stubs',
})
export class FedacoModelEventObjectStub extends Model {
  @Column() id: number;
  @Column() name: string;

  protected dispatchesEvents: any = {
    saving: FedacoModelSavingEventStub,
  };
}

@Table({
  tableName: 'stubs',
})
export class FedacoModelWithoutTimestamps extends Model {
  // _table: any            = 'stub';
  public timestamps: any = false;
}

@Table({
  tableName: 'stub',
})
export class FedacoModelWithUpdatedAtNull extends Model {
  _table: any = 'stub';
}

export class UnsavedModel extends Model {
  _casts: any = {
    name: Uppercase,
  };
}

export class Uppercase /* implements CastsInboundAttributes */ {
  public set(model: Model, key: string, value: any, attributes: any) {
    return isString(value) ? value.toUpperCase() : value;
  }
}
