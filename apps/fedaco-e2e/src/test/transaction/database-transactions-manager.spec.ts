import { DatabaseTransactionsManager } from '../../src/database-transactions-manager';

describe('test database transactions manager', () => {
  it('beginning transactions', () => {
    const manager = new DatabaseTransactionsManager();
    manager.begin('default', 1);
    manager.begin('default', 2);
    manager.begin('admin', 1);
    expect(manager.getTransactions()).toHaveLength(3);
    expect(manager.getTransactions()[0].connection).toBe('default');
    expect(manager.getTransactions()[0].level).toEqual(1);
    expect(manager.getTransactions()[1].connection).toBe('default');
    expect(manager.getTransactions()[1].level).toEqual(2);
    expect(manager.getTransactions()[2].connection).toBe('admin');
    expect(manager.getTransactions()[2].level).toEqual(1);
  });
  it('rolling back transactions', () => {
    const manager = new DatabaseTransactionsManager();
    manager.begin('default', 1);
    manager.begin('default', 2);
    manager.begin('admin', 1);
    manager.rollback('default', 1);
    expect(manager.getTransactions()).toHaveLength(2);
    expect(manager.getTransactions()[0].connection).toBe('default');
    expect(manager.getTransactions()[0].level).toEqual(1);
    expect(manager.getTransactions()[1].connection).toBe('admin');
    expect(manager.getTransactions()[1].level).toEqual(1);
  });
  it('rolling back transactions all the way', () => {
    const manager = new DatabaseTransactionsManager();
    manager.begin('default', 1);
    manager.begin('default', 2);
    manager.begin('admin', 1);
    manager.rollback('default', 0);
    expect(manager.getTransactions()).toHaveLength(1);
    expect(manager.getTransactions()[0].connection).toBe('admin');
    expect(manager.getTransactions()[0].level).toEqual(1);
  });
  it('committing transactions', () => {
    const manager = new DatabaseTransactionsManager();
    manager.begin('default', 1);
    manager.begin('default', 2);
    manager.begin('admin', 1);
    manager.commit('default');
    expect(manager.getTransactions()).toHaveLength(1);
    expect(manager.getTransactions()[0].connection).toBe('admin');
    expect(manager.getTransactions()[0].level).toEqual(1);
  });
  it('callbacks are added to the current transaction', () => {
    const callbacks = [];
    const manager = new DatabaseTransactionsManager();
    manager.begin('default', 1);
    manager.addCallback(() => {});
    manager.begin('default', 2);
    manager.begin('admin', 1);
    manager.addCallback(() => {});
    expect(manager.getTransactions()[0].getCallbacks()).toHaveLength(1);
    expect(manager.getTransactions()[1].getCallbacks()).toHaveLength(0);
    expect(manager.getTransactions()[2].getCallbacks()).toHaveLength(1);
  });
  it('committing transactions executes callbacks', async () => {
    const callbacks: any[] = [];
    const manager = new DatabaseTransactionsManager();
    manager.begin('default', 1);
    manager.addCallback(() => {
      callbacks.push(['default', 1]);
    });
    manager.begin('default', 2);
    manager.addCallback(() => {
      callbacks.push(['default', 2]);
    });
    manager.begin('admin', 1);
    await manager.commit('default');
    expect(callbacks).toHaveLength(2);
    expect(callbacks[0]).toEqual(['default', 1]);
    expect(callbacks[1]).toEqual(['default', 2]);
  });

  it('committing executes only callbacks of the connection', () => {
    const callbacks: any[] = [];
    const manager = new DatabaseTransactionsManager();
    manager.begin('default', 1);
    manager.addCallback(() => {
      callbacks.push(['default', 1]);
    });
    manager.begin('default', 2);
    manager.begin('admin', 1);
    manager.addCallback(() => {
      callbacks.push(['admin', 1]);
    });
    manager.commit('default');
    expect(callbacks).toHaveLength(1);
    expect(callbacks[0]).toEqual(['default', 1]);
  });
  it('callback is executed if no transactions', () => {
    const callbacks: any[] = [];
    const manager = new DatabaseTransactionsManager();
    manager.addCallback(() => {
      callbacks.push(['default', 1]);
    });
    expect(callbacks).toHaveLength(1);
    expect(callbacks[0]).toEqual(['default', 1]);
  });
});
