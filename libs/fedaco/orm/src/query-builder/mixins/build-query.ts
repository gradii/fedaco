import { FedacoBuilder } from '../../fedaco/fedaco-builder';
import { Model } from '../../fedaco/model';
import { QueryBuilder } from '../query-builder';
import { Constructor } from '../../helper/constructor';

export interface BuildQueries {

  when(condition, callback: (q: this, condition) => any, defaultCallback?): this

  tap(callback: (q: this, condition) => any): this

  first(columns?: any[] | string): Model | object | null

  unless(value: any, callback: Function, _default?: Function )
}

export type BuildQueriesCtor = Constructor<BuildQueries>;


export function mixinBuildQueries<T extends Constructor<any>>(base: T): BuildQueriesCtor & T {

  return class _Self extends base {

    public chunk(count: number, callback: Function) {

    }

    public each(callback: Function, count: number = 1000) {

    }

    public chunkById(count: number,
                     callback: Function,
                     column: string | null = null,
                     alias: string | null  = null) {

    }

    public eachById(callback: Function, count: number                  = 1000,
                    column: string | null = null, alias: string | null = null) {
    }

    /*Execute the query and get the first result.*/
    public first(this: QueryBuilder & _Self, columns: any[] | string = ['*']) {
      // return this.take(1).get(columns).first();
      //todo
      return this.take(1).get(columns).pop();
    }

    public when(condition, callback: (q: this, condition) => any, defaultCallback?): this {
      if (condition) {
        return callback(this, condition) ?? this;
      }

      if (defaultCallback) {
        return defaultCallback(this, condition) ?? this;
      }
      return this;
    }

    public tap(callback: (q: this, condition) => any) {
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