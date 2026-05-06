/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { ConfigurationUrlParser } from './configuration-url-parser';

describe('ConfigurationUrlParser', () => {
  const parser = new ConfigurationUrlParser();

  it('parses a full mysql URI with user, password, host, port, and db', () => {
    const result = parser.parseConfiguration({
      url: 'mysql://user:password@host:3306/db',
    });

    expect(result).toMatchObject({
      driver  : 'mysql',
      host    : 'host',
      port    : 3306,
      username: 'user',
      password: 'password',
      database: 'db',
    });
  });

  it('parses a postgres URI', () => {
    const result = parser.parseConfiguration({
      url: 'postgres://u:p@db.example.com:5432/app?sslmode=require',
    });

    expect(result).toMatchObject({
      driver  : 'pgsql',
      host    : 'db.example.com',
      port    : 5432,
      username: 'u',
      password: 'p',
      database: 'app',
      sslmode : 'require',
    });
  });

  it('parses a sqlite URI (sqlite:///path)', () => {
    const result = parser.parseConfiguration({
      url: 'sqlite:///:memory:',
    });

    expect(result).toMatchObject({
      driver  : 'sqlite',
      database: ':memory:',
    });
  });
});
