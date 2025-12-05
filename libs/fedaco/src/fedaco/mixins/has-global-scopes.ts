/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank } from '@gradii/nanofn';
import type { Constructor } from '../../helper/constructor';
import type { Model } from '../model';
import type { Scope } from '../scope';
import type { QueryBuilder } from '../../query-builder/query-builder';

export interface HasGlobalScopes {
  GetGlobalScopes(): { [key: string]: Scope | Function };
}

export interface HasGlobalScopesCtor {
  addGlobalScope(scope: string, implementation: Scope | Function): void;
  addGlobalScope(scope: string, implementation: Scope | ((q: QueryBuilder) => void)): void;

  new(...args: any[]): HasGlobalScopes
}

const globalScopes = new WeakMap();

export function mixinHasGlobalScopes<T extends Constructor<{}>>(base: T): HasGlobalScopesCtor & T {
  return class _Self extends base {
    /* Register a new global scope on the model. */
    public static addGlobalScope(this: typeof Model & typeof _Self, scope: string, implementation: Function) {
      let targetScopes = globalScopes.get(this);
      if (!targetScopes) {
        targetScopes = {};
        globalScopes.set(this, targetScopes);
      }
      return (targetScopes[scope] = implementation);
    }

    /* Determine if a model has a global scope. */
    public static hasGlobalScope(scope: string) {
      return !isBlank(this.getGlobalScope(scope));
    }

    /* Get a global scope registered with the model. */
    public static getGlobalScope(scope: string) {
      const target = globalScopes.get(this);
      if (target) {
        return target[scope];
      }
      return undefined;
    }

    /* Get the global scopes for this class instance. */
    public GetGlobalScopes(this: Model & _Self) {
      const target = globalScopes.get(this.constructor);
      return target || [];
    }
  };
}
