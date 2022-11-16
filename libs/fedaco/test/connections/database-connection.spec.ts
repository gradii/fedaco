// import { isNumber } from '@gradii/nanofn';
// import { TransactionBeginning } from '../../src/events/transaction-beginning';
// import { TransactionCommitted } from '../../src/events/transaction-committed';
// import { TransactionRolledBack } from '../../src/events/transaction-rolled-back';
//
// function getMockConnection() {
//
// }
//
// describe('test database connection', () => {
//   it('setting default calls get default grammar', () => {
//     const connection = getMockConnection();
//     const mock       = {};
//     connection.expects(this.once()).method('getDefaultQueryGrammar').willReturn(mock);
//     connection.useDefaultQueryGrammar();
//     expect(connection.getQueryGrammar()).toEqual(mock);
//   });
//
//   it('setting default calls get default post processor', () => {
//     const connection = getMockConnection();
//     const mock       = m.mock(stdClass);
//     connection.expects(this.once()).method('getDefaultPostProcessor').willReturn(mock);
//     connection.useDefaultPostProcessor();
//     expect(connection.getPostProcessor()).toEqual(mock);
//   });
//
//   it('select one calls select and returns single result', () => {
//     const connection = getMockConnection(['select']);
//     connection.expects(this.once()).method('select')._with('foo', {
//       'bar': 'baz'
//     }).willReturn(['foo']);
//     expect(connection.selectOne('foo', {
//       'bar': 'baz'
//     })).toBe('foo');
//   });
//
//   it('select properly calls pdo', () => {
//     const pdo      = this.getMockBuilder(DatabaseConnectionTestMockPDO).setMethods(
//       ['prepare']).getMock();
//     const writePdo = this.getMockBuilder(DatabaseConnectionTestMockPDO).setMethods(
//       ['prepare']).getMock();
//     writePdo.expects(this.never()).method('prepare');
//     const statement = this.getMockBuilder('PDOStatement').setMethods(
//       ['execute', 'fetchAll', 'bindValue']).getMock();
//     statement.expects(this.once()).method('bindValue')._with('foo', 'bar', 2);
//     statement.expects(this.once()).method('execute');
//     statement.expects(this.once()).method('fetchAll').willReturn(['boom']);
//     pdo.expects(this.once()).method('prepare')._with('foo').willReturn(statement);
//     const mock = getMockConnection(['prepareBindings'], writePdo);
//     mock.setReadPdo(pdo);
//     mock.expects(this.once()).method('prepareBindings')._with(this.equalTo({
//       'foo': 'bar'
//     })).willReturn({
//       'foo': 'bar'
//     });
//     const results = mock.select('foo', {
//       'foo': 'bar'
//     });
//     expect(results).toEqual(['boom']);
//     const log = mock.getQueryLog();
//     expect(log[0]['query']).toBe('foo');
//     expect(log[0]['bindings']).toEqual({
//       'foo': 'bar'
//     });
//     expect(isNumber(log[0]['time'])).toBeTruthy();
//   });
//
//   it('insert calls the statement method', () => {
//     const connection = getMockConnection(['statement']);
//     connection.expects(this.once()).method('statement')._with(this.equalTo('foo'),
//       this.equalTo(['bar'])).willReturn('baz');
//     const results = connection.insert('foo', ['bar']);
//     expect(results).toBe('baz');
//   });
//
//   it('update calls the affecting statement method', () => {
//     const connection = getMockConnection(['affectingStatement']);
//     connection.expects(this.once()).method('affectingStatement')._with(this.equalTo('foo'),
//       this.equalTo(['bar'])).willReturn('baz');
//     const results = connection.update('foo', ['bar']);
//     expect(results).toBe('baz');
//   });
//
//   it('delete calls the affecting statement method', () => {
//     const connection = getMockConnection(['affectingStatement']);
//     connection.expects(this.once()).method('affectingStatement')._with(this.equalTo('foo'),
//       this.equalTo(['bar'])).willReturn('baz');
//     const results = connection.delete('foo', ['bar']);
//     expect(results).toBe('baz');
//   });
//
//   it('statement properly calls pdo', () => {
//     const pdo       = this.getMockBuilder(DatabaseConnectionTestMockPDO).setMethods(
//       ['prepare']).getMock();
//     const statement = this.getMockBuilder('PDOStatement').setMethods(
//       ['execute', 'bindValue']).getMock();
//     statement.expects(this.once()).method('bindValue')._with(1, 'bar', 2);
//     statement.expects(this.once()).method('execute').willReturn('foo');
//     pdo.expects(this.once()).method('prepare')._with(this.equalTo('foo')).willReturn(statement);
//     const mock = getMockConnection(['prepareBindings'], pdo);
//     mock.expects(this.once()).method('prepareBindings')._with(this.equalTo(['bar'])).willReturn(
//       ['bar']);
//     const results = mock.statement('foo', ['bar']);
//     expect(results).toBe('foo');
//     const log = mock.getQueryLog();
//     expect(log[0]['query']).toBe('foo');
//     expect(log[0]['bindings']).toEqual(['bar']);
//     expect(isNumber(log[0]['time'])).toBeTruthy();
//   });
//
//   it('affecting statement properly calls pdo', () => {
//     const pdo       = this.getMockBuilder(DatabaseConnectionTestMockPDO).setMethods(
//       ['prepare']).getMock();
//     const statement = this.getMockBuilder('PDOStatement').setMethods(
//       ['execute', 'rowCount', 'bindValue']).getMock();
//     statement.expects(this.once()).method('bindValue')._with('foo', 'bar', 2);
//     statement.expects(this.once()).method('execute');
//     statement.expects(this.once()).method('rowCount').willReturn(['boom']);
//     pdo.expects(this.once()).method('prepare')._with('foo').willReturn(statement);
//     const mock = getMockConnection(['prepareBindings'], pdo);
//     mock.expects(this.once()).method('prepareBindings')._with(this.equalTo({
//       'foo': 'bar'
//     })).willReturn({
//       'foo': 'bar'
//     });
//     const results = mock.update('foo', {
//       'foo': 'bar'
//     });
//     expect(results).toEqual(['boom']);
//     const log = mock.getQueryLog();
//     expect(log[0]['query']).toBe('foo');
//     expect(log[0]['bindings']).toEqual({
//       'foo': 'bar'
//     });
//     expect(isNumber(log[0]['time'])).toBeTruthy();
//   });
//
//   it('transaction level not incremented on transaction exception', () => {
//     const pdo = this.createMock(DatabaseConnectionTestMockPDO);
//     pdo.expects(this.once()).method('beginTransaction').will(this.throwException(new Exception()));
//     const connection = getMockConnection([], pdo);
//     try {
//       connection.beginTransaction();
//     } catch (e: Exception) {
//       expect(connection.transactionLevel()).toEqual(0);
//     }
//   });
//
//   it('begin transaction method retries on failure', () => {
//     const pdo = this.createMock(DatabaseConnectionTestMockPDO);
//     pdo.expects(this.at(0)).method('beginTransaction').will(
//       this.throwException(new ErrorException('server has gone away')));
//     const connection = getMockConnection(['reconnect'], pdo);
//     connection.expects(this.once()).method('reconnect');
//     connection.beginTransaction();
//     expect(connection.transactionLevel()).toEqual(1);
//   });
//
//   it('begin transaction method reconnects missing connection', () => {
//     const connection = getMockConnection();
//     connection.setReconnector(connection => {
//       const pdo = this.createMock(DatabaseConnectionTestMockPDO);
//       connection.setPdo(pdo);
//     });
//     connection.disconnect();
//     connection.beginTransaction();
//     expect(connection.transactionLevel()).toEqual(1);
//   });
//
//   it('begin transaction method never retries if within transaction', () => {
//     const pdo = this.createMock(DatabaseConnectionTestMockPDO);
//     pdo.expects(this.once()).method('beginTransaction');
//     pdo.expects(this.once()).method('exec').will(this.throwException(new Exception()));
//     const connection   = getMockConnection(['reconnect'], pdo);
//     const queryGrammar = this.createMock(Grammar);
//     queryGrammar.expects(this.once()).method('supportsSavepoints').willReturn(true);
//     connection.setQueryGrammar(queryGrammar);
//     connection.expects(this.never()).method('reconnect');
//     connection.beginTransaction();
//     expect(connection.transactionLevel()).toEqual(1);
//     try {
//       connection.beginTransaction();
//     } catch (e: Exception) {
//       expect(connection.transactionLevel()).toEqual(1);
//     }
//   });
//
//   it('swap pdo with open transaction resets transaction level', () => {
//     const pdo = this.createMock(DatabaseConnectionTestMockPDO);
//     pdo.expects(this.once()).method('beginTransaction').willReturn(true);
//     const connection = getMockConnection([], pdo);
//     connection.beginTransaction();
//     connection.disconnect();
//     expect(connection.transactionLevel()).toEqual(0);
//   });
//
//   it('began transaction fires events if set', () => {
//     const pdo        = this.createMock(DatabaseConnectionTestMockPDO);
//     const connection = getMockConnection(['getName'], pdo);
//     connection.expects(this.any()).method('getName').willReturn('name');
//     connection.setEventDispatcher(events = m.mock(Dispatcher));
//     events.shouldReceive('dispatch').once()._with(m.type(TransactionBeginning));
//     connection.beginTransaction();
//   });
//
//   it('committed fires events if set', () => {
//     const pdo        = this.createMock(DatabaseConnectionTestMockPDO);
//     const connection = getMockConnection(['getName'], pdo);
//     connection.expects(this.any()).method('getName').willReturn('name');
//     connection.setEventDispatcher(events = m.mock(Dispatcher));
//     events.shouldReceive('dispatch').once()._with(m.type(TransactionCommitted));
//     connection.commit();
//   });
//
//   it('roll backed fires events if set', () => {
//     const pdo        = this.createMock(DatabaseConnectionTestMockPDO);
//     const connection = getMockConnection(['getName'], pdo);
//     connection.expects(this.any()).method('getName').willReturn('name');
//     connection.beginTransaction();
//     connection.setEventDispatcher(events = m.mock(Dispatcher));
//     events.shouldReceive('dispatch').once()._with(m.type(TransactionRolledBack));
//     connection.rollBack();
//   });
//
//   it('redundant roll back fires no event', () => {
//     const pdo        = this.createMock(DatabaseConnectionTestMockPDO);
//     const connection = getMockConnection(['getName'], pdo);
//     connection.expects(this.any()).method('getName').willReturn('name');
//     connection.setEventDispatcher(events = m.mock(Dispatcher));
//     events.shouldNotReceive('dispatch');
//     connection.rollBack();
//   });
//
//   it('transaction method runs successfully', () => {
//     const pdo  = this.getMockBuilder(DatabaseConnectionTestMockPDO).setMethods(
//       ['beginTransaction', 'commit']).getMock();
//     const mock = getMockConnection([], pdo);
//     pdo.expects(this.once()).method('beginTransaction');
//     pdo.expects(this.once()).method('commit');
//     const result = mock.transaction(db => {
//       return db;
//     });
//     expect(result).toEqual(mock);
//   });
//
//   it('transaction retries on serialization failure', () => {
//     this.expectException(PDOException);
//     this.expectExceptionMessage('Serialization failure');
//     const pdo  = this.getMockBuilder(DatabaseConnectionTestMockPDO).setMethods(
//       ['beginTransaction', 'commit', 'rollBack']).getMock();
//     const mock = getMockConnection([], pdo);
//     pdo.expects(this.exactly(3)).method('commit').will(this.throwException(
//       new DatabaseConnectionTestMockPDOException('Serialization failure', '40001')));
//     pdo.expects(this.exactly(3)).method('beginTransaction');
//     pdo.expects(this.never()).method('rollBack');
//     mock.transaction(() => {
//     }, 3);
//   });
//
//   it('transaction method retries on deadlock', () => {
//     this.expectException(QueryException);
//     this.expectExceptionMessage('Deadlock found when trying to get lock (SQL: )');
//     const pdo  = this.getMockBuilder(DatabaseConnectionTestMockPDO).setMethods(
//       ['beginTransaction', 'commit', 'rollBack']).getMock();
//     const mock = getMockConnection([], pdo);
//     pdo.expects(this.exactly(3)).method('beginTransaction');
//     pdo.expects(this.exactly(3)).method('rollBack');
//     pdo.expects(this.never()).method('commit');
//     mock.transaction(() => {
//       throw new QueryException('', [], new Exception('Deadlock found when trying to get lock'));
//     }, 3);
//   });
//
//   it('transaction method rollsback and throws', () => {
//     const pdo  = this.getMockBuilder(DatabaseConnectionTestMockPDO).setMethods(
//       ['beginTransaction', 'commit', 'rollBack']).getMock();
//     const mock = getMockConnection([], pdo);
//     pdo.expects(this.once()).method('beginTransaction');
//     pdo.expects(this.once()).method('rollBack');
//     pdo.expects(this.never()).method('commit');
//     try {
//       mock.transaction(() => {
//         throw new Exception('foo');
//       });
//     } catch (e: Exception) {
//       expect(e.getMessage()).toBe('foo');
//     }
//   });
//
//   it('on lost connection pdo is not swapped within a transaction', () => {
//     this.expectException(QueryException);
//     this.expectExceptionMessage('server has gone away (SQL: foo)');
//     const pdo = m.mock(PDO);
//     pdo.shouldReceive('beginTransaction').once();
//     const statement = m.mock(PDOStatement);
//     pdo.shouldReceive('prepare').once().andReturn(statement);
//     statement.shouldReceive('execute').once().andThrow(new PDOException('server has gone away'));
//     const connection = new Connection(pdo);
//     connection.beginTransaction();
//     connection.statement('foo');
//   });
//
//   it('on lost connection pdo is swapped outside transaction', () => {
//     const pdo       = m.mock(PDO);
//     const statement = m.mock(PDOStatement);
//     statement.shouldReceive('execute').once().andThrow(new PDOException('server has gone away'));
//     statement.shouldReceive('execute').once().andReturn('result');
//     pdo.shouldReceive('prepare').twice().andReturn(statement);
//     const connection = new Connection(pdo);
//     const called     = false;
//     connection.setReconnector(connection => {
//       const called = true;
//     });
//     expect(connection.statement('foo')).toBe('result');
//     expect(called).toBeTruthy();
//   });
//
//   it('run method retries on failure', () => {
//     const method = new ReflectionClass(Connection).getMethod('run');
//     method.setAccessible(true);
//     const pdo  = this.createMock(DatabaseConnectionTestMockPDO);
//     const mock = getMockConnection(['tryAgainIfCausedByLostConnection'], pdo);
//     mock.expects(this.once()).method('tryAgainIfCausedByLostConnection');
//     method.invokeArgs(mock, [
//       '', [], () => {
//         throw new QueryException('', [], new Exception());
//       }
//     ]);
//   });
//
//   it('run method never retries if within transaction', () => {
//     this.expectException(QueryException);
//     this.expectExceptionMessage('(SQL: ) (SQL: )');
//     const method = new ReflectionClass(Connection).getMethod('run');
//     method.setAccessible(true);
//     const pdo  = this.getMockBuilder(DatabaseConnectionTestMockPDO).setMethods(
//       ['beginTransaction']).getMock();
//     const mock = getMockConnection(['tryAgainIfCausedByLostConnection'], pdo);
//     pdo.expects(this.once()).method('beginTransaction');
//     mock.expects(this.never()).method('tryAgainIfCausedByLostConnection');
//     mock.beginTransaction();
//     method.invokeArgs(mock, [
//       '', [], () => {
//         throw new QueryException('', [], new Exception());
//       }
//     ]);
//   });
//
//   it('from creates new query builder', () => {
//     const conn = getMockConnection();
//     conn.setQueryGrammar(m.mock(Grammar));
//     conn.setPostProcessor(m.mock(Processor));
//     const builder = conn.table('users');
//     expect(builder).toInstanceOf(BaseBuilder);
//     expect(builder.from).toBe('users');
//   });
//
//   it('prepare bindings', () => {
//     const date = m.mock(DateTime);
//     date.shouldReceive('format').once()._with('foo').andReturn('bar');
//     const bindings = {
//       'test': date
//     };
//     const conn     = getMockConnection();
//     const grammar  = m.mock(Grammar);
//     grammar.shouldReceive('getDateFormat').once().andReturn('foo');
//     conn.setQueryGrammar(grammar);
//     const result = conn.prepareBindings(bindings);
//     expect(result).toEqual({
//       'test': 'bar'
//     });
//   });
//
//   it('log query fires events if set', () => {
//     const connection = getMockConnection();
//     connection.logQuery('foo', [], time());
//     connection.setEventDispatcher(events = m.mock(Dispatcher));
//     events.shouldReceive('dispatch').once()._with(m.type(QueryExecuted));
//     connection.logQuery('foo', [], null);
//   });
//
//   it('pretend only logs queries', () => {
//     const connection = getMockConnection();
//     const queries    = connection.pretend(connection => {
//       connection.select('foo bar', ['baz']);
//     });
//     expect(queries[0]['query']).toBe('foo bar');
//     expect(queries[0]['bindings']).toEqual(['baz']);
//   });
//
//   it('schema builder can be created', () => {
//     const connection = getMockConnection();
//     const schema     = connection.getSchemaBuilder();
//     expect(schema).toBeInstanceOf(Builder);
//     expect(schema.getConnection()).toEqual(connection);
//   });
//
//   it('get mock connection', () => {
//     const pdo        = pdo || new DatabaseConnectionTestMockPDO();
//     const defaults   = [
//       'getDefaultQueryGrammar', 'getDefaultPostProcessor', 'getDefaultSchemaGrammar'
//     ];
//     const connection = this.getMockBuilder(Connection).setMethods(
//       [...defaults, ...methods]).setConstructorArgs([pdo]).getMock();
//     connection.enableQueryLog();
//     return connection;
//   });
// });
//
// export class DatabaseConnectionTestMockPDO {
//   public constructor() {
//   }
// }
//
// export class DatabaseConnectionTestMockPDOException {
//   /*Overrides Exception::__construct, which casts $code to integer, so that we can create
//   an exception with a string $code consistent with the real PDOException behavior.*/
//   public constructor(message: string | null = null, code: string | null = null) {
//     this.message = message;
//     this.code    = code;
//   }
// }
