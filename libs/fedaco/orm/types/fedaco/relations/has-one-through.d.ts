/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Collection } from '../../define/collection';
import { Model } from '../model';
import { HasManyThrough } from './has-many-through';
declare const HasOneThrough_base: import("@gradii/fedaco/src/fedaco/relations/concerns/interacts-with-dictionary").InteractsWithDictionaryCtor & (new (...args: any[]) => import("@gradii/fedaco/src/fedaco/relations/concerns/supports-default-models").SupportsDefaultModels) & typeof HasManyThrough;
export declare class HasOneThrough extends HasOneThrough_base {
    getResults(): Promise<Model>;
    initRelation(models: any[], relation: string): any[];
    match(models: any[], results: Collection, relation: string): any[];
    newRelatedInstanceFor(parent: Model): Model;
}
export {};
