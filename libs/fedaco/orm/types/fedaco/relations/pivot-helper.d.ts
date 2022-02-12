/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Model } from '../model';
import { AsPivot } from './concerns/as-pivot';
import { ForwardRefFn } from '../../query-builder/forward-ref';
import { Pivot } from './pivot';
export declare function fromAttributes(
    clazz: typeof AsPivot | ForwardRefFn<typeof AsPivot>,
    parent: Model,
    attributes: any,
    table: string,
    exists?: boolean
): Model & Pivot;
export declare function fromRawAttributes(
    clazz: typeof AsPivot | ForwardRefFn<typeof AsPivot>,
    parent: Model,
    attributes: any,
    table: string,
    exists?: boolean
): Model;
