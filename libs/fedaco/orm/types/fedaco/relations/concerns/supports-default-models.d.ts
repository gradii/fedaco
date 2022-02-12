/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../../helper/constructor';
import { Model } from '../../model';
export interface SupportsDefaultModels {
    withDefault(callback?: (m: Model) => void): this;
    withDefault(callback?: Function | any[] | any | boolean): this;
    _getDefaultFor(parent: Model): Model;
}
declare type SupportsDefaultModelsCtor = Constructor<SupportsDefaultModels>;
export declare function mixinSupportsDefaultModels<T extends Constructor<{}>>(base: T): SupportsDefaultModelsCtor & T;
export {};
