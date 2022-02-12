/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { FedacoBuilder } from '../fedaco-builder';
import { Model } from '../model';
import { BelongsToMany } from './belongs-to-many';
export declare class MorphToMany extends BelongsToMany {
    _morphType: string;
    _morphClass: string;
    _inverse: boolean;
    constructor(query: FedacoBuilder, parent: Model, name: string, table: string, foreignPivotKey: string, relatedPivotKey: string, parentKey: string, relatedKey: string, relationName?: string | null, inverse?: boolean);
    addConstraints(): void;
    _addWhereConstraints(): this;
    addEagerConstraints(models: any[]): void;
    _baseAttachRecord(id: number, timed: boolean): Record<string, any>;
    getRelationExistenceQuery(query: FedacoBuilder, parentQuery: FedacoBuilder, columns?: any[] | any): FedacoBuilder<Model>;
    _getCurrentlyAttachedPivots(): Promise<any[]>;
    newPivotQuery(): import("@gradii/fedaco").QueryBuilder;
    newPivot(attributes?: any[], exists?: boolean): any;
    _aliasedPivotColumns(): string[];
    getMorphType(): string;
    getMorphClass(): string;
    getInverse(): boolean;
}
