/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
import { Scope } from '../scope';
export declare class HasGlobalScopes {
    static addGlobalScope(scope: string, implementation: Scope | Function): void;
    getGlobalScopes(): {
        [key: string]: Scope | Function;
    };
}
declare type HasGlobalScopesCtor = Constructor<HasGlobalScopes>;
export declare function mixinHasGlobalScopes<T extends Constructor<{}>>(base: T): HasGlobalScopesCtor & T;
export {};
