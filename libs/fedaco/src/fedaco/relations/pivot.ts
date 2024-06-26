/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Constructor } from '../../helper/constructor';
/* tslint:disable:no-namespace */
import { Model } from '../model';
import type { AsPivot, AsPivotCtor } from './concerns/as-pivot';
import { mixinAsPivot } from './concerns/as-pivot';

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace Pivot {
  /*Create a new pivot model instance.*/
  export function fromAttributes(parent: Model, attributes: any, table: string,
                                 exists?: boolean): any;

  /*Create a new pivot model from raw values returned from a query.*/
  export function fromRawAttributes(
    parent: Model, attributes: any, table: string, exists?: boolean): any;
}

export interface Pivot extends AsPivotCtor, Omit<Model, keyof AsPivot>, Constructor<Model> {
}

export class Pivot extends mixinAsPivot(Model) {
  /*Indicates if the IDs are auto-incrementing.*/
  public _incrementing = false;
  /*The attributes that aren't mass assignable.*/
  public _guarded: string[] = [];
}
