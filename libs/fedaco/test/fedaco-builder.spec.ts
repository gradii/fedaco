import { PrimaryGeneratedColumn } from '@gradii/fedaco';
import { isFunction } from '@gradii/nanofn';
import { format } from 'date-fns';
import { Table } from '../src/annotation/table/table';
import { ConnectionFactory } from '../src/connector/connection-factory';
import { DatabaseManager } from '../src/database-manager';
import { DatabaseTransactionsManager } from '../src/database-transactions-manager';
import { FedacoBuilder } from '../src/fedaco/fedaco-builder';
import { Model } from '../src/fedaco/model';
import { onlyTrashed, withTrashed } from '../src/fedaco/scopes/soft-deleting-scope';
import { ConnectionResolverInterface } from '../src/interface/connection-resolver-interface';
import { ConnectionInterface } from '../src/query-builder/connection-interface';
import { MysqlQueryGrammar } from '../src/query-builder/grammar/mysql-query-grammar';
import { SqliteQueryGrammar } from '../src/query-builder/grammar/sqlite-query-grammar';
import { Processor } from '../src/query-builder/processor';
import { QueryBuilder } from '../src/query-builder/query-builder';
import { SchemaBuilder } from '../src/schema/schema-builder';
import { FedacoBuilderTestHigherOrderWhereScopeStub } from './model/fedaco-builder-test-higher-order-where-scope-stub';
import { FedacoBuilderTestNestedStub } from './model/fedaco-builder-test-nested-stub';
import { FedacoBuilderTestScopeStub } from './model/fedaco-builder-test-scope-stub';
import { StubModel } from './model/stub-model';

const _global: any = {};


describe('fedaco builder', () => {
  let model: Model, builder: FedacoBuilder;

  class Conn implements ConnectionInterface {
    getQueryGrammar(): any {

    }

    getDatabaseName(): string {
      return 'default-database';
    }

    getPostProcessor(): any {

    }

    query(): QueryBuilder {
      return new QueryBuilder(
        this,
        new SqliteQueryGrammar(),
        new Processor()
      );
    }

    async select() {
      return await Promise.resolve();
    }

    async insert(sql: string, bindings: any[]): Promise<boolean> {
      return false;
    }

    async update() {
    }

    async delete() {
    }

    async statement() {
    }

    async affectingStatement() {
    }

    getName() {
      return '';
    }

    getConfig(name: string): any {
    }

    getPdo(): any {
    }

    getSchemaBuilder(): SchemaBuilder {
      throw new Error('not implemented');
    }

    recordsHaveBeenModified(): any {
    }

    selectFromWriteConnection(sql: string, values: any): any {
    }

    table(table: Function | QueryBuilder | string, as?: string): QueryBuilder {
      return undefined;
    }

    insertGetId(sql: string, bindings: any[], sequence?: string): Promise<any> | boolean {
      return undefined;
    }

    _transactions: number;
    _transactionsManager: DatabaseTransactionsManager;

    afterCommit(callback: Function): Promise<void> {
      return Promise.resolve(undefined);
    }

    beginTransaction(): Promise<void> {
      return Promise.resolve(undefined);
    }

    commit(): Promise<void> {
      return Promise.resolve(undefined);
    }

    rollBack(toLevel?: number | null): Promise<void> {
      return Promise.resolve(undefined);
    }

    setTablePrefix(prefix: string): any {
    }

    setTransactionManager(manager: DatabaseTransactionsManager): this {
      return undefined;
    }

    transaction(callback: (...args: any[]) => Promise<any>, attempts?: number): Promise<any> {
      return Promise.resolve(undefined);
    }

    transactionLevel(): number {
      return 0;
    }

    unsetTransactionManager(): void {
    }
  }

  function resolveModel(model: Model) {
    // model.
    // (model.constructor as typeof Model)._connectionResolver                    = new ResolveConnection();
    (model.constructor as typeof Model).resolver = new DatabaseManager(
      new ConnectionFactory()
    );
  }

  function getModel() {
    const _model = new Model();

    resolveModel(_model);

    jest.spyOn(_model, 'GetKeyName').mockReturnValue('foo');
    jest.spyOn(_model, 'GetTable').mockReturnValue('foo_table');
    jest.spyOn(_model, 'GetQualifiedKeyName').mockReturnValue('foo_table.foo');
    jest.spyOn(_model, 'NewBaseQueryBuilder').mockReturnValue(mockNewQueryBuilder());
    return _model;
  }

  function getStubModel() {
    const _model = new StubModel();

    resolveModel(_model);

    // jest.spyOn(_model, 'getKeyName').mockReturnValue('foo');
    jest.spyOn(_model, 'GetTable').mockReturnValue('stub');
    // jest.spyOn(_model, 'getQualifiedKeyName').mockReturnValue('foo_table.foo');
    return _model;
  }

  function mockNewQueryBuilder() {
    return new QueryBuilder(
      new Conn(),
      new MysqlQueryGrammar(),
      new Processor()
    );
  }

  function getBuilder() {
    return new FedacoBuilder(mockNewQueryBuilder());
  }

  function mockConnectionForModel<T extends typeof Model>(
    modelClazz: any,
    database: string
  ) {
    const grammar    = new SqliteQueryGrammar();
    const processor  = new Processor();
    const connection = new Conn(); // m::mock(ConnectionInterface::class, ['getQueryGrammar' => Grammar, 'getPostProcessor' => Processor]);
    jest.spyOn(connection, 'getQueryGrammar').mockReturnValue(grammar);
    jest.spyOn(connection, 'getPostProcessor').mockReturnValue(processor);

    // jest.spyOn(connection, 'query').mockImplementation(() =>
    //   new QueryBuilder(connection, grammar, processor));
    jest.spyOn(connection, 'getDatabaseName').mockReturnValue('database');

    const resolver: ConnectionResolverInterface = {
      getDefaultConnection(): any {
      },
      setDefaultConnection(name: string): any {
      },
      connection() {
        return connection;
      }
    };
    (modelClazz as typeof Model).setConnectionResolver(resolver);
  }

  beforeEach(() => {
    model          = getModel();
    builder        = getBuilder();
    // @ts-ignore
    builder._model = model;
  });

  it('find method', async () => {
    let spySelect, spyFirst, result;
    spySelect = jest.spyOn(builder.getQuery(), 'where');
    // @ts-ignore
    spyFirst  = jest.spyOn(builder, 'first').mockReturnValue({name: 'baz'});
    result    = await builder.find('bar', ['column']);
    expect(spySelect).toBeCalledWith('foo_table.foo', '=', 'bar', 'and');
    expect(spyFirst).toBeCalledWith(['column']);
    expect(result).toStrictEqual({name: 'baz'});
  });

  it('find many method', async () => {
    let spy1, spy2, result;
    builder = getBuilder();
    builder.setModel(getModel());
    spy1 = jest.spyOn(builder.getQuery(), 'whereIn');
    // @ts-ignore
    spy2 = jest.spyOn(builder, 'get').mockReturnValue(['baz']);

    result = await builder.findMany(['one', 'two'], ['column']);
    expect(spy1).toHaveBeenCalledWith('foo_table.foo', ['one', 'two']);
    expect(spy2).toHaveBeenCalledWith(['column']);
    expect(result).toEqual(['baz']);

    builder = getBuilder();
    builder.setModel(getModel());
    spy1 = jest.spyOn(builder.getQuery(), 'whereIn');
    spy2 = jest.spyOn(builder, 'get').mockReturnValue(Promise.resolve(['baz' as unknown as Model]));

    result = await builder.findMany([], ['column']);
    expect(spy1).toBeCalledTimes(0);
    expect(spy2).toBeCalledTimes(0);
    expect(result).toStrictEqual([]);
  });

  it('find or new method model found', async () => {
    let spy1, spy2, spy3, result, expected;
    builder = getBuilder();
    model   = getModel();
    builder.setModel(model);
    const modelQuery = builder.getModel().NewQuery();

    spy1 = jest.spyOn(builder.getQuery(), 'where');
    // @ts-ignore
    spy2 = jest.spyOn(modelQuery, 'findOrNew').mockReturnValue('baz');
    // @ts-ignore
    spy3 = jest.spyOn(builder, 'first').mockReturnValue('baz');

    expected = await modelQuery.findOrNew('bar', ['column']);
    result   = await builder.find('bar', ['column']);

    expect(builder.getModel()['findOrNew']).toBe(builder.getModel()['findOrNew']);

    expect(spy1).toBeCalledWith('foo_table.foo', '=', 'bar', 'and');
    expect(spy2).toBeCalledTimes(1);
    expect(spy3).toBeCalledWith(['column']);
    expect(result).toBe(expected);
  });

  it('find or new method model not found', async () => {
    let spy1, spy2, spy3, result, findResult;
    builder = getBuilder();
    model   = getModel();
    builder.setModel(model);
    const modelQuery = builder.getModel().NewQuery();

    spy1 = jest.spyOn(builder.getQuery(), 'where');
    spy2 = jest.spyOn(modelQuery, 'findOrNew').mockReturnValue(Promise.resolve(getModel()));
    spy3 = jest.spyOn(builder, 'first').mockReturnValue(undefined);

    result     = await modelQuery.findOrNew('bar', ['column']);
    findResult = await builder.find('bar', ['column']);
    expect(spy1).toBeCalledWith('foo_table.foo', '=', 'bar', 'and');
    expect(spy2).toBeCalledTimes(1);
    expect(spy3).toBeCalledWith(['column']);
    expect(findResult).toBe(undefined);
    expect(result instanceof Model).toBe(true);
  });

  it('find or fail method throws model not found exception', async () => {
    let spy1, spy3;
    builder = getBuilder();
    model   = getModel();
    builder.setModel(model);

    spy1 = jest.spyOn(builder.getQuery(), 'where');
    spy3 = jest.spyOn(builder, 'first').mockReturnValue(undefined);
    await expect(async () => {
      await builder.findOrFail('bar', ['column']);
    }).rejects.toThrowError('ModelNotFoundException');

    expect(spy1).toBeCalledWith('foo_table.foo', '=', 'bar', 'and');
    expect(spy3).toBeCalledWith(['column']);
  });

  it('find or fail method with many throws model not found exception', async () => {
    let spy1, spy3;
    builder = getBuilder();
    model   = getModel();
    builder.setModel(model);

    spy1 = jest.spyOn(builder.getQuery(), 'whereIn').mockReturnValue(undefined);
    // @ts-ignore
    spy3 = jest.spyOn(builder, 'get').mockReturnValue([1]);

    await expect(async () => {
      await builder.findOrFail([1, 2], ['column']);
    }).rejects.toThrowError('ModelNotFoundException');

    expect(spy1).toBeCalledWith('foo_table.foo', [1, 2]);
    expect(spy3).toBeCalledWith(['column']);
    expect(spy3).lastReturnedWith([1]);
  });

  xit('find or fail method with many using collection throws model not found exception', () => {
    let spy1, spy3;
    builder = getBuilder();
    model   = getModel();
    builder.setModel(model);

    spy1 = jest.spyOn(builder.getQuery(), 'whereIn').mockReturnValue(undefined);
    // @ts-ignore
    spy3 = jest.spyOn(builder, 'get').mockReturnValue([1]);

    expect(() => {
      builder.findOrFail([1, 2], ['column']);
    }).toThrowError('ModelNotFoundException');

    expect(spy1).toBeCalledWith('foo_table.foo', [1, 2]);
    expect(spy3).toBeCalledWith(['column']);
    expect(spy3).lastReturnedWith([1]);
  });

  it('first or fail method throws model not found exception', async () => {
    let spy1, spy3;
    builder = getBuilder();
    model   = getModel();
    builder.setModel(model);

    spy1 = jest.spyOn(builder, 'first').mockReturnValue(undefined);

    await expect(async () => {
      await builder.firstOrFail(['column']);
    }).rejects.toThrowError('ModelNotFoundException');

    expect(spy1).toBeCalledWith(['column']);
    expect(spy1).toReturnWith(undefined);
  });

  it('find with many', async () => {
    let spy1, spy3, result;
    builder = getBuilder();
    model   = getModel();
    builder.setModel(model);

    // @ts-ignore
    spy1 = jest.spyOn(builder, 'get').mockReturnValue('baz');
    spy3 = jest.spyOn(builder.getQuery(), 'whereIn');

    result = await builder.find([1, 2], ['column']);

    expect(spy1).toBeCalledWith(['column']);
    expect(spy1).toReturnWith('baz');
    expect(spy3).toBeCalledTimes(1);
    expect(spy3).toBeCalledWith('foo_table.foo', [1, 2]);
    expect(result).toBe('baz');
  });

  xit('find with many using collection', () => {
    let spy1, spy3, result;
    builder = getBuilder();
    model   = getModel();
    builder.setModel(model);

    const ids = [1, 2];

    // @ts-ignore
    spy1 = jest.spyOn(builder, 'get').mockReturnValue('baz');
    spy3 = jest.spyOn(builder.getQuery(), 'whereIn');

    result = builder.find(ids, ['column']);

    expect(spy1).toBeCalledWith(['column']);
    expect(spy1).toReturnWith('baz');
    expect(spy3).toBeCalledTimes(1);
    expect(spy3).toBeCalledWith('foo_table.foo', [1, 2]);
    expect(result).toBe('baz');
  });

  it('first method', async () => {
    let spy1, spy2, spy3, result;
    builder = getBuilder();
    model   = getModel();
    builder.setModel(model);

    // @ts-ignore
    spy1 = jest.spyOn(builder, 'get').mockReturnValue(['bar']);
    // @ts-ignore
    spy2 = jest.spyOn(builder, 'take').mockReturnThis();

    result = await builder.first();

    expect(spy1).toBeCalledWith(['*']);
    // expect(spy1).toReturnWith('baz');
    expect(spy2).toBeCalledWith(1);
    expect(result).toBe('bar');
  });

  it('qualify column', () => {
    let spy1, spy2, spy3, result;
    builder = getBuilder();
    model   = getModel();
    builder.setModel(model);

    spy1 = jest.spyOn(builder.getQuery(), 'from');

    builder.setModel(getStubModel());

    result = builder.qualifyColumn('column');

    expect(spy1).toBeCalledWith('stub');
    expect(result).toBe('stub.column');
  });

  it('get method loads models and hydrates eager relations', async () => {
    let spy1, spy2, spy3, spy4, results;
    builder = getBuilder();
    model   = getModel();
    builder.setModel(model);

    // @ts-ignore
    spy1 = jest.spyOn(builder, 'getModels').mockReturnValue(['bar']);
    spy2 = jest.spyOn(builder, 'applyScopes').mockReturnThis();
    // @ts-ignore
    spy3 = jest.spyOn(builder, 'eagerLoadRelations').mockReturnValue(['bar', 'baz']);
    // spy4 = jest.spyOn(builder.getModel(), 'newCollection')//.mockReturnValue(['bar', 'baz']);

    results = await builder.get(['foo']);

    expect(spy1).toBeCalledWith(['foo']);
    expect(spy1).toReturnWith(['bar']);
    expect(spy2).toReturnWith(builder);
    expect(spy3).toReturnWith(['bar', 'baz']);
    expect(results).toEqual(['bar', 'baz']);
  });

  // public testGetMethodDoesntHydrateEagerRelationsWhenNoResultsAreReturned() {
  //     var builder = m.mock(Builder + "[getModels,eagerLoadRelations]", [this.getMockQueryBuilder()]);
  //     builder.shouldReceive("applyScopes").andReturnSelf()
  //     builder.shouldReceive("getModels")._with(["foo"]).andReturn([])
  //     builder.shouldReceive("eagerLoadRelations").never()
  //     builder.setModel(this.getMockModel())
  //     builder.getModel().shouldReceive("newCollection")._with([]).andReturn(new Collection([]))
  //     var results = builder.get(["foo"]);
  //     this.assertEquals([], results.all())
  //   }

  // public testValueMethodWithModelFound() {
  //     var builder = m.mock(Builder + "[first]", [this.getMockQueryBuilder()]);
  //     var mockModel = new stdClass();
  //     mockModel.name = "foo"
  //     builder.shouldReceive("first")._with(["name"]).andReturn(mockModel)
  //     this.assertSame("foo", builder.value("name"))
  //   }
  // public testValueMethodWithModelNotFound() {
  //     var builder = m.mock(Builder + "[first]", [this.getMockQueryBuilder()]);
  //     builder.shouldReceive("first")._with(["name"]).andReturn(null)
  //     this.assertNull(builder.value("name"))
  //   }
  // public testChunkWithLastChunkComplete() {
  //     var builder = m.mock(Builder + "[forPage,get]", [this.getMockQueryBuilder()]);
  //     builder.getQuery().orders.push({
  //       "column": "foobar",
  //       "direction": "asc"
  //     });
  //     var chunk1 = new Collection(["foo1", "foo2"]);
  //     var chunk2 = new Collection(["foo3", "foo4"]);
  //     var chunk3 = new Collection([]);
  //     builder.shouldReceive("forPage").once()._with(1, 2).andReturnSelf()
  //     builder.shouldReceive("forPage").once()._with(2, 2).andReturnSelf()
  //     builder.shouldReceive("forPage").once()._with(3, 2).andReturnSelf()
  //     builder.shouldReceive("get").times(3).andReturn(chunk1, chunk2, chunk3)
  //     var callbackAssertor = m.mock(stdClass);
  //     callbackAssertor.shouldReceive("doSomething").once()._with(chunk1)
  //     callbackAssertor.shouldReceive("doSomething").once()._with(chunk2)
  //     callbackAssertor.shouldReceive("doSomething").never()._with(chunk3)
  //     builder.chunk(2, results => {
  //       callbackAssertor.doSomething(results)
  //     })
  //   }
  // public testChunkWithLastChunkPartial() {
  //     var builder = m.mock(Builder + "[forPage,get]", [this.getMockQueryBuilder()]);
  //     builder.getQuery().orders.push({
  //       "column": "foobar",
  //       "direction": "asc"
  //     });
  //     var chunk1 = new Collection(["foo1", "foo2"]);
  //     var chunk2 = new Collection(["foo3"]);
  //     builder.shouldReceive("forPage").once()._with(1, 2).andReturnSelf()
  //     builder.shouldReceive("forPage").once()._with(2, 2).andReturnSelf()
  //     builder.shouldReceive("get").times(2).andReturn(chunk1, chunk2)
  //     var callbackAssertor = m.mock(stdClass);
  //     callbackAssertor.shouldReceive("doSomething").once()._with(chunk1)
  //     callbackAssertor.shouldReceive("doSomething").once()._with(chunk2)
  //     builder.chunk(2, results => {
  //       callbackAssertor.doSomething(results)
  //     })
  //   }
  // public testChunkCanBeStoppedByReturningFalse() {
  //     var builder = m.mock(Builder + "[forPage,get]", [this.getMockQueryBuilder()]);
  //     builder.getQuery().orders.push({
  //       "column": "foobar",
  //       "direction": "asc"
  //     });
  //     var chunk1 = new Collection(["foo1", "foo2"]);
  //     var chunk2 = new Collection(["foo3"]);
  //     builder.shouldReceive("forPage").once()._with(1, 2).andReturnSelf()
  //     builder.shouldReceive("forPage").never()._with(2, 2)
  //     builder.shouldReceive("get").times(1).andReturn(chunk1)
  //     var callbackAssertor = m.mock(stdClass);
  //     callbackAssertor.shouldReceive("doSomething").once()._with(chunk1)
  //     callbackAssertor.shouldReceive("doSomething").never()._with(chunk2)
  //     builder.chunk(2, results => {
  //       callbackAssertor.doSomething(results)
  //       return false;
  //     })
  //   }
  // public testChunkWithCountZero() {
  //     var builder = m.mock(Builder + "[forPage,get]", [this.getMockQueryBuilder()]);
  //     builder.getQuery().orders.push({
  //       "column": "foobar",
  //       "direction": "asc"
  //     });
  //     var chunk = new Collection([]);
  //     builder.shouldReceive("forPage").once()._with(1, 0).andReturnSelf()
  //     builder.shouldReceive("get").times(1).andReturn(chunk)
  //     var callbackAssertor = m.mock(stdClass);
  //     callbackAssertor.shouldReceive("doSomething").never()
  //     builder.chunk(0, results => {
  //       callbackAssertor.doSomething(results)
  //     })
  //   }
  // public testChunkPaginatesUsingIdWithLastChunkComplete() {
  //     var builder = m.mock(Builder + "[forPageAfterId,get]", [this.getMockQueryBuilder()]);
  //     builder.getQuery().orders.push({
  //       "column": "foobar",
  //       "direction": "asc"
  //     });
  //     var chunk1 = new Collection([
  //       //cast type object
  //       {
  //         "someIdField": 1
  //       },
  //       //cast type object
  //       {
  //         "someIdField": 2
  //       }]);
  //     var chunk2 = new Collection([
  //       //cast type object
  //       {
  //         "someIdField": 10
  //       },
  //       //cast type object
  //       {
  //         "someIdField": 11
  //       }]);
  //     var chunk3 = new Collection([]);
  //     builder.shouldReceive("forPageAfterId").once()._with(2, 0, "someIdField").andReturnSelf()
  //     builder.shouldReceive("forPageAfterId").once()._with(2, 2, "someIdField").andReturnSelf()
  //     builder.shouldReceive("forPageAfterId").once()._with(2, 11, "someIdField").andReturnSelf()
  //     builder.shouldReceive("get").times(3).andReturn(chunk1, chunk2, chunk3)
  //     var callbackAssertor = m.mock(stdClass);
  //     callbackAssertor.shouldReceive("doSomething").once()._with(chunk1)
  //     callbackAssertor.shouldReceive("doSomething").once()._with(chunk2)
  //     callbackAssertor.shouldReceive("doSomething").never()._with(chunk3)
  //     builder.chunkById(2, results => {
  //       callbackAssertor.doSomething(results)
  //     }, "someIdField")
  //   }
  // public testChunkPaginatesUsingIdWithLastChunkPartial() {
  //     var builder = m.mock(Builder + "[forPageAfterId,get]", [this.getMockQueryBuilder()]);
  //     builder.getQuery().orders.push({
  //       "column": "foobar",
  //       "direction": "asc"
  //     });
  //     var chunk1 = new Collection([
  //       //cast type object
  //       {
  //         "someIdField": 1
  //       },
  //       //cast type object
  //       {
  //         "someIdField": 2
  //       }]);
  //     var chunk2 = new Collection([
  //       //cast type object
  //       {
  //         "someIdField": 10
  //       }]);
  //     builder.shouldReceive("forPageAfterId").once()._with(2, 0, "someIdField").andReturnSelf()
  //     builder.shouldReceive("forPageAfterId").once()._with(2, 2, "someIdField").andReturnSelf()
  //     builder.shouldReceive("get").times(2).andReturn(chunk1, chunk2)
  //     var callbackAssertor = m.mock(stdClass);
  //     callbackAssertor.shouldReceive("doSomething").once()._with(chunk1)
  //     callbackAssertor.shouldReceive("doSomething").once()._with(chunk2)
  //     builder.chunkById(2, results => {
  //       callbackAssertor.doSomething(results)
  //     }, "someIdField")
  //   }
  // public testChunkPaginatesUsingIdWithCountZero() {
  //     var builder = m.mock(Builder + "[forPageAfterId,get]", [this.getMockQueryBuilder()]);
  //     builder.getQuery().orders.push({
  //       "column": "foobar",
  //       "direction": "asc"
  //     });
  //     var chunk = new Collection([]);
  //     builder.shouldReceive("forPageAfterId").once()._with(0, 0, "someIdField").andReturnSelf()
  //     builder.shouldReceive("get").times(1).andReturn(chunk)
  //     var callbackAssertor = m.mock(stdClass);
  //     callbackAssertor.shouldReceive("doSomething").never()
  //     builder.chunkById(0, results => {
  //       callbackAssertor.doSomething(results)
  //     }, "someIdField")
  //   }
  // public testPluckReturnsTheMutatedAttributesOfAModel() {
  //     var builder = this.getBuilder();
  //     builder.getQuery().shouldReceive("pluck")._with("name", "").andReturn(new BaseCollection(["bar", "baz"]))
  //     builder.setModel(this.getMockModel())
  //     builder.getModel().shouldReceive("hasGetMutator")._with("name").andReturn(true)
  //     builder.getModel().shouldReceive("newFromBuilder")._with({
  //       "name": "bar"
  //     }).andReturn(new EloquentBuilderTestPluckStub({
  //       "name": "bar"
  //     }))
  //     builder.getModel().shouldReceive("newFromBuilder")._with({
  //       "name": "baz"
  //     }).andReturn(new EloquentBuilderTestPluckStub({
  //       "name": "baz"
  //     }))
  //     this.assertEquals(["foo_bar", "foo_baz"], builder.pluck("name").all())
  //   }
  // public testPluckReturnsTheCastedAttributesOfAModel() {
  //     var builder = this.getBuilder();
  //     builder.getQuery().shouldReceive("pluck")._with("name", "").andReturn(new BaseCollection(["bar", "baz"]))
  //     builder.setModel(this.getMockModel())
  //     builder.getModel().shouldReceive("hasGetMutator")._with("name").andReturn(false)
  //     builder.getModel().shouldReceive("hasCast")._with("name").andReturn(true)
  //     builder.getModel().shouldReceive("newFromBuilder")._with({
  //       "name": "bar"
  //     }).andReturn(new EloquentBuilderTestPluckStub({
  //       "name": "bar"
  //     }))
  //     builder.getModel().shouldReceive("newFromBuilder")._with({
  //       "name": "baz"
  //     }).andReturn(new EloquentBuilderTestPluckStub({
  //       "name": "baz"
  //     }))
  //     this.assertEquals(["foo_bar", "foo_baz"], builder.pluck("name").all())
  //   }
  // public testPluckReturnsTheDateAttributesOfAModel() {
  //     var builder = this.getBuilder();
  //     builder.getQuery().shouldReceive("pluck")._with("created_at", "").andReturn(new BaseCollection(["2010-01-01 00:00:00", "2011-01-01 00:00:00"]))
  //     builder.setModel(this.getMockModel())
  //     builder.getModel().shouldReceive("hasGetMutator")._with("created_at").andReturn(false)
  //     builder.getModel().shouldReceive("hasCast")._with("created_at").andReturn(false)
  //     builder.getModel().shouldReceive("getDates").andReturn(["created_at"])
  //     builder.getModel().shouldReceive("newFromBuilder")._with({
  //       "created_at": "2010-01-01 00:00:00"
  //     }).andReturn(new EloquentBuilderTestPluckDatesStub({
  //       "created_at": "2010-01-01 00:00:00"
  //     }))
  //     builder.getModel().shouldReceive("newFromBuilder")._with({
  //       "created_at": "2011-01-01 00:00:00"
  //     }).andReturn(new EloquentBuilderTestPluckDatesStub({
  //       "created_at": "2011-01-01 00:00:00"
  //     }))
  //     this.assertEquals(["date_2010-01-01 00:00:00", "date_2011-01-01 00:00:00"], builder.pluck("created_at").all())
  //   }
  // public testPluckWithoutModelGetterJustReturnsTheAttributesFoundInDatabase() {
  //     var builder = this.getBuilder();
  //     builder.getQuery().shouldReceive("pluck")._with("name", "").andReturn(new BaseCollection(["bar", "baz"]))
  //     builder.setModel(this.getMockModel())
  //     builder.getModel().shouldReceive("hasGetMutator")._with("name").andReturn(false)
  //     builder.getModel().shouldReceive("hasCast")._with("name").andReturn(false)
  //     builder.getModel().shouldReceive("getDates").andReturn(["created_at"])
  //     this.assertEquals(["bar", "baz"], builder.pluck("name").all())
  //   }
  // public testLocalMacrosAreCalledOnBuilder() {
  //     delete _SERVER["__test.builder"]
  //     var builder = new Builder(new BaseBuilder(m.mock(ConnectionInterface), m.mock(Grammar), m.mock(Processor)));
  //     builder.macro("fooBar", builder => {
  //       _SERVER["__test.builder"] = builder
  //       return builder;
  //     })
  //     var result = builder.fooBar();
  //     this.assertTrue(builder.hasMacro("fooBar"))
  //     this.assertEquals(builder, result)
  //     this.assertEquals(builder, _SERVER["__test.builder"])
  //     delete _SERVER["__test.builder"]
  //   }
  // public testGlobalMacrosAreCalledOnBuilder() {
  //     Builder.macro("foo", bar => {
  //       return bar;
  //     })
  //     Builder.macro("bam", [Builder, "getQuery"])
  //     var builder = this.getBuilder();
  //     this.assertTrue(Builder.hasGlobalMacro("foo"))
  //     this.assertEquals(builder.foo("bar"), "bar")
  //     this.assertEquals(builder.bam(), builder.getQuery())
  //   }
  // public testMissingStaticMacrosThrowsProperException() {
  //     this.expectException(BadMethodCallException)
  //     this.expectExceptionMessage("Call to undefined method Illuminate\\Database\\Eloquent\\Builder::missingMacro()")
  //     Builder.missingMacro()
  //   }
  // public testGetModelsProperlyHydratesModels() {
  //     var builder = m.mock(Builder + "[get]", [this.getMockQueryBuilder()]);
  //     records.push({
  //       "name": "taylor",
  //       "age": 26
  //     });
  //     records.push({
  //       "name": "dayle",
  //       "age": 28
  //     });
  //     builder.getQuery().shouldReceive("get").once()._with(["foo"]).andReturn(new BaseCollection(records))
  //     var model = m.mock(Model + "[getTable,hydrate]");
  //     model.shouldReceive("getTable").once().andReturn("foo_table")
  //     builder.setModel(model)
  //     model.shouldReceive("hydrate").once()._with(records).andReturn(new Collection(["hydrated"]))
  //     var models = builder.getModels(["foo"]);
  //     this.assertEquals(models, ["hydrated"])
  //   }

  it('eager load relations load top level relationships', async () => {
    builder = getBuilder();
    model   = getModel();
    builder.setModel(model);
    // var builder = m.mock(Builder + '[eagerLoadRelation]', [this.getMockQueryBuilder()]);
    const nop1 = () => {
    };
    const nop2 = () => {
    };
    builder.setEagerLoads({
      'foo'    : nop1,
      'foo.bar': nop2
    });
    // @ts-ignore
    const spy1 = jest.spyOn(builder, '_eagerLoadRelation').mockReturnValue(['foo']);

    const results = await builder.eagerLoadRelations(['models']);

    expect(spy1).toBeCalledWith(['models'], 'foo', nop1);
    expect(spy1).toReturnWith(['foo']);
    expect(results).toEqual(['foo']);
  });

  it('relationship eager load process', async () => {
    let spy1, spy2, spy3, spy4, results, _SERVER = {};

    builder = getBuilder();
    model   = getModel();
    builder.setModel(model);
    builder.setEagerLoads({
      'orders': (query: QueryBuilder) => {
        _global['__fedaco.constrain'] = query;
      }
    });

    const relation = new class {
      addEagerConstraints() {
      }

      initRelation() {
      }

      getEager() {
      }

      match() {
      }

      getRelation() {
      }
    };

    // @ts-ignore
    spy1 = jest.spyOn(builder, 'getRelation').mockReturnValue(relation);
    spy2 = jest.spyOn(builder, 'applyScopes'); // .mockReturnThis();
    spy3 = jest.spyOn(builder, 'eagerLoadRelations'); // .mockReturnValue(['bar', 'baz']);

    const spy11 = jest.spyOn(relation, 'addEagerConstraints');
    // @ts-ignore
    const spy12 = jest.spyOn(relation, 'initRelation').mockReturnValue(['models']);
    // @ts-ignore
    const spy13 = jest.spyOn(relation, 'getEager').mockReturnValue(['results']);
    // @ts-ignore
    const spy14 = jest.spyOn(relation, 'match').mockReturnValue(['models.matched']);
    const spy15 = jest.spyOn(builder, 'getRelation');

    results = await builder.eagerLoadRelations(['models']);

    expect(spy11).toBeCalledWith(['models']);
    expect(spy12).toBeCalledWith(['models'], 'orders');
    // expect(spy12).toReturnWith(['models']);
    // expect(spy13).toReturnWith(['results']);
    expect(spy14).toBeCalledWith(['models'], ['results'], 'orders');
    // expect(spy14).toReturnWith(['models.matched']);
    expect(spy15).toBeCalledWith('orders');
    expect(spy15).toReturnWith(relation);

    expect(results).toEqual(['models.matched']);
    expect(relation).toEqual(_global['__fedaco.constrain']);
  });

  it('get relation properly sets nested relationships', () => {
    let spy1, spy2, spy3;

    builder = getBuilder();
    model   = getModel();
    builder.setModel(model);
    builder.setEagerLoads({
      orders                : null,
      'orders.lines'        : null,
      'orders.lines.details': null
    });

    const relation = new class {
      getQuery(): any {
      }
    };

    spy1 = jest.spyOn(model.constructor.prototype, 'NewRelation').mockReturnValue(relation);
    // @ts-ignore
    spy2 = jest.spyOn(builder, '_relationsNestedUnder');
    spy3 = jest.spyOn(relation, 'getQuery').mockReturnValue({
      with() {
      }
    });

    builder.getRelation('orders');

    expect(spy2).toHaveBeenCalled();
    expect(spy2).toReturnWith({
      'lines'        : null,
      'lines.details': null
    });
  });

  it('get relation properly sets nested relationships with similar names', () => {
    let spy1, spy2, spy3, spy4;
    builder = getBuilder();
    builder.setModel(getModel());

    builder.setEagerLoads({
      'orders'                    : null,
      'ordersGroups'              : null,
      'ordersGroups.lines'        : null,
      'ordersGroups.lines.details': null
    });

    const relation   = new class {
      getQuery(): any {
      }
    };
    const groupQuery = new class {
      with() {
      }
    };

    spy1 = jest.spyOn(model.constructor.prototype, 'NewRelation').mockReturnValue(relation);
    // @ts-ignore
    spy2 = jest.spyOn(builder, '_relationsNestedUnder');
    spy3 = jest.spyOn(relation, 'getQuery').mockReturnValue(groupQuery);
    spy4 = jest.spyOn(groupQuery, 'with');

    builder.getRelation('orders');
    builder.getRelation('ordersGroups');

    expect(spy3).toBeCalled();
    expect(spy4).toBeCalledWith({
      'lines'        : null,
      'lines.details': null
    });
  });

  it('get relation throws exception', () => {
    builder = getBuilder();
    builder.setModel(getModel());
    try {
      builder.getRelation('invalid');
    } catch (e: any) {
      expect(e.message).toBe('RelationNotFoundException Model invalid');
    }
  });

  it('eager load parsing sets proper relationships', () => {
    let eagers;
    builder = getBuilder();
    builder.setModel(getModel());
    builder.with(['orders', 'orders.lines']);
    eagers = builder.getEagerLoads();
    expect(Object.keys(eagers)).toEqual(['orders', 'orders.lines']);

    builder = getBuilder();
    builder.with('orders', 'orders.lines');
    eagers = builder.getEagerLoads();
    expect(Object.keys(eagers)).toEqual(['orders', 'orders.lines']);
    expect(isFunction(eagers['orders'])).toBeTruthy();
    expect(isFunction(eagers['orders.lines'])).toBeTruthy();

    builder = getBuilder();
    builder.with(['orders.lines']);
    eagers = builder.getEagerLoads();
    expect(Object.keys(eagers)).toEqual(['orders', 'orders.lines']);
    expect(isFunction(eagers['orders'])).toBeTruthy();
    expect(isFunction(eagers['orders.lines'])).toBeTruthy();

    builder = getBuilder();
    builder.with({
      'orders': () => {
        return 'foo';
      }
    });
    eagers = builder.getEagerLoads();
    expect(eagers['orders']()).toBe('foo');

    builder = getBuilder();
    builder.with({
      'orders.lines': () => {
        return 'foo';
      }
    });
    eagers = builder.getEagerLoads();
    expect(isFunction(eagers['orders'])).toBe(true);
    expect(eagers['orders']()).toBe(undefined);
    expect(eagers['orders.lines']()).toBe('foo');
  });

  it('query pass thru', async () => {
    // builder = getBuilder();
    // builder.getQuery().shouldReceive('foobar').once().andReturn('foo');
    // this.assertInstanceOf(Builder, builder.foobar());
    let spy1, spy2, spy3, result;

    builder = getBuilder();
    // @ts-ignore
    spy1    = jest.spyOn(builder.getQuery(), 'insert').mockReturnValue('foo');
    result  = await builder.insert(['bar']);
    expect(spy1).toBeCalledWith(['bar']);
    expect(spy1).toReturnWith('foo');
    expect(result).toEqual('foo');


    builder = getBuilder();
    spy1    = jest.spyOn(builder.getQuery(), 'insertOrIgnore').mockReturnValue('foo');
    result  = await builder.insertOrIgnore(['bar']);
    expect(spy1).toBeCalledWith(['bar']);
    expect(spy1).toReturnWith('foo');
    expect(result).toEqual('foo');


    builder = getBuilder();
    // @ts-ignore
    spy1    = jest.spyOn(builder.getQuery(), 'insertGetId').mockReturnValue(Promise.resolve('foo'));
    result  = await builder.insertGetId(['bar']);
    expect(spy1).toBeCalledWith(['bar']);
    // expect(spy1).toReturnWith('foo');
    expect(result).toEqual('foo');


    builder = getBuilder();
    spy1    = jest.spyOn(builder.getQuery(), 'insertUsing').mockReturnValue(Promise.resolve('foo'));
    result  = await builder.insertUsing(['bar'], 'baz');
    expect(spy1).toBeCalledWith(['bar'], 'baz');
    // expect(spy1).toReturnWith('foo');
    expect(result).toEqual('foo');


    // builder      = getBuilder();
    // spy1         = jest.spyOn(builder.getQuery(), 'raw');
    // result = await builder.raw('bar');
    // expect(spy1).toBeCalledWith('bar');
    // expect(spy1).toReturnWith('foo');
    // expect(result).toBe('foo');


    builder = getBuilder();
    spy1    = jest.spyOn(builder.getQuery(), 'getGrammar');
    result  = await builder.getGrammar();
    expect(spy1).toBeCalled();
  });

  it('query scopes', () => {
    let result;
    builder = getBuilder();
    const m = new FedacoBuilderTestScopeStub();
    builder.setModel(m);

    const spy1 = jest.spyOn(builder.getQuery(), 'from');
    const spy2 = jest.spyOn(builder.getQuery(), 'where');

    result = builder.whereScope('approved');

    expect(spy2).toBeCalledWith('foo', '=', 'bar', 'and');
    expect(builder).toBe(result);
  });

  // it('query scopes with no such method', () => {
  //   let result;
  //   builder = getBuilder();
  //   const m = new FedacoBuilderTestScopeStub();
  //   builder.setModel(m);
  //
  //   const spy1 = jest.spyOn(builder.getQuery(), 'from');
  //   const spy2 = jest.spyOn(builder.getQuery(), 'where');
  //
  //   // @ts-ignore
  //   result = builder.approved();
  //
  //   expect(spy2).toBeCalledWith('foo', 'bar', null, 'and');
  //   expect(builder).toBe(result);
  // });

  it('nested where', () => {
    builder = getBuilder();
    model   = getModel();

    const spy1 = jest.spyOn(builder.getQuery(), 'from');
    const spy2 = jest.spyOn(builder.getQuery(), 'addNestedWhereQuery').mockReturnThis();
    const spy3 = jest.spyOn(model, 'NewQueryWithoutRelationships').mockReturnValue({
      // @ts-ignore
      foo     : jest.fn(),
      getQuery: jest.fn()
    });

    builder.setModel(model);

    const result = builder.where((query: FedacoBuilder) => {
      // @ts-ignore
      query.foo();
    });
    expect(spy1).toBeCalled();
    expect(spy2).toBeCalled();
    expect(spy2).toBeCalledWith(undefined, 'and');
    expect(result).toBe(builder);
  });

  it('real nested where with scopes', () => {
    const model1 = new FedacoBuilderTestNestedStub();
    mockConnectionForModel(FedacoBuilderTestNestedStub, 'SQLite');
    const query = model1.NewQuery()
      .where('foo', '=', 'bar')
      .where((q: FedacoBuilder) => {
        q.where('baz', '>', 9000);
      });

    const data = query.toSql();
    expect(data.result).toBe(
      'SELECT * FROM "nest_table" WHERE "foo" = ? AND ("baz" > ?) AND "nest_table"."deleted_at" IS NULL');
    expect(data.bindings).toEqual(['bar', 9000]);
  });

  it('real nested where with scopes macro', () => {
    const model1 = new FedacoBuilderTestNestedStub();
    mockConnectionForModel(FedacoBuilderTestNestedStub, 'SQLite');
    const query = model1.NewQuery()
      .where('foo', '=', 'bar')
      .where((q: FedacoBuilder) => {
        q.where('baz', '>', 9000).pipe(
          onlyTrashed()
        );
      }).pipe(
        withTrashed()
      );
    const data  = query.toSql();
    expect(data.result).toBe(
      'SELECT * FROM "nest_table" WHERE "foo" = ? AND ("baz" > ? AND "nest_table"."deleted_at" IS NOT NULL)');
    expect(data.bindings).toEqual(['bar', 9000]);
  });

  it('real nested where with multiple scopes and one dead scope', () => {
    const model1 = new FedacoBuilderTestNestedStub();
    mockConnectionForModel(FedacoBuilderTestNestedStub, 'SQLite');
    const query = model1.NewQuery()
      .scope('empty')
      .where('foo', '=', 'bar')
      .scope('empty')
      .where((q: FedacoBuilder) => {
        q.scope('empty').where('baz', '>', 9000);
      });
    const data  = query.toSql();
    expect(data.result).toBe(
      'SELECT * FROM "nest_table" WHERE "foo" = ? AND ("baz" > ?) AND "nest_table"."deleted_at" IS NULL');
    expect(data.bindings).toEqual(['bar', 9000]);
  });

  it('real query higher order or where scopes', () => {
    const model1 = new FedacoBuilderTestHigherOrderWhereScopeStub();
    mockConnectionForModel(FedacoBuilderTestHigherOrderWhereScopeStub, 'SQLite');
    const query = model1.NewQuery()
      .scope('one')
      .orWhere(
        (q: FedacoBuilder) => {
          q.scope('two');
        }
      );

    const data = query.toSql();
    expect(data.result).toBe('SELECT * FROM "nest_table" WHERE "one" = ? OR ("two" = ?)');
    expect(data.bindings).toEqual(['foo', 'bar']);
  });

  it('real query chained higher order or where scopes', () => {
    const model1 = new FedacoBuilderTestHigherOrderWhereScopeStub();
    mockConnectionForModel(FedacoBuilderTestHigherOrderWhereScopeStub, 'SQLite');
    const query = model1.NewQuery()
      .scope('one')
      .orWhere(
        (q: FedacoBuilder) => {
          q.scope('two');
        }
      )
      .orWhere(
        (q: FedacoBuilder) => {
          q.scope('three');
        }
      );

    const data = query.toSql();
    expect(data.result).toBe(
      'SELECT * FROM "nest_table" WHERE "one" = ? OR ("two" = ?) OR ("three" = ?)');
    expect(data.bindings).toEqual(['foo', 'bar', 'baz']);
  });

  it('simple where', () => {
    let spy1, result;
    builder = getBuilder();
    spy1    = jest.spyOn(builder.getQuery(), 'where');
    result  = builder.where('foo', '=', 'bar');
    expect(spy1).toBeCalledWith('foo', '=', 'bar', 'and');
    expect(builder).toBe(result);
  });

  it('postgres operators where', () => {
    let spy1, result;
    builder = getBuilder();
    spy1    = jest.spyOn(builder.getQuery(), 'where');
    result  = builder.where('foo', '@>', 'bar');
    expect(spy1).toBeCalledWith('foo', '@>', 'bar', 'and');
    expect(builder).toBe(result);
  });

  it('delete override', async () => {
    builder = getBuilder();
    builder.onDelete((qb: FedacoBuilder) => {
      return {
        'foo': qb
      };
    });

    const result = await builder.delete();

    expect(result).toEqual({'foo': builder});
  });

  it('where key method with int', () => {
    let spy1, result;
    builder = getBuilder();
    model   = getModel();

    builder.setModel(model);

    spy1          = jest.spyOn(builder.getQuery(), 'where');
    const keyName = model.GetQualifiedKeyName();
    const int     = 1;
    builder.whereKey(int);
    expect(spy1).toBeCalledWith(keyName, '=', int, 'and');
  });

  it('test where key for primary generate key', () => {
    const model = new FedacoBuilderWhereKey();

    const primaryKey = model.GetQualifiedKeyName();
    expect(primaryKey).toBe('test_where_key.uuid');
  });

  it('where key method with array', () => {
    let spy1, result;
    builder = getBuilder();
    model   = getModel();

    builder.setModel(model);

    spy1          = jest.spyOn(builder.getQuery(), 'whereIn');
    const keyName = model.GetQualifiedKeyName();
    const array   = [1, 2, 3];
    builder.whereKey(array);

    expect(spy1).toBeCalledWith(keyName, array);
  });

  xit('where key method with collection', () => {
    let spy1, result;
    builder = getBuilder();
    model   = getModel();

    builder.setModel(model);

    spy1             = jest.spyOn(builder.getQuery(), 'whereIn');
    const keyName    = model.GetQualifiedKeyName();
    const collection = [1, 2, 3];
    builder.whereKey(collection);

    expect(spy1).toBeCalledWith(keyName, collection);
  });

  it('where key not method with int', () => {
    let spy1, result;
    builder = getBuilder();
    model   = getModel();

    builder.setModel(model);

    spy1          = jest.spyOn(builder.getQuery(), 'where');
    const keyName = model.GetQualifiedKeyName();
    const int     = 1;
    builder.whereKeyNot(int);

    expect(spy1).toBeCalledWith(keyName, '!=', int, 'and');

  });

  it('where key not method with array', () => {
    let spy1, result;
    builder = getBuilder();
    model   = getModel();

    builder.setModel(model);

    spy1          = jest.spyOn(builder.getQuery(), 'whereNotIn');
    const keyName = model.GetQualifiedKeyName();
    const array   = [1, 2, 3];
    builder.whereKeyNot(array);

    expect(spy1).toBeCalledWith(keyName, array);
  });

  xit('where key not method with collection', () => {
    let spy1, result;
    builder = getBuilder();
    model   = getModel();

    builder.setModel(model);

    spy1             = jest.spyOn(builder.getQuery(), 'whereNotIn');
    const keyName    = model.GetQualifiedKeyName();
    const collection = [1, 2, 3];
    builder.whereKeyNot(collection);

    expect(spy1).toBeCalledWith(keyName, collection);
  });

  it('where in', () => {
    model = new FedacoBuilderTestNestedStub();
    mockConnectionForModel(FedacoBuilderTestNestedStub, '');
    const query  = model.NewQuery().withoutGlobalScopes().whereIn('foo',
      model.NewQuery().select('id'));
    const result = query.toSql();

    expect(result.result).toBe(
      'SELECT * FROM "nest_table" WHERE "foo" IN (SELECT "id" FROM "nest_table" WHERE "nest_table"."deleted_at" IS NULL)');
  });

  it('latest without column with created at', () => {
    let spy1, spy2, result;
    builder = getBuilder();
    model   = getModel();

    builder.setModel(model);

    spy1 = jest.spyOn(model, 'GetCreatedAtColumn').mockReturnValue('foo');
    spy2 = jest.spyOn(builder.getQuery(), 'latest');

    builder.latest();

    expect(spy2).toBeCalledWith('foo');

  });

  it('latest without column without created at', () => {
    let spy1, spy2, result;
    builder = getBuilder();
    model   = getModel();

    builder.setModel(model);

    spy1 = jest.spyOn(model, 'GetCreatedAtColumn').mockReturnValue(null);
    spy2 = jest.spyOn(builder.getQuery(), 'latest');

    builder.latest();

    expect(spy2).toBeCalledWith('created_at');

  });

  it('latest with column', () => {
    let spy1, spy2, result;
    builder = getBuilder();
    model   = getModel();

    builder.setModel(model);

    spy1 = jest.spyOn(builder.getQuery(), 'latest');

    builder.latest('foo');

    expect(spy1).toBeCalledWith('foo');
  });

  it('oldest without column with created at', () => {
    let spy1, spy2, result;
    builder = getBuilder();
    model   = getModel();

    builder.setModel(model);

    spy1 = jest.spyOn(model, 'GetCreatedAtColumn').mockReturnValue('foo');
    spy2 = jest.spyOn(builder.getQuery(), 'oldest');

    builder.oldest();

    expect(spy2).toBeCalledWith('foo');
  });

  it('oldest without column without created at', () => {
    let spy1, spy2, result;
    builder = getBuilder();
    model   = getModel();

    builder.setModel(model);

    spy1 = jest.spyOn(model, 'GetCreatedAtColumn').mockReturnValue(null);
    spy2 = jest.spyOn(builder.getQuery(), 'oldest');

    builder.oldest();

    expect(spy2).toBeCalledWith('created_at');
  });

  it('oldest with column', () => {
    let spy1, spy2, result;
    builder = getBuilder();
    model   = getModel();

    builder.setModel(model);

    spy1 = jest.spyOn(builder.getQuery(), 'oldest');

    builder.oldest('foo');

    expect(spy1).toBeCalledWith('foo');
  });

  it('update', async () => {
    let spy1, spy2, result;
    builder = getBuilder();
    model   = new FedacoBuilderTestStub();
    mockConnectionForModel(FedacoBuilderTestStub, '');
    builder.setModel(model);

    spy1   = jest.spyOn(builder.getConnection(), 'update').mockReturnValue(1);
    //     builder.getConnection().shouldReceive("update").once()._with("update \"table\" set \"foo\" = ?, \"table\".\"updated_at\" = ?", ["bar", now]).andReturn(1)
    result = await builder.update({
      'foo': 'bar'
    });

    const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    expect(result).toBe(1);

    expect(spy1).toBeCalledWith(
      'UPDATE `test_tables` SET `foo` = ?, `updated_at` = ?',
      ['bar', now]);
  });

  it('update with timestamp value', async () => {
    let spy1, spy2, result;
    builder = getBuilder();
    model   = new FedacoBuilderTestStub();
    mockConnectionForModel(FedacoBuilderTestStub, '');
    builder.setModel(model);

    spy1   = jest.spyOn(builder.getConnection(), 'update').mockReturnValue(1);
    //     builder.getConnection().shouldReceive("update").once()._with("update \"table\" set \"foo\" = ?, \"table\".\"updated_at\" = ?", ["bar", now]).andReturn(1)
    result = await builder.update({
      'foo'       : 'bar',
      'updated_at': null
    });

    const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    expect(result).toBe(1);

    expect(spy1).toBeCalledWith(
      'UPDATE `test_tables` SET `foo` = ?, `updated_at` = ?',
      ['bar', null]);
  });

  it('update without timestamp', async () => {
    let spy1, spy2, result;
    builder = getBuilder();
    model   = new FedacoBuilderTestStubWithoutTimestamp();
    mockConnectionForModel(FedacoBuilderTestStubWithoutTimestamp, '');
    builder.setModel(model);

    spy1   = jest.spyOn(builder.getConnection(), 'update').mockReturnValue(1);
    //     builder.getConnection().shouldReceive("update").once()._with("update \"table\" set \"foo\" = ?, \"table\".\"updated_at\" = ?", ["bar", now]).andReturn(1)
    result = await builder.update({
      'foo': 'bar'
    });

    expect(result).toBe(1);

    expect(spy1).toBeCalledWith('UPDATE `test_tables` SET `foo` = ?', ['bar']);
  });

  it('update with alias', async () => {
    let spy1, spy2, result;
    builder = getBuilder();
    model   = new FedacoBuilderTestStub();
    mockConnectionForModel(FedacoBuilderTestStub, '');
    builder.setModel(model);

    spy1   = jest.spyOn(builder.getConnection(), 'update').mockReturnValue(1);
    //     builder.getConnection().shouldReceive("update").once()._with("update \"table\" set \"foo\" = ?, \"table\".\"updated_at\" = ?", ["bar", now]).andReturn(1)
    result = await builder.from('test_table as alias').update({
      'foo': 'bar'
    });

    expect(result).toBe(1);

    expect(spy1).toBeCalledWith(
      'UPDATE `test_table` AS `alias` SET `alias`.`foo` = ?, `alias`.`updated_at` = ?',
      ['bar', expect.anything()]);

  });

  it('with casts method', () => {
    // let spy1, spy2, result;
    // builder = getBuilder();
    // model = getModel();
    //
    // builder.setModel(model);
    //
    // spy1 = jest.spyOn(builder.getQuery(), 'mergeCasts');
    //
    // builder.withCasts({'foo': 'bar'})
    //
    // expect(spy1).toBeCalledWith({'foo': 'bar'})
  });
});


@Table({
  tableName    : 'test_table',
  noPluralTable: false
})
class FedacoBuilderTestStub extends Model {
}

@Table({
  tableName    : 'test_table',
  noPluralTable: false
})
class FedacoBuilderTestStubWithoutTimestamp extends Model {
  static UPDATED_AT: string = null;
}

@Table({
  tableName: 'test_where_key'
})
class FedacoBuilderWhereKey extends Model {
  @PrimaryGeneratedColumn({
    keyType: 'string'
  })
  uuid: string;
}