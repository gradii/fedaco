/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Model } from './model';
import { AsPivot } from './relations/concerns/as-pivot';
import { Pivot } from './relations/pivot';
import { ForwardRefFn } from '../query-builder/forward-ref';
export declare function newPivot(
    parent: Model,
    attributes: any,
    table: string,
    exists: boolean,
    using?: typeof AsPivot | ForwardRefFn<typeof AsPivot>
): Pivot | any;
