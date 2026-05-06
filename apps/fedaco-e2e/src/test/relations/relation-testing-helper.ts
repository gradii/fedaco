/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { type ConnectionInterface } from '@gradii/fedaco';
import { QueryBuilder } from '@gradii/fedaco';
import { SqliteQueryGrammar } from '@gradii/fedaco-sqlite-driver';
import { Processor } from '@gradii/fedaco';
import { type SchemaBuilder } from '@gradii/fedaco';
import { FedacoBuilder } from '@gradii/fedaco';
import { MysqlQueryGrammar } from '@gradii/fedaco-mysql-driver';
import { type DatabaseTransactionsManager } from '@gradii/fedaco';

let builder, related;

class Conn implements ConnectionInterface {
  getQueryGrammar(): any {}

  getDatabaseName(): string {
    return 'default-database';
  }

  getPostProcessor(): any {}

  query(): QueryBuilder {
    return new QueryBuilder(this, new SqliteQueryGrammar(), new Processor());
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

  getConfig(name: string): any {}

  getPdo(): any {}

  getSchemaBuilder(): SchemaBuilder {
    throw new Error('not implemented');
  }

  recordsHaveBeenModified(): any {}

  selectFromWriteConnection(sql: string, values: any): any {}

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

  setTransactionManager(manager: DatabaseTransactionsManager): this {
    return undefined;
  }

  transaction(callback: (...args: any[]) => Promise<any>, attempts?: number): Promise<any> {
    return Promise.resolve(undefined);
  }

  transactionLevel(): number {
    return 0;
  }

  unsetTransactionManager(): void {}

  setTablePrefix(prefix: string): any {}
}

export function getBuilder() {
  return new FedacoBuilder(new QueryBuilder(new Conn(), new MysqlQueryGrammar(), new Processor()));
}
