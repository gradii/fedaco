/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Collection } from '../../define/collection';
import { Constructor } from '../../helper/constructor';
import { FedacoBuilder } from '../fedaco-builder';
import { Model } from '../model';
import { InteractsWithDictionary } from './concerns/interacts-with-dictionary';
import { Relation } from './relation';
export interface HasManyThrough extends InteractsWithDictionary, Constructor<Relation> {
    _throughParent: Model;
    _farParent: Model;
    _firstKey: string;
    _secondKey: string;
    _localKey: string;
    _secondLocalKey: string;
    addConstraints(): void;
    _performJoin(query?: FedacoBuilder | null): void;
    getQualifiedParentKeyName(): string;
    throughParentSoftDeletes(): boolean;
    withTrashedParents(): this;
    addEagerConstraints(models: any[]): void;
    initRelation(models: any[], relation: string): Model[];
    match(this: Model & this, models: any[], results: Collection, relation: string): Model[];
    _buildDictionary(results: Collection): {
        [key: string]: any[];
    };
    firstOrNew(attributes: any[]): Promise<Model>;
    updateOrCreate(attributes: any[], values?: any[]): Promise<Model>;
    firstWhere(column: Function | string | any[], operator?: any, value?: any, conjunction?: 'and' | 'or' | string): Promise<Model>;
    first(columns?: any[]): Promise<Model>;
    firstOrFail(columns?: any[]): Promise<Model>;
    find(id: any, columns?: any[]): Promise<Model | Model[]>;
    findMany(ids: any[], columns?: any[]): Promise<Model[]>;
    findOrFail(id: any | any[], columns?: any[]): Promise<Model | Model[]>;
    getResults(): Promise<Model | Model[]>;
    get(columns?: any[]): Promise<Model | Model[]>;
    _shouldSelect(columns?: any[]): string[];
    _prepareQueryBuilder(columns?: any[]): FedacoBuilder;
    getRelationExistenceQuery(query: FedacoBuilder, parentQuery: FedacoBuilder, columns?: any[] | any): FedacoBuilder;
    getRelationExistenceQueryForSelfRelation(query: FedacoBuilder, parentQuery: FedacoBuilder, columns?: any[] | any): FedacoBuilder;
    getRelationExistenceQueryForThroughSelfRelation(query: FedacoBuilder, parentQuery: FedacoBuilder, columns?: any[] | any): FedacoBuilder;
    getQualifiedFarKeyName(): string;
    getFirstKeyName(): string;
    getQualifiedFirstKeyName(): string;
    getForeignKeyName(): string;
    getQualifiedForeignKeyName(): string;
    getLocalKeyName(): string;
    getQualifiedLocalKeyName(): string;
    getSecondLocalKeyName(): string;
}
declare const HasManyThrough_base: import("@gradii/fedaco/src/fedaco/relations/concerns/interacts-with-dictionary").InteractsWithDictionaryCtor & typeof Relation;
export declare class HasManyThrough extends HasManyThrough_base {
    _throughParent: Model;
    _farParent: Model;
    _firstKey: string;
    _secondKey: string;
    _localKey: string;
    _secondLocalKey: string;
    constructor(query: FedacoBuilder, farParent: Model, throughParent: Model, firstKey: string, secondKey: string, localKey: string, secondLocalKey: string);
}
export {};
