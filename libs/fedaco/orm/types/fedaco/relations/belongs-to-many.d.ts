/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Observable } from 'rxjs';
import { Collection } from '../../define/collection';
import { Constructor } from '../../helper/constructor';
import { FedacoBuilder } from '../fedaco-builder';
import { Model } from '../model';
import { AsPivot } from './concerns/as-pivot';
import { InteractsWithDictionary } from './concerns/interacts-with-dictionary';
import { InteractsWithPivotTable } from './concerns/interacts-with-pivot-table';
import { Relation } from './relation';
export interface BelongsToMany extends InteractsWithDictionary, InteractsWithPivotTable, Constructor<Relation> {
}
declare const BelongsToMany_base: import("./concerns/interacts-with-dictionary").InteractsWithDictionaryCtor & (new (...args: any[]) => InteractsWithPivotTable) & typeof Relation;
export declare class BelongsToMany extends BelongsToMany_base {
    _table: string;
    _foreignPivotKey: string;
    _relatedPivotKey: string;
    _parentKey: string;
    _relatedKey: string;
    _relationName: string;
    _pivotColumns: any[];
    _pivotWheres: any[];
    _pivotWhereIns: any[];
    _pivotWhereNulls: any[];
    _pivotValues: {
        column: string;
        value: any;
    }[];
    _withTimestamps: boolean;
    _pivotCreatedAt: string;
    _pivotUpdatedAt: string;
    _using: typeof AsPivot;
    _accessor: string;
    constructor(query: FedacoBuilder, parent: Model, table: string, foreignPivotKey: string, relatedPivotKey: string, parentKey: string, relatedKey: string, relationName?: string | null);
    addConstraints(): void;
    _performJoin(query?: FedacoBuilder | null): this;
    _addWhereConstraints(): this;
    addEagerConstraints(models: any[]): void;
    initRelation(models: any[], relation: string): any[];
    match(models: any[], results: Collection, relation: string): any[];
    _buildDictionary(results: Collection): {
        [key: string]: any[];
    };
    using(clazz: typeof AsPivot): this;
    as(accessor: string): this;
    wherePivot(column: string, value: any): FedacoBuilder;
    wherePivot(column: string, operator?: string, value?: any, conjunction?: 'and' | 'or' | string): FedacoBuilder;
    wherePivotBetween(column: string, values: any[], conjunction?: string, not?: boolean): FedacoBuilder<Model>;
    orWherePivotBetween(column: string, values: any[]): FedacoBuilder<Model>;
    wherePivotNotBetween(column: string, values: any[], conjunction?: string): FedacoBuilder<Model>;
    orWherePivotNotBetween(column: string, values: any[]): FedacoBuilder<Model>;
    wherePivotIn(column: string, values: any, conjunction?: string, not?: boolean): this;
    orWherePivot(column: string, operator?: any, value?: any): FedacoBuilder<Model>;
    withPivotValue(column: string | any[] | object, value?: any): FedacoBuilder<Model> | this;
    orWherePivotIn(column: string, values: any): this;
    wherePivotNotIn(column: string, values: any, conjunction?: string): this;
    orWherePivotNotIn(column: string, values: any): this;
    wherePivotNull(column: string, conjunction?: string, not?: boolean): this;
    wherePivotNotNull(column: string, conjunction?: string): this;
    orWherePivotNull(column: string, not?: boolean): this;
    orWherePivotNotNull(column: string): this;
    orderByPivot(column: string, direction?: string): this;
    findOrNew(id: any, columns?: any[]): Promise<Model>;
    firstOrNew(attributes?: any, values?: any[]): Promise<Model>;
    firstOrCreate(attributes?: any, values?: any, joining?: any[], touch?: boolean): Promise<Model>;
    updateOrCreate(attributes: any[], values?: any[], joining?: any[], touch?: boolean): Promise<Model>;
    find(id: any, columns?: any[]): Promise<Model | Model[]>;
    findMany(ids: any[], columns?: any[]): Promise<Model[]>;
    findOrFail(id: any, columns?: any[]): Promise<Model | Model[]>;
    firstWhere(column: Function | string | any[], operator?: any, value?: any, conjunction?: 'and' | 'or'): Promise<Model>;
    first(columns?: any[]): Promise<Model>;
    firstOrFail(columns?: any[]): Promise<Model>;
    getResults(): Promise<Model[]>;
    get(columns?: any[]): Promise<Model[]>;
    _shouldSelect(columns?: any[]): any[];
    _aliasedPivotColumns(): string[];
    paginate(page?: number, pageSize?: number, columns?: any[]): Promise<{
        items: any[];
        total: number;
        pageSize: number;
        page: number;
    }>;
    chunk(count: number, signal?: Observable<any>): Observable<{
        results: any[];
        page: number;
    }>;
    chunkById(count: number, column?: string, alias?: string, signal?: Observable<any>): Observable<{
        results: any;
        page: number;
    }>;
    each(count?: number, signal?: Observable<any>): Observable<{
        item: any;
        index: number;
    }>;
    _prepareQueryBuilder(): FedacoBuilder<Model>;
    _hydratePivotRelation(models: any[]): void;
    _migratePivotAttributes(model: Model): any;
    touchIfTouching(): Promise<void>;
    _touchingParent(): boolean;
    _guessInverseRelation(): string;
    touch(): Promise<void>;
    allRelatedIds(): Promise<any[]>;
    save(model: Model, pivotAttributes?: any[], touch?: boolean): Model;
    saveMany(models: Collection | any[], pivotAttributes?: any): any[] | Collection<Model>;
    create(attributes?: any, joining?: any[], touch?: boolean): Promise<Model>;
    createMany(records: any[], joinings?: any): Promise<Model>[];
    getRelationExistenceQuery(query: FedacoBuilder, parentQuery: FedacoBuilder, columns?: any[] | any): FedacoBuilder<Model>;
    getRelationExistenceQueryForSelfJoin(query: FedacoBuilder, parentQuery: FedacoBuilder, columns?: any[] | any): FedacoBuilder<Model>;
    getExistenceCompareKey(): string;
    withTimestamps(createdAt?: any, updatedAt?: any): this;
    createdAt(): string;
    updatedAt(): string;
    getForeignPivotKeyName(): string;
    getQualifiedForeignPivotKeyName(): string;
    getRelatedPivotKeyName(): string;
    getQualifiedRelatedPivotKeyName(): string;
    getParentKeyName(): string;
    getQualifiedParentKeyName(): string;
    getRelatedKeyName(): string;
    getQualifiedRelatedKeyName(): string;
    getTable(): string;
    getRelationName(): string;
    getPivotAccessor(): string;
    getPivotColumns(): any[];
    qualifyPivotColumn(column: string): string;
}
export {};
