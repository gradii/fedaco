/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
import { Model } from '../model';
import { AsPivot, AsPivotCtor } from './concerns/as-pivot';
export declare namespace Pivot {
    function fromAttributes(
        parent: Model,
        attributes: any,
        table: string,
        exists?: boolean
    ): any;
    function fromRawAttributes(
        parent: Model,
        attributes: any,
        table: string,
        exists?: boolean
    ): any;
}
export interface Pivot
    extends AsPivotCtor,
        Omit<Model, keyof AsPivot>,
        Constructor<Model> {}
declare const Pivot_base: AsPivotCtor & typeof Model;
export declare class Pivot extends Pivot_base {
    incrementing: boolean;
    protected guarded: any[];
}
export {};
