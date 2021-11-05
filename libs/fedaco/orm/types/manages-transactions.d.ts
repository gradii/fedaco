import { DatabaseTransactionsManager } from './database-transactions-manager';
import { Constructor } from './helper/constructor';
export interface ManagesTransactions {
    _transactions: number;
    _transactionsManager: DatabaseTransactionsManager;
    transaction(callback: (...args: any[]) => Promise<any | void>, attempts?: number): Promise<any>;
    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollBack(toLevel?: number | null): Promise<void>;
    transactionLevel(): number;
    afterCommit(callback: Function): Promise<void>;
    setTransactionManager(manager: DatabaseTransactionsManager): this;
    unsetTransactionManager(): void;
}
declare type ManagesTransactionsCtor = Constructor<ManagesTransactions>;
export declare function mixinManagesTransactions<T extends Constructor<any>>(base: T): ManagesTransactionsCtor;
export {};
