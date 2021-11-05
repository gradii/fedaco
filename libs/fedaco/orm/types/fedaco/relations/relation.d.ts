/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Collection } from '../../define/collection';
import { FedacoBuilder } from '../fedaco-builder';
import { Model } from '../model';
declare const Relation_base: import("@gradii/fedaco/src/fedaco/mixins/forward-call-to-query-builder").ForwardCallToQueryBuilderCtor & {
    new (): {};
};
/**
 * select * from table where col = ? and col2 = ?;
 */
export declare class Relation extends Relation_base {
    _query: FedacoBuilder;
    _parent: Model;
    _related: Model;
    protected static constraints: boolean;
    static _morphMap: any;
    protected static selfJoinCount: number;
    constructor(query: FedacoBuilder, parent: Model);
    static noConstraints(callback: Function): Relation;
    addConstraints(): void;
    addEagerConstraints(models: any[]): void;
    initRelation(models: any[], relation: string): Model[];
    match(models: any[], results: Collection, relation: string): Model[];
    getResults(): Promise<Model | Model[]>;
    getEager(): Promise<any | any[]>;
    sole(columns?: any[] | string): Promise<any>;
    get(columns?: string[] | string): Promise<any | any[]>;
    touch(): Promise<void>;
    rawUpdate(attributes: any): Promise<any>;
    getRelationExistenceCountQuery(query: FedacoBuilder, parentQuery: FedacoBuilder): FedacoBuilder<Model>;
    getRelationExistenceQuery(query: FedacoBuilder, parentQuery: FedacoBuilder, columns?: any[] | any): FedacoBuilder;
    getExistenceCompareKey(): string;
    getRelationCountHash(incrementJoinCount?: boolean): string;
    getKeys(models: any[], key?: string | null): any;
    _getRelationQuery(): FedacoBuilder<Model>;
    getQuery(): FedacoBuilder<Model>;
    getBaseQuery(): import("@gradii/fedaco").QueryBuilder;
    toBase(): import("@gradii/fedaco").QueryBuilder;
    getParent(): Model;
    getQualifiedParentKeyName(): string;
    getRelated(): Model;
    createdAt(): string;
    updatedAt(): string;
    relatedUpdatedAt(): string;
    _whereInMethod(model: Model, key: string): 'whereIntegerInRaw' | 'whereIn';
    whereKey(id: any): this;
    static morphMap(map?: any | null, merge?: boolean): any;
    protected static buildMorphMapFromModels(models?: any | Array<typeof Model> | null): any;
    static getMorphedModel(alias: string): any;
}
export {};
