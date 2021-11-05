/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
export declare namespace GuardsAttributes {
    const _unguarded = false;
    const _guardableColumns: any[];
    function unguard(state: boolean): void;
    function reguard(): void;
    function isUnguarded(): boolean;
    function unguarded(callback: Function): any;
}
export interface GuardsAttributes {
    _fillable: string[];
    _guarded: string[];
    getFillable(): this;
    totallyGuarded(): boolean;
    isFillable(key: string): boolean;
    getGuarded(): this;
    guard(guarded: any[]): this;
    mergeGuarded(guarded: any[]): this;
    _fillableFromArray(attributes: any): this;
}
export declare type GuardsAttributesCtor<M> = Constructor<GuardsAttributes>;
export declare function mixinGuardsAttributes<T extends Constructor<any>, M>(base: T): GuardsAttributesCtor<M> & T;
