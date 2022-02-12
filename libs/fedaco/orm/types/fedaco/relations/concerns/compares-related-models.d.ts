/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../../helper/constructor';
import { Model } from '../../model';
export interface ComparesRelatedModels {
    is(model: Model | null): Model;
    isNot(model: Model | null): Model;
    getParentKey(): string;
    _getRelatedKeyFrom(model: Model): string;
    _compareKeys(parentKey: any, relatedKey: any): boolean;
}
declare type ComparesRelatedModelsCtor = Constructor<ComparesRelatedModels>;
export declare function mixinComparesRelatedModels<T extends Constructor<any>>(
    base: T
): ComparesRelatedModelsCtor & T;
export {};
