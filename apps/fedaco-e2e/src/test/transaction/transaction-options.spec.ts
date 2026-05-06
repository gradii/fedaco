/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { DatabaseConfig } from '@gradii/fedaco';
import { sqliteDriver } from '@gradii/fedaco-sqlite-driver';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('transaction isolation and timeout', () => {
  let db: DatabaseConfig;

  beforeEach(() => {
    db = new DatabaseConfig();
    db.addConnection({
      driver: 'sqlite',
      factory: sqliteDriver(),
      database: ':memory:',
      pool: {
        min: 2,
        max: 5,
      },
    });
    db.setAsGlobal();
  });

  afterEach(async () => {
    // Clean up
    await db.getDatabaseManager().disconnect();
  });

  it('should execute regular transaction without isolation', async () => {
    const connection = db.getConnection();

    await connection.statement('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)', []);

    await connection.transaction(async (tx) => {
      await tx.statement('INSERT INTO users (name) VALUES (?)', ['Alice']);
      await tx.statement('INSERT INTO users (name) VALUES (?)', ['Bob']);
    });

    const users = await connection.select('SELECT * FROM users');
    expect(users.length).toBe(2);
  });

  it('should execute transaction with timeout option', async () => {
    const connection = db.getConnection();

    await connection.statement('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)', []);

    await connection.transaction(
      async (tx) => {
        await tx.statement('INSERT INTO users (name) VALUES (?)', ['Alice']);
      },
      { timeout: 5000 },
    );

    const users = await connection.select('SELECT * FROM users');
    expect(users.length).toBe(1);
  });

  it('should timeout long-running transaction', async () => {
    const connection = db.getConnection();

    await connection.statement('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)', []);

    try {
      await connection.transaction(
        async (tx) => {
          await tx.statement('INSERT INTO users (name) VALUES (?)', ['Alice']);
          // Simulate long-running operation
          await new Promise((resolve) => setTimeout(resolve, 200));
        },
        { timeout: 100 },
      );
      fail('Should have thrown timeout error');
    } catch (error: any) {
      expect(error.message).toContain('Transaction timeout after 100ms');
    }

    // Transaction should be rolled back
    const users = await connection.select('SELECT * FROM users');
    expect(users.length).toBe(0);
  });

  it('should set isolation level', async () => {
    const connection = db.getConnection();

    await connection.statement('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)', []);

    await connection.transaction(
      async (tx) => {
        await tx.statement('INSERT INTO users (name) VALUES (?)', ['Alice']);
      },
      { isolationLevel: 'SERIALIZABLE' },
    );

    const users = await connection.select('SELECT * FROM users');
    expect(users.length).toBe(1);
  });

  it('should support retry attempts', async () => {
    const connection = db.getConnection();

    await connection.statement('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)', []);

    let attemptCount = 0;

    await connection.transaction(
      async (tx) => {
        attemptCount++;
        if (attemptCount === 1) {
          throw new Error('Deadlock found when trying to get lock');
        }
        await tx.statement('INSERT INTO users (name) VALUES (?)', ['Alice']);
      },
      { attempts: 3 },
    );

    expect(attemptCount).toBe(2);
    const users = await connection.select('SELECT * FROM users');
    expect(users.length).toBe(1);
  });
});

describe('isolated transactions on a driver without pooling', () => {
  // SQLite has no pool manager. Isolated transactions still work via the
  // createConnector fallback — each one opens a fresh sqlite3 handle that
  // shares the same database file. Use a temp file (not :memory:) so the
  // primary connection and the isolated handle see the same data.
  let db: DatabaseConfig;
  let dbDir: string;
  let dbFile: string;

  beforeEach(() => {
    dbDir = mkdtempSync(join(tmpdir(), 'fedaco-iso-'));
    dbFile = join(dbDir, 'test.sqlite');

    db = new DatabaseConfig();
    db.addConnection({
      driver: 'sqlite',
      factory: sqliteDriver(),
      database: dbFile,
    });
    db.setAsGlobal();
  });

  afterEach(async () => {
    await db.getDatabaseManager().disconnect();
    rmSync(dbDir, { recursive: true, force: true });
  });

  it('runs an isolated transaction without a pool manager (createConnector fallback)', async () => {
    const connection = db.getConnection();

    await connection.statement('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)', []);

    await connection.transaction(
      async (tx) => {
        await tx.statement('INSERT INTO users (name) VALUES (?)', ['Alice']);
        await tx.statement('INSERT INTO users (name) VALUES (?)', ['Bob']);
      },
      { isolated: true },
    );

    const users = await connection.select('SELECT * FROM users');
    expect(users.length).toBe(2);
  });

  it('rolls back an isolated transaction on error', async () => {
    const connection = db.getConnection();

    await connection.statement('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)', []);

    await expect(
      connection.transaction(
        async (tx) => {
          await tx.statement('INSERT INTO users (name) VALUES (?)', ['Carol']);
          throw new Error('boom');
        },
        { isolated: true },
      ),
    ).rejects.toThrow('boom');

    const users = await connection.select('SELECT * FROM users');
    expect(users.length).toBe(0);
  });
});
