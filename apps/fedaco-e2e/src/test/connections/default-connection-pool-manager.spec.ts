/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { DefaultConnectionPoolManager, type DriverConnection } from '@gradii/fedaco';

/**
 * Minimal DriverConnection stub. We only care about `disconnect()` for pool
 * teardown — the pool never invokes the SQL methods. Each instance carries an
 * id so tests can assert which connection was handed out.
 */
function makeFakeConnection(id: number): DriverConnection & { id: number; closed: boolean } {
  const conn = {
    id,
    closed: false,
    disconnect: () => {
      conn.closed = true;
      return Promise.resolve();
    },
  } as unknown as DriverConnection & { id: number; closed: boolean };

  // Fill in unused methods with rejecting stubs so accidental use is loud.
  const reject = () => Promise.reject(new Error('not used in pool tests'));
  Object.assign(conn, {
    prepare: reject,
    execute: reject,
    lastInsertId: reject,
    commit: reject,
    beginTransaction: reject,
    rollBack: reject,
  });
  return conn;
}

function makeResolver() {
  let counter = 0;
  const created: Array<DriverConnection & { id: number; closed: boolean }> = [];
  const resolver = async () => {
    const c = makeFakeConnection(++counter);
    created.push(c);
    return c;
  };
  return { resolver, created, count: () => counter };
}

describe('DefaultConnectionPoolManager', () => {
  it('reuses an idle connection on the next acquire', async () => {
    const { resolver, count } = makeResolver();
    const pool = new DefaultConnectionPoolManager(resolver, { max: 2 });

    const c1 = await pool.acquire();
    expect(count()).toBe(1);

    await pool.release(c1);
    expect(pool.getPoolSize()).toEqual({ total: 1, idle: 1, active: 0, pending: 0 });

    const c2 = await pool.acquire();
    expect(c2).toBe(c1);
    // No new connection opened — same one came out of the idle queue.
    expect(count()).toBe(1);

    await pool.destroy();
  });

  it('opens new connections up to max, then queues waiters', async () => {
    const { resolver, count } = makeResolver();
    const pool = new DefaultConnectionPoolManager(resolver, {
      max: 2,
      acquireTimeout: 1000,
    });

    const a = await pool.acquire();
    const b = await pool.acquire();
    expect(count()).toBe(2);
    expect(pool.getPoolSize()).toEqual({ total: 2, idle: 0, active: 2, pending: 0 });

    // Third acquire must queue — pool is at capacity.
    let resolved = false;
    const pending = pool.acquire().then((c) => {
      resolved = true;
      return c;
    });

    // Yield once; the waiter must still be pending.
    await Promise.resolve();
    expect(resolved).toBe(false);

    // Releasing should hand the connection straight to the waiter, not park
    // it in idle.
    await pool.release(a);
    const c = await pending;
    expect(c).toBe(a);
    expect(count()).toBe(2);
    expect(pool.getPoolSize()).toEqual({ total: 2, idle: 0, active: 2, pending: 0 });

    await pool.release(b);
    await pool.release(c);
    await pool.destroy();
  });

  it('rejects an acquire when acquireTimeout elapses', async () => {
    const { resolver } = makeResolver();
    const pool = new DefaultConnectionPoolManager(resolver, {
      max: 1,
      acquireTimeout: 30,
    });

    await pool.acquire(); // saturate the pool

    await expect(pool.acquire()).rejects.toThrow(/acquire timeout after 30ms/);

    await pool.destroy();
  });

  it('destroy rejects pending waiters and disconnects all connections', async () => {
    const { resolver, created } = makeResolver();
    const pool = new DefaultConnectionPoolManager(resolver, {
      max: 1,
      acquireTimeout: 5000,
    });

    const a = await pool.acquire();
    const queued = pool.acquire(); // will wait
    // Don't await — destroy() should reject it.

    await pool.destroy();

    await expect(queued).rejects.toThrow(/Connection pool has been destroyed/);
    // Active connection gets closed by destroy.
    expect((a as any).closed).toBe(true);
    expect(created.every((c) => c.closed)).toBe(true);

    // Subsequent acquire fails.
    await expect(pool.acquire()).rejects.toThrow(/Connection pool has been destroyed/);
  });

  it('release on a destroyed pool closes the returned connection', async () => {
    const { resolver } = makeResolver();
    const pool = new DefaultConnectionPoolManager(resolver, { max: 2 });

    const a = await pool.acquire();
    await pool.destroy();
    // Already closed by destroy(), but releasing a stale handle must be safe
    // (it's a noop because the active set was cleared).
    await expect(pool.release(a)).resolves.toBeUndefined();
  });

  it('idle connections are closed after idleTimeout', async () => {
    const { resolver } = makeResolver();
    const pool = new DefaultConnectionPoolManager(resolver, {
      max: 2,
      idleTimeout: 20,
    });

    const a = (await pool.acquire()) as DriverConnection & { closed: boolean };
    await pool.release(a);
    expect(pool.getPoolSize()).toEqual({ total: 1, idle: 1, active: 0, pending: 0 });

    // Wait long enough for the idle timer to fire.
    await new Promise((r) => setTimeout(r, 60));

    expect(a.closed).toBe(true);
    expect(pool.getPoolSize()).toEqual({ total: 0, idle: 0, active: 0, pending: 0 });

    await pool.destroy();
  });
});
