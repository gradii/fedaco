/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Collection } from '../../define/collection';
import { HasOneOrMany } from './has-one-or-many';
export declare class HasMany extends HasOneOrMany {
    getResults(): Promise<import("@gradii/fedaco").Model[]>;
    initRelation(models: any[], relation: string): any[];
    match(models: any[], results: Collection, relation: string): any[];
}
