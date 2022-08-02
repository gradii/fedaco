/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank } from '@gradii/check-type';
import type { Constructor } from '../../helper/constructor';
import type { Model } from '../model';
import type { Scope } from '../scope';

export declare class HasGlobalScopes {
  static addGlobalScope(scope: string, implementation: Scope | Function): void;

  getGlobalScopes(): { [key: string]: Scope | Function };
}

type HasGlobalScopesCtor = Constructor<HasGlobalScopes>;

const globalScopes = new WeakMap();

export function mixinHasGlobalScopes<T extends Constructor<{}>>(base: T): HasGlobalScopesCtor & T {
  return class _Self extends base {
    /*Register a new global scope on the model.*/
    public static addGlobalScope(this: typeof Model & typeof _Self, scope: string,
                                 implementation: Function) {
      let targetScopes = globalScopes.get(this);
      if (!targetScopes) {
        targetScopes = {};
        globalScopes.set(this, targetScopes);
      }
      return targetScopes[scope] = implementation;
    }

    /*Determine if a model has a global scope.*/
    public static hasGlobalScope(scope: string) {
      return !isBlank(this.getGlobalScope(scope));
    }

    /*Get a global scope registered with the model.*/
    public static getGlobalScope(scope: string) {
      const target = globalScopes.get(this);
      if (target) {
        return target[scope];
      }
      return undefined;
    }

    /*Get the global scopes for this class instance.*/
    public getGlobalScopes(this: Model & _Self) {
      const target = globalScopes.get(this.constructor);
      return target || [];
    }
  };
}
