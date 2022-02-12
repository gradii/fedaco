/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Collection } from '../../define/collection';
import { MorphOneOrMany } from './morph-one-or-many';
export declare class MorphMany extends MorphOneOrMany {
    getResults(): Promise<import('@gradii/fedaco').Model[]>;
    initRelation(models: any[], relation: string): any[];
    match(models: any[], results: Collection, relation: string): any[];
}
