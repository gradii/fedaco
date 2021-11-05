/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
export interface QueryBuilderAggregate {
    aggregate(func: string, columns: any[]): Promise<any>;
    count(columns?: string): Promise<number>;
    doesntExist(columns?: string): Promise<boolean>;
    exists(columns?: string): Promise<boolean>;
    getCountForPagination(columns?: string[]): Promise<number>;
    max(columns?: string): Promise<any>;
    min(columns?: string): Promise<any>;
    sum(columns?: string): Promise<any>;
}
export declare type QueryBuilderAggregateCtor = Constructor<QueryBuilderAggregate>;
export declare function mixinAggregate<T extends Constructor<any>>(base: T): QueryBuilderAggregateCtor & T;
