/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
export interface HidesAttributes {
    _hidden: any[];
    _visible: any[];
    getHidden(): any[];
    setHidden(hidden: any[]): this;
    getVisible(): any[];
    setVisible(visible: any[]): this;
    makeVisible(attributes: any[] | string | null): this;
    makeVisibleIf(condition: boolean | Function, attributes: any[] | string | null): this;
    makeHidden(attributes: any[] | string | null): this;
    makeHiddenIf(condition: boolean | Function, attributes: any[] | string | null): this;
}
declare type HidesAttributesCtor = Constructor<HidesAttributes>;
export declare function mixinHidesAttributes<T extends Constructor<{}>>(base: T): HidesAttributesCtor & T;
export {};
