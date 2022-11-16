/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank } from '@gradii/nanofn';
import { last } from 'ramda';
import { BehaviorSubject, defer, EMPTY, from, Observable, of, Subject, Subscriber, takeUntil } from 'rxjs';
import { catchError, finalize, mergeMap, tap } from 'rxjs/operators';
import type { Model } from '../../fedaco/model';
import type { Constructor } from '../../helper/constructor';
import type { QueryBuilder } from '../query-builder';

export interface BuildQueries {

  chunk(count: number, concurrent?: number): Observable<{ results: any[], page: number }>;

  each(count?: number, concurrent?: number): Observable<{ item: any, index: number }>;

  chunkById(count: number,
            column?: string,
            alias?: string): Observable<{ results: any, page: number }>;

  eachById(count: number,
           column?: string,
           alias?: string): Observable<{ item: any, index: number }>;

  first(columns?: any[] | string): Promise<Model | /*object |*/ any | null>;

  when(condition: boolean, callback: (q: this, condition: boolean) => any,
       defaultCallback?: Function): this;

  tap(callback: (q: this, condition: boolean) => any): this;

  unless(value: any, callback: Function, _default?: Function): this;
}

export type BuildQueriesCtor = Constructor<BuildQueries>;


export function mixinBuildQueries<T extends Constructor<any>>(base: T): BuildQueriesCtor & T {

  return class _Self extends base {

    public chunk(count: number, concurrent = 1): Observable<{ results: any[], page: number }> {
      if (!(count > 0)) {
        return EMPTY;
      }
      const clone = this.clone();

      let taskPage  = 0;
      const subject = new Subject<number>();
      const runTask = (page: number, count: number) => defer(() => clone.forPage(page, count).get());

      return new Observable((observer: Subscriber<any>) => {
        const destroy$ = new Subject();
        subject.pipe(
          mergeMap((page: number) => {
            return runTask(page, count).pipe(
              takeUntil(destroy$),
              tap((results: any) => {
                if (!results || results.length == 0) {
                  subject.complete();
                }
              }),
              tap((results) => {
                if (results.length > 0) {
                  if (results.length === count) {
                    subject.next(++taskPage);
                    observer.next({results, page});
                  } else {
                    observer.next({results, page});
                    subject.complete();
                  }
                }
              })
            );
          }, concurrent),
          catchError((err, caught) => {
            subject.complete();
            observer.error(err);
            observer.complete();
            return EMPTY;
          }),
          finalize(() => {
            observer.complete();
          })
        ).subscribe();

        for (let i = 0; i < concurrent; i++) {
          subject.next(++taskPage);
        }

        return () => {
          subject.complete();
          destroy$.complete();
        };
      });
    }

    public each(count: number = 1000,
                concurrent?: number): Observable<{ item: any, index: number }> {
      return this.chunk(count, concurrent).pipe(
        mergeMap(({results, page}) => {
          return from(results.map((it: any, idx: number) => {
            return {item: it, index: (page - 1) * count + idx};
          }));
        })
      );
    }

    /**
     * Chunk the results of a query by comparing IDs.
     * this version doesn't use callback. use callback can wait callback finish then emit next
     */
    public chunkById<T extends Model = any>(this: QueryBuilder & _Self, count: number,
                                            column?: string,
                                            alias?: string): Observable<{ results: T[], page: number }> {
      if (!(count > 0)) {
        return EMPTY;
      }
      column = column ?? this._defaultKeyName();
      alias  = alias ?? column;

      const clone = this.clone();

      const subject = new BehaviorSubject<[number, number]>([1, null]);
      const runTask = (count: number, lastId: number) => defer(() => clone.forPageAfterId(count, lastId, column).get());

      return new Observable((observer: Subscriber<any>) => {
        const destroy$ = new Subject();
        subject.pipe(
          mergeMap(([page, lastId]: [page: number, lastId: number]) => {
            return runTask(count, lastId).pipe(
              takeUntil(destroy$),
              tap((results) => {
                if (!results || results.length == 0) {
                  subject.complete();
                } else {
                  lastId = (last(results) as any)[alias];

                  if (isBlank(lastId)) {
                    throw new Error(
                      `RuntimeException The chunkById operation was aborted` +
                      ` because the [${alias}] column is not present in the query result.`);
                  }
                  if (results.length === count) {
                    subject.next([++subject.value[0], lastId]);
                    observer.next({results, page});
                  } else {
                    observer.next({results, page});
                    subject.complete();
                  }
                }
              })
            );
          }, 1),
          catchError((err, caught) => {
            subject.complete();
            observer.error(err);
            observer.complete();
            return EMPTY;
          }),
          finalize(() => {
            observer.complete();
          })
        ).subscribe();

        return () => {
          subject.complete();
          destroy$.complete();
        };
      });
    }

    public eachById(this: QueryBuilder & _Self, count: number = 1000,
                    column?: string,
                    alias?: string): Observable<{ item: any, index: number }> {
      return this.chunkById(count, column, alias).pipe(
        mergeMap(({results, page}): Observable<{ item: any, index: number }> => {
          return from<ArrayLike<{ item: any, index: number }>>(results.map((it: any, idx: number) => {
            return {item: it, index: (page - 1) * count + idx};
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
