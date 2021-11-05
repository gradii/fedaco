/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Collection } from '../../define/collection';
import { Constructor } from '../../helper/constructor';
import { FedacoBuilder } from '../fedaco-builder';
import { Model } from '../model';
import { ComparesRelatedModels } from './concerns/compares-related-models';
import { InteractsWithDictionary } from './concerns/interacts-with-dictionary';
import { SupportsDefaultModels } from './concerns/supports-default-models';
import { Relation } from './relation';
export interface BelongsTo extends ComparesRelatedModels, InteractsWithDictionary, SupportsDefaultModels, Constructor<Relation> {
    getRelationExistenceQuery(query: FedacoBuilder, parentQuery: FedacoBuilder, columns: any[] | any): FedacoBuilder;
}
declare const BelongsTo_base: (new (...args: any[]) => ComparesRelatedModels) & import("@gradii/fedaco/src/fedaco/relations/concerns/interacts-with-dictionary").InteractsWithDictionaryCtor & (new (...args: any[]) => SupportsDefaultModels) & typeof Relation;
export declare class BelongsTo extends BelongsTo_base {
    protected _child: Model;
    protected _foreignKey: string;
    protected _ownerKey: string;
    protected _relationName: string;
    constructor(query: FedacoBuilder, child: Model, foreignKey: string, ownerKey: string, relationName: string);
    getResults(): Promise<Model>;
    addConstraints(): void;
    addEagerConstraints(models: any[]): void;
    protected getEagerModelKeys(models: any[]): any;
    initRelation(models: any[], relation: string): any[];
    match(models: any[], results: Collection, relation: string): any[];
    associate(model: Model | number | string): Model;
    dissociate(): Model;
    disassociate(): Model;
    getRelationExistenceQueryForSelfRelation(query: FedacoBuilder, parentQuery: FedacoBuilder, columns?: any[] | any): FedacoBuilder;
    protected relationHasIncrementingId(): boolean;
    protected newRelatedInstanceFor(parent: Model): Model;
    getChild(): Model;
    getForeignKeyName(): string;
    getQualifiedForeignKeyName(): string;
    getParentKey(): any;
    getOwnerKeyName(): string;
    getQualifiedOwnerKeyName(): string;
    _getRelatedKeyFrom(model: Model): any;
    getRelationName(): string;
}
export {};
