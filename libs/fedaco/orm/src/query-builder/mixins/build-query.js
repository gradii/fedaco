import { __awaiter } from 'tslib'
import { isBlank } from '@gradii/check-type'
import { last } from 'ramda'
import { BehaviorSubject, EMPTY, from, interval, Observable, of } from 'rxjs'
import {
  bufferWhen,
  catchError,
  concatMap,
  map,
  mergeMap,
  take,
  tap,
} from 'rxjs/operators'
export function mixinBuildQueries(base) {
  return class _Self extends base {
    chunk(count, signal) {
      if (!(count > 0)) {
        return EMPTY
      }
      const clone = this.clone()
      return new Observable((observer) => {
        let isFirst = true
        const subject = new BehaviorSubject(1)
        subject
          .pipe(
            signal
              ? bufferWhen(() => {
                  if (isFirst) {
                    isFirst = false
                    return interval(10).pipe(take(1))
                  }
                  return signal
                })
              : map((it) => [it]),
            mergeMap((items) => of(...items)),
            concatMap((page) => {
              return from(clone.forPage(page, count).get()).pipe(
                tap((results) => {
                  if (!results || results.length == 0) {
                    subject.complete()
                    observer.complete()
                  } else if (results.length === count) {
                    subject.next(page + 1)
                    observer.next({ results, page })
                  } else {
                    observer.next({ results, page })
                    subject.complete()
                    observer.complete()
                  }
                })
              )
            }),
            catchError((err, caught) => {
              subject.complete()
              observer.error(err)
              observer.complete()
              return EMPTY
            })
          )
          .subscribe()
        return () => {
          subject.complete()
        }
      })
    }
    each(count = 1000, signal) {
      return this.chunk(count, signal).pipe(
        mergeMap(({ results, page }) => {
          return of(
            ...results.map((it, idx) => {
              return { item: it, index: (page - 1) * count + idx }
            })
          )
        })
      )
    }

    chunkById(count, column, alias, signal) {
      if (!(count > 0)) {
        return EMPTY
      }
      column =
        column !== null && column !== void 0 ? column : this._defaultKeyName()
      alias = alias !== null && alias !== void 0 ? alias : column
      const clone = this.clone()
      return new Observable((observer) => {
        let lastId = null
        let isFirst = true
        const subject = new BehaviorSubject(1)
        subject
          .pipe(
            signal
              ? bufferWhen(() => {
                  if (isFirst) {
                    isFirst = false
                    return interval(10).pipe(take(1))
                  }
                  return signal
                })
              : map((it) => [it]),
            mergeMap((items) => of(...items)),
            concatMap((page) => {
              return from(
                clone.forPageAfterId(count, lastId, column).get()
              ).pipe(
                tap((results) => {
                  if (!results || results.length == 0) {
                    subject.complete()
                    observer.complete()
                  } else {
                    lastId = last(results)[alias]
                    if (isBlank(lastId)) {
                      throw new Error(
                        `RuntimeException The chunkById operation was aborted` +
                          ` because the [${alias}] column is not present in the query result.`
                      )
                    }
                  }
                }),
                tap((results) => {
                  if (results.length > 0) {
                    if (results.length === count) {
                      subject.next(page + 1)
                      observer.next({ results, page })
                    } else {
                      observer.next({ results, page })
                      subject.complete()
                      observer.complete()
                    }
                  }
                })
              )
            }),
            catchError((err, caught) => {
              subject.complete()
              observer.error(err)
              observer.complete()
              return EMPTY
            })
          )
          .subscribe()
        return () => {
          subject.complete()
        }
      })
    }
    eachById(count = 1000, column, alias, signal) {
      return this.chunkById(count, column, alias, signal).pipe(
        mergeMap(({ results, page }) => {
          return from(
            results.map((it, idx) => {
              return { item: it, index: (page - 1) * count + idx }
            })
          )
        })
      )
    }

    first(columns = ['*']) {
      return __awaiter(this, void 0, void 0, function* () {
        const results = yield this.take(1).get(columns)
        return results.pop()
      })
    }
    when(condition, callback, defaultCallback) {
      var _a, _b
      if (condition) {
        return (_a = callback(this, condition)) !== null && _a !== void 0
          ? _a
          : this
      }
      if (defaultCallback) {
        return (_b = defaultCallback(this, condition)) !== null && _b !== void 0
          ? _b
          : this
      }
      return this
    }
    tap(callback) {
      return this.when(true, callback)
    }
    unless(value, callback, _default = null) {
      if (!value) {
        return callback(this, value) || this
      } else if (_default) {
        return _default(this, value) || this
      }
      return this
    }
  }
}
