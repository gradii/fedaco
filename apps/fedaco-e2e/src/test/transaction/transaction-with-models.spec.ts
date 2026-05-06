/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Column, DatabaseConfig, Model, PrimaryColumn, Table } from '@gradii/fedaco';
import { sqliteDriver } from '@gradii/fedaco-sqlite-driver';

@Table({
  tableName: 'users',
})
class User extends Model {
  _timestamps = false;

  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;
}

@Table({
  tableName: 'posts',
})
class Post extends Model {
  _timestamps = false;

  @PrimaryColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  title: string;

  @Column()
  content: string;
}

describe('transaction with models using withConnection and createQuery', () => {
  let db: DatabaseConfig;

  beforeEach(async () => {
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
    db.bootFedaco();
    db.setAsGlobal();

    const connection = db.getConnection();

    // Create tables
    await connection.statement(
      'CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT)',
      [],
    );
    await connection.statement(
      'CREATE TABLE posts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT, content TEXT)',
      [],
    );
  });

  afterEach(async () => {
    await db.getDatabaseManager().disconnect();
  });

  it('should use withConnection() to execute queries in transaction context', async () => {
    const connection = db.getConnection();

    await connection.transaction(async (tx) => {
      // Use withConnection() to pass transaction context to model queries
      const user = await User.createQuery()
        .withConnection(tx)
        .create({
          name: 'Alice',
          email: 'alice@example.com',
        });

      await Post.createQuery()
        .withConnection(tx)
        .create({
          user_id: user.id,
          title: 'First Post',
          content: 'Hello World',
        });

      // Verify data exists within transaction
      const users = await User.createQuery().withConnection(tx).get();
      expect(users.length).toBe(1);

      const posts = await Post.createQuery().withConnection(tx).get();
      expect(posts.length).toBe(1);
    });

    // Verify data persisted after transaction commit
    const users = await User.createQuery().get();
    expect(users.length).toBe(1);
    expect(users[0].name).toBe('Alice');

    const posts = await Post.createQuery().get();
    expect(posts.length).toBe(1);
    expect(posts[0].title).toBe('First Post');
  });

  it('should use createQuery(tx) to execute queries in transaction context', async () => {
    const connection = db.getConnection();

    await connection.transaction(async (tx) => {
      // Use createQuery(tx) to pass transaction context directly
      const user = await User.createQuery(tx).create({
        name: 'Bob',
        email: 'bob@example.com',
      });

      await Post.createQuery(tx).create({
        user_id: user.id,
        title: 'Second Post',
        content: 'Using createQuery(tx)',
      });

      // Verify data exists within transaction
      const users = await User.createQuery(tx).get();
      expect(users.length).toBe(1);

      const posts = await Post.createQuery(tx).get();
      expect(posts.length).toBe(1);
    });

    // Verify data persisted after transaction commit
    const users = await User.createQuery().get();
    expect(users.length).toBe(1);
    expect(users[0].name).toBe('Bob');

    const posts = await Post.createQuery().get();
    expect(posts.length).toBe(1);
    expect(posts[0].title).toBe('Second Post');
  });

  it('should rollback transaction on error with withConnection()', async () => {
    const connection = db.getConnection();

    try {
      await connection.transaction(async (tx) => {
        await User.createQuery()
          .withConnection(tx)
          .create({
            name: 'Charlie',
            email: 'charlie@example.com',
          });

        await Post.createQuery()
          .withConnection(tx)
          .create({
            user_id: 1,
            title: 'Third Post',
            content: 'This will be rolled back',
          });

        // Simulate error
        throw new Error('Transaction failed');
      });
    } catch (e: any) {
      expect(e.message).toBe('Transaction failed');
    }

    // Verify data was rolled back
    const users = await User.createQuery().get();
    expect(users.length).toBe(0);

    const posts = await Post.createQuery().get();
    expect(posts.length).toBe(0);
  });

  it('should rollback transaction on error with createQuery(tx)', async () => {
    const connection = db.getConnection();

    try {
      await connection.transaction(async (tx) => {
        await User.createQuery(tx).create({
          name: 'David',
          email: 'david@example.com',
        });

        await Post.createQuery(tx).create({
          user_id: 1,
          title: 'Fourth Post',
          content: 'This will be rolled back',
        });

        // Simulate error
        throw new Error('Transaction failed');
      });
    } catch (e: any) {
      expect(e.message).toBe('Transaction failed');
    }

    // Verify data was rolled back
    const users = await User.createQuery().get();
    expect(users.length).toBe(0);

    const posts = await Post.createQuery().get();
    expect(posts.length).toBe(0);
  });

  it('should work with transaction options using withConnection()', async () => {
    const connection = db.getConnection();

    await connection.transaction(
      async (tx) => {
        await User.createQuery()
          .withConnection(tx)
          .create({
            name: 'Eve',
            email: 'eve@example.com',
          });
      },
      { timeout: 5000, isolationLevel: 'SERIALIZABLE' },
    );

    const users = await User.createQuery().get();
    expect(users.length).toBe(1);
    expect(users[0].name).toBe('Eve');
  });

  it('should work with transaction options using createQuery(tx)', async () => {
    const connection = db.getConnection();

    await connection.transaction(
      async (tx) => {
        await User.createQuery(tx).create({
          name: 'Frank',
          email: 'frank@example.com',
        });
      },
      { timeout: 5000, isolationLevel: 'SERIALIZABLE' },
    );

    const users = await User.createQuery().get();
    expect(users.length).toBe(1);
    expect(users[0].name).toBe('Frank');
  });

  it('should support complex queries with withConnection()', async () => {
    const connection = db.getConnection();

    await connection.transaction(async (tx) => {
      // Create multiple users
      await User.createQuery()
        .withConnection(tx)
        .create({ name: 'User1', email: 'user1@example.com' });
      await User.createQuery()
        .withConnection(tx)
        .create({ name: 'User2', email: 'user2@example.com' });

      // Query with where clause
      const user = await User.createQuery()
        .withConnection(tx)
        .where('name', 'User1')
        .first();

      expect(user.name).toBe('User1');

      // Update
      await User.createQuery()
        .withConnection(tx)
        .where('name', 'User1')
        .update({ email: 'updated@example.com' });

      // Verify update
      const updated = await User.createQuery()
        .withConnection(tx)
        .where('name', 'User1')
        .first();

      expect(updated.email).toBe('updated@example.com');
    });
  });

  it('should support complex queries with createQuery(tx)', async () => {
    const connection = db.getConnection();

    await connection.transaction(async (tx) => {
      // Create multiple users
      await User.createQuery(tx).create({ name: 'User3', email: 'user3@example.com' });
      await User.createQuery(tx).create({ name: 'User4', email: 'user4@example.com' });

      // Query with where clause
      const user = await User.createQuery(tx).where('name', 'User3').first();

      expect(user.name).toBe('User3');

      // Update
      await User.createQuery(tx).where('name', 'User3').update({ email: 'updated3@example.com' });

      // Verify update
      const updated = await User.createQuery(tx).where('name', 'User3').first();

      expect(updated.email).toBe('updated3@example.com');
    });
  });
});
