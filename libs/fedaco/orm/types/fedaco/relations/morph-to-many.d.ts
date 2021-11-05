/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { FedacoBuilder } from '../fedaco-builder';
import { Model } from '../model';
import { BelongsToMany } from './belongs-to-many';
export declare class MorphToMany extends BelongsToMany {
    protected morphType: string;
    protected morphClass: string;
    protected inverse: boolean;
    constructor(query: FedacoBuilder, parent: Model, name: string, table: string, foreignPivotKey: string, relatedPivotKey: string, parentKey: string, relatedKey: string, relationName?: string | null, inverse?: boolean);
}
