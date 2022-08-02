/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isArray, isFunction, isObject } from '@gradii/check-type';
import type { Constructor } from '../../../helper/constructor';
import type { Model } from '../../model';
import type { Relation } from '../relation';

export interface SupportsDefaultModels {
  withDefault(callback?: (m: Model) => void): this;

  withDefault(callback?: Function | any[] | any | boolean): this;

  _getDefaultFor(parent: Model): Model;
}

type SupportsDefaultModelsCtor = Constructor<SupportsDefaultModels>;

export function mixinSupportsDefaultModels<T extends Constructor<{}>>(base: T): SupportsDefaultModelsCtor & T {
  // @ts-ignore
  return class _Self extends base {
    /*Indicates if a default model instance should be used.

    Alternatively, may be a Closure or array.*/
    _withDefault: ((instance: any, parent: any) => any) | any[] | boolean;

    /*Make a new related instance for the given model.*/
    // protected abstract newRelatedInstanceFor(parent: Model);

    /*Return a new model instance in case the relationship does not exist.*/
    public withDefault(callback: ((instance: any, parent: any) => any) | any[] | boolean = true) {
      this._withDefault = callback;
      return this;
    }

    newRelatedInstanceFor(parent: Model): Model {
      throw new Error('not implement');
    }

    /*Get the default value for this relation.*/
    _getDefaultFor(this: Relation & _Self, parent: Model): Model {
      if (!this._withDefault) {
        return null;
      }
      const instance = this.newRelatedInstanceFor(parent);
      if (isFunction(this._withDefault)) {
        return this._withDefault.call(this, instance, parent) || instance;
      }
      if (isObject(this._withDefault)) {
        instance.forceFill(this._withDefault as any[]);
      }
      return instance;
    }
  };
}
