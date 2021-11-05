/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Observable } from 'rxjs';
import { Model } from '../../fedaco/model';
import { Constructor } from '../../helper/constructor';
export interface BuildQueries {
    chunk(count: number, signal?: Observable<any>): Observable<{
        results: any[];
        page: number;
    }>;
    each(count?: number, signal?: Observable<any>): Observable<{
        item: any;
        index: number;
    }>;
    chunkById(count: number, column?: string, alias?: string, signal?: Observable<any>): Observable<{
        results: any;
        page: number;
    }>;
    eachById(count: number, column?: string, alias?: string, signal?: Observable<any>): Observable<{
        item: any;
        index: number;
    }>;
    first(columns?: any[] | string): Promise<Model | /*object |*/ any | null>;
    when(condition: boolean, callback: (q: this, condition: boolean) => any, defaultCallback?: Function): this;
    tap(callback: (q: this, condition: boolean) => any): this;
    unless(value: any, callback: Function, _default?: Function): this;
}
export declare type BuildQueriesCtor = Constructor<BuildQueries>;
export declare function mixinBuildQueries<T extends Constructor<any>>(base: T): BuildQueriesCtor & T;
