/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank } from '@gradii/check-type';
import { last } from 'ramda';
import type { Subscriber } from 'rxjs';
import { BehaviorSubject, EMPTY, from, interval, Observable, of } from 'rxjs';
import { bufferWhen, catchError, concatMap, map, mergeMap, take, tap } from 'rxjs/operators';
import type { Model } from '../../fedaco/model';
import type { Constructor } from '../../helper/constructor';
import type { QueryBuilder } from '../query-builder';

export interface BuildQueries {

  chunk(count: number, signal?: Observable<any>): Observable<{results: any[], page: number}>;

  each(count?: number, signal?: Observable<any>): Observable<{item: any, index: number}>;

  chunkById(count: number,
            column?: string,
            alias?: string,
            signal?: Observable<any>): Observable<{results: any, page: number}>;

  eachById(count: number,
           column?: string,
           alias?: string,
           signal?: Observable<any>): Observable<{item: any, index: number}>;

  first(columns?: any[] | string): Promise<Model | /*object |*/ any | null>;

  when(condition: boolean, callback: (q: this, condition: boolean) => any,
       defaultCallback?: Function): this;

  tap(callback: (q: this, condition: boolean) => any): this;

  unless(value: any, callback: Function, _default?: Function): this;
}

export type BuildQueriesCtor = Constructor<BuildQueries>;


export function mixinBuildQueries<T extends Constructor<any>>(base: T): BuildQueriesCtor & T {

  return class _Self extends base {

    public chunk(count: number,
                 signal?: Observable<any>): Observable<{results: any[], page: number}> {
      if (!(count > 0)) {
        return EMPTY;
      }
      const clone = this.clone();

      return new Observable((observer: Subscriber<any>) => {
        let isFirst = true;
        const subject = new BehaviorSubject(1);
        subject.pipe(
          signal ? bufferWhen(() => {
            // first time emit immediately
            if (isFirst) {
              isFirst = false;
              return interval(10).pipe(take(1));
            }
            return signal;
          }) : map(it => [it]),
          mergeMap((items: number[]) => of(...items)),
          concatMap((page: number) => {
            return from(
              (clone as QueryBuilder)
                .forPage(page, count).get()
            ).pipe(
              tap((results: any[]) => {
                if (!results || results.length == 0) {
                  subject.complete();
                  observer.complete();
                } else if (results.length === count) {
                  subject.next(page + 1);
                  observer.next({ results, page });
                } else {
                  observer.next({ results, page });
                  subject.complete();
                  observer.complete();
                }
              })
            );
          }),
          catchError((err, caught) => {
            subject.complete();
            observer.error(err);
            observer.complete();
            return EMPTY;
          })
        ).subscribe();

        return () => {
          subject.complete();
        };
      });
    }

    public each(count: number = 1000,
                signal?: Observable<any>): Observable<{item: any, index: number}> {
      return this.chunk(count, signal).pipe(
        mergeMap(({ results, page }) => {
          return of(...results.map((it: any, idx: number) => {
            return { item: it, index: (page - 1) * count + idx };
          }));
        })
      );
    }

    /**
     * Chunk the results of a query by comparing IDs.
     * this version doesn't use callback. use callback can wait callback finish then emit next
     */
    public chunkById(this: QueryBuilder & _Self, count: number,
                     column?: string,
                     alias?: string,
                     signal?: Observable<any>): Observable<any> {
      if (!(count > 0)) {
        return EMPTY;
      }
      column = column ?? this._defaultKeyName();
      alias = alias ?? column;
      const clone = this.clone();

      return new Observable((observer: Subscriber<any>) => {
        let lastId: number = null;
        let isFirst = true;
        const subject = new BehaviorSubject(1);
        subject.pipe(
          signal ? bufferWhen(() => {
            // first time emit immediately
            if (isFirst) {
              isFirst = false;
              return interval(10).pipe(take(1));
            }
            return signal;
          }) : map(it => [it]),
          mergeMap((items: number[]) => of(...items)),
          concatMap((page: number) => {
            return from(
              (clone as QueryBuilder)
                .forPageAfterId(count, lastId, column).get()
            ).pipe(
              tap((results: any[]) => {
                if (!results || results.length == 0) {
                  subject.complete();
                  observer.complete();
                } else {
                  lastId = last(results)[alias];

                  if (isBlank(lastId)) {
                    throw new Error(
                      `RuntimeException The chunkById operation was aborted` +
                      ` because the [${alias}] column is not present in the query result.`);
                  }
                }
              }),
              tap((results) => {
                if (results.length > 0) {
                  if (results.length === count) {
                    subject.next(page + 1);
                    observer.next({ results, page });
                  } else {
                    observer.next({ results, page });
                    subject.complete();
                    observer.complete();
                  }
                }
              })
            );
          }),
          catchError((err, caught) => {
            subject.complete();
            observer.error(err);
            observer.complete();
            return EMPTY;
          })
        ).subscribe();

        return () => {
          subject.complete();
        };
      });
    }

    public eachById(this: QueryBuilder & _Self, count: number = 1000,
                    column?: string,
                    alias?: string,
                    signal?: Observable<any>): Observable<{item: any, index: number}> {
      return this.chunkById(count, column, alias, signal).pipe(
        mergeMap(({ results, page }): Observable<{item: any, index: number}> => {
          return from<ArrayLike<{item: any, index: number}>>(results.map((it: any, idx: number) => {
            return { item: it, index: (page - 1) * count + idx };
          }));
        })
      );
    }

    /*Execute the query and get the first result.*/
    public async first(this: QueryBuilder & _Self, columns: any[] | string = ['*']) {
      // return this.take(1).get(columns).first();
      // todo
      const results = await this.take(1).get(columns);
      return results.pop();
    }

    public when(condition: boolean, callback: (q: this, condition: boolean) => any,
                defaultCallback?: Function): this {
      if (condition) {
        return callback(this, condition) ?? this;
      }

      if (defaultCallback) {
        return defaultCallback(this, condition) ?? this;
      }
      return this;
    }

    public tap(callback: (q: this, condition: boolean) => any) {
      return this.when(true, callback);
    }

    public unless(value: any, callback: Function, _default: Function = null) {
      if (!value) {
        return callback(this, value) || this;
      } else if (_default) {
        return _default(this, value) || this;
      }
      return this;
    }


  };
}
