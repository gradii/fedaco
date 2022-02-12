/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../../helper/constructor';
export interface InteractsWithDictionary {
    _getDictionaryKey(attribute: any): string;
}
export declare type InteractsWithDictionaryCtor =
    Constructor<InteractsWithDictionary>;
export declare function mixinInteractsWithDictionary<
    T extends Constructor<any>
>(base: T): InteractsWithDictionaryCtor & T;
