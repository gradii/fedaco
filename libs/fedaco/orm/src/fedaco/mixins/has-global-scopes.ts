import { Scope } from '../Scope';
import { isBlank } from '@gradii/check-type';
import { Constructor } from '../../helper/constructor';

export function mixinHasGlobalScopes<T extends Constructor<{}>>(base: T) {
  return class extends base {
    /*Register a new global scope on the model.*/
    public static addGlobalScope(scope: string, implementation: Function) {
      // return this.globalScopes[scope] = implementation;
    }

    /*Determine if a model has a global scope.*/
    public static hasGlobalScope(scope: Scope | string) {
      return !isBlank(this.getGlobalScope(scope));
    }

    /*Get a global scope registered with the model.*/
    public static getGlobalScope(scope: Scope | string) {
      // return Arr.get(this.globalScopes, HasGlobalScopes + '.' + scope);
    }

    /*Get the global scopes for this class instance.*/
    public getGlobalScopes() {
      // return Arr.get(this.constructor.globalScopes, HasGlobalScopes, []);
      return {};
    }
  };
}
