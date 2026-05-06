import { Connector } from '../../src/connector/connector';
// import { MysqlConnector } from '../../src/connector/mysql/mysql-connector';
//
describe('test database connector', () => {
  it('option resolution', () => {
    const connector = new Connector();
    connector.setDefaultOptions(['foo', 'bar']);
    expect(
      connector.getOptions({
        options: ['baz', 'boom'],
      }),
    ).toEqual({ '0': 'baz', '1': 'boom' });
  });
  //
  //   it('my sql connect calls create connection with proper arguments', () => {
  //     const connector  = new MysqlConnector();
  //     const connection = {}
  //     connector.expects(this.once()).method('getOptions')._with(this.equalTo(config)).willReturn(
  //       ['options']);
  //     connector.expects(this.once()).method('createConnection')._with(this.equalTo(dsn),
  //       this.equalTo(config), this.equalTo(['options'])).willReturn(connection);
  //     connection.shouldReceive('prepare').once()._with(
  //       'set names \'utf8\' collate \'utf8_unicode_ci\'').andReturn(connection);
  //     connection.shouldReceive('execute').once();
  //     connection.shouldReceive('exec').zeroOrMoreTimes();
  //     const result = connector.connect(config);
  //     expect(connection).toEqual(result);
  //   });
  //
  //   it('my sql connect provider', () => {
  //     return [
  //       [
  //         'mysql:host=foo;dbname=bar', {
  //         'host'     : 'foo',
  //         'database' : 'bar',
  //         'collation': 'utf8_unicode_ci',
  //         'charset'  : 'utf8'
  //       }
  //       ], [
  //         'mysql:host=foo;port=111;dbname=bar', {
  //           'host'     : 'foo',
  //           'database' : 'bar',
  //           'port'     : 111,
  //           'collation': 'utf8_unicode_ci',
  //           'charset'  : 'utf8'
  //         }
  //       ], [
  //         'mysql:unix_socket=baz;dbname=bar', {
  //           'host'       : 'foo',
  //           'database'   : 'bar',
  //           'port'       : 111,
  //           'unix_socket': 'baz',
  //           'collation'  : 'utf8_unicode_ci',
  //           'charset'    : 'utf8'
  //         }
  //       ]
  //     ];
  //   });
  //
  //   it('postgres connect calls create connection with proper arguments', () => {
  //     const dsn        = 'pgsql:host=foo;dbname=bar;port=111';
  //     const config     = {
  //       'host'    : 'foo',
  //       'database': 'bar',
  //       'port'    : 111,
  //       'charset' : 'utf8'
  //     };
  //     const connector  = this.getMockBuilder(PostgresConnector).setMethods(
  //       ['createConnection', 'getOptions']).getMock();
  //     const connection = m.mock(stdClass);
  //     connector.expects(this.once()).method('getOptions')._with(this.equalTo(config)).willReturn(
  //       ['options']);
  //     connector.expects(this.once()).method('createConnection')._with(this.equalTo(dsn),
  //       this.equalTo(config), this.equalTo(['options'])).willReturn(connection);
  //     connection.shouldReceive('prepare').once()._with('set names \'utf8\'').andReturn(connection);
  //     connection.shouldReceive('execute').once();
  //     const result = connector.connect(config);
  //     expect(connection).toEqual(result);
  //   });
  //
  //   it('postgres search path is set', () => {
  //     const dsn        = 'pgsql:host=foo;dbname=bar';
  //     const config     = {
  //       'host'    : 'foo',
  //       'database': 'bar',
  //       'schema'  : 'public',
  //       'charset' : 'utf8'
  //     };
  //     const connector  = this.getMockBuilder(PostgresConnector).setMethods(
  //       ['createConnection', 'getOptions']).getMock();
  //     const connection = m.mock(stdClass);
  //     connector.expects(this.once()).method('getOptions')._with(this.equalTo(config)).willReturn(
  //       ['options']);
  //     connector.expects(this.once()).method('createConnection')._with(this.equalTo(dsn),
  //       this.equalTo(config), this.equalTo(['options'])).willReturn(connection);
  //     connection.shouldReceive('prepare').once()._with('set names \'utf8\'').andReturn(connection);
  //     connection.shouldReceive('prepare').once()._with('set search_path to "public"').andReturn(
  //       connection);
  //     connection.shouldReceive('execute').twice();
  //     const result = connector.connect(config);
  //     expect(connection).toEqual(result);
  //   });
  //
  //   it('postgres search path array supported', () => {
  //     const dsn        = 'pgsql:host=foo;dbname=bar';
  //     const config     = {
  //       'host'    : 'foo',
  //       'database': 'bar',
  //       'schema'  : ['public', 'user'],
  //       'charset' : 'utf8'
  //     };
  //     const connector  = this.getMockBuilder(PostgresConnector).setMethods(
  //       ['createConnection', 'getOptions']).getMock();
  //     const connection = m.mock(stdClass);
  //     connector.expects(this.once()).method('getOptions')._with(this.equalTo(config)).willReturn(
  //       ['options']);
  //     connector.expects(this.once()).method('createConnection')._with(this.equalTo(dsn),
  //       this.equalTo(config), this.equalTo(['options'])).willReturn(connection);
  //     connection.shouldReceive('prepare').once()._with('set names \'utf8\'').andReturn(connection);
  //     connection.shouldReceive('prepare').once()._with(
  //       'set search_path to "public", "user"').andReturn(connection);
  //     connection.shouldReceive('execute').twice();
  //     const result = connector.connect(config);
  //     expect(connection).toEqual(result);
  //   });
  //
  //   it('postgres application name is set', () => {
  //     const dsn        = 'pgsql:host=foo;dbname=bar';
  //     const config     = {
  //       'host'            : 'foo',
  //       'database'        : 'bar',
  //       'charset'         : 'utf8',
  //       'application_name': 'Laravel App'
  //     };
  //     const connector  = this.getMockBuilder(PostgresConnector).setMethods(
  //       ['createConnection', 'getOptions']).getMock();
  //     const connection = m.mock(stdClass);
  //     connector.expects(this.once()).method('getOptions')._with(this.equalTo(config)).willReturn(
  //       ['options']);
  //     connector.expects(this.once()).method('createConnection')._with(this.equalTo(dsn),
  //       this.equalTo(config), this.equalTo(['options'])).willReturn(connection);
  //     connection.shouldReceive('prepare').once()._with('set names \'utf8\'').andReturn(connection);
  //     connection.shouldReceive('prepare').once()._with(
  //       'set application_name to \'Laravel App\'').andReturn(connection);
  //     connection.shouldReceive('execute').twice();
  //     const result = connector.connect(config);
  //     expect(connection).toEqual(result);
  //   });
  //
  //   it('sq lite memory databases may be connected to', () => {
  //     const dsn        = 'sqlite::memory:';
  //     const config     = {
  //       'database': ':memory:'
  //     };
  //     const connector  = this.getMockBuilder(SQLiteConnector).setMethods(
  //       ['createConnection', 'getOptions']).getMock();
  //     const connection = m.mock(stdClass);
  //     connector.expects(this.once()).method('getOptions')._with(this.equalTo(config)).willReturn(
  //       ['options']);
  //     connector.expects(this.once()).method('createConnection')._with(this.equalTo(dsn),
  //       this.equalTo(config), this.equalTo(['options'])).willReturn(connection);
  //     const result = connector.connect(config);
  //     expect(connection).toEqual(result);
  //   });
  //
  //   it('sq lite file databases may be connected to', () => {
  //     const dsn        = 'sqlite:' + __DIR__;
  //     const config     = {
  //       'database': __DIR__
  //     };
  //     const connector  = this.getMockBuilder(SQLiteConnector).setMethods(
  //       ['createConnection', 'getOptions']).getMock();
  //     const connection = m.mock(stdClass);
  //     connector.expects(this.once()).method('getOptions')._with(this.equalTo(config)).willReturn(
  //       ['options']);
  //     connector.expects(this.once()).method('createConnection')._with(this.equalTo(dsn),
  //       this.equalTo(config), this.equalTo(['options'])).willReturn(connection);
  //     const result = connector.connect(config);
  //     expect(connection).toEqual(result);
  //   });
  //
  //   it('sql server connect calls create connection with proper arguments', () => {
  //     const config     = {
  //       'host'    : 'foo',
  //       'database': 'bar',
  //       'port'    : 111
  //     };
  //     const dsn        = this.getDsn(config);
  //     const connector  = this.getMockBuilder(SqlServerConnector).setMethods(
  //       ['createConnection', 'getOptions']).getMock();
  //     const connection = m.mock(stdClass);
  //     connector.expects(this.once()).method('getOptions')._with(this.equalTo(config)).willReturn(
  //       ['options']);
  //     connector.expects(this.once()).method('createConnection')._with(this.equalTo(dsn),
  //       this.equalTo(config), this.equalTo(['options'])).willReturn(connection);
  //     const result = connector.connect(config);
  //     expect(connection).toEqual(result);
  //   });
  //
  //   it('sql server connect calls create connection with optional arguments', () => {
  //     const config     = {
  //       'host'    : 'foo',
  //       'database': 'bar',
  //       'port'    : 111,
  //       'readonly': true,
  //       'charset' : 'utf-8',
  //       'pooling' : false,
  //       'appname' : 'baz'
  //     };
  //     const dsn        = this.getDsn(config);
  //     const connector  = this.getMockBuilder(SqlServerConnector).setMethods(
  //       ['createConnection', 'getOptions']).getMock();
  //     const connection = m.mock(stdClass);
  //     connector.expects(this.once()).method('getOptions')._with(this.equalTo(config)).willReturn(
  //       ['options']);
  //     connector.expects(this.once()).method('createConnection')._with(this.equalTo(dsn),
  //       this.equalTo(config), this.equalTo(['options'])).willReturn(connection);
  //     const result = connector.connect(config);
  //     expect(connection).toEqual(result);
  //   });
  //
  //   it('sql server connect calls create connection with preferred odbc', () => {
  //     const config     = {
  //       'odbc'                : true,
  //       'odbc_datasource_name': 'server=localhost;database=test;'
  //     };
  //     const dsn        = this.getDsn(config);
  //     const connector  = this.getMockBuilder(SqlServerConnector).setMethods(
  //       ['createConnection', 'getOptions']).getMock();
  //     const connection = m.mock(stdClass);
  //     connector.expects(this.once()).method('getOptions')._with(this.equalTo(config)).willReturn(
  //       ['options']);
  //     connector.expects(this.once()).method('createConnection')._with(this.equalTo(dsn),
  //       this.equalTo(config), this.equalTo(['options'])).willReturn(connection);
  //     const result = connector.connect(config);
  //     expect(connection).toEqual(result);
  //   });
  //
  //   it('get dsn', () => {
  //     extract(config, EXTR_SKIP);
  //     const availableDrivers = PDO.getAvailableDrivers();
  //     if (availableDrivers.includes('odbc') && (config['odbc'] ?? null) === true) {
  //       return config['odbc_datasource_name'] !== undefined ? 'odbc:' + config['odbc_datasource_name'] : '';
  //     }
  //     if (availableDrivers.includes('sqlsrv')) {
  //       const port     = config['port'] !== undefined ? ',' + port : '';
  //       const appname  = config['appname'] !== undefined ? ';APP=' + config['appname'] : '';
  //       const readonly = config['readonly'] !== undefined ? ';ApplicationIntent=ReadOnly' : '';
  //       const pooling  = config['pooling'] !== undefined && config['pooling'] == false ? ';ConnectionPooling=0' : '';
  //       return `sqlsrv:Server=${host}${port};Database=${database}${readonly}${pooling}${appname}`;
  //     } else {
  //       const port    = config['port'] !== undefined ? ':' + port : '';
  //       const appname = config['appname'] !== undefined ? ';appname=' + config['appname'] : '';
  //       const charset = config['charset'] !== undefined ? ';charset=' + config['charset'] : '';
  //       return `dblib:host=${host}${port};dbname=${database}${charset}${appname}`;
  //     }
  //   });
});
